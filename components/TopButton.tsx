import React from 'react';
import { FiChevronUp } from 'react-icons/fi';

const TopButton = () => (
  <button
    onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
    className="fixed bottom-8 left-8 z-40 bg-main-red text-white p-3 rounded-full shadow-lg hover:bg-red-700 transition-colors flex items-center focus:outline-none focus-visible:ring-4 focus-visible:ring-red-300"
    aria-label="Voltar ao topo"
  >
    <FiChevronUp size={28} />
  </button>
);

export default TopButton;