import React from "react";
import { motion, AnimatePresence } from "framer-motion";

interface PromoBannerProps {
  message?: string;
  ctaLabel?: string;
  ctaHref?: string;
  storageKey?: string;
}

const PromoBanner: React.FC<PromoBannerProps> = ({
  message = "Promoção: Financie com taxas especiais este mês!",
  ctaLabel = "Fazer Simulação",
  ctaHref = "/financing",
  storageKey = "promoBannerDismissedV1",
}) => {
  const [visible, setVisible] = React.useState(false);
  const variant =
    (typeof import.meta !== "undefined" && (import.meta as any).env?.VITE_PROMO_VARIANT) || "A";
  const abKey = `${storageKey}_${variant}`;

  // Derive A/B content
  const abMessage = React.useMemo(() => {
    if (variant === "B")
      return (
        (typeof import.meta !== "undefined" && (import.meta as any).env?.VITE_PROMO_MESSAGE_B) ||
        "Descontos exclusivos esta semana! Avaliamos seu usado na hora."
      );
    return message;
  }, [message, variant]);

  const abCta = React.useMemo(() => {
    if (variant === "B")
      return {
        label:
          (typeof import.meta !== "undefined" && (import.meta as any).env?.VITE_PROMO_CTA_LABEL_B) ||
          "Ver Ofertas",
        href:
          (typeof import.meta !== "undefined" && (import.meta as any).env?.VITE_PROMO_CTA_HREF_B) ||
          "/inventory",
      } as const;
    return { label: ctaLabel, href: ctaHref } as const;
  }, [ctaHref, ctaLabel, variant]);

  React.useEffect(() => {
    try {
      const dismissed = localStorage.getItem(abKey) === "1";
      if (!dismissed) setVisible(true);
      // Persist selected variant for analytics session attribution
      try {
        localStorage.setItem("ab_variant", variant);
      } catch {}
    } catch {
      setVisible(true);
    }
  }, [abKey]);

  const dismiss = () => {
    try {
      localStorage.setItem(abKey, "1");
    } catch {}
    setVisible(false);
  };

  const withUtm = (href: string) => {
    try {
      const url = new URL(href, typeof window !== "undefined" ? window.location.origin : "http://localhost");
      url.searchParams.set("utm_source", "site");
      url.searchParams.set("utm_medium", "banner_top");
      url.searchParams.set("utm_campaign", `promo_${variant}`);
      url.searchParams.set("utm_content", "promo_banner");
      return url.pathname + url.search + url.hash;
    } catch {
      return href;
    }
  };

  const onClickCTA = () => {
    try {
      // @ts-expect-error global helper provided by analytics service
      (window as any)?.trackBusinessEvent?.("banner_click", {
        variant,
        message: abMessage,
        cta: abCta.label,
        href: abCta.href,
        position: "top",
      });
    } catch {}
  };

  return (
    <AnimatePresence>
      {visible ? (
        <motion.div
          initial={{ y: -40, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -40, opacity: 0 }}
          transition={{ duration: 0.25 }}
          className="sticky top-0 z-50 w-full"
        >
          <div className="bg-gradient-to-r from-red-600 to-rose-600 text-white">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-2 flex items-center justify-between gap-3">
              <div className="text-sm sm:text-base font-semibold">
                {abMessage}
              </div>
              <div className="flex items-center gap-2">
                <a
                  href={withUtm(abCta.href)}
                  onClick={onClickCTA}
                  className="text-sm sm:text-base bg-white text-red-600 font-bold px-3 sm:px-4 py-1.5 rounded-lg hover:bg-red-50 transition-colors"
                >
                  {abCta.label}
                </a>
                <button
                  aria-label="Fechar banner"
                  className="text-white/80 hover:text-white px-2 py-1"
                  onClick={dismiss}
                >
                  ✕
                </button>
              </div>
            </div>
          </div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
};

export default PromoBanner;

