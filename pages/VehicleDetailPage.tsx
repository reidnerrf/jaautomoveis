
import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useVehicleData } from '../hooks/useVehicleData.tsx';
import VehicleCarousel from '../components/VehicleCarousel.tsx';
import PriceComparison from '../components/PriceComparison.tsx';
import { FaWhatsapp } from 'react-icons/fa';
import { FiChevronLeft, FiChevronRight, FiTag, FiCalendar, FiTrello, FiSettings, FiDroplet, FiGitCommit, FiFolder, FiX } from 'react-icons/fi';
import { motion } from 'framer-motion';
import { Vehicle } from '../types.ts';

const VehicleDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { getVehicleById, vehicles: allVehicles, loading } = useVehicleData();
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [vehicle, setVehicle] = useState<Vehicle | null>(null);
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);

  useEffect(() => {
    window.scrollTo(0, 0);
    if (id) {
      const fetchVehicle = async () => {
        const fetchedVehicle = await getVehicleById(id);
        if (fetchedVehicle) {
          setVehicle(fetchedVehicle);
        }
      };
      fetchVehicle();
    }
  }, [id, getVehicleById]);
  
  const openLightbox = () => {
    if (vehicle && vehicle.images.length > 0) {
      setIsLightboxOpen(true);
    }
  };

  const closeLightbox = () => {
    setIsLightboxOpen(false);
  };
  
  if (loading && !vehicle) {
     return <div className="text-center py-16">Carregando...</div>;
  }
  
  if (!vehicle) {
    return <div className="text-center py-16">Veículo não encontrado. <Link to="/inventory" className="text-main-red">Voltar para o estoque</Link></div>;
  }
  
  const nextImage = () => {
    setCurrentImageIndex(prev => (prev + 1) % vehicle.images.length);
  };

  const prevImage = () => {
    setCurrentImageIndex(prev => (prev - 1 + vehicle.images.length) % vehicle.images.length);
  };
  
  const otherVehicles = allVehicles.filter(v => v.id !== id).slice(0, 5);

  const details = [
    { icon: <FiTag className="text-main-red"/>, label: 'Marca', value: vehicle.make },
    { icon: <FiTrello className="text-main-red"/>, label: 'Modelo', value: vehicle.model },
    { icon: <FiCalendar className="text-main-red"/>, label: 'Ano', value: vehicle.year },
    { icon: <FiSettings className="text-main-red"/>, label: 'Quilometragem', value: `${vehicle.km.toLocaleString('pt-BR')} km` },
    { icon: <FiDroplet className="text-main-red"/>, label: 'Cor', value: vehicle.color },
    { icon: <FiGitCommit className="text-main-red"/>, label: 'Câmbio', value: vehicle.gearbox },
    { icon: <FiFolder className="text-main-red"/>, label: 'Combustível', value: vehicle.fuel },
    { icon: <FiTag className="text-main-red"/>, label: 'Portas', value: vehicle.doors },
  ];

  return (
    <div className="bg-white">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
          {/* Image Gallery */}
          <div className="lg:col-span-3">
             <div className="relative">
                <motion.img
                    whileHover={{ scale: 1.02 }}
                    src={vehicle.images[currentImageIndex]}
                    alt={`${vehicle.name} - ${currentImageIndex + 1}`}
                    className="w-full rounded-lg shadow-xl object-cover h-[26rem] cursor-pointer hover:opacity-95 transition-opacity"
                    onClick={openLightbox}
                />
                {vehicle.images.length > 1 && (
                    <>
                    <button onClick={prevImage} className="absolute top-1/2 left-2 transform -translate-y-1/2 bg-black/30 text-white p-2 rounded-full hover:bg-black/50 transition-colors">
                        <FiChevronLeft size={24} />
                    </button>
                    <button onClick={nextImage} className="absolute top-1/2 right-2 transform -translate-y-1/2 bg-black/30 text-white p-2 rounded-full hover:bg-black/50 transition-colors">
                        <FiChevronRight size={24} />
                    </button>
                    </>
                )}
            </div>
            <div className="flex space-x-2 mt-4 overflow-x-auto pb-2">
                {vehicle.images.map((img, index) => (
                    <img
                        key={index}
                        src={img}
                        alt={`${vehicle.name} thumbnail ${index + 1}`}
                        className={`w-24 h-20 object-cover rounded-md cursor-pointer border-2 flex-shrink-0 ${index === currentImageIndex ? 'border-main-red' : 'border-transparent'}`}
                        onClick={() => setCurrentImageIndex(index)}
                    />
                ))}
            </div>
          </div>

          {/* Vehicle Info */}
          <div className="lg:col-span-2 bg-comp-light-gray p-6 rounded-lg shadow-lg flex flex-col">
            <h1 className="text-3xl font-bold text-gray-900">{vehicle.name}</h1>
            <p className="text-2xl font-semibold text-main-red mt-2 mb-6">{new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(vehicle.price)}</p>
            
            <div className="mb-6">
              <PriceComparison vehicle={vehicle} />
            </div>

            <a
              href={`https://wa.me/5524999037716?text=${encodeURIComponent(`Olá, tenho interesse no ${vehicle.name} ${vehicle.year} ${vehicle.color}`)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full flex items-center justify-center bg-green-500 text-white font-bold py-3 px-4 rounded-lg hover:bg-green-600 transition-colors duration-300 mt-auto"
            >
              <FaWhatsapp size={22} className="mr-2" />
              Contatar no WhatsApp
            </a>
          </div>
        </div>

        {/* Details Section */}
        <div className="mt-12">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
                <div className="space-y-8">
                  <div className="bg-comp-light-gray p-6 rounded-lg shadow-lg">
                      <h2 className="text-2xl font-bold text-gray-800 mb-4">Características</h2>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          {details.map(detail => (
                              <div key={detail.label} className="flex items-center space-x-2">
                                  {detail.icon}
                                  <div>
                                      <p className="text-sm text-gray-500">{detail.label}</p>
                                      <p className="font-semibold text-gray-800">{detail.value}</p>
                                  </div>
                              </div>
                          ))}
                      </div>
                  </div>
                  {vehicle.optionals && vehicle.optionals.length > 0 && vehicle.optionals[0] !== '' && (
                    <div className="bg-comp-light-gray p-6 rounded-lg shadow-lg">
                        <h2 className="text-2xl font-bold text-gray-800 mb-4">Opcionais</h2>
                        <ul className="space-y-2 text-gray-600 grid grid-cols-1 md:grid-cols-2 gap-x-4">
                            {vehicle.optionals.map(opt => <li key={opt} className="flex items-center"><FiChevronRight className="text-main-red mr-2"/>{opt}</li>)}
                        </ul>
                    </div>
                  )}
                </div>
                
                {vehicle.additionalInfo && (
                  <div className="bg-comp-light-gray p-6 rounded-lg shadow-lg">
                      <h2 className="text-2xl font-bold text-gray-800 mb-4">Informações Adicionais</h2>
                      <p className="text-gray-600 leading-relaxed whitespace-pre-wrap">{vehicle.additionalInfo}</p>
                  </div>
                )}
            </div>
        </div>

        {/* Other Cars Carousel */}
        <div className="mt-16">
          <h2 className="text-3xl font-bold text-center text-gray-800 mb-8">Outros Veículos que Você Pode Gostar</h2>
          <VehicleCarousel vehicles={otherVehicles} />
        </div>
      </div>
      
      {/* Lightbox Modal */}
      {isLightboxOpen && (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4"
            onClick={closeLightbox}
        >
            <button
                onClick={closeLightbox}
                className="absolute top-4 right-4 text-white hover:text-main-red transition-colors z-[60]"
                aria-label="Fechar imagem"
            >
                <FiX size={40} />
            </button>

            <div className="relative w-full h-full flex items-center justify-center" onClick={e => e.stopPropagation()}>
                {vehicle.images.length > 1 && (
                    <button
                        onClick={prevImage}
                        className="absolute left-2 md:left-10 top-1/2 transform -translate-y-1/2 bg-black/30 text-white p-3 rounded-full hover:bg-black/50 transition-colors z-[60]"
                        aria-label="Imagem anterior"
                    >
                        <FiChevronLeft size={32} />
                    </button>
                )}

                <motion.img
                    key={currentImageIndex}
                    initial={{ opacity: 0.5, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.2 }}
                    src={vehicle.images[currentImageIndex]}
                    alt={`${vehicle.name} - ${currentImageIndex + 1}`}
                    className="max-w-full max-h-[90vh] object-contain rounded-lg shadow-2xl"
                />

                {vehicle.images.length > 1 && (
                    <button
                        onClick={nextImage}
                        className="absolute right-2 md:right-10 top-1/2 transform -translate-y-1/2 bg-black/30 text-white p-3 rounded-full hover:bg-black/50 transition-colors z-[60]"
                        aria-label="Próxima imagem"
                    >
                        <FiChevronRight size={32} />
                    </button>
                )}
            </div>
        </motion.div>
      )}
    </div>
  );
};

export default VehicleDetailPage;
