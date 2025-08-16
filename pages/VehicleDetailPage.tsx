import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useVehicleData } from '../hooks/useVehicleData.tsx';
import VehicleCarousel from '../components/VehicleCarousel.tsx';
import PriceComparison from '../components/PriceComparison.tsx';
import { FaWhatsapp } from 'react-icons/fa';
import { FiChevronLeft, FiChevronRight, FiArrowLeft, FiTag, FiCalendar, FiTrello, FiSettings, FiDroplet, FiGitCommit, FiFolder, FiX, FiAward, FiShield, FiEye } from 'react-icons/fi';
import { motion, AnimatePresence } from 'framer-motion';
import { Vehicle } from '../types.ts';
import TopButton from '../components/TopButton.tsx';
import ShareButton from '../components/ShareButton.tsx';
import RealTimeViewers from '../components/RealTimeViewers.tsx';


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
          // Increment view count, fire and forget
          try {
            await fetch(`/api/vehicles/${id}/view`, { method: 'POST' });
          } catch (error) {
            console.warn('Failed to increment view count.', error);
          }
        }
      };
      fetchVehicle();
    }
  }, [id, getVehicleById]);

  if (loading && !vehicle) {
    return <div className="text-center py-16">Carregando...</div>;
  }

  if (!vehicle) {
    return (
      <div className="text-center py-16">
        Veículo não encontrado.{" "}
        <Link to="/inventory" className="text-main-red">
          Voltar para o estoque
        </Link>
      </div>
    );
  }

  const nextImage = () => {
    setCurrentImageIndex(prev => (prev + 1) % vehicle.images.length);
  };

  const prevImage = () => {
    setCurrentImageIndex(prev => (prev - 1 + vehicle.images.length) % vehicle.images.length);
  };

  const details = [
    { icon: <FiTag className="text-main-red" />, label: 'Marca', value: vehicle.make },
    { icon: <FiTrello className="text-main-red" />, label: 'Modelo', value: vehicle.model },
    { icon: <FiCalendar className="text-main-red" />, label: 'Ano', value: vehicle.year },
    { icon: <FiSettings className="text-main-red" />, label: 'Quilometragem', value: `${vehicle.km.toLocaleString('pt-BR')} km` },
    { icon: <FiDroplet className="text-main-red" />, label: 'Cor', value: vehicle.color },
    { icon: <FiGitCommit className="text-main-red" />, label: 'Câmbio', value: vehicle.gearbox },
    { icon: <FiFolder className="text-main-red" />, label: 'Combustível', value: vehicle.fuel },
    { icon: <FiTag className="text-main-red" />, label: 'Portas', value: vehicle.doors },
  ];

  const otherVehicles = allVehicles.filter(v => v.id !== id).slice(0, 5);

  return (
    <div className="bg-white">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Seta para voltar ao estoque */}
<div className="mb-4">
  <Link to="/inventory" className="inline-flex items-center text-main-red hover:underline">
    <FiArrowLeft className="mr-1" /> Voltar ao estoque
  </Link>
</div>
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">

          {/* Galeria de imagens */}
          <div className="lg:col-span-3">
            <div className="relative rounded-2xl overflow-hidden shadow-xl">
              <motion.img
                whileHover={{ scale: 1.02 }}
                src={vehicle.images[currentImageIndex]}
                alt={`${vehicle.name} - ${currentImageIndex + 1}`}
                className="w-full h-[26rem] object-cover cursor-pointer transition-all"
                onClick={() => setIsLightboxOpen(true)}
              />
              {vehicle.images.length > 1 && (
                <>
                  <button onClick={prevImage} className="absolute top-1/2 left-3 transform -translate-y-1/2 bg-black/30 text-white p-2 rounded-full hover:bg-black/50 transition">
                    <FiChevronLeft size={24} />
                  </button>
                  <button onClick={nextImage} className="absolute top-1/2 right-3 transform -translate-y-1/2 bg-black/30 text-white p-2 rounded-full hover:bg-black/50 transition">
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
                  className={`w-24 h-20 object-cover rounded-lg cursor-pointer border-2 ${index === currentImageIndex ? 'border-main-red' : 'border-transparent'} transition`}
                  onClick={() => setCurrentImageIndex(index)}
                />
              ))}
            </div>
          </div>

          {/* Informações do veículo */}
          <div className="lg:col-span-2 bg-gray-50 p-6 rounded-2xl shadow-lg flex flex-col">
            <div className="flex items-center text-sm text-gray-500 mb-6">
              <FiEye className="mr-2" />
              <span>{vehicle.views || 0} visualizações</span>
            </div>
            <span className="inline-block bg-main-red text-white text-xs font-bold px-3 py-1 rounded-full shadow-md mb-2">
              Oferta Especial 🚗
            </span>
            <h1 className="text-3xl font-extrabold text-gray-900">{vehicle.name}</h1>
            <p className="text-4xl font-bold text-main-red mt-2 mb-6 drop-shadow-sm">
              {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(vehicle.price)}
            </p>

            {/* Selos de confiança */}
            <div className="flex space-x-4 mb-6">
              <div className="flex items-center text-gray-700"><FiAward className="mr-2 text-main-red" /> Revisado</div>
              <div className="flex items-center text-gray-700"><FiShield className="mr-2 text-main-red" /> Garantia</div>
            </div>

            {/* Características */}
            <div className="mb-6 bg-white p-4 rounded-xl shadow">
              <h2 className="text-xl font-bold text-gray-800 mb-4">Características</h2>
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

            {/* Botão WhatsApp */}
            <div className="flex flex-col sm:flex-row gap-4">
                <a
                  href={`https://api.whatsapp.com/send?phone=5524999037716&text=Tenho interesse no ${vehicle.name} ${vehicle.year}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1"
                  onClick={() => {
                    if ((window as any).trackRealTimeAction) {
                      (window as any).trackRealTimeAction('whatsapp_click', 'contact', vehicle.name);
                    }
                  }}
                >
                  <button className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-6 rounded-lg flex items-center justify-center gap-2 transition-colors">
                    <FaWhatsapp size={20} />
                    Tenho Interesse
                  </button>
                </a>
                <Link to="/financing" className="flex-1">
                  <button className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-lg transition-colors">
                    Simular Financiamento
                  </button>
                </Link>
                <ShareButton vehicle={vehicle} />
              </div>
          </div>
        </div>

        {/* Opcionais e Comparativo */}
        <div className="mt-12 grid grid-cols-1 lg:grid-cols-2 gap-8">
          {vehicle.optionals?.length > 0 && vehicle.optionals[0] !== '' && (
            <div className="bg-gray-50 p-6 rounded-2xl shadow-lg border border-gray-100">
              <h2 className="text-2xl font-bold text-gray-800 mb-4">Opcionais</h2>
              <ul className="grid grid-cols-1 md:grid-cols-2 gap-2 text-gray-600">
                {vehicle.optionals.map(opt => (
                  <li key={opt} className="flex items-center">
                    <FiChevronRight className="text-main-red mr-2" />
                    {opt}
                  </li>
                ))}
              </ul>
            </div>
          )}
          <PriceComparison vehicle={vehicle} />
        </div>

        {/* Informações adicionais */}
        {vehicle.additionalInfo && (
          <div className="bg-gray-50 p-6 rounded-2xl shadow-lg mt-8">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">Informações Adicionais</h2>
            <p className="text-gray-600 leading-relaxed whitespace-pre-wrap">{vehicle.additionalInfo}</p>
          </div>
        )}

        {/* Outros veículos */}
        <div className="mt-16">
          <h2 className="text-3xl font-bold text-center text-gray-800 mb-8">Outros Veículos que Você Pode Gostar</h2>
          <VehicleCarousel vehicles={otherVehicles} />
        </div>
      </div>

      {/* Lightbox */}
      <AnimatePresence>
        {isLightboxOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4"
            onClick={() => setIsLightboxOpen(false)}
          >
            <div
              className="relative w-full h-full flex items-center justify-center"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Botão fechar */}
              <button
                onClick={() => setIsLightboxOpen(false)}
                className="absolute top-4 right-4 text-white hover:text-main-red transition z-50"
              >
                <FiX size={40} />
              </button>

              {/* Botão anterior */}
              {vehicle.images.length > 1 && (
                <button
                  onClick={prevImage}
                  className="absolute left-2 md:left-10 top-1/2 transform -translate-y-1/2 bg-black/30 text-white p-3 rounded-full hover:bg-black/50 transition z-50"
                >
                  <FiChevronLeft size={32} />
                </button>
              )}

              {/* Imagem */}
              <motion.img
                key={currentImageIndex}
                initial={{ opacity: 0.5, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.2 }}
                src={vehicle.images[currentImageIndex]}
                alt={`${vehicle.name} - ${currentImageIndex + 1}`}
                className="max-w-full max-h-[90vh] object-contain rounded-lg shadow-2xl"
              />

              {/* Botão próximo */}
              {vehicle.images.length > 1 && (
                <button
                  onClick={nextImage}
                  className="absolute right-2 md:right-10 top-1/2 transform -translate-y-1/2 bg-black/30 text-white p-3 rounded-full hover:bg-black/50 transition z-50"
                >
                  <FiChevronRight size={32} />
                </button>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <RealTimeViewers page={`/vehicle/${id}`} vehicleId={id} />
      <TopButton />

      {/* Botão fixo WhatsApp no mobile */}
      <a
        href={`https://wa.me/5524999037716?text=${encodeURIComponent(`Olá, tenho interesse no ${vehicle.name} ${vehicle.year} ${vehicle.color}`)}`}
        target="_blank"
        rel="noopener noreferrer"
        className="fixed bottom-4 right-4 bg-green-500 hover:bg-green-600 text-white p-4 rounded-full shadow-lg lg:hidden transition"
      >
        <FaWhatsapp size={28} />
      </a>
    </div>
  );
};

export default VehicleDetailPage;