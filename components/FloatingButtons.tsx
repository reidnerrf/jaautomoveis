import React, { useState } from 'react';
import { FaWhatsapp, FaInstagram, FaPhone } from 'react-icons/fa';
import { motion, AnimatePresence } from 'framer-motion';

const FloatingButtons: React.FC = () => {
  const [isExpanded, setIsExpanded] = useState(false);

  const buttons = [
    { 
      icon: <FaWhatsapp size={20} />, 
      href: 'https://wa.me/5524999037716?text=Olá! Gostaria de mais informações sobre os veículos.', 
      gradient: 'bg-gradient-to-br from-green-500 to-green-600', 
      glow: 'shadow-[0_0_20px_rgba(16,185,129,0.4)]',
      label: 'WhatsApp',
      description: 'Fale conosco no WhatsApp'
    },
    { 
      icon: <FaInstagram size={20} />, 
      href: 'https://www.instagram.com/_jaautomoveis/', 
      gradient: 'bg-gradient-to-br from-pink-500 to-pink-600', 
      glow: 'shadow-[0_0_20px_rgba(236,72,153,0.4)]',
      label: 'Instagram',
      description: 'Siga-nos no Instagram'
    },
    { 
      icon: <FaPhone size={20} />, 
      href: 'tel:+5524999037716', 
      gradient: 'bg-gradient-to-br from-blue-500 to-blue-600', 
      glow: 'shadow-[0_0_20px_rgba(59,130,246,0.4)]',
      label: 'Telefone',
      description: 'Ligue para nós'
    },
  ];

  return (
    <div className="fixed bottom-6 right-6 z-50">
      {/* Botões flutuantes */}
      <div className="flex flex-col items-end space-y-3">
        <AnimatePresence>
          {isExpanded && buttons.map((button, index) => (
            <motion.a
              key={button.label}
              href={button.href}
              target={button.href.startsWith('tel:') ? undefined : '_blank'}
              rel={button.href.startsWith('tel:') ? undefined : 'noopener noreferrer'}
              aria-label={button.description}
              className={`
                ${button.gradient} ${button.glow}
                text-white w-14 h-14 rounded-full 
                flex items-center justify-center 
                shadow-lg hover:shadow-xl
                transition-all duration-300
                group relative
              `}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              initial={{ opacity: 0, x: 20, scale: 0.8 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, x: 20, scale: 0.8 }}
              transition={{ delay: index * 0.1 }}
            >
              {button.icon}
              
              {/* Tooltip */}
              <div className="absolute right-16 top-1/2 transform -translate-y-1/2 bg-gray-900 text-white text-sm px-3 py-2 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 whitespace-nowrap pointer-events-none">
                {button.description}
                <div className="absolute left-full top-1/2 transform -translate-y-1/2 w-0 h-0 border-l-4 border-l-gray-900 border-t-4 border-t-transparent border-b-4 border-b-transparent"></div>
              </div>
            </motion.a>
          ))}
        </AnimatePresence>

        {/* Botão principal */}
        <motion.button
          onClick={() => setIsExpanded(!isExpanded)}
          className="bg-gradient-to-br from-main-red to-red-600 text-white w-16 h-16 rounded-full flex items-center justify-center shadow-[0_0_25px_rgba(210,40,47,0.4)] hover:shadow-[0_0_30px_rgba(210,40,47,0.6)] transition-all duration-300"
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
          aria-label={isExpanded ? 'Fechar menu de contato' : 'Abrir menu de contato'}
          aria-expanded={isExpanded}
        >
          <motion.div
            animate={{ rotate: isExpanded ? 45 : 0 }}
            transition={{ duration: 0.3 }}
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="12" y1="5" x2="12" y2="19"></line>
              <line x1="5" y1="12" x2="19" y2="12"></line>
            </svg>
          </motion.div>
        </motion.button>
      </div>

      {/* Estilo da animação flutuante */}
      <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-8px); }
        }
        
        .floating-animation {
          animation: float 3s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
};

export default FloatingButtons;
