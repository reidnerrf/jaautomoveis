import React from 'react';
import { FaWhatsapp, FaInstagram } from 'react-icons/fa';

const FloatingSocialButtons: React.FC = () => {
  return (
    <div className="fixed bottom-6 right-6 z-40 flex flex-col gap-3">
      <a
        href="https://api.whatsapp.com/send?phone=5524999037716&text=Ol%C3%A1%2C%20gostaria%20de%20mais%20informa%C3%A7%C3%B5es"
        target="_blank"
        rel="noopener noreferrer"
        className="w-12 h-12 rounded-full bg-green-500 hover:bg-green-600 text-white flex items-center justify-center shadow-lg transition-colors"
      >
        <FaWhatsapp size={22} />
      </a>
      <a
        href="https://www.instagram.com/_jaautomoveis/"
        target="_blank"
        rel="noopener noreferrer"
        className="w-12 h-12 rounded-full bg-pink-500 hover:bg-pink-600 text-white flex items-center justify-center shadow-lg transition-colors"
      >
        <FaInstagram size={22} />
      </a>
    </div>
  );
};

export default FloatingSocialButtons;