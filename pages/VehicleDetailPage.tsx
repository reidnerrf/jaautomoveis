import React, { useState, useEffect, useRef } from "react";
import { useParams, Link } from "react-router-dom";
import { useVehicleData } from "../hooks/useVehicleData.tsx";
import VehicleCarousel from "../components/VehicleCarousel.tsx";
import PriceComparison from "../components/PriceComparison.tsx";
// Lightweight inline WhatsApp icon replacement
import {
  FiChevronLeft,
  FiChevronRight,
  FiArrowLeft,
  FiTag,
  FiCalendar,
  FiTrello,
  FiSettings,
  FiDroplet,
  FiGitCommit,
  FiFolder,
  FiX,
  FiAward,
  FiShield,
  FiEye,
  FiHeart,
} from "react-icons/fi";
import { motion, AnimatePresence } from "framer-motion";
import { Vehicle } from "../types.ts";
import ShareButton from "../components/ShareButton.tsx";
import RealTimeViewers from "../components/RealTimeViewers.tsx";
import SEOHead from "../components/SEOHead.tsx";
import MiniLeadForm from "../components/MiniLeadForm.tsx";
import OptimizedImage from "../components/OptimizedImage.tsx";
import Recommendations from "../components/Recommendations.tsx";

const VehicleDetailPage: React.FC = () => {
  const params = useParams<{ id: string }>();
  const id = params?.id;
  const { getVehicleById, vehicles: allVehicles, loading } = useVehicleData();
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [vehicle, setVehicle] = useState<Vehicle | null>(null);
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);
  // Lightbox zoom/pan state
  const [zoom, setZoom] = useState(1);
  const [offset, setOffset] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [isPanning, setIsPanning] = useState(false);
  const panStartRef = useRef<{ x: number; y: number } | null>(null);
  const imgContainerRef = useRef<HTMLDivElement | null>(null);
  const pinchRef = useRef<{ dist: number; zoom: number } | null>(null);
  const [isFavorite, setIsFavorite] = useState(false);
  const viewIncrementedRef = useRef<string | null>(null);
  const [showExitOffer, setShowExitOffer] = useState(false);

  useEffect(() => {
    window.scrollTo(0, 0);
    if (id) {
      const fetchVehicle = async () => {
        const fetchedVehicle = await getVehicleById(id);
        if (fetchedVehicle) {
          setVehicle(fetchedVehicle);
          // Increment view count only once per page load
          if (viewIncrementedRef.current !== id) {
            viewIncrementedRef.current = id;
            try {
              await fetch(`/api/vehicles/${id}/view`, { method: "POST" });
              if ((window as any).trackBusinessEvent) {
                (window as any).trackBusinessEvent("vehicle_view", {
                  vehicleId: fetchedVehicle.id,
                  name: fetchedVehicle.name,
                });
              }
            } catch (error) {
              console.warn("Failed to increment view count.", error);
            }
          }
        }
      };
      fetchVehicle();
    } else {
      setVehicle(null);
      viewIncrementedRef.current = null;
    }
  }, [id]);

  // Exit-intent offer (respect consent, once per session per vehicle)
  useEffect(() => {
    const vehId = id || "";
    if (!vehId) return;
    const sessionKey = `exitOffer:${vehId}`;
    const already = sessionStorage.getItem(sessionKey);
    if (already) return;
    const consent = ((): string => {
      try { return String(localStorage.getItem("cookieConsentV1") || ""); } catch { return ""; }
    })();
    if (consent === "denied") return;

    const onMouseOut = (e: MouseEvent) => {
      if (e.clientY <= 0) {
        sessionStorage.setItem(sessionKey, "1");
        setShowExitOffer(true);
        document.body.style.overflow = "hidden";
        window.removeEventListener("mouseout", onMouseOut as any);
      }
    };
    window.addEventListener("mouseout", onMouseOut as any, { passive: true } as any);

    // Mobile: try history back intent via visibility/blur fallback after inactivity
    let timer: number | null = null;
    const onTouchMove = () => {
      if (timer) window.clearTimeout(timer);
      timer = window.setTimeout(() => {
        if (!sessionStorage.getItem(sessionKey)) {
          sessionStorage.setItem(sessionKey, "1");
          setShowExitOffer(true);
          document.body.style.overflow = "hidden";
        }
      }, 25000);
    };
    window.addEventListener("touchmove", onTouchMove, { passive: true } as any);
    return () => {
      window.removeEventListener("mouseout", onMouseOut as any);
      window.removeEventListener("touchmove", onTouchMove as any);
      if (timer) window.clearTimeout(timer);
    };
  }, [id]);

  // Load favorite state from localStorage
  useEffect(() => {
    if (vehicle) {
      try {
        const likedVehicles = JSON.parse(localStorage.getItem("likedVehicles") || "[]");
        setIsFavorite(likedVehicles.includes(vehicle.id));
      } catch (error) {
        console.warn("Failed to load favorite state:", error);
      }
    }
  }, [vehicle]);

  if (loading && !vehicle) {
    return <div className="text-center py-16">Carregando...</div>;
  }

  if (!vehicle) {
    return (
      <div className="text-center py-16">
        Caregando veículo...{" "}
        <Link to="/inventory" className="text-main-red">
          Voltar para o estoque
        </Link>
      </div>
    );
  }

  // Generate JSON-LD structured data
  const generateStructuredData = () => {
    const hasPrev = typeof (vehicle as any).previousPrice === "number" && (vehicle as any).previousPrice > vehicle.price;
    const priceValidUntil = new Date(Date.now() + 1000 * 60 * 60 * 24 * 7).toISOString().slice(0, 10); // +7 dias
    const structuredData = {
      "@context": "https://schema.org",
      "@type": "Car",
      name: vehicle.name,
      description: `${vehicle.year} ${vehicle.make} ${vehicle.model} - ${vehicle.color} - ${vehicle.km.toLocaleString("pt-BR")} km`,
      brand: {
        "@type": "Brand",
        name: vehicle.make,
      },
      model: vehicle.model,
      vehicleModelDate: vehicle.year.toString(),
      mileageFromOdometer: {
        "@type": "QuantitativeValue",
        value: vehicle.km,
        unitCode: "KMT", // Kilometers
      },
      color: vehicle.color,
      numberOfDoors: vehicle.doors,
      fuelType: vehicle.fuel,
      vehicleTransmission: vehicle.gearbox,
      image: vehicle.images,
      offers: {
        "@type": "Offer",
        price: vehicle.price,
        priceCurrency: "BRL",
        availability: "https://schema.org/InStock",
        priceValidUntil: priceValidUntil,
        url: typeof window !== "undefined" ? `${window.location.origin}/vehicle/${vehicle.id}` : undefined,
        seller: {
          "@type": "Organization",
          name: "JA Automóveis",
          url: window.location.origin,
        },
      },
    };

    return structuredData;
  };

  const nextImage = () => {
    setCurrentImageIndex((prev) => (prev + 1) % (vehicle.images?.length || 1));
    setZoom(1);
    setOffset({ x: 0, y: 0 });
  };

  const prevImage = () => {
    setCurrentImageIndex((prev) => (prev - 1 + (vehicle.images?.length || 1)) % (vehicle.images?.length || 1));
    setZoom(1);
    setOffset({ x: 0, y: 0 });
  };

  const details = [
    {
      icon: <FiTag className="text-main-red" />,
      label: "Marca",
      value: vehicle.make,
    },
    {
      icon: <FiTrello className="text-main-red" />,
      label: "Modelo",
      value: vehicle.model,
    },
    {
      icon: <FiCalendar className="text-main-red" />,
      label: "Ano",
      value: vehicle.year,
    },
    {
      icon: <FiSettings className="text-main-red" />,
      label: "Quilometragem",
      value: `${vehicle.km.toLocaleString("pt-BR")} km`,
    },
    {
      icon: <FiDroplet className="text-main-red" />,
      label: "Cor",
      value: vehicle.color,
    },
    {
      icon: <FiGitCommit className="text-main-red" />,
      label: "Câmbio",
      value: vehicle.gearbox,
    },
    {
      icon: <FiFolder className="text-main-red" />,
      label: "Combustível",
      value: vehicle.fuel,
    },
    {
      icon: <FiTag className="text-main-red" />,
      label: "Portas",
      value: vehicle.doors,
    },
  ];

  const othersSorted = React.useMemo(() => {
    const list = (allVehicles || []).filter((v) => v.id !== id);
    try {
      list.sort((a: any, b: any) => (b?.views || 0) - (a?.views || 0));
    } catch {}
    return list;
  }, [allVehicles, id]);
  const alsoViewed = othersSorted.slice(0, 6);
  const otherVehicles = othersSorted.slice(0, 5);

  // Dynamic badges based on metadata
  const reviewed = Boolean((vehicle as any)?.reviewed ?? true);
  const singleOwner = Boolean((vehicle as any)?.singleOwner);
  const reportApproved = Boolean((vehicle as any)?.inspectionApproved || (vehicle as any)?.laudoAprovado);

  // Vehicle timeline (maintenance/visits/test-drives)
  type TimelineEvent = { type: string; date?: string; label: string; note?: string };
  const timelineEvents: TimelineEvent[] = React.useMemo(() => {
    const events: TimelineEvent[] = [];
    const v: any = vehicle || {};
    const pushSafe = (e?: TimelineEvent) => { if (e && e.label) events.push(e); };
    // Generic timeline array if provided
    if (Array.isArray(v.timeline)) {
      for (const it of v.timeline) {
        if (it && (it.label || it.type)) {
          pushSafe({ type: String(it.type || "evento"), date: it.date, label: String(it.label || it.type || "Evento"), note: it.note });
        }
      }
    }
    // Maintenance history
    if (Array.isArray(v.maintenanceHistory)) {
      for (const m of v.maintenanceHistory) {
        pushSafe({ type: "manutencao", date: m?.date, label: m?.label || "Manutenção realizada", note: m?.note });
      }
    }
    // Visits
    if (Array.isArray(v.visits)) {
      for (const vis of v.visits) {
        pushSafe({ type: "visita", date: vis?.date, label: vis?.label || "Visita ao showroom", note: vis?.note });
      }
    }
    // Test drives
    if (Array.isArray(v.testDrives)) {
      for (const td of v.testDrives) {
        pushSafe({ type: "test-drive", date: td?.date, label: td?.label || "Test-drive realizado", note: td?.note });
      }
    }
    // Sort descending by date when dates exist
    events.sort((a, b) => {
      const da = a.date ? Date.parse(a.date) : 0;
      const db = b.date ? Date.parse(b.date) : 0;
      return db - da;
    });
    return events.slice(0, 10);
  }, [vehicle]);

  const toggleFavorite = () => {
    const newFavoriteState = !isFavorite;
    setIsFavorite(newFavoriteState);

    if ((window as any).trackBusinessEvent) {
      (window as any).trackBusinessEvent("like_vehicle", {
        vehicleId: vehicle.id,
        name: vehicle.name,
      });
    }

    try {
      const liked = JSON.parse(localStorage.getItem("likedVehicles") || "[]");
      const set = new Set<string>(liked);
      if (newFavoriteState && vehicle.id) {
        set.add(vehicle.id);
      } else if (vehicle.id) {
        set.delete(vehicle.id);
      }
      localStorage.setItem("likedVehicles", JSON.stringify(Array.from(set)));
    } catch (error) {
      console.warn("Failed to save favorite state:", error);
    }
  };

  return (
    <>
      <SEOHead
        title={`${vehicle.year} ${vehicle.make} ${vehicle.model} - R$ ${vehicle.price.toLocaleString("pt-BR")} | JA Automóveis`}
        description={`${vehicle.year} ${vehicle.make} ${vehicle.model} - ${vehicle.color} - ${vehicle.km.toLocaleString("pt-BR")} km - R$ ${vehicle.price.toLocaleString("pt-BR")}. Confira este veículo na JA Automóveis.`}
        keywords={`${vehicle.make}, ${vehicle.model}, ${vehicle.year}, ${vehicle.color}, carro usado, seminovo, JA Automóveis, Resende RJ`}
        image={vehicle.images?.[0] || "/assets/empreparacao.jpg"}
        url={`/vehicle/${vehicle.id}`}
        type="product"
      >
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "AutoDealer",
            name: "JA Automóveis",
            url: typeof window !== "undefined" ? window.location.origin : "https://jaautomoveisresende.com.br",
            telephone: "+55 24 99903-7716",
            address: {
              "@type": "PostalAddress",
              streetAddress: "Av. Brasília, n°35 - Vila Julieta",
              addressLocality: "Resende",
              addressRegion: "RJ",
              postalCode: "27511-110",
              addressCountry: "BR"
            },
            sameAs: [
              "https://www.instagram.com/_jaautomoveis/",
              "https://wa.me/5524999037716"
            ]
          })}
        </script>
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "BreadcrumbList",
            itemListElement: [
              {
                "@type": "ListItem",
                position: 1,
                name: "Início",
                item: typeof window !== "undefined" ? `${window.location.origin}/` : "",
              },
              {
                "@type": "ListItem",
                position: 2,
                name: "Estoque",
                item: typeof window !== "undefined" ? `${window.location.origin}/inventory` : "",
              },
              {
                "@type": "ListItem",
                position: 3,
                name: `${vehicle.make} ${vehicle.model} ${vehicle.year}`,
                item:
                  typeof window !== "undefined"
                    ? `${window.location.origin}/vehicle/${vehicle.id}`
                    : "",
              },
            ],
          })}
        </script>
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "FAQPage",
            mainEntity: [
              {
                "@type": "Question",
                name: "Como reservo este veículo?",
                acceptedAnswer: {
                  "@type": "Answer",
                  text: "Fale no WhatsApp e podemos reservar mediante sinal e documentação."
                }
              },
              {
                "@type": "Question",
                name: "O veículo tem garantia?",
                acceptedAnswer: {
                  "@type": "Answer",
                  text: "Sim, entregamos com garantia de procedência e inspeção técnica."
                }
              }
            ]
          })}
        </script>
        <script type="application/ld+json">{JSON.stringify(generateStructuredData())}</script>
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "BreadcrumbList",
            itemListElement: [
              {
                "@type": "ListItem",
                position: 1,
                name: "Início",
                item: typeof window !== "undefined" ? `${window.location.origin}/` : "/",
              },
              {
                "@type": "ListItem",
                position: 2,
                name: "Estoque",
                item:
                  typeof window !== "undefined"
                    ? `${window.location.origin}/inventory`
                    : "/inventory",
              },
              {
                "@type": "ListItem",
                position: 3,
                name: vehicle.name,
                item:
                  typeof window !== "undefined"
                    ? `${window.location.origin}/vehicle/${vehicle.id}`
                    : `/vehicle/${vehicle.id}`,
              },
            ],
          })}
        </script>
        <link
          rel="alternate"
          hrefLang="pt-BR"
          href={`${typeof window !== "undefined" ? window.location.href : ""}`}
        />
        {/* Preload primeiras imagens do carrossel para LCP melhor */}
        {vehicle.images?.slice(0, 2).map((img, i) => (
          <link key={i} rel="preload" as="image" href={img} />
        ))}
      </SEOHead>

      <div className="bg-gradient-to-br from-gray-50 via-white to-gray-100 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
          {/* Breadcrumb Navigation */}
          <motion.div
            className="mb-8"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <Link
              to="/inventory"
              className="inline-flex items-center text-main-red font-medium relative group"
            >
              <FiArrowLeft className="mr-2 w-5 h-5 transition-transform duration-200 group-hover:-translate-x-1" />
              Voltar ao estoque
              <span className="absolute left-0 -bottom-1 h-0.5 w-0 bg-main-red transition-all duration-300 group-hover:w-full"></span>
            </Link>
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
            {/* Galeria de imagens */}
            <div className="lg:col-span-3">
              <div className="relative rounded-2xl overflow-hidden shadow-xl ring-1 ring-transparent hover:ring-red-200/60 dark:hover:ring-red-400/20 transition">
                <OptimizedImage
                  src={`${vehicle.images?.[currentImageIndex] || "/assets/empreparacao.jpg"}`}
                  alt={`${vehicle.make} ${vehicle.model} ${vehicle.year} imagem ${currentImageIndex + 1}`}
                  className="w-full h-[26rem] object-cover cursor-pointer transition-all"
                  onClick={() => setIsLightboxOpen(true)}
                  width={1280}
                  height={624}
                  sizes="(max-width: 1024px) 100vw, 960px"
                  priority
                  fetchPriority="high"
                />
                {(vehicle.images?.length || 0) > 1 && (
                  <>
                    <button
                      onClick={prevImage}
                      className="absolute top-1/2 left-3 transform -translate-y-1/2 bg-black/30 text-white p-2 rounded-full hover:bg-black/50 transition"
                    >
                      <FiChevronLeft size={24} />
                    </button>
                    <button
                      onClick={nextImage}
                      className="absolute top-1/2 right-3 transform -translate-y-1/2 bg-black/30 text-white p-2 rounded-full hover:bg-black/50 transition"
                    >
                      <FiChevronRight size={24} />
                    </button>
                  </>
                )}
              </div>
              <div className="flex space-x-2 mt-4 overflow-x-auto pb-2">
                {(vehicle.images || []).map((img, index) => (
                  <img
                    key={`${img}-${index}`}
                  src={`${img || "/assets/empreparacao.jpg"}${(img || "").includes("?") ? "&" : "?"}v=${encodeURIComponent(vehicle.updatedAt || "")}`}
                    alt={`${vehicle.name} thumbnail ${index + 1}`}
                    width={96}
                    height={80}
                    loading="lazy"
                    decoding="async"
                    className={`w-24 h-20 object-cover rounded-lg cursor-pointer border-2 ${index === currentImageIndex ? "border-main-red" : "border-transparent"} transition`}
                    onClick={() => setCurrentImageIndex(index)}
                  />
                ))}
              </div>
            </div>

            {/* Informações do veículo */}
            <div className="lg:col-span-2 bg-gray-50 dark:bg-gray-800 p-6 rounded-2xl shadow-lg flex flex-col ring-1 ring-transparent hover:ring-red-200/60 dark:hover:ring-red-400/20 transition lg:sticky lg:top-24">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center text-sm text-gray-500">
                  <FiEye className="mr-2" />
                  <span>{vehicle.views || 0} visualizações totais</span>
                </div>
                <button
                  onClick={toggleFavorite}
                  className={`p-2 rounded-full transition-all ${isFavorite ? "bg-red-500 text-white" : "bg-white text-gray-700 hover:bg-red-500 hover:text-white"} shadow`}
                  aria-label="Curtir"
                  title="Curtir"
                >
                  <FiHeart size={18} className={isFavorite ? "fill-current" : ""} />
                </button>
              </div>
              <div className="mb-4">
                <RealTimeViewers page={`/vehicle/${id}`} vehicleId={id} variant="inline" />
              </div>
              <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white">
                {vehicle.name}
              </h1>
              <div className="flex items-center gap-3 mt-2 mb-1">
                {typeof (vehicle as any).previousPrice === "number" && (vehicle as any).previousPrice > vehicle.price ? (
                  <div className="flex items-baseline gap-1">
                    <span className="text-xs text-gray-400">R$</span>
                    <span className="text-2xl text-gray-400 line-through">
                      {new Intl.NumberFormat("pt-BR").format((vehicle as any).previousPrice)}
                    </span>
                  </div>
                ) : null}
                <div className="flex items-baseline gap-1">
                  <span className="text-sm text-gray-500">R$</span>
                  <p className="text-5xl font-bold text-main-red drop-shadow-sm">
                    {new Intl.NumberFormat("pt-BR").format(vehicle.price)}
                  </p>
                </div>
              </div>
              {typeof (vehicle as any).previousPrice === "number" && (vehicle as any).previousPrice > vehicle.price ? (
                <div className="mb-4 flex items-center gap-3">
                  {(() => {
                    const prev = Number((vehicle as any).previousPrice);
                    const curr = Number(vehicle.price);
                    const pct = Math.max(0, Math.round(((prev - curr) / prev) * 100));
                    return (
                      <>
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-bold bg-green-100 text-green-700 border border-green-200">-{pct}%</span>
                        <span className="text-sm text-gray-600">Você economiza R$ {new Intl.NumberFormat("pt-BR").format(prev - curr)}</span>
                      </>
                    );
                  })()}
                </div>
              ) : null}
              {/* Oferta abaixo de Disponível */}
              <div className="mb-6">
                <div className="inline-flex items-center gap-2 bg-red-100 text-red-700 border border-red-200 px-3 py-1 rounded-full text-sm font-semibold">
                  🔥 Oferta especial válida por tempo limitado
                </div>
              </div>

              {/* Selos de confiança dinâmicos + Compartilhar */}
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3 overflow-x-auto scrollbar-none [-ms-overflow-style:none] [scrollbar-width:none]">
                  <style>{`.scrollbar-none::-webkit-scrollbar{display:none;}`}</style>
                  {reviewed && (
                    <div className="relative group">
                      <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold bg-green-100 text-green-700 border border-green-200">
                        <FiAward className="text-green-700" /> Revisado
                      </span>
                      <span role="tooltip" className="pointer-events-none absolute left-0 top-full mt-2 hidden group-hover:block bg-black text-white text-xs px-2 py-1 rounded shadow">
                        Revisão de segurança e checklist mecânico realizados
                      </span>
                    </div>
                  )}
                  {singleOwner && (
                    <div className="relative group">
                      <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold bg-blue-100 text-blue-700 border border-blue-200">
                        <FiShield className="text-blue-700" /> Único dono
                      </span>
                      <span role="tooltip" className="pointer-events-none absolute left-0 top-full mt-2 hidden group-hover:block bg-black text-white text-xs px-2 py-1 rounded shadow">
                        Histórico apontando apenas um proprietário anterior
                      </span>
                    </div>
                  )}
                  {reportApproved && (
                    <div className="relative group">
                      <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold bg-purple-100 text-purple-700 border border-purple-200">
                        <FiShield className="text-purple-700" /> Laudo aprovado
                      </span>
                      <span role="tooltip" className="pointer-events-none absolute left-0 top-full mt-2 hidden group-hover:block bg-black text-white text-xs px-2 py-1 rounded shadow">
                        Laudo cautelar sem restrições relevantes
                      </span>
                    </div>
                  )}
                  {/* Compartilhar */}
                  <ShareButton vehicle={vehicle} className="!p-0 !m-0" />
                </div>
              </div>

              {/* Características */}
              <div className="mb-6 bg-white dark:bg-gray-900 p-4 rounded-xl shadow ring-1 ring-transparent hover:ring-red-200/60 dark:hover:ring-red-400/20 transition">
                <h2 className="text-xl font-bold text-gray-800 dark:text-white mb-4">
                  Características
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {details.map((detail) => (
                    <div key={detail.label} className="flex items-center space-x-2">
                      {detail.icon}
                      <div>
                        <p className="text-sm text-gray-500 dark:text-gray-400">{detail.label}</p>
                        <p className="font-semibold text-gray-800 dark:text-gray-200">
                          {detail.value}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Botões de ação principais (sem compartilhar aqui) */}
              <div className="flex flex-col sm:flex-row gap-4">
                {(() => {
                  const now = new Date();
                  const day = now.getDay(); // 0 dom - 6 sab
                  const hour = now.getHours();
                  const isOpenDay = day >= 1 && day <= 6; // seg-sab
                  const isOpenHour = hour >= 9 && hour < 18; // 9-18h
                  const isOpen = isOpenDay && isOpenHour;
                  const label = isOpen ? "Falar agora no WhatsApp" : "Chamar no WhatsApp (responderemos em horário comercial)";
                  const msg = isOpen
                    ? `Tenho interesse no ${vehicle.name} ${vehicle.year}. Podemos falar agora?`
                    : `Tenho interesse no ${vehicle.name} ${vehicle.year}. Pode me responder no próximo horário comercial?`;
                  const wa = `https://api.whatsapp.com/send?phone=5524999037716&text=${encodeURIComponent(msg)}`;
                  return (
                    <a
                      href={wa}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex-1"
                      onClick={() => {
                        if ((window as any).trackBusinessEvent) {
                          (window as any).trackBusinessEvent("whatsapp_click", {
                            vehicleId: vehicle.id,
                            name: vehicle.name,
                            businessOpen: isOpen,
                          });
                          (window as any).trackBusinessEvent("add_to_whatsapp", {
                            vehicleId: vehicle.id,
                            name: vehicle.name,
                            businessOpen: isOpen,
                          });
                        }
                        try { (window as any).analytics?.sendClickHeatmap?.('detail_whatsapp_click', { isOpen }); } catch {}
                      }}
                    >
                      <button className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-6 rounded-lg flex items-center justify-center gap-2 transition-colors">
                        <svg width="20" height="20" viewBox="0 0 32 32" fill="currentColor" aria-hidden="true" focusable="false"><path d="M16.04 3C9.41 3 4 8.41 4 15.04c0 2.12.57 4.09 1.57 5.8L4 29l8.35-1.52c1.63.9 3.5 1.42 5.48 1.42 6.63 0 12.04-5.41 12.04-12.04S22.67 3 16.04 3zm6.97 17.26c-.29.82-1.7 1.61-2.36 1.72-.61.09-1.39.13-2.25-.14-.52-.17-1.18-.38-2.04-.74-3.58-1.54-5.9-5.14-6.08-5.38-.18-.24-1.45-1.93-1.45-3.68 0-1.75.92-2.61 1.25-2.97.33-.36.73-.45.97-.45.24 0 .49 0 .71.01.22.01.54-.09.84.64.29.7.98 2.41 1.07 2.58.09.18.14.39.03.63-.11.24-.16.39-.33.6-.17.21-.35.47-.5.63-.17.17-.35.36-.15.7.2.33.9 1.48 1.93 2.4 1.33 1.18 2.45 1.55 2.79 1.72.35.18.56.15.77-.09.21-.24.88-1.03 1.12-1.38.24-.35.47-.29.79-.17.33.12 2.06.97 2.42 1.15.36.18.6.27.69.42.09.15.09.86-.2 1.68z"/></svg>
                        {label}
                      </button>
                    </a>
                  );
                })()}
                <a
                  href={`https://api.whatsapp.com/send?phone=5524999037716&text=${encodeURIComponent(
                    `Quero agendar um test-drive do ${vehicle.name} ${vehicle.year}. Quando posso visitar?`
                  )}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1"
                  onClick={() => {
                    try {
                      (window as any).trackBusinessEvent?.("test_drive_request", {
                        vehicleId: vehicle.id,
                        name: vehicle.name,
                      });
                    } catch {}
                  }}
                >
                  <button className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-lg flex items-center justify-center gap-2 transition-colors">
                    Agendar Test-Drive
                  </button>
                </a>
              </div>

              {/* Badges de pagamento e bancos parceiros */}
              <div className="mt-6">
                <div className="bg-white dark:bg-gray-900 p-4 rounded-xl border border-gray-100 dark:border-gray-700">
                  <div className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
                    Formas de pagamento e bancos parceiros
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="px-3 py-1 rounded-full text-xs font-bold bg-green-100 text-green-700 border border-green-200" aria-label="Pagamento via PIX">PIX</span>
                    <span className="px-3 py-1 rounded-full text-xs font-bold bg-blue-100 text-blue-700 border border-blue-200" aria-label="Cartão de crédito Visa">Visa</span>
                    <span className="px-3 py-1 rounded-full text-xs font-bold bg-purple-100 text-purple-700 border border-purple-200" aria-label="Cartão de crédito Mastercard">Mastercard</span>
                    <span className="px-3 py-1 rounded-full text-xs font-bold bg-yellow-100 text-yellow-700 border border-yellow-200" aria-label="Transferência TED DOC">TED/DOC</span>
                    <span className="px-3 py-1 rounded-full text-xs font-bold bg-gray-100 text-gray-700 border border-gray-200" aria-label="Boleto bancário">Boleto</span>
                    <img src="/assets/logo-rodobens.png" alt="Consórcio Rodobens" className="h-6 object-contain ml-2" loading="lazy" />
                  </div>
                </div>
              </div>

              {/* Mini Lead Form - Vehicle context */}
              <div className="mt-6">
                <MiniLeadForm context="vehicle" vehicleId={vehicle.id} vehicleName={vehicle.name} />
              </div>
            </div>
          </div>

          {/* Opcionais e Comparativo */}
          <div className="mt-12 grid grid-cols-1 lg:grid-cols-2 gap-8">
            {(vehicle.optionals?.length || 0) > 0 && vehicle.optionals?.[0] !== "" && (
              <div className="bg-gray-50 dark:bg-gray-800 p-6 rounded-2xl shadow-lg border border-gray-100 dark:border-gray-700 ring-1 ring-transparent hover:ring-red-200/60 dark:hover:ring-red-400/20 transition">
                <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-4">Opcionais</h2>
                <ul className="grid grid-cols-1 md:grid-cols-2 gap-2 text-gray-600 dark:text-gray-300">
                  {(vehicle.optionals || []).map((opt) => (
                    <li key={opt} className="flex items-center">
                      <FiChevronRight className="text-main-red mr-2" />
                      {opt}
                    </li>
                  ))}
                </ul>
              </div>
            )}
            <PriceComparison vehicle={vehicle} />
          </div>

          {/* Informações adicionais */}
          {vehicle.additionalInfo ? (
            <div className="bg-gray-50 dark:bg-gray-800 p-6 rounded-2xl shadow-lg mt-8 ring-1 ring-transparent hover:ring-red-200/60 dark:hover:ring-red-400/20 transition">
              <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-4">
                Informações Adicionais
              </h2>
              <p className="text-gray-600 dark:text-gray-300 leading-relaxed whitespace-pre-wrap">
                {vehicle.additionalInfo}
              </p>
            </div>
          ) : null}

          {/* Linha do tempo do veículo */}
          <div className="bg-gray-50 dark:bg-gray-800 p-6 rounded-2xl shadow-lg mt-8 ring-1 ring-transparent hover:ring-red-200/60 dark:hover:ring-red-400/20 transition">
            <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-4">
              Linha do Tempo
            </h2>
            {timelineEvents.length ? (
              <ol className="relative border-l-2 border-gray-200 dark:border-gray-700 pl-6 space-y-5">
                {timelineEvents.map((ev, idx) => (
                  <li key={idx} className="ml-2">
                    <div className="absolute -left-1.5 w-3 h-3 rounded-full bg-main-red"></div>
                    <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                      {ev.date ? new Date(ev.date).toLocaleDateString("pt-BR") : ""}
                      <span className="uppercase tracking-wide text-xs px-2 py-0.5 rounded-full bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200">
                        {ev.type}
                      </span>
                    </div>
                    <div className="font-semibold text-gray-800 dark:text-gray-200">{ev.label}</div>
                    {ev.note ? (
                      <div className="text-gray-600 dark:text-gray-300 text-sm">{ev.note}</div>
                    ) : null}
                  </li>
                ))}
              </ol>
            ) : (
              <div className="text-gray-600 dark:text-gray-300 text-sm">Sem eventos registrados ainda.</div>
            )}
          </div>

          {/* Custos de propriedade estimados */}
          <div className="bg-gray-50 dark:bg-gray-800 p-6 rounded-2xl shadow-lg mt-8 ring-1 ring-transparent hover:ring-red-200/60 dark:hover:ring-red-400/20 transition">
            <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-4">Custos de Propriedade (estimativa)</h2>
            {(() => {
              const price = Number(vehicle.price || 0);
              const ipvaRate = 0.04; // 4% padrão RJ, pode variar
              const ipva = Math.max(0, Math.round(price * ipvaRate));
              const insuranceBase = 2000; // base simplificada
              const insuranceByYear = Math.max(0.6, Math.min(1.2, (2025 - Number(vehicle.year || 2015)) * -0.03 + 1));
              const insurance = Math.round(insuranceBase * insuranceByYear);
              const monthlyKm = 1000; // suposição
              const fuelPrice = (vehicle.fuel || "Flex") === "Diesel" ? 6.0 : 5.8; // média simplificada
              const kmPerLiter = (vehicle.fuel || "Flex") === "Diesel" ? 12 : 10; // suposição
              const monthlyFuel = Math.round((monthlyKm / kmPerLiter) * fuelPrice);
              return (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="card">
                    <div className="card-body">
                      <div className="text-sm text-gray-500 dark:text-gray-400">IPVA (anual)</div>
                      <div className="text-2xl font-extrabold text-gray-800 dark:text-gray-100">R$ {new Intl.NumberFormat("pt-BR").format(ipva)}</div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">Alíquota estimada de {Math.round(ipvaRate*100)}%</div>
                    </div>
                  </div>
                  <div className="card">
                    <div className="card-body">
                      <div className="text-sm text-gray-500 dark:text-gray-400">Seguro (anual)</div>
                      <div className="text-2xl font-extrabold text-gray-800 dark:text-gray-100">R$ {new Intl.NumberFormat("pt-BR").format(insurance)}</div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">Varia com perfil e ano/modelo</div>
                    </div>
                  </div>
                  <div className="card">
                    <div className="card-body">
                      <div className="text-sm text-gray-500 dark:text-gray-400">Combustível (mensal)</div>
                      <div className="text-2xl font-extrabold text-gray-800 dark:text-gray-100">R$ {new Intl.NumberFormat("pt-BR").format(monthlyFuel)}</div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">Base: {monthlyKm} km/mês · {kmPerLiter} km/l · R$ {fuelPrice.toFixed(2)}/l</div>
                    </div>
                  </div>
                </div>
              );
            })()}
          </div>

          {/* Recomendações (IA) */}
          <Recommendations title="Recomendados para você" limit={6} />

          {/* Outros veículos */}
          <div className="mt-16 space-y-16">
            <div>
              <h2 className="text-3xl font-bold text-center text-gray-800 dark:text-white mb-8">
                Pessoas também viram
              </h2>
              <VehicleCarousel vehicles={alsoViewed} />
            </div>

            <div>
              <h2 className="text-3xl font-bold text-center text-gray-800 dark:text-white mb-8">
                Outros Veículos que Você Pode Gostar
              </h2>
              <VehicleCarousel vehicles={otherVehicles} />
            </div>

            {/* Internal linking: tags por marca/modelo/ano */}
            <div className="text-center">
              <div className="inline-flex flex-wrap gap-2 items-center justify-center">
                <a href={`/inventory?q=${encodeURIComponent(vehicle.make)}`} className="px-3 py-1 rounded-full text-sm bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition">#{vehicle.make}</a>
                <a href={`/inventory?q=${encodeURIComponent(vehicle.model)}`} className="px-3 py-1 rounded-full text-sm bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition">#{vehicle.model}</a>
                <a href={`/inventory?q=${encodeURIComponent(String(vehicle.year))}`} className="px-3 py-1 rounded-full text-sm bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition">#{vehicle.year}</a>
              </div>
            </div>
          </div>
        </div>

        {/* Sticky mobile CTA WhatsApp */}
        <div className="fixed bottom-4 inset-x-0 z-40 px-4 sm:hidden">
          <a
            href={`https://wa.me/5524999037716?text=${encodeURIComponent(
              `Tenho interesse no ${vehicle.name} ${vehicle.year}`
            )}`}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => {
              try {
                (window as any).trackBusinessEvent?.("whatsapp_click", {
                  vehicleId: vehicle.id,
                  name: vehicle.name,
                  source: "sticky_cta",
                });
              } catch {}
            }}
            className="block w-full bg-green-600 hover:bg-green-700 text-white text-center font-bold py-3 rounded-xl shadow-xl"
            aria-label="Falar no WhatsApp sobre este veículo"
          >
            💬 Falar no WhatsApp
          </a>
        </div>

        {/* Lightbox */}
        <AnimatePresence>
          {isLightboxOpen ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4"
              onClick={() => setIsLightboxOpen(false)}
            >
              <div
                className="relative w-full h-full flex items-center justify-center select-none"
                onClick={(e) => e.stopPropagation()}
                role="dialog"
                aria-modal="true"
                aria-label={`Visualizar imagem de ${vehicle.name}`}
                tabIndex={-1}
                onKeyDown={(e) => {
                  if (e.key === "Escape") setIsLightboxOpen(false);
                  if (e.key === "ArrowLeft") prevImage();
                  if (e.key === "ArrowRight") nextImage();
                }}
              >
                {/* Botão fechar */}
                <button
                  onClick={() => setIsLightboxOpen(false)}
                  className="absolute top-4 right-4 text-white hover:text-main-red transition z-50 focus:outline-none focus:ring-2 focus:ring-red-400 rounded"
                  aria-label="Fechar visualização"
                >
                  <FiX size={40} />
                </button>

                {/* Botão anterior */}
                {(vehicle.images?.length || 0) > 1 && (
                  <button
                    onClick={prevImage}
                    className="absolute left-2 md:left-10 top-1/2 transform -translate-y-1/2 bg-black/30 text-white p-3 rounded-full hover:bg-black/50 transition z-50 focus:outline-none focus:ring-2 focus:ring-white/70"
                    aria-label="Imagem anterior"
                  >
                    <FiChevronLeft size={32} />
                  </button>
                )}

                {/* Área da imagem com zoom/pan */}
                <div
                  ref={imgContainerRef}
                  className="relative max-w-full max-h-[90vh] overflow-hidden rounded-lg shadow-2xl"
                  onWheel={(e) => {
                    e.preventDefault();
                    const delta = -e.deltaY;
                    const factor = delta > 0 ? 1.1 : 0.9;
                    const newZoom = Math.min(5, Math.max(1, zoom * factor));
                    setZoom(newZoom);
                  }}
                  onMouseDown={(e) => {
                    if (zoom <= 1) return;
                    setIsPanning(true);
                    panStartRef.current = { x: e.clientX - offset.x, y: e.clientY - offset.y };
                  }}
                  onMouseMove={(e) => {
                    if (!isPanning || !panStartRef.current) return;
                    setOffset({ x: e.clientX - panStartRef.current.x, y: e.clientY - panStartRef.current.y });
                  }}
                  onMouseUp={() => {
                    setIsPanning(false);
                    panStartRef.current = null;
                  }}
                  onMouseLeave={() => {
                    setIsPanning(false);
                    panStartRef.current = null;
                  }}
                  onDoubleClick={() => {
                    if (zoom > 1) { setZoom(1); setOffset({ x: 0, y: 0 }); }
                    else setZoom(2);
                  }}
                  onTouchStart={(e) => {
                    if (e.touches.length === 2) {
                      const [a, b] = e.touches;
                      const dist = Math.hypot(a.clientX - b.clientX, a.clientY - b.clientY);
                      pinchRef.current = { dist, zoom };
                    } else if (e.touches.length === 1 && zoom > 1) {
                      const t = e.touches[0];
                      setIsPanning(true);
                      panStartRef.current = { x: t.clientX - offset.x, y: t.clientY - offset.y };
                    }
                  }}
                  onTouchMove={(e) => {
                    if (e.touches.length === 2 && pinchRef.current) {
                      const [a, b] = e.touches;
                      const dist = Math.hypot(a.clientX - b.clientX, a.clientY - b.clientY);
                      const base = pinchRef.current;
                      const newZoom = Math.min(5, Math.max(1, (dist / base.dist) * base.zoom));
                      setZoom(newZoom);
                    } else if (e.touches.length === 1 && isPanning && panStartRef.current) {
                      const t = e.touches[0];
                      setOffset({ x: t.clientX - panStartRef.current.x, y: t.clientY - panStartRef.current.y });
                    }
                  }}
                  onTouchEnd={() => {
                    pinchRef.current = null;
                    setIsPanning(false);
                    panStartRef.current = null;
                  }}
                >
                  <motion.img
                    key={currentImageIndex}
                    initial={{ opacity: 0.5, scale: 0.98 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.2 }}
                    src={vehicle.images?.[currentImageIndex] || "/assets/empreparacao.jpg"}
                    alt={`${vehicle.name} - ${currentImageIndex + 1}`}
                    className="max-w-full max-h-[90vh] object-contain"
                    style={{ transform: `translate(${offset.x}px, ${offset.y}px) scale(${zoom})` }}
                    draggable={false}
                  />
                </div>

                {/* Controles de zoom */}
                <div className="absolute bottom-24 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2">
                  <button
                    onClick={() => setZoom((z) => Math.max(1, z - 0.25))}
                    className="px-3 py-2 rounded-lg bg-white/90 text-gray-800 hover:bg-white shadow"
                    aria-label="Reduzir zoom"
                  >
                    -
                  </button>
                  <span className="px-2 py-1 rounded bg-black/40 text-white text-sm min-w-[60px] text-center">{Math.round(zoom * 100)}%</span>
                  <button
                    onClick={() => setZoom((z) => Math.min(5, z + 0.25))}
                    className="px-3 py-2 rounded-lg bg-white/90 text-gray-800 hover:bg-white shadow"
                    aria-label="Aumentar zoom"
                  >
                    +
                  </button>
                  <button
                    onClick={() => { setZoom(1); setOffset({ x: 0, y: 0 }); }}
                    className="px-3 py-2 rounded-lg bg-white/90 text-gray-800 hover:bg-white shadow"
                    aria-label="Resetar zoom"
                  >
                    Reset
                  </button>
                </div>

                {/* Botão próximo */}
                {(vehicle.images?.length || 0) > 1 && (
                  <button
                    onClick={nextImage}
                    className="absolute right-2 md:right-10 top-1/2 transform -translate-y-1/2 bg-black/30 text-white p-3 rounded-full hover:bg-black/50 transition z-50 focus:outline-none focus:ring-2 focus:ring-white/70"
                    aria-label="Próxima imagem"
                  >
                    <FiChevronRight size={32} />
                  </button>
                )}

                {/* Mini-mapa de thumbnails dentro do lightbox */}
                {(vehicle.images?.length || 0) > 1 && (
                  <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black/40 rounded-xl px-3 py-2 backdrop-blur-sm max-w-full overflow-x-auto">
                    <div className="flex items-center gap-2">
                      {(vehicle.images || []).map((img, idx) => (
                        <button
                          key={`${img}-${idx}`}
                          onClick={() => {
                            setCurrentImageIndex(idx);
                            setZoom(1);
                            setOffset({ x: 0, y: 0 });
                          }}
                          className={`rounded-md overflow-hidden border ${idx === currentImageIndex ? "border-main-red" : "border-white/30"}`}
                          aria-label={`Ir para imagem ${idx + 1}`}
                        >
                          <img src={img} alt="thumb" className="w-14 h-12 object-cover" loading="lazy" decoding="async" />
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          ) : null}
        </AnimatePresence>

        {/* Exit-intent Offer Modal */}
        <AnimatePresence>
          {showExitOffer ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4"
              onClick={() => {
                setShowExitOffer(false);
                document.body.style.overflow = "";
              }}
              role="dialog"
              aria-modal="true"
              aria-label="Oferta antes de sair"
            >
              <motion.div
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.95, opacity: 0 }}
                className="max-w-md w-full bg-white dark:bg-gray-900 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700 p-6"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="flex items-start justify-between mb-3">
                  <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100">Vai sair? Podemos ajudar!</h3>
                  <button
                    onClick={() => { setShowExitOffer(false); document.body.style.overflow = ""; }}
                    aria-label="Fechar oferta"
                    className="text-gray-500 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200"
                  >
                    <FiX size={24} />
                  </button>
                </div>
                <p className="text-gray-600 dark:text-gray-300 mb-4">
                  Tire dúvidas rápidas no WhatsApp sobre o {vehicle.name}. Sem compromisso.
                </p>
                <div className="flex flex-col sm:flex-row gap-3">
                  <a
                    href={`https://wa.me/5524999037716?text=${encodeURIComponent(
                      `Tenho dúvidas sobre o ${vehicle.name} ${vehicle.year}`
                    )}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={() => {
                      try {
                        (window as any).trackBusinessEvent?.("exit_intent_offer_whatsapp", {
                          vehicleId: vehicle.id,
                          name: vehicle.name,
                        });
                      } catch {}
                      setShowExitOffer(false);
                      document.body.style.overflow = "";
                    }}
                    className="flex-1"
                  >
                    <button className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-6 rounded-lg transition-colors">
                      Falar no WhatsApp
                    </button>
                  </a>
                  <button
                    onClick={() => { setShowExitOffer(false); document.body.style.overflow = ""; }}
                    className="flex-1 border-2 border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-200 font-semibold py-3 px-6 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                  >
                    Continuar navegando
                  </button>
                </div>
              </motion.div>
            </motion.div>
          ) : null}
        </AnimatePresence>
      </div>
    </>
  );
};

export default VehicleDetailPage;
