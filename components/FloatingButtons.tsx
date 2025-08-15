import React from 'react';
import { FaWhatsapp, FaInstagram } from 'react-icons/fa';
import { motion } from 'framer-motion';

const FloatingButtons: React.FC = () => {
  const buttons = [
    { 
      icon: <FaWhatsapp size={22} />, 
      href: 'https://wa.me/5524999037716', 
      gradient: 'bg-gradient-to-br from-green-500 to-green-600', 
      glow: 'shadow-[0_0_12px_rgba(16,185,129,0.6)]',
      label: 'WhatsApp' 
    },
    { 
      icon: <FaInstagram size={22} />, 
      href: 'https://www.instagram.com/_jaautomoveis/', 
      gradient: 'bg-gradient-to-br from-pink-500 to-pink-600', 
      glow: 'shadow-[0_0_12px_rgba(236,72,153,0.6)]',
      label: 'Instagram' 
    },
  ];

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-center space-y-3">
      {buttons.map((button, index) => (
        <motion.a
          key={button.label}
          href={button.href}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={button.label}
          className={`
            ${button.gradient} ${button.glow}
            text-white w-14 h-14 rounded-full 
            flex items-center justify-center 
            shadow-lg hover:shadow-xl
            transition-all duration-300
          `}
          whileHover={{ scale: 1.15 }}
          whileTap={{ scale: 0.95 }}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 + index * 0.1 }}
          style={{
            animation: 'float 3s ease-in-out infinite',
            animationDelay: `${index * 0.5}s`
          }}
        >
          {button.icon}
        </motion.a>
      ))}

      {/* Estilo da animação flutuante */}
      <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-5px); }
        }
      `}</style>
    </div>
  );
};

export default FloatingButtons;
