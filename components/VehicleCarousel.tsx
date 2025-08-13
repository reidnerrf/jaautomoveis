
import React, { useState, useEffect } from 'react';
import { Vehicle } from '../types.ts';
import VehicleCard from './VehicleCard.tsx';
import { FiChevronLeft, FiChevronRight } from 'react-icons/fi';

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
        <div className="relative w-full">
            <div className="overflow-hidden">
                <div
                    className="flex transition-transform duration-500 ease-in-out"
                    style={{ transform: `translateX(-${currentIndex * (100 / visibleSlides)}%)` }}
                >
                    {vehicles.map(vehicle => (
                        <div key={vehicle.id} className="p-2" style={{ flex: `0 0 ${100 / visibleSlides}%` }}>
                           <VehicleCard vehicle={vehicle} />
                        </div>
                    ))}
                </div>
            </div>

            {vehicles.length > visibleSlides && (
                <>
                    <button onClick={prevSlide} className="absolute top-1/2 left-0 md:-left-4 transform -translate-y-1/2 bg-white/50 hover:bg-white rounded-full p-2 shadow-md z-10">
                        <FiChevronLeft size={28} className="text-gray-800"/>
                    </button>
                    <button onClick={nextSlide} className="absolute top-1/2 right-0 md:-right-4 transform -translate-y-1/2 bg-white/50 hover:bg-white rounded-full p-2 shadow-md z-10">
                        <FiChevronRight size={28} className="text-gray-800"/>
                    </button>
                </>
            )}
        </div>
    );
};

export default VehicleCarousel;