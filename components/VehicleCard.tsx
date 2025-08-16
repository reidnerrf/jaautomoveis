
import React, { memo } from 'react';
import { motion } from 'framer-motion';
import { FiEye, FiHeart, FiCalendar, FiSettings, FiDollarSign } from 'react-icons/fi';
import { BsFuelPump } from 'react-icons/bs';
import { AiOutlineSpeedometer } from 'react-icons/ai';
import OptimizedImage from './OptimizedImage';

interface VehicleCardProps {
  vehicle: {
    _id: string;
    brand: string;
    model: string;
    year: number;
    price: number;
    mileage: number;
    fuelType: string;
    transmission: string;
    images: string[];
    description?: string;
    featured?: boolean;
  };
  onView?: (id: string) => void;
  onFavorite?: (id: string) => void;
  isFavorite?: boolean;
  index?: number;
}

const VehicleCard: React.FC<VehicleCardProps> = memo(({ 
  vehicle, 
  onView, 
  onFavorite, 
  isFavorite = false,
  index = 0 
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
      {vehicle.featured && (
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
          alt={`${vehicle.brand} ${vehicle.model}`}
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      </div>

      {/* Content */}
      <div className="p-6">
        {/* Title */}
        <div className="mb-3">
          <h3 className="text-xl font-bold text-gray-900 group-hover:text-blue-600 transition-colors duration-300">
            {vehicle.brand} {vehicle.model}
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
            <AiOutlineSpeedometer className="w-4 h-4 text-green-500" />
            <span>{formatMileage(vehicle.mileage)} km</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <BsFuelPump className="w-4 h-4 text-orange-500" />
            <span>{vehicle.fuelType}</span>
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
