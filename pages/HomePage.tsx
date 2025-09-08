import React, { useEffect, useState, Suspense, lazy } from "react";
import { Link } from "react-router-dom";
import { motion, useScroll, useTransform } from "framer-motion";
import { useVehicleData } from "../hooks/useVehicleData";
import { useTopVehicles } from "../hooks/useTopVehicles.tsx";
import { Car, BadgeDollarSign, Handshake, Tag, Phone, MapPin, Clock, Shield, Users, Award, Star } from "lucide-react";
const VehicleCarousel = lazy(() => import("../components/VehicleCarousel.tsx"));
const GoogleReviewsCarousel = lazy(() => import("../components/GoogleReviewsCarousel.tsx"));
const GoogleReviewSummary = lazy(() => import("../components/GoogleReviewSummary.tsx"));
import { GoogleReview } from "../types.ts";
import { useAnalytics } from "../utils/analytics.ts";
import { analytics } from "../utils/analytics";
import SEOHead from "../components/SEOHead.tsx";
//import { useTheme } from "../contexts/ThemeContext.tsx";

const consentAllowed = (key: "analytics" | "personalization") => {
  try {
    const raw = localStorage.getItem("cookieConsentV1");
    if (!raw) return false;
    const parsed = JSON.parse(raw);
    return !!parsed[key];
  } catch {
    return false;
  }
};

const getUserId = () => {
  const key = "chatId";
  let id = localStorage.getItem(key);
  if (!id) {
    id = Math.random().toString(36).slice(2);
    localStorage.setItem(key, id);
  }
  return id;
};

const HomePage: React.FC = () => {
  const { vehicles, refreshVehicles } = useVehicleData();
  const {
    vehicles: mostViewedVehicles,
    loading: loadingMostViewed,
    refresh: refreshMostViewed,
  } = useTopVehicles({ limit: 4, periodDays: 30 });
  const { trackAction, trackBusinessEvent } = useAnalytics("HomePage");
  //const { isDarkMode } = useTheme();
  const { scrollY } = useScroll();
  const y = useTransform(scrollY, [0, 1000], [0, -100]);

  const [googleReviews, setGoogleReviews] = useState<GoogleReview[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [personalized, setPersonalized] = useState<any[]>([]);
  const [clientsServed, setClientsServed] = useState<number>(542);

  useEffect(() => {
    // Recomendações personalizadas
    if (!consentAllowed("personalization")) {
      setPersonalized([]);
      return;
    }
    const controller = new AbortController();
    const fetchRecs = async () => {
      try {
        const userId = getUserId();
        const res = await fetch(`/api/recommendations?userId=${encodeURIComponent(userId)}`, {
          signal: controller.signal,
        });
        const json = await res.json();
        const items = Array.isArray(json?.recommendations) ? json.recommendations : [];
        // Ensure id field exists
        const normalized = items.map((v: any) => ({ ...v, id: v.id || v._id }));
        setPersonalized(normalized);
      } catch {}
    };
    fetchRecs();
    return () => controller.abort();
  }, []);

  useEffect(() => {
    // contador dinâmico simples (mock/animado). Em prod, pode vir do backend
    let mounted = true;
    const base = 542;
    const extra = Math.floor((Date.now() / 1000 / 60 / 60) % 200);
    const value = base + extra;
    if (mounted) setClientsServed(value);
    const id = window.setInterval(() => {
      const extraNow = Math.floor((Date.now() / 1000 / 60 / 60) % 200);
      setClientsServed(base + extraNow);
    }, 60000);
    return () => {
      mounted = false;
      window.clearInterval(id);
    };
  }, []);

  useEffect(() => {
    // Atualiza em tempo real para carrosséis usando socket compartilhado
    const offUpdated = analytics.on("vehicle-updated", () => {
      refreshVehicles();
      refreshMostViewed();
    });
    const offCreated = analytics.on("vehicle-created", () => {
      refreshVehicles();
      refreshMostViewed();
    });
    const offDeleted = analytics.on("vehicle-deleted", () => {
      refreshVehicles();
      refreshMostViewed();
    });
    return () => {
      if (typeof offUpdated === "function") offUpdated();
      if (typeof offCreated === "function") offCreated();
      if (typeof offDeleted === "function") offDeleted();
    };
  }, [refreshVehicles, refreshMostViewed]);

  useEffect(() => {
    // Buscar avaliações do Google via backend (evita CORS e expõe menos a API key)
    const fetchGoogleReviews = async () => {
      try {
        const response = await fetch("/api/place-details?place_id=ChIJBfuB6mR_ngARsAmwbVRKdto");
        const data = await response.json();
        const raw: any[] = data?.result?.reviews || [];
        const filteredSorted = raw
          .filter((r: any) => Number(r?.rating) >= 4 && String(r?.text || "").trim().length > 0)
          .sort((a: any, b: any) => (b?.time || 0) - (a?.time || 0));
        const reviews = filteredSorted.map((review: any, index: number) => ({
          id: review.id || `${review.author_name}-${index}`,
          reviewerName: review.author_name,
          comment: review.text,
          avatarUrl: review.profile_photo_url,
          rating: review.rating,
          timeAgo: review.relative_time_description,
        }));
        setGoogleReviews(reviews);
      } catch (error) {
        console.error("Error fetching Google reviews:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchGoogleReviews();
  }, []);

  const services = [
    {
      icon: <Car size={32} />,
      title: "Venda",
      description: "Os melhores veículos novos e seminovos do mercado com garantia de procedência.",
      gradient: "from-blue-500 to-blue-600",
    },
    {
      icon: <Handshake size={32} />,
      title: "Compra",
      description: "Compramos seu carro com avaliação justa, rápida e sem burocracia.",
      gradient: "from-green-500 to-green-600",
    },
    {
      icon: <Tag size={32} />,
      title: "Troca",
      description: "Use seu carro atual como entrada para um modelo mais novo.",
      gradient: "from-purple-500 to-purple-600",
    },
    {
      icon: <BadgeDollarSign size={32} />,
      title: "Financiamento",
      description: "As melhores taxas do mercado para você realizar seu sonho.",
      gradient: "from-orange-500 to-orange-600",
    },
  ];

  const stats = [
    {
      icon: <Users size={24} />,
      number: "500+",
      label: "Clientes Satisfeitos",
    },
    { icon: <Car size={24} />, number: "1000+", label: "Veículos Vendidos" },
    {
      icon: <Award size={24} />,
      number: "15+",
      label: "Anos de Experiência",
    },
    { icon: <Star size={24} />, number: "4.8", label: "Avaliação Google" },
  ];

  const handleSocialClick = (platform: string) => {
    // real-time only generic action
    trackAction(`${platform}_click`, "social_media");
    // persist only essential clicks
    if (platform === "whatsapp" || platform === "instagram") {
      trackBusinessEvent(`${platform}_click` as any, {});
    }
  };

  return (
    <div className="w-full bg-white dark:bg-gray-900 transition-colors duration-300 overflow-x-hidden ">
      <SEOHead
        title="JA Automóveis - Seu Próximo Carro Está Aqui"
        description="Encontre seu próximo carro com as melhores ofertas e financiamento facilitado na JA Automóveis"
        image="/assets/logo.png"
      >
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "BreadcrumbList",
            itemListElement: [
              {
                "@type": "ListItem",
                position: 1,
                name: "Início",
                item: typeof window !== "undefined" ? window.location.origin + "/" : "/",
              },
            ],
          })}
        </script>
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "AutoDealer",
            name: "JA Automóveis",
            url:
              typeof window !== "undefined"
                ? window.location.origin
                : "https://jaautomoveis.onrender.com",
            logo: `${typeof window !== "undefined" ? window.location.origin : ""}/assets/logo.png`,
            image: `${typeof window !== "undefined" ? window.location.origin : ""}/assets/logo.png`,
            telephone: "+55 24 99903-7716",
            address: {
              "@type": "PostalAddress",
              streetAddress: "Av. Brasília, n°35 - Vila Julieta",
              addressLocality: "Resende",
              addressRegion: "RJ",
              postalCode: "27511-110",
              addressCountry: "BR",
            },
            openingHoursSpecification: [
              {
                "@type": "OpeningHoursSpecification",
                dayOfWeek: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
                opens: "09:00",
                closes: "18:00",
              },
              {
                "@type": "OpeningHoursSpecification",
                dayOfWeek: "Saturday",
                opens: "09:00",
                closes: "13:00",
              },
            ],
            sameAs: ["https://www.instagram.com/_jaautomoveis/", "https://wa.me/5524999037716"],
          })}
        </script>
        <link
          rel="alternate"
          hrefLang="pt-BR"
          href={`${typeof window !== "undefined" ? window.location.href : ""}`}
        />
      </SEOHead>
      {/* HERO SECTION */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden ">
        {/* Background media: video on desktop, image on mobile for performance */}
        <div className="absolute inset-0 z-0">
          <div className="hidden sm:block h-full w-full">
            <motion.video
              style={{ y }}
              muted
              playsInline
              poster="/assets/homepageabout.webp"
              className="absolute inset-0 w-full h-full object-cover"
              onLoadStart={() => {
                // Pause video when not in viewport for better performance
                const observer = new IntersectionObserver(
                  (entries) => {
                    entries.forEach((entry) => {
                      const video = entry.target as HTMLVideoElement;
                      if (entry.isIntersecting) video.play();
                      else video.pause();
                    });
                  },
                  { threshold: 0.2 }
                );
                const el = document.querySelector("video");
                if (el) observer.observe(el);
              }}
              // Respect reduced motion preference
              {...(typeof window !== "undefined" &&
              window.matchMedia &&
              window.matchMedia("(prefers-reduced-motion: reduce)").matches
                ? { autoPlay: false, loop: false }
                : {})}
            />
          </div>
          <img
            src="/assets/homepageabout.webp"
            alt="JA Automóveis"
            width={1920}
            height={1080}
            className="sm:hidden absolute inset-0 w-full h-full object-cover"
            loading="eager"
          />
        </div>
        {/* Overlay */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-black/20 to-black/70"></div>
        
        {/* Floating elements for visual appeal */}
        <div className="absolute inset-0 z-10 pointer-events-none">
          {/* Floating car icons */}
          <motion.div
            className="absolute top-20 left-10 text-white/20"
            animate={{ y: [0, -20, 0], rotate: [0, 5, 0] }}
            transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
          >
            <Car size={40} />
          </motion.div>
          <motion.div
            className="absolute top-40 right-20 text-white/15"
            animate={{ y: [0, 15, 0], rotate: [0, -3, 0] }}
            transition={{ duration: 8, repeat: Infinity, ease: "easeInOut", delay: 1 }}
          >
            <Car size={30} />
          </motion.div>
          <motion.div
            className="absolute bottom-40 left-20 text-white/10"
            animate={{ y: [0, -10, 0], rotate: [0, 2, 0] }}
            transition={{ duration: 7, repeat: Infinity, ease: "easeInOut", delay: 2 }}
          >
            <Car size={25} />
          </motion.div>
        </div>
        
        {/* Content */}
        <div className="relative z-20 text-center px-6">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-extrabold text-white drop-shadow-lg mb-6">
              Seu Próximo{" "}
              <span className="bg-gradient-to-r from-red-500 to-orange-500 bg-clip-text text-transparent">
                Carro
              </span>{" "}
              Está Aqui
            </h1>
            <p className="text-lg md:text-xl lg:text-2xl text-gray-200 max-w-3xl mx-auto leading-relaxed">
              Ofertas imperdíveis, atendimento de qualidade e as melhores condições do mercado.
            </p>
          </motion.div>
          
          <motion.div
            className="mt-8 flex flex-col sm:flex-row justify-center gap-4"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
          >
            <Link
              to="/inventory"
              className="group bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white font-bold px-8 py-4 rounded-full shadow-2xl hover:shadow-red-500/25 transition-all duration-300 transform hover:scale-105 flex items-center justify-center gap-3"
              onClick={() => trackAction("view_inventory", "cta_button")}
            >
              <Car className="group-hover:rotate-12 transition-transform duration-300" />
              Ver Estoque
            </Link>
            <a
              href="https://wa.me/5524999037716"
              onClick={() => {
                handleSocialClick("whatsapp");
                try {
                  trackBusinessEvent("whatsapp_click", { source: "home_hero_cta" });
                } catch {}
              }}
              className="group bg-green-600 hover:bg-green-700 text-white font-bold px-8 py-4 rounded-full shadow-2xl hover:shadow-green-500/25 transition-all duration-300 transform hover:scale-105 flex items-center justify-center gap-3"
            >
              <span className="group-hover:scale-110 transition-transform duration-300">
                {/* inline WhatsApp icon to avoid heavy dependency */}
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M20.52 3.48A11.94 11.94 0 0 0 12.01 0C5.39 0 .03 5.36.03 11.98c0 2.11.55 4.18 1.6 6.01L0 24l6.17-1.6a11.95 11.95 0 0 0 5.84 1.49h.01c6.62 0 11.98-5.36 11.98-11.98 0-3.2-1.25-6.2-3.48-8.43ZM12.01 22.03h-.01c-1.92 0-3.8-.52-5.44-1.5l-.39-.23-3.66.95.98-3.56-.25-.37a10.02 10.02 0 0 1-1.57-5.34C1.67 6.43 6.13 1.97 12 1.97c2.67 0 5.18 1.04 7.07 2.93a10 10 0 0 1 2.94 7.07c0 5.87-4.77 10.06-9.99 10.06Zm5.8-7.53c-.31-.15-1.83-.9-2.11-1-.28-.1-.48-.15-.68.15-.2.31-.78 1-.96 1.2-.18.2-.35.23-.66.08-.31-.15-1.3-.48-2.48-1.53-.92-.82-1.54-1.84-1.72-2.15-.18-.31-.02-.48.13-.63.13-.13.31-.35.46-.53.15-.18.2-.31.31-.51.1-.2.05-.38-.03-.53-.08-.15-.68-1.64-.93-2.24-.24-.57-.49-.49-.68-.5h-.58c-.2 0-.53.08-.81.38-.28.31-1.07 1.04-1.07 2.56s1.1 2.97 1.25 3.17c.15.2 2.16 3.29 5.23 4.61.73.32 1.3.5 1.75.64.73.23 1.4.2 1.93.12.59-.09 1.83-.75 2.09-1.47.26-.72.26-1.33.18-1.47-.08-.14-.28-.22-.59-.37Z"/></svg>
              </span>
              Falar no WhatsApp
            </a>
          </motion.div>

          {/* Stats - Hidden on mobile */}
          <motion.div
            className="mt-12 grid grid-cols-2 lg:grid-cols-4 gap-6 max-w-4xl mx-auto hidden md:grid"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
          >
            {stats.map((stat, index) => (
              <motion.div
                key={stat.label}
                className="group relative"
                whileHover={{ scale: 1.05, y: -5 }}
                transition={{ duration: 0.3 }}
              >
                <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl p-6 text-center hover:bg-white/20 transition-all duration-300 shadow-lg hover:shadow-2xl">
                  <div className="mb-3">
                    <div className="inline-flex items-center justify-center w-12 h-12 bg-white/20 rounded-full mb-3 group-hover:bg-white/30 transition-colors duration-300">
                      {stat.icon}
                    </div>
                  </div>
                  <div className="text-3xl lg:text-4xl font-bold text-white mb-2 group-hover:text-yellow-300 transition-colors duration-300">
                    {stat.number}
                  </div>
                  <div className="text-sm lg:text-base text-gray-200 group-hover:text-white transition-colors duration-300">
                    {stat.label}
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>

        {/* Scroll indicator */}
        <motion.div
          className="absolute bottom-8 left-1/2 transform -translate-x-1/2 z-20"
          animate={{ y: [0, 10, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          <div className="w-6 h-10 border-2 border-white/50 rounded-full flex justify-center">
            <motion.div
              className="w-1 h-3 bg-white rounded-full mt-2"
              animate={{ y: [0, 12, 0] }}
              transition={{ duration: 2, repeat: Infinity }}
            />
          </div>
        </motion.div>
      </section>

      {/* PERSONALIZADOS */}
      {personalized.length > 0 && (
        <section className="container mx-auto px-4 sm:px-6 lg:px-8 py-10">
          <h2 className="text-2xl font-bold mb-4">Recomendados para você</h2>
          <Suspense fallback={<div className="flex items-center justify-center py-12"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-500"></div></div>}>
            <VehicleCarousel vehicles={personalized as any} />
          </Suspense>
        </section>
      )}

      {/* PROVAS SOCIAIS */}
      <section className="py-20 bg-gradient-to-br from-gray-50 via-white to-gray-100 dark:from-gray-800 dark:via-gray-900 dark:to-gray-800 transition-colors duration-300">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            className="text-center mb-16"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-4">
              Números que <span className="text-red-500">Comprovam</span> Nossa Excelência
            </h2>
            <div className="w-24 h-1 bg-gradient-to-r from-red-500 to-orange-500 mx-auto rounded-full mb-6"></div>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
              Resultados reais que demonstram nossa qualidade e confiança no mercado
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            <motion.div
              className="group relative"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              viewport={{ once: true }}
              whileHover={{ scale: 1.05, y: -5 }}
            >
              <div className="bg-white dark:bg-gray-800 rounded-3xl p-8 text-center shadow-lg hover:shadow-2xl transition-all duration-300 border border-gray-100 dark:border-gray-700 group-hover:border-red-200 dark:group-hover:border-red-800">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-red-500 to-red-600 rounded-2xl mb-6 group-hover:scale-110 transition-transform duration-300">
                  <Users className="text-white" size={24} />
                </div>
                <div className="text-5xl font-bold text-gray-900 dark:text-white mb-3 group-hover:text-red-500 transition-colors duration-300">
                  +{new Intl.NumberFormat("pt-BR").format(clientsServed)}
                </div>
                <div className="text-lg font-semibold text-gray-600 dark:text-gray-300 mb-2">
                  Clientes Atendidos
                </div>
                <div className="text-sm text-gray-500 dark:text-gray-400">
                  Satisfação garantida em cada negociação
                </div>
              </div>
            </motion.div>

            <motion.div
              className="group relative"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              viewport={{ once: true }}
              whileHover={{ scale: 1.05, y: -5 }}
            >
              <div className="bg-white dark:bg-gray-800 rounded-3xl p-8 text-center shadow-lg hover:shadow-2xl transition-all duration-300 border border-gray-100 dark:border-gray-700 group-hover:border-green-200 dark:group-hover:border-green-800">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-green-500 to-green-600 rounded-2xl mb-6 group-hover:scale-110 transition-transform duration-300">
                  <Shield className="text-white" size={24} />
                </div>
                <div className="text-5xl font-bold text-gray-900 dark:text-white mb-3 group-hover:text-green-500 transition-colors duration-300">
                  100%
                </div>
                <div className="text-lg font-semibold text-gray-600 dark:text-gray-300 mb-2">
                  Garantia Total
                </div>
                <div className="text-sm text-gray-500 dark:text-gray-400">
                  Veículos com procedência verificada
                </div>
              </div>
            </motion.div>

            <motion.div
              className="group relative"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              viewport={{ once: true }}
              whileHover={{ scale: 1.05, y: -5 }}
            >
              <div className="bg-white dark:bg-gray-800 rounded-3xl p-8 text-center shadow-lg hover:shadow-2xl transition-all duration-300 border border-gray-100 dark:border-gray-700 group-hover:border-yellow-200 dark:group-hover:border-yellow-800">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-2xl mb-6 group-hover:scale-110 transition-transform duration-300">
                  <Star className="text-white" size={24} />
                </div>
                <div className="text-5xl font-bold text-gray-900 dark:text-white mb-3 group-hover:text-yellow-500 transition-colors duration-300">
                  4.8★
                </div>
                <div className="text-lg font-semibold text-gray-600 dark:text-gray-300 mb-2">
                  Avaliação Google
                </div>
                <div className="text-sm text-gray-500 dark:text-gray-400">
                  Excelência reconhecida pelos clientes
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* DESTAQUES */}
      <section className="py-24 bg-gray-50 dark:bg-gray-800 transition-colors duration-300">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            className="text-center mb-16 max-w-5xl mx-auto"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <h2 className="text-5xl font-black text-gray-900 dark:text-white mb-4">
              Destaques da <span className="text-red-500">Semana</span>
            </h2>
            <div className="w-24 h-1 bg-gradient-to-r from-red-500 to-rose-500 mx-auto rounded-full mb-6"></div>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
              Selecionamos os melhores veículos com condições especiais para você
            </p>
          </motion.div>

          {vehicles && vehicles.length > 0 ? (
            <Suspense fallback={<div className="flex items-center justify-center py-12"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-500"></div></div>}>
              <VehicleCarousel vehicles={vehicles.slice(0, 6)} />
            </Suspense>
          ) : (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-500"></div>
            </div>
          )}

          <motion.div
            className="text-center mt-12"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.6 }}
            viewport={{ once: true }}
          >
            <Link to="/inventory">
              <motion.button
                className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-500 hover:to-blue-600 text-white font-bold py-4 px-10 rounded-full shadow-xl text-lg transition-all duration-300"
                whileHover={{ scale: 1.05, y: -2 }}
                whileTap={{ scale: 0.98 }}
              >
                Ver Estoque Completo
              </motion.button>
            </Link>

            <div className="mt-6 text-gray-600 dark:text-gray-400">
              <p>
                Também disponível em{" "}
                <a
                  href="https://www.olx.com.br/perfil/jaautomoveis35-55485ae0"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-red-500 font-semibold hover:text-red-600 transition-colors duration-200 underline"
                >
                  OLX
                </a>{" "}
                e{" "}
                <a
                  href="https://www.icarros.com.br/ache/estoque.jsp?id=2183242"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-red-500 font-semibold hover:text-red-600 transition-colors duration-200 underline"
                >
                  iCarros
                </a>
              </p>
            </div>
          </motion.div>
        </div>
      </section>

      {/* MAIS VISITADOS */}
      <section className="py-24 bg-white dark:bg-gray-900 transition-colors duration-300">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            className="text-center mb-16 max-w-5xl mx-auto"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <h2 className="text-5xl font-black text-gray-900 dark:text-white mb-4">
              Veículos <span className="text-red-500">Mais Visitados</span>
            </h2>
            <div className="w-24 h-1 bg-gradient-to-r from-red-500 to-rose-500 mx-auto rounded-full mb-6"></div>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
              Confira os modelos mais populares nas últimas semanas
            </p>
          </motion.div>

          {loadingMostViewed ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-500"></div>
            </div>
          ) : mostViewedVehicles && mostViewedVehicles.length > 0 ? (
            <Suspense fallback={<div className="flex items-center justify-center py-12"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-500"></div></div>}>
              <VehicleCarousel vehicles={mostViewedVehicles} />
            </Suspense>
          ) : (
            <div className="text-center text-gray-600 dark:text-gray-300 py-12">
              Ainda não há dados suficientes para exibir os mais visitados. Confira nossos destaques
              acima!
            </div>
          )}
        </div>
      </section>

      {/* SOBRE */}
      <section className="py-20 bg-white dark:bg-gray-900 transition-colors duration-300">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
              className="relative"
            >
              <div className="relative overflow-hidden rounded-3xl shadow-2xl">
                <img
                  src="/assets/homepageabout.webp"
                  alt="JA Automóveis"
                  className="w-full h-[500px] object-cover transform hover:scale-105 transition duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
              </div>
              <div className="absolute -bottom-6 -right-6 bg-red-500 text-white p-6 rounded-2xl shadow-xl">
                <div className="text-3xl font-bold">15+</div>
                <div className="text-sm font-medium">Anos de Confiança</div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
              className="space-y-8"
            >
              <div>
                <h2 className="text-5xl font-black text-gray-900 dark:text-white mb-6">
                  Sobre a{" "}
                  <span className="bg-gradient-to-r from-red-500 to-rose-500 bg-clip-text text-transparent">
                    JA Automóveis
                  </span>
                </h2>
                <div className="w-20 h-1 bg-gradient-to-r from-red-500 to-rose-500 rounded-full mb-8"></div>
              </div>

              <div className="space-y-6 text-lg text-gray-600 dark:text-gray-300 leading-relaxed">
                <p>
                  Somos uma{" "}
                  <strong className="text-gray-900 dark:text-white">
                    agência de veículos premium
                  </strong>{" "}
                  que oferece uma experiência completa em serviços automotivos. Com mais de 15 anos
                  no mercado, nos especializamos na venda e troca de veículos novos, seminovos e
                  usados.
                </p>
                <p>
                  Nossa missão é proporcionar{" "}
                  <strong className="text-gray-900 dark:text-white">
                    transparência, qualidade e confiança
                  </strong>
                  em cada negociação. Todos os nossos veículos passam por rigorosa inspeção técnica
                  e oferecemos garantia de procedência.
                </p>
              </div>

              <div className="grid grid-cols-2 gap-6 my-8">
                <div className="bg-gray-50 dark:bg-gray-800 p-6 rounded-xl">
                  <Shield className="text-red-500" size={24} />
                  <h3 className="font-bold text-gray-900 dark:text-white mb-2">Garantia Total</h3>
                  <p className="text-gray-600 dark:text-gray-400 text-sm">
                    Todos os veículos com garantia e procedência verificada
                  </p>
                </div>
                <div className="bg-gray-50 dark:bg-gray-800 p-6 rounded-xl">
                  <Users className="text-red-500" size={24} />
                  <h3 className="font-bold text-gray-900 dark:text-white mb-2">
                    Atendimento Premium
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400 text-sm">
                    Equipe especializada e atendimento personalizado
                  </p>
                </div>
              </div>

              <Link
                to="/about"
                className="inline-flex items-center gap-2 text-red-500 font-bold text-lg hover:text-red-600 transition-colors duration-200"
              >
                Conheça Nossa História
                <motion.span
                  animate={{ x: [0, 5, 0] }}
                  transition={{ repeat: Infinity, duration: 1.5 }}
                >
                  →
                </motion.span>
              </Link>
            </motion.div>
          </div>
        </div>
      </section>

      {/* SERVIÇOS */}
      <section className="py-24 bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900 transition-colors duration-300">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            className="text-center mb-16"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <h2 className="text-5xl font-black text-gray-900 dark:text-white mb-4">
              Nossos <span className="text-red-500">Serviços</span>
            </h2>
            <div className="w-24 h-1 bg-gradient-to-r from-red-500 to-rose-500 mx-auto rounded-full mb-6"></div>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
              Soluções completas para todas as suas necessidades automotivas
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 max-w-7xl mx-auto">
            {services.map((service, index) => (
              <motion.div
                key={service.title}
                className="group relative"
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
                whileHover={{ y: -10 }}
              >
                <div className="relative h-full p-8 bg-white dark:bg-gray-800 rounded-3xl shadow-lg hover:shadow-2xl transition-all duration-500 overflow-hidden">
                  <div
                    className={`absolute inset-0 bg-gradient-to-br ${service.gradient} opacity-0 group-hover:opacity-10 transition-opacity duration-500`}
                  ></div>

                  <div className="relative z-10">
                    <div
                      className={`w-16 h-16 bg-gradient-to-br ${service.gradient} rounded-2xl flex items-center justify-center text-white mb-6 group-hover:scale-110 transition-transform duration-300`}
                    >
                      {service.icon}
                    </div>

                    <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4 group-hover:text-red-500 transition-colors duration-300">
                      {service.title}
                    </h3>

                    <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                      {service.description}
                    </p>
                  </div>

                  <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-red-500 to-transparent scale-x-0 group-hover:scale-x-100 transition-transform duration-500"></div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CONSIGNE SEU CARRO */}
      <section className="py-12 bg-white dark:bg-gray-900 transition-colors duration-300">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="max-w-5xl mx-auto bg-gray-50 dark:bg-gray-800 rounded-2xl shadow-lg p-6 sm:p-8 flex flex-col sm:flex-row items-center gap-6"
          >
            <div className="flex-1 text-center sm:text-left">
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                Consigne seu carro com a <span className="text-red-500">JA Automóveis</span>
              </h3>
              <p className="text-gray-600 dark:text-gray-300">
                Cuidamos de todo o processo de divulgação, negociação e venda. Você segue como
                proprietário até a venda e recebe à vista.
              </p>
            </div>
            <div>
              <Link
                to="/consignado"
                className="inline-block bg-red-500 hover:bg-red-600 text-white font-semibold px-5 py-2 rounded-xl transition-colors"
              >
                Consignar meu carro
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* AVISO CONSÓRCIO RODOBENS */}
      <section className="py-12 bg-gray-50 dark:bg-gray-800 transition-colors duration-300">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="max-w-5xl mx-auto bg-white dark:bg-gray-900 rounded-2xl shadow-lg p-6 sm:p-8 flex flex-col sm:flex-row items-center gap-6"
          >
            <img
              src="/assets/logo-rodobens.png"
              alt="Rodobens Consórcios"
              className="w-[200px] sm:w-[240px] object-contain"
              loading="lazy"
            />
            <div className="text-center sm:text-left">
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                Trabalhamos com <span className="text-red-500">Consórcio Rodobens</span>
              </h3>
              <p className="text-gray-600 dark:text-gray-300">
                Planeje a compra do seu veículo com segurança e condições diferenciadas. Fale
                conosco e faça sua simulação.
              </p>
              <div className="mt-4">
                <Link
                  to="/consortium"
                  className="inline-block bg-red-500 hover:bg-red-600 text-white font-semibold px-5 py-2 rounded-xl transition-colors"
                >
                  Saiba mais
                </Link>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* DEPOIMENTOS */}
      <section className="py-24 bg-white dark:bg-gray-900 transition-colors duration-300">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            className="text-center mb-16"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <h2 className="text-5xl font-black text-gray-900 dark:text-white mb-4">
              O que dizem nossos{" "}
              <span className="bg-gradient-to-r from-red-500 to-rose-500 bg-clip-text text-transparent">
                Clientes
              </span>
            </h2>
            <div className="w-24 h-1 bg-gradient-to-r from-red-500 to-rose-500 mx-auto rounded-full mb-6"></div>
            <p className="text-xl text-gray-600 dark:text-gray-300">
              Avaliações reais diretamente do Google
            </p>
          </motion.div>

          {!isLoading && (
            <Suspense fallback={<div className="flex items-center justify-center py-12"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-500"></div></div>}>
              <GoogleReviewsCarousel reviews={googleReviews} />
            </Suspense>
          )}

          <motion.div
            className="mt-12"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.6 }}
            viewport={{ once: true }}
          >
            <Suspense fallback={<div className="flex items-center justify-center py-6"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-500"></div></div>}>
              <GoogleReviewSummary
              rating={4.8}
              reviewCount={28}
              reviewsPageUrl="https://www.google.com/maps/place/JA+Autom%C3%B3veis"
              />
            </Suspense>
          </motion.div>
        </div>
      </section>

      {/* LOCALIZAÇÃO */}
      <section className="py-24 bg-gray-50 dark:bg-gray-800 transition-colors duration-300">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            className="text-center mb-16"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <h2 className="text-5xl font-black text-gray-900 dark:text-white mb-4">
              Venha nos <span className="text-red-500">Visitar</span>
            </h2>
            <div className="w-24 h-1 bg-gradient-to-r from-red-500 to-rose-500 mx-auto rounded-full mb-6"></div>
            <p className="text-xl text-gray-600 dark:text-gray-300">
              Estamos prontos para receber você de braços abertos
            </p>
          </motion.div>

          <div className="grid lg:grid-cols-3 gap-12 max-w-7xl mx-auto">
            <motion.div
              className="lg:col-span-2"
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
            >
              <div className="h-96 lg:h-[500px] rounded-3xl overflow-hidden shadow-2xl">
                <iframe
                  src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3686.0969984913757!2d-44.46753692566539!3d-22.47133702206713!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x9e7f64ea81fb05%3A0xda764a546db009b0!2sJA%20Autom%C3%B3veis!5e0!3m2!1sen!2sbr!4v1722368940567!5m2!1sen!2sbr"
                  width="100%"
                  height="100%"
                  style={{ border: 0 }}
                  loading="lazy"
                  title="Localização JA Automóveis"
                ></iframe>
              </div>
            </motion.div>

            <motion.div
              className="space-y-8"
              initial={{ opacity: 0, x: 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              viewport={{ once: true }}
            >
              <div className="bg-white dark:bg-gray-900 p-8 rounded-3xl shadow-xl">
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
                  Informações de Contato
                </h3>

                <div className="space-y-6">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-red-500 rounded-2xl flex items-center justify-center text-white flex-shrink-0">
                      <MapPin size={20} />
                    </div>
                    <div>
                      <h4 className="font-bold text-gray-900 dark:text-white mb-1">Endereço</h4>
                      <p className="text-gray-600 dark:text-gray-300">
                        Av. Brasília, n°35
                        <br />
                        Vila Julieta, Resende - RJ
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-green-500 rounded-2xl flex items-center justify-center text-white flex-shrink-0">
                      <Phone size={18} />
                    </div>
                    <div>
                      <h4 className="font-bold text-gray-900 dark:text-white mb-1">Telefone</h4>
                      <p className="text-gray-600 dark:text-gray-300">(24) 99903-7716</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-blue-500 rounded-2xl flex items-center justify-center text-white flex-shrink-0">
                      <Clock size={18} />
                    </div>
                    <div>
                      <h4 className="font-bold text-gray-900 dark:text-white mb-1">Horário</h4>
                      <p className="text-gray-600 dark:text-gray-300">
                        Seg-Sex: 8h às 18:30h
                        <br />
                        Sáb: 8h às 13h
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* CONTATO */}
      <section className="py-24 bg-gradient-to-r from-red-600 via-red-500 to-rose-500 text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <h2 className="text-5xl font-black mb-6">Pronto para encontrar seu carro ideal?</h2>
            <p className="text-2xl mb-12 text-red-100 max-w-3xl mx-auto">
              Entre em contato conosco e faça parte da família JA Automóveis!
            </p>

            <div className="flex flex-col sm:flex-row justify-center gap-8 max-w-2xl mx-auto">
              <a
                href="https://wa.me/5524999037716?text=Ol%C3%A1%2C%20gostaria%20de%20mais%20informa%C3%A7%C3%B5es"
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => handleSocialClick("whatsapp")}
              >
                <motion.button
                  className="group relative overflow-hidden bg-green-600 hover:bg-green-500 py-4 px-10 rounded-full font-bold text-lg shadow-2xl transition-all duration-300 w-full sm:w-auto"
                  whileHover={{ scale: 1.05, y: -2 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <span className="relative z-10 flex items-center justify-center gap-3">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M20.52 3.48A11.94 11.94 0 0 0 12.01 0C5.39 0 .03 5.36.03 11.98c0 2.11.55 4.18 1.6 6.01L0 24l6.17-1.6a11.95 11.95 0 0 0 5.84 1.49h.01c6.62 0 11.98-5.36 11.98-11.98 0-3.2-1.25-6.2-3.48-8.43ZM12.01 22.03h-.01c-1.92 0-3.8-.52-5.44-1.5l-.39-.23-3.66.95.98-3.56-.25-.37a10.02 10.02 0 0 1-1.57-5.34C1.67 6.43 6.13 1.97 12 1.97c2.67 0 5.18 1.04 7.07 2.93a10 10 0 0 1 2.94 7.07c0 5.87-4.77 10.06-9.99 10.06Zm5.8-7.53c-.31-.15-1.83-.9-2.11-1-.28-.1-.48-.15-.68.15-.2.31-.78 1-.96 1.2-.18.2-.35.23-.66.08-.31-.15-1.3-.48-2.48-1.53-.92-.82-1.54-1.84-1.72-2.15-.18-.31-.02-.48.13-.63.13-.13.31-.35.46-.53.15-.18.2-.31.31-.51.1-.2.05-.38-.03-.53-.08-.15-.68-1.64-.93-2.24-.24-.57-.49-.49-.68-.5h-.58c-.2 0-.53.08-.81.38-.28.31-1.07 1.04-1.07 2.56s1.1 2.97 1.25 3.17c.15.2 2.16 3.29 5.23 4.61.73.32 1.3.5 1.75.64.73.23 1.4.2 1.93.12.59-.09 1.83-.75 2.09-1.47.26-.72.26-1.33.18-1.47-.08-.14-.28-.22-.59-.37Z"/></svg>
                    WhatsApp
                  </span>
                  <div className="absolute inset-0 bg-green-400 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                </motion.button>
              </a>

              <a
                href="https://www.instagram.com/_jaautomoveis/"
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => handleSocialClick("instagram")}
              >
                <motion.button
                  className="group relative overflow-hidden bg-pink-600 hover:bg-pink-500 py-4 px-10 rounded-full font-bold text-lg shadow-2xl transition-all duration-300 w-full sm:w-auto"
                  whileHover={{ scale: 1.05, y: -2 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <span className="relative z-10 flex items-center justify-center gap-3">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M7 2h10a5 5 0 0 1 5 5v10a5 5 0 0 1-5 5H7a5 5 0 0 1-5-5V7a5 5 0 0 1 5-5Zm0 2a3 3 0 0 0-3 3v10a3 3 0 0 0 3 3h10a3 3 0 0 0 3-3V7a3 3 0 0 0-3-3H7Zm5 3a5 5 0 1 1 0 10 5 5 0 0 1 0-10Zm0 2a3 3 0 1 0 0 6 3 3 0 0 0 0-6Zm6.5-.75a1.25 1.25 0 1 1-2.5 0 1.25 1.25 0 0 1 2.5 0Z"/></svg>
                    Instagram
                  </span>
                  <div className="absolute inset-0 bg-pink-400 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                </motion.button>
              </a>
            </div>
          </motion.div>
        </div>

        {/* Background decoration */}
        <div className="absolute top-0 left-0 w-full h-full opacity-10">
          <div className="absolute top-10 left-10 w-20 h-20 bg-white rounded-full"></div>
          <div className="absolute top-32 right-20 w-16 h-16 bg-white rounded-full"></div>
          <div className="absolute bottom-20 left-1/4 w-12 h-12 bg-white rounded-full"></div>
          <div className="absolute bottom-32 right-1/3 w-24 h-24 bg-white rounded-full"></div>
        </div>
      </section>
    </div>
  );
};

export default HomePage;
