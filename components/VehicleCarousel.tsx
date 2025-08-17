import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { Vehicle } from '../types.ts';
import VehicleCard from './VehicleCard.tsx';
import { FiChevronLeft, FiChevronRight } from 'react-icons/fi';
import { motion } from 'framer-motion';

interface VehicleCarouselProps {
  vehicles: Vehicle[];
}

const VehicleCarousel: React.FC<VehicleCarouselProps> = React.memo(({ vehicles }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const touchStartXRef = useRef<number | null>(null);
  const touchDeltaXRef = useRef<number>(0);
  const autoPlayRef = useRef<number | null>(null);

  const getVisibleSlides = useCallback(() => {
    if (typeof window === 'undefined') return 1;
    if (window.innerWidth >= 1280) return 4;
    if (window.innerWidth >= 1024) return 3;
    if (window.innerWidth >= 768) return 2;
    return 1;
  }, []);

  const [visibleSlides, setVisibleSlides] = useState(getVisibleSlides);

  useEffect(() => {
    const handleResize = () => setVisibleSlides(getVisibleSlides());
    window.addEventListener('resize', handleResize, { passive: true } as any);
    return () => window.removeEventListener('resize', handleResize);
  }, [getVisibleSlides]);

  const prevSlide = useCallback(() => {
    setCurrentIndex(prev => (prev === 0 ? Math.max(0, vehicles.length - visibleSlides) : prev - 1));
  }, [vehicles.length, visibleSlides]);

  const nextSlide = useCallback(() => {
    setCurrentIndex(prev => (prev >= vehicles.length - visibleSlides ? Math.max(0, vehicles.length - visibleSlides) : prev + 1));
  }, [vehicles.length, visibleSlides]);

  // Auto-play suave em telas menores
  useEffect(() => {
    if (vehicles.length <= visibleSlides) return;
    const isMobile = typeof window !== 'undefined' && window.innerWidth < 768;
    if (!isMobile) return;
    autoPlayRef.current = window.setInterval(() => {
      nextSlide();
    }, 5000);
    return () => {
      if (autoPlayRef.current) window.clearInterval(autoPlayRef.current);
    };
  }, [vehicles.length, visibleSlides, nextSlide]);

  // Suporte a arraste por toque
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const onTouchStart = (e: TouchEvent) => {
      touchStartXRef.current = e.touches[0].clientX;
      touchDeltaXRef.current = 0;
    };
    const onTouchMove = (e: TouchEvent) => {
      if (touchStartXRef.current == null) return;
      touchDeltaXRef.current = e.touches[0].clientX - touchStartXRef.current;
    };
    const onTouchEnd = () => {
      const delta = touchDeltaXRef.current;
      if (Math.abs(delta) > 40) {
        if (delta < 0) nextSlide(); else prevSlide();
      }
      touchStartXRef.current = null;
      touchDeltaXRef.current = 0;
    };

    el.addEventListener('touchstart', onTouchStart, { passive: true });
    el.addEventListener('touchmove', onTouchMove, { passive: true });
    el.addEventListener('touchend', onTouchEnd);

    return () => {
      el.removeEventListener('touchstart', onTouchStart);
      el.removeEventListener('touchmove', onTouchMove);
      el.removeEventListener('touchend', onTouchEnd);
    };
  }, [nextSlide, prevSlide]);

  // Memoize the carousel items to prevent unnecessary re-renders
  const carouselItems = useMemo(() => 
         vehicles.map(vehicle => (
      <div key={vehicle.id} className="p-2 md:p-3 box-border" style={{ flex: `0 0 ${100 / visibleSlides}%` }}>
        <VehicleCard vehicle={vehicle} />
      </div>
    )), [vehicles, visibleSlides]
  );

  // Memoize indicators
  const indicators = useMemo(() => 
    Array.from({ length: Math.max(1, vehicles.length - visibleSlides + 1) }, (_, i) => (
      <motion.button
        key={i}
        onClick={() => setCurrentIndex(i)}
        className={`w-3 h-3 rounded-full transition-all duration-300 ${
          i === currentIndex ? 'bg-main-red scale-110' : 'bg-gray-300'
        }`}
        aria-label={`Ir para slide ${i + 1}`}
        animate={{ scale: i === currentIndex ? 1.2 : 1 }}
      />
    )), [vehicles.length, visibleSlides, currentIndex]
  );

  if (!vehicles.length) {
    return <div className="text-center p-8">Nenhum veículo para exibir.</div>;
  }

  // clamp currentIndex when visibleSlides or vehicles length changes
  useEffect(() => {
    setCurrentIndex((prev) => Math.min(prev, Math.max(0, vehicles.length - visibleSlides)));
  }, [visibleSlides, vehicles.length]);

  return (
    <div className="relative w-full px-2 md:px-4" ref={containerRef}>
      {/* Lista de veículos */}
      <div className="overflow-hidden">
        <motion.div
          className="flex"
          animate={{ x: `-${currentIndex * (100 / visibleSlides)}%` }}
          transition={{ type: "spring", stiffness: 80, damping: 20 }}
        >
          {carouselItems}
        </motion.div>
      </div>

      {/* Botões de navegação */}
      {vehicles.length > visibleSlides && (
        <>
          <button
            onClick={prevSlide}
            className="absolute top-1/2 left-3 transform -translate-y-1/2 
                       bg-white/70 dark:bg-gray-800/60 backdrop-blur-md hover:bg-white/90 dark:hover:bg-gray-800/80 
                       rounded-full p-2 shadow-lg transition-all duration-300"
            aria-label="Previous slide"
          >
            <FiChevronLeft size={28} className="text-gray-800 dark:text-white" />
          </button>
          <button
            onClick={nextSlide}
            className="absolute top-1/2 right-3 transform -translate-y-1/2 
                       bg-white/70 dark:bg-gray-800/60 backdrop-blur-md hover:bg-white/90 dark:hover:bg-gray-800/80 
                       rounded-full p-2 shadow-lg transition-all duration-300"
            aria-label="Next slide"
          >
            <FiChevronRight size={28} className="text-gray-800 dark:text-white" />
          </button>
        </>
      )}

      {/* Indicadores */}
      <div className="flex justify-center mt-4 space-x-2">
        {indicators}
      </div>
    </div>
  );
});

VehicleCarousel.displayName = 'VehicleCarousel';

export default VehicleCarousel;
