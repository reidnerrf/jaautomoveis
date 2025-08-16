import React, { useState, useEffect } from 'react';
import { FiChevronUp } from 'react-icons/fi';
import { motion, AnimatePresence } from 'framer-motion';

const TopButton = () => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const toggleVisibility = () => {
      if (window.pageYOffset > 300) {
        setIsVisible(true);
      } else {
        setIsVisible(false);
      }
    };

    window.addEventListener('scroll', toggleVisibility);
    return () => window.removeEventListener('scroll', toggleVisibility);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.button
          onClick={scrollToTop}
          className="fixed bottom-8 left-8 z-40 bg-gradient-to-br from-primary-600 to-primary-700 hover:from-primary-700 hover:to-primary-800 text-white p-4 rounded-2xl shadow-large hover:shadow-glow transition-all duration-300 hover-lift backdrop-blur-sm border border-white/20 group"
          aria-label="Voltar ao topo"
          initial={{ opacity: 0, scale: 0.8, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.8, y: 20 }}
          whileHover={{ 
            scale: 1.1,
            rotate: -5,
            transition: { type: "spring", stiffness: 400, damping: 10 }
          }}
          whileTap={{ scale: 0.95 }}
        >
          {/* Efeito de brilho no hover */}
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700 rounded-2xl"></div>
          
          {/* Ícone */}
          <motion.div
            className="relative z-10"
            whileHover={{ y: -2 }}
            transition={{ duration: 0.2 }}
          >
            <FiChevronUp size={24} />
          </motion.div>
          
          {/* Tooltip */}
          <div className="absolute right-full mr-3 px-3 py-2 bg-neutral-800 text-white text-sm rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 whitespace-nowrap">
            Voltar ao topo
            <div className="absolute left-full top-1/2 transform -translate-y-1/2 w-0 h-0 border-l-4 border-l-neutral-800 border-t-4 border-t-transparent border-b-4 border-b-transparent"></div>
          </div>
        </motion.button>
      )}
    </AnimatePresence>
  );
};

export default TopButton;