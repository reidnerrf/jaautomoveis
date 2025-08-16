import React, { memo } from 'react';
import { motion } from 'framer-motion';
import { FiEye, FiHeart, FiCalendar, FiSettings, FiDollarSign, FiStar } from 'react-icons/fi';
import { BsFuelPump, BsSpeedometer2 } from 'react-icons/bs';
import OptimizedImage from './OptimizedImage';
import { FaWhatsapp } from 'react-icons/fa';
import { Link } from 'react-router-dom'; // Assuming react-router-dom is used

// Placeholder for RealTimeViewers component
const RealTimeViewers = ({ vehicleId }: { vehicleId: string }) => (
  <div className="bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 font-bold py-3 px-4 rounded-xl flex items-center justify-center transform scale-100 transition-all duration-300 shadow-md">
    <FiEye className="w-4 h-4 mr-2" />
    <span>15</span>
  </div>
);

// Placeholder for trackEvent function
const trackEvent = (event: string, data: any) => {
  console.log(`Tracking event: ${event}`, data);
};

// Placeholder for Vehicle type
interface Vehicle {
  _id: string;
  name: string;
  make: string;
  model: string;
  year: number;
  price: number;
  km: number;
  fuel: string;
  transmission: string;
  images: string[];
  description?: string;
  featured?: boolean;
  id: string; // Assuming 'id' is also available and used for links
}

interface VehicleCardProps {
  vehicle: Vehicle;
  onView?: (id: string) => void;
  onFavorite?: (id: string) => void;
  isFavorite?: boolean;
  index?: number;
  viewMode?: 'grid' | 'list';
}

const VehicleCard: React.FC<VehicleCardProps> = memo(({
  vehicle,
  onView,
  onFavorite,
  isFavorite = false,
  index = 0,
  viewMode = 'grid'
}) => {
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(price);
  };

  const formatMileage = (mileage: number) => {
    return new Intl.NumberFormat('pt-BR').format(mileage);
  };

  const handleCardClick = () => {
    if (onView) {
      onView(vehicle._id);
    }
  };

  const handleFavoriteClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onFavorite) {
      onFavorite(vehicle._id);
    }
  };

  // removed unused helpers

  if (viewMode === 'list') {
    return (
      <motion.div
        className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg hover:shadow-xl border border-gray-200 dark:border-gray-700 overflow-hidden transition-all duration-300 cursor-pointer"
        whileHover={{ scale: 1.01 }}
        onClick={handleCardClick}
      >
        <div className="flex flex-col md:flex-row">
          <div className="md:w-80 h-48 md:h-auto relative overflow-hidden flex-shrink-0">
            <OptimizedImage
              src={vehicle.images?.[0] || '/assets/placeholder-car.jpg'}
              alt={vehicle.name}
              className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-500"
            />
            <div className="absolute top-3 left-3">
              <span className="bg-green-500 text-white px-3 py-1 rounded-full text-sm font-semibold shadow-md">
                Disponível
              </span>
            </div>
            {Boolean(vehicle.featured) && (
              <div className="absolute top-3 right-3 z-10">
                <span className="bg-gradient-to-r from-yellow-400 to-yellow-500 text-white px-3 py-1 rounded-full text-xs font-semibold shadow-lg flex items-center gap-1">
                  <FiStar className="fill-current w-3 h-3" />
                  Destaque
                </span>
              </div>
            )}
             <button
              onClick={handleFavoriteClick}
              className={`absolute top-3 right-14 z-10 p-2 rounded-full transition-all duration-300 ${
                isFavorite
                  ? 'bg-red-500 text-white shadow-lg'
                  : 'bg-white/80 text-gray-600 hover:bg-red-500 hover:text-white'
              } backdrop-blur-sm`}
            >
              <FiHeart className={`w-4 h-4 ${isFavorite ? 'fill-current' : ''}`} />
            </button>
          </div>

          <div className="flex-1 p-6">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2 group-hover:text-blue-600 transition-colors duration-300">
                  {vehicle.make} {vehicle.model}
                </h3>
                <p className="text-sm text-gray-500 mt-1">
                  {vehicle.year} {vehicle.description && vehicle.description.length > 60
                    ? `${vehicle.description.substring(0, 60)}...`
                    : vehicle.description
                  }
                </p>
              </div>
              <div className="text-right">
                <p className="text-3xl font-black text-green-600 dark:text-green-400">
                  {formatPrice(vehicle.price)}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                <FiCalendar className="w-4 h-4 text-blue-500" />
                <span>{vehicle.year}</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                <BsSpeedometer2 className="w-4 h-4 text-green-500" />
                <span>{formatMileage(vehicle.km)} km</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                <BsFuelPump className="w-4 h-4 text-orange-500" />
                <span>{vehicle.fuel}</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                <FiSettings className="w-4 h-4 text-purple-500" />
                <span>{vehicle.transmission}</span>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t border-gray-100 dark:border-gray-700">
              <Link
                to={`/vehicle/${vehicle.id}`}
                className="flex-1 flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-lg text-center transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105"
              >
                <FiEye className="w-4 h-4" />
                Ver Detalhes
              </Link>
              <div className="flex gap-3">
                <a
                  href={`https://wa.me/5511999999999?text=Olá! Tenho interesse no ${vehicle.make} ${vehicle.model} ${vehicle.year}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2 bg-green-500 hover:bg-green-600 text-white font-bold py-3 px-4 rounded-lg transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105"
                  onClick={() => trackEvent('whatsapp_click', { vehicle_id: vehicle.id, vehicle_name: `${vehicle.make} ${vehicle.model}` })}
                >
                  <FaWhatsapp className="w-5 h-5" />
                </a>
                <RealTimeViewers vehicleId={vehicle.id} />
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      className="group relative bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden border border-gray-100 cursor-pointer"
      onClick={handleCardClick}
      whileHover={{ y: -5 }}
    >
      {/* Featured Badge */}
      {Boolean(vehicle.featured) && (
        <div className="absolute top-4 left-4 z-10 bg-gradient-to-r from-yellow-400 to-yellow-500 text-white px-3 py-1 rounded-full text-xs font-semibold shadow-lg">
          ⭐ Destaque
        </div>
      )}

      {/* Favorite Button */}
      <button
        onClick={handleFavoriteClick}
        className={`absolute top-4 right-4 z-10 p-2 rounded-full transition-all duration-300 ${
          isFavorite
            ? 'bg-red-500 text-white shadow-lg'
            : 'bg-white/80 text-gray-600 hover:bg-red-500 hover:text-white'
        } backdrop-blur-sm`}
      >
        <FiHeart className={`w-4 h-4 ${isFavorite ? 'fill-current' : ''}`} />
      </button>

      {/* Image Container */}
      <div className="relative h-48 overflow-hidden">
        <OptimizedImage
          src={vehicle.images?.[0] || '/assets/placeholder-car.jpg'}
          alt={`${vehicle.make} ${vehicle.model}`}
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      </div>

      {/* Content */}
      <div className="p-6">
        {/* Title */}
        <div className="mb-3">
          <h3 className="text-xl font-bold text-gray-900 group-hover:text-blue-600 transition-colors duration-300">
            {vehicle.make} {vehicle.model}
          </h3>
          <p className="text-sm text-gray-500 mt-1">
            {vehicle.description && vehicle.description.length > 60
              ? `${vehicle.description.substring(0, 60)}...`
              : vehicle.description
            }
          </p>
        </div>

        {/* Specs Grid */}
        <div className="grid grid-cols-2 gap-3 mb-4">
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <FiCalendar className="w-4 h-4 text-blue-500" />
            <span>{vehicle.year}</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <BsSpeedometer2 className="w-4 h-4 text-green-500" />
            <span>{formatMileage(vehicle.km)} km</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <BsFuelPump className="w-4 h-4 text-orange-500" />
            <span>{vehicle.fuel}</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <FiSettings className="w-4 h-4 text-purple-500" />
            <span>{vehicle.transmission}</span>
          </div>
        </div>

        {/* Price and Action */}
        <div className="flex items-center justify-between pt-4 border-t border-gray-100">
          <div className="flex items-center gap-2">
            <FiDollarSign className="w-5 h-5 text-green-600" />
            <span className="text-2xl font-bold text-green-600">
              {formatPrice(vehicle.price)}
            </span>
          </div>
          <button
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors duration-300 text-sm font-medium"
            onClick={(e) => {
              e.stopPropagation();
              handleCardClick();
            }}
          >
            <FiEye className="w-4 h-4" />
            Ver Detalhes
          </button>
        </div>
      </div>
    </motion.div>
  );
});

VehicleCard.displayName = 'VehicleCard';

export default VehicleCard;