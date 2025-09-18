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

  React.useEffect(() => {
    try {
      const dismissed = localStorage.getItem(storageKey) === "1";
      if (!dismissed) setVisible(true);
    } catch {
      setVisible(true);
    }
  }, [storageKey]);

  const dismiss = () => {
    try {
      localStorage.setItem(storageKey, "1");
    } catch {}
    setVisible(false);
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
                {message}
              </div>
              <div className="flex items-center gap-2">
                <a
                  href={ctaHref}
                  className="text-sm sm:text-base bg-white text-red-600 font-bold px-3 sm:px-4 py-1.5 rounded-lg hover:bg-red-50 transition-colors"
                >
                  {ctaLabel}
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

