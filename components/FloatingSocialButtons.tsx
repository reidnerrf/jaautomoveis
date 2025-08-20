import React, { useState, useEffect } from "react";
import { FaWhatsapp, FaInstagram } from "react-icons/fa";
import { FiArrowUp } from "react-icons/fi";
import { motion, AnimatePresence } from "framer-motion";
import RealTimeViewers from "./RealTimeViewers.tsx";

interface FloatingSocialButtonsProps {
  page?: string;
}

const FloatingSocialButtons: React.FC<FloatingSocialButtonsProps> = ({ page }) => {
  const [showTopButton, setShowTopButton] = useState(false);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // Detecta scroll para mostrar/esconder o botão de "Topo"
  useEffect(() => {
    const handleScroll = () => {
      setShowTopButton(window.scrollY > 400); // aparece depois de 400px
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const showRealtime = false; // manter desativado para evitar duplicados

  const buttons = [
    {
      href: "https://wa.me/5524999037716?text=Ol%C3%A1%2C%20gostaria%20de%20mais%20informa%C3%A7%C3%B5es",
      color: "bg-green-500 hover:bg-green-600",
      icon: <FaWhatsapp size={22} />,
      label: "WhatsApp",
      tracking: "whatsapp_click",
      extraClass: "animate-bounce", // WhatsApp com destaque
    },
    {
      href: "https://www.instagram.com/_jaautomoveis/",
      color: "bg-pink-500 hover:bg-pink-600",
      icon: <FaInstagram size={22} />,
      label: "Instagram",
      tracking: "instagram_click",
      extraClass: "",
    },
  ];

  return (
    <div className="fixed bottom-6 right-6 z-40 flex flex-col gap-3 items-end">
      {showRealtime && page ? <RealTimeViewers page={page as string} variant="inline" /> : null}

      {buttons.map((btn) => (
        <a
          key={btn.label}
          href={btn.href}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={btn.label}
          className={`group relative w-12 h-12 rounded-full ${btn.color} ${btn.extraClass}
            text-white flex items-center justify-center shadow-lg 
            transition-transform transform hover:scale-110 hover:rotate-3`}
          onClick={() => {
            try {
              if ((window as any).trackBusinessEvent) {
                (window as any).trackBusinessEvent(btn.tracking, {});
              }
            } catch {}
          }}
        >
          {btn.icon}
          {/* Tooltip */}
          <span className="absolute right-full mr-3 px-2 py-1 text-xs rounded bg-black/80 text-white opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
            {btn.label}
          </span>
          {/* Glow Effect */}
          <span className="absolute inset-0 rounded-full animate-pulse bg-white/10"></span>
        </a>
      ))}

      {/* Botão "Voltar ao topo" com fade-in/out */}
      <AnimatePresence>
        {showTopButton ? (
          <motion.button
            key="top-button"
            onClick={scrollToTop}
            initial={{ opacity: 0, y: 50, scale: 0.8 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 50, scale: 0.8 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
            className="group relative w-12 h-12 rounded-full bg-red-500 hover:bg-red-600 
              text-white flex items-center justify-center shadow-lg 
              transition-transform transform hover:scale-110 hover:-rotate-3"
            aria-label="Voltar ao topo"
          >
            <FiArrowUp size={22} />
            {/* Tooltip */}
            <span className="absolute right-full mr-3 px-2 py-1 text-xs rounded bg-black/80 text-white opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
              Topo
            </span>
            {/* Glow Effect */}
            <span className="absolute inset-0 rounded-full animate-pulse bg-white/10"></span>
          </motion.button>
        ) : null}
      </AnimatePresence>
    </div>
  );
};

export default FloatingSocialButtons;
