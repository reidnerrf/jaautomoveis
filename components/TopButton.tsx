
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiArrowUp } from 'react-icons/fi';

const TopButton: React.FC = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [isNearFooter, setIsNearFooter] = useState(false);

  useEffect(() => {
    const toggleVisibility = () => {
      const scrollTop = window.pageYOffset;
      const windowHeight = window.innerHeight;
      const docHeight = document.documentElement.scrollHeight;
      const footerHeight = 400; // Approximate footer height
      
      // Show button when scrolled down 300px
      setIsVisible(scrollTop > 300);
      
      // Check if near footer
      setIsNearFooter(scrollTop + windowHeight > docHeight - footerHeight);
    };

    window.addEventListener('scroll', toggleVisibility);
    return () => window.removeEventListener('scroll', toggleVisibility);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    });
  };

  return (
    <AnimatePresence>
      {Boolean(isVisible) && (
        <motion.button
          initial={{ opacity: 0, scale: 0.8, y: 20 }}
          animate={{ 
            opacity: 1, 
            scale: 1, 
            y: 0,
            x: isNearFooter ? -120 : 0 // Move left when near footer
          }}
          exit={{ opacity: 0, scale: 0.8, y: 20 }}
          onClick={scrollToTop}
          className="fixed bottom-8 right-8 z-40 group"
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          transition={{ type: "spring", stiffness: 260, damping: 20 }}
        >
          <div className="relative">
            <div className="w-14 h-14 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-400 hover:to-red-500 rounded-full shadow-lg flex items-center justify-center text-white transition-all duration-300 group-hover:shadow-xl">
              <FiArrowUp size={24} className="group-hover:scale-110 transition-transform duration-200" />
            </div>
            
            {/* Hover tooltip */}
            <div className="absolute bottom-full right-0 mb-2 px-3 py-1 bg-gray-900 dark:bg-white text-white dark:text-gray-900 text-sm rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap">
              Voltar ao topo
              <div className="absolute top-full right-4 w-2 h-2 bg-gray-900 dark:bg-white transform rotate-45"></div>
            </div>
            
            {/* Animated ring */}
            <div className="absolute inset-0 rounded-full border-2 border-red-400 opacity-0 group-hover:opacity-100 scale-110 group-hover:scale-125 transition-all duration-300"></div>
          </div>
        </motion.button>
      )}
    </AnimatePresence>
  );
};

export default TopButton;
