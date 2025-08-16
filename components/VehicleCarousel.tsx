import React, { useState, useEffect } from 'react';
import { Vehicle } from '../types.ts';
import VehicleCard from './VehicleCard.tsx';
import { FiChevronLeft, FiChevronRight } from 'react-icons/fi';
import { motion, AnimatePresence } from 'framer-motion';

interface VehicleCarouselProps {
  vehicles: Vehicle[];
}

const VehicleCarousel: React.FC<VehicleCarouselProps> = ({ vehicles }) => {
  const [currentIndex, setCurrentIndex] = useState(0);

  const getVisibleSlides = () => {
    if (window.innerWidth >= 1280) return 4;
    if (window.innerWidth >= 1024) return 3;
    if (window.innerWidth >= 768) return 2;
    return 1;
  };

  const [visibleSlides, setVisibleSlides] = useState(getVisibleSlides());

  useEffect(() => {
    const handleResize = () => setVisibleSlides(getVisibleSlides());
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const prevSlide = () => {
    setCurrentIndex(prev => (prev === 0 ? Math.max(0, vehicles.length - visibleSlides) : prev - 1));
  };

  const nextSlide = () => {
    setCurrentIndex(prev => (prev >= vehicles.length - visibleSlides ? 0 : prev + 1));
  };

  if (!vehicles.length) {
    return <div className="text-center p-8">Nenhum veículo para exibir.</div>;
  }

  return (
    <div className="relative w-full" role="region" aria-roledescription="carrossel" aria-label="Veículos em destaque">
      {/* Lista de veículos */}
      <div className="overflow-hidden">
        <motion.div
          className="flex"
          animate={{ x: `-${currentIndex * (100 / visibleSlides)}%` }}
          transition={{ type: "spring", stiffness: 80, damping: 20 }}
        >
          {vehicles.map(vehicle => (
            <div key={vehicle.id} className="p-2" style={{ flex: `0 0 ${100 / visibleSlides}%` }}>
              <VehicleCard vehicle={vehicle} />
            </div>
          ))}
        </motion.div>
      </div>

      {/* Botões de navegação */}
      {vehicles.length > visibleSlides && (
        <>
          <button
            onClick={prevSlide}
            className="absolute top-1/2 left-2 md:-left-4 transform -translate-y-1/2 
                       bg-white/30 backdrop-blur-md hover:bg-white/50 
                       rounded-full p-2 shadow-lg transition-all duration-300"
            aria-label="Anterior"
          >
            <FiChevronLeft size={28} className="text-gray-800" />
          </button>
          <button
            onClick={nextSlide}
            className="absolute top-1/2 right-2 md:-right-4 transform -translate-y-1/2 
                       bg-white/30 backdrop-blur-md hover:bg-white/50 
                       rounded-full p-2 shadow-lg transition-all duration-300"
            aria-label="Próximo"
          >
            <FiChevronRight size={28} className="text-gray-800" />
          </button>
        </>
      )}

      {/* Indicadores */}
      <div className="flex justify-center mt-4 space-x-2" role="tablist" aria-label="Indicadores do carrossel">
        {Array.from({ length: vehicles.length - visibleSlides + 1 }, (_, i) => (
          <button
            key={i}
            className={`w-3 h-3 rounded-full transition-all duration-300 ${
              i === currentIndex ? 'bg-main-red scale-110' : 'bg-gray-300'
            }`}
            aria-label={`Slide ${i + 1}`}
            aria-current={i === currentIndex}
            onClick={() => setCurrentIndex(i)}
          >
            <span className="sr-only">{`Ir para o slide ${i + 1}`}</span>
          </button>
        ))}
      </div>
    </div>
  );
};

export default VehicleCarousel;
