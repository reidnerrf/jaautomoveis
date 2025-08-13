
import React from 'react';
import { FaWhatsapp, FaInstagram } from 'react-icons/fa';
import { FiMessageSquare } from 'react-icons/fi';
import { motion } from 'framer-motion';

const FloatingButtons: React.FC = () => {
  const buttons = [
    { icon: <FaWhatsapp size={24} />, href: 'https://wa.me/1234567890', color: 'bg-green-500', label: 'WhatsApp' },
    { icon: <FaInstagram size={24} />, href: 'https://instagram.com', color: 'bg-pink-500', label: 'Instagram' },
  ];

  return (
    <div className="fixed bottom-5 right-5 z-40 flex flex-col items-center space-y-3">
      {buttons.map((button, index) => (
        <motion.a
          key={button.label}
          href={button.href}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={button.label}
          className={`${button.color} text-white w-12 h-12 rounded-full flex items-center justify-center shadow-lg hover:scale-110 transition-transform`}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 + index * 0.1 }}
        >
          {button.icon}
        </motion.a>
      ))}
    </div>
  );
};

export default FloatingButtons;
