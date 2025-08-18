import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useVehicleData } from '../hooks/useVehicleData.tsx';
import VehicleCarousel from '../components/VehicleCarousel.tsx';
import PriceComparison from '../components/PriceComparison.tsx';
import { FaWhatsapp } from 'react-icons/fa';
import { FiChevronLeft, FiChevronRight, FiArrowLeft, FiTag, FiCalendar, FiTrello, FiSettings, FiDroplet, FiGitCommit, FiFolder, FiX, FiAward, FiShield, FiEye, FiHeart } from 'react-icons/fi';
import { motion, AnimatePresence } from 'framer-motion';
import { Vehicle } from '../types.ts';
import ShareButton from '../components/ShareButton.tsx';
import RealTimeViewers from '../components/RealTimeViewers.tsx';
import SEOHead from '../components/SEOHead.tsx';


const VehicleDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { getVehicleById, vehicles: allVehicles, loading } = useVehicleData();
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [vehicle, setVehicle] = useState<Vehicle | null>(null);
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);
  const [isFavorite, setIsFavorite] = useState(false);

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
            if ((window as any).trackBusinessEvent) {
              (window as any).trackBusinessEvent('vehicle_view', { vehicleId: fetchedVehicle.id, name: fetchedVehicle.name });
            }
          } catch (error) {
            console.warn('Failed to increment view count.', error);
          }
        }
      };
      fetchVehicle();
    }
  }, [id, getVehicleById]);

  // Load favorite state from localStorage
  useEffect(() => {
    if (vehicle) {
      try {
        const likedVehicles = JSON.parse(localStorage.getItem('likedVehicles') || '[]');
        setIsFavorite(likedVehicles.includes(vehicle.id));
      } catch (error) {
        console.warn('Failed to load favorite state:', error);
      }
    }
  }, [vehicle]);

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

  // Generate JSON-LD structured data
  const generateStructuredData = () => {
    const structuredData = {
      "@context": "https://schema.org",
      "@type": "Car",
      "name": vehicle.name,
      "description": `${vehicle.year} ${vehicle.make} ${vehicle.model} - ${vehicle.color} - ${vehicle.km.toLocaleString('pt-BR')} km`,
      "brand": {
        "@type": "Brand",
        "name": vehicle.make
      },
      "model": vehicle.model,
      "vehicleModelDate": vehicle.year.toString(),
      "mileageFromOdometer": {
        "@type": "QuantitativeValue",
        "value": vehicle.km,
        "unitCode": "KMT" // Kilometers
      },
      "color": vehicle.color,
      "numberOfDoors": vehicle.doors,
      "fuelType": vehicle.fuel,
      "vehicleTransmission": vehicle.gearbox,
      "image": vehicle.images,
      "offers": {
        "@type": "Offer",
        "price": vehicle.price,
        "priceCurrency": "BRL",
        "availability": "https://schema.org/InStock",
        "seller": {
          "@type": "Organization",
          "name": "JA Automóveis",
          "url": window.location.origin
        }
      }
    };

    return structuredData;
  };

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

  const toggleFavorite = () => {
    const newFavoriteState = !isFavorite;
    setIsFavorite(newFavoriteState);
    
    if ((window as any).trackBusinessEvent) {
      (window as any).trackBusinessEvent('like_vehicle', { vehicleId: vehicle.id, name: vehicle.name });
    }
    
    try {
      const liked = JSON.parse(localStorage.getItem('likedVehicles') || '[]');
      const set = new Set<string>(liked);
      if (newFavoriteState) {
        set.add(vehicle.id);
      } else {
        set.delete(vehicle.id);
      }
      localStorage.setItem('likedVehicles', JSON.stringify(Array.from(set)));
    } catch (error) {
      console.warn('Failed to save favorite state:', error);
    }
  };

  return (
    <>
      <SEOHead
        title={`${vehicle.year} ${vehicle.make} ${vehicle.model} - R$ ${vehicle.price.toLocaleString('pt-BR')} | JA Automóveis`}
        description={`${vehicle.year} ${vehicle.make} ${vehicle.model} - ${vehicle.color} - ${vehicle.km.toLocaleString('pt-BR')} km - R$ ${vehicle.price.toLocaleString('pt-BR')}. Confira este veículo na JA Automóveis.`}
        keywords={`${vehicle.make}, ${vehicle.model}, ${vehicle.year}, ${vehicle.color}, carro usado, seminovo, JA Automóveis`}
        image={vehicle.images[0]}
        url={`/vehicle/${vehicle.id}`}
        type="product"
      >
        <script type="application/ld+json">
          {JSON.stringify(generateStructuredData())}
        </script>
      </SEOHead>
      
      <div className="bg-gradient-to-br from-gray-50 via-white to-gray-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
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
          <div className="lg:col-span-2 bg-gray-50 dark:bg-gray-800 p-6 rounded-2xl shadow-lg flex flex-col">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center text-sm text-gray-500">
                <FiEye className="mr-2" />
                <span>{vehicle.views || 0} visualizações totais</span>
              </div>
              <button
                onClick={toggleFavorite}
                className={`p-2 rounded-full transition-all ${isFavorite ? 'bg-red-500 text-white' : 'bg-white text-gray-700 hover:bg-red-500 hover:text-white'} shadow`}
                aria-label="Curtir"
                title="Curtir"
              >
                <FiHeart size={18} className={isFavorite ? 'fill-current' : ''} />
              </button>
            </div>
            <div className="mb-4">
              <RealTimeViewers page={`vehicle-${id}`} vehicleId={id} variant="inline" />
            </div>
            <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white">{vehicle.name}</h1>
            <div className="flex items-center gap-1 mt-2 mb-6">
              <span className="text-sm text-gray-500">R$</span>
              <p className="text-4xl font-bold text-main-red drop-shadow-sm">
                {new Intl.NumberFormat('pt-BR').format(vehicle.price)}
              </p>
            </div>

            {/* Selos de confiança */}
            <div className="flex space-x-4 mb-6">
              <div className="flex items-center text-gray-700 dark:text-gray-300"><FiAward className="mr-2 text-main-red" /> Revisado</div>
              <div className="flex items-center text-gray-700 dark:text-gray-300"><FiShield className="mr-2 text-main-red" /> Garantia</div>
            </div>

            {/* Características */}
            <div className="mb-6 bg-white dark:bg-gray-900 p-4 rounded-xl shadow">
              <h2 className="text-xl font-bold text-gray-800 dark:text-white mb-4">Características</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {details.map(detail => (
                  <div key={detail.label} className="flex items-center space-x-2">
                    {detail.icon}
                    <div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">{detail.label}</p>
                      <p className="font-semibold text-gray-800 dark:text-gray-200">{detail.value}</p>
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
                    if ((window as any).trackBusinessEvent) {
                      (window as any).trackBusinessEvent('whatsapp_click', { vehicleId: vehicle.id, name: vehicle.name });
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
            <div className="bg-gray-50 dark:bg-gray-800 p-6 rounded-2xl shadow-lg border border-gray-100 dark:border-gray-700">
              <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-4">Opcionais</h2>
              <ul className="grid grid-cols-1 md:grid-cols-2 gap-2 text-gray-600 dark:text-gray-300">
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
        {vehicle.additionalInfo ? <div className="bg-gray-50 dark:bg-gray-800 p-6 rounded-2xl shadow-lg mt-8">
            <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-4">Informações Adicionais</h2>
            <p className="text-gray-600 dark:text-gray-300 leading-relaxed whitespace-pre-wrap">{vehicle.additionalInfo}</p>
          </div> : null}

        {/* Outros veículos */}
        <div className="mt-16">
          <h2 className="text-3xl font-bold text-center text-gray-800 dark:text-white mb-8">Outros Veículos que Você Pode Gostar</h2>
          <VehicleCarousel vehicles={otherVehicles} />
        </div>
      </div>

      {/* Floating Real-time Viewers Button */}
      <RealTimeViewers page={`vehicle-${id}`} vehicleId={id} variant="fixed" />

      {/* Lightbox */}
      <AnimatePresence>
        {isLightboxOpen ? <motion.div
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
          </motion.div> : null}
      </AnimatePresence>
      </div>
    </>
  );
};

export default VehicleDetailPage;