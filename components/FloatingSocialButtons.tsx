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

  useEffect(() => {
    const handleScroll = () => setShowTopButton(window.scrollY > 400);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const showRealtime = false;

  const buttons = [
    {
      href: "https://wa.me/5524999037716?text=Ol%C3%A1%2C%20gostaria%20de%20mais%20informa%C3%A7%C3%B5es",
      gradient: "bg-gradient-to-tr from-green-500 to-green-400 hover:from-green-600 hover:to-green-500",
      icon: <FaWhatsapp size={22} />,
      label: "WhatsApp",
      tracking: "whatsapp_click",
    }
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
          className={`group relative w-12 h-12 rounded-full ${btn.gradient}
            text-white flex items-center justify-center shadow-xl
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
          {/* Tooltip com animação */}
          <motion.span
            initial={{ opacity: 0, scale: 0.9, x: 10 }}
            whileHover={{ opacity: 1, scale: 1, x: 0 }}
            transition={{ duration: 0.2 }}
            className="absolute right-full mr-3 px-2 py-1 text-xs rounded 
                       bg-black/80 text-white whitespace-nowrap"
          >
            {btn.label}
          </motion.span>
          {/* Glow Effect */}
          <span className="absolute inset-0 rounded-full animate-pulse bg-white/10"></span>
        </a>
      ))}

      {/* Botão "Topo" */}
      <AnimatePresence>
        {showTopButton ? (
          <motion.button
            key="top-button"
            onClick={scrollToTop}
            initial={{ opacity: 0, y: 50, scale: 0.8 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 50, scale: 0.8 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
            className="group relative w-12 h-12 rounded-full 
              bg-gradient-to-tr from-red-500 to-red-400 hover:from-red-600 hover:to-red-500
              text-white flex items-center justify-center shadow-xl
              transition-transform transform hover:scale-110 hover:-rotate-3"
            aria-label="Voltar ao topo"
          >
            <FiArrowUp size={22} />
            {/* Tooltip */}
            <motion.span
              initial={{ opacity: 0, scale: 0.9, x: 10 }}
              whileHover={{ opacity: 1, scale: 1, x: 0 }}
              transition={{ duration: 0.2 }}
              className="absolute right-full mr-3 px-2 py-1 text-xs rounded 
                         bg-black/80 text-white whitespace-nowrap"
            >
              Topo
            </motion.span>
            {/* Glow Effect */}
            <span className="absolute inset-0 rounded-full animate-pulse bg-white/10"></span>
          </motion.button>
        ) : null}
      </AnimatePresence>
    </div>
  );
};

export default FloatingSocialButtons;
``
