import React from 'react';
import { FaWhatsapp, FaInstagram } from 'react-icons/fa';
import { motion } from 'framer-motion';

const FloatingButtons: React.FC = () => {
  const buttons = [
    { 
      icon: <FaWhatsapp size={24} />, 
      href: 'https://wa.me/5524999037716', 
      gradient: 'from-green-500 to-green-600', 
      hoverGradient: 'from-green-600 to-green-700',
      glow: 'shadow-glow',
      label: 'WhatsApp',
      color: 'green'
    },
    { 
      icon: <FaInstagram size={24} />, 
      href: 'https://www.instagram.com/_jaautomoveis/', 
      gradient: 'from-pink-500 via-purple-500 to-orange-500', 
      hoverGradient: 'from-pink-600 via-purple-600 to-orange-600',
      glow: 'shadow-glow',
      label: 'Instagram',
      color: 'pink'
    },
  ];

  return (
    <div className="fixed bottom-8 right-8 z-50 flex flex-col items-center space-y-4">
      {buttons.map((button, index) => (
        <motion.a
          key={button.label}
          href={button.href}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={button.label}
          className={`
            bg-gradient-to-br ${button.gradient} hover:${button.hoverGradient}
            text-white w-16 h-16 rounded-2xl
            flex items-center justify-center 
            shadow-large hover:shadow-glow
            transition-all duration-300 hover-lift
            backdrop-blur-sm border border-white/20
            relative overflow-hidden group
          `}
          whileHover={{ 
            scale: 1.1,
            rotate: 5,
            transition: { type: "spring", stiffness: 400, damping: 10 }
          }}
          whileTap={{ scale: 0.95 }}
          initial={{ opacity: 0, y: 30, scale: 0.8 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ 
            delay: 0.5 + index * 0.2,
            duration: 0.6,
            type: "spring",
            stiffness: 200
          }}
        >
          {/* Efeito de brilho no hover */}
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700"></div>
          
          {/* Ícone */}
          <motion.div
            className="relative z-10"
            whileHover={{ rotate: 360 }}
            transition={{ duration: 0.6 }}
          >
            {button.icon}
          </motion.div>
          
          {/* Tooltip */}
          <div className="absolute right-full mr-3 px-3 py-2 bg-neutral-800 text-white text-sm rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 whitespace-nowrap">
            {button.label}
            <div className="absolute left-full top-1/2 transform -translate-y-1/2 w-0 h-0 border-l-4 border-l-neutral-800 border-t-4 border-t-transparent border-b-4 border-b-transparent"></div>
          </div>
        </motion.a>
      ))}

      {/* Indicador de pulso */}
      <motion.div
        className="absolute -bottom-2 -right-2 w-20 h-20 rounded-full bg-green-500/20"
        animate={{ scale: [1, 1.2, 1], opacity: [0.5, 0, 0.5] }}
        transition={{ duration: 2, repeat: Infinity }}
      />
    </div>
  );
};

export default FloatingButtons;
