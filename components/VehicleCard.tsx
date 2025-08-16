import React from 'react';
import { Link } from 'react-router-dom';
import { Vehicle } from '../types.ts';
import { motion } from 'framer-motion';
import { FiCalendar, FiSettings, FiMapPin, FiStar } from 'react-icons/fi';

interface VehicleCardProps {
  vehicle: Vehicle;
}

const VehicleCard: React.FC<VehicleCardProps> = ({ vehicle }) => {
  // Calcular idade do veículo
  const currentYear = new Date().getFullYear();
  const vehicleAge = currentYear - vehicle.year;
  
  // Determinar status do veículo baseado na quilometragem
  const getKmStatus = (km: number) => {
    if (km < 50000) return { text: 'Baixa KM', color: 'bg-green-500' };
    if (km < 100000) return { text: 'Média KM', color: 'bg-yellow-500' };
    return { text: 'Alta KM', color: 'bg-orange-500' };
  };

  const kmStatus = getKmStatus(vehicle.km);

  return (
    <motion.div
      className="bg-white rounded-2xl shadow-lg overflow-hidden flex flex-col group transition-all duration-300 border border-gray-100"
      whileHover={{
        y: -8,
        boxShadow: "0 25px 50px -12px rgba(0,0,0,0.25)"
      }}
      transition={{ duration: 0.3 }}
    >
      {/* Imagem */}
      <div className="relative overflow-hidden">
        <img
          src={vehicle.images[0]}
          alt={vehicle.name}
          className="w-full h-56 object-cover transform transition-transform duration-500 group-hover:scale-110"
          loading="lazy"
        />
        
        {/* Overlay com informações rápidas */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <div className="absolute bottom-3 left-3 right-3">
            <div className="flex items-center justify-between text-white text-sm">
              <span className="flex items-center gap-1">
                <FiCalendar size={14} />
                {vehicleAge} {vehicleAge === 1 ? 'ano' : 'anos'}
              </span>
              <span className="flex items-center gap-1">
                <FiSettings size={14} />
                {vehicle.gearbox}
              </span>
            </div>
          </div>
        </div>

        {/* Preço */}
        <div className="absolute top-3 right-3 bg-gradient-to-r from-main-red to-red-600 text-white py-2 px-4 rounded-full font-bold shadow-lg text-sm">
          {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(vehicle.price)}
        </div>

        {/* Status da KM */}
        <div className={`absolute top-3 left-3 ${kmStatus.color} text-white py-1 px-3 rounded-full text-xs font-semibold shadow-md`}>
          {kmStatus.text}
        </div>
      </div>

      {/* Conteúdo */}
      <div className="p-5 flex flex-col flex-grow">
        <div className="mb-3">
          <h3 className="text-lg font-bold text-gray-800 group-hover:text-main-red transition-colors line-clamp-2">
            {vehicle.name}
          </h3>
          <p className="text-gray-500 text-sm mt-1">
            {vehicle.make} • {vehicle.model}
          </p>
        </div>

        {/* Detalhes principais */}
        <div className="grid grid-cols-2 gap-3 mb-4">
          <div className="flex items-center text-sm text-gray-600">
            <FiCalendar className="text-main-red mr-2" size={16} />
            <span>{vehicle.year}</span>
          </div>
          <div className="flex items-center text-sm text-gray-600">
            <FiSettings className="text-main-red mr-2" size={16} />
            <span>{vehicle.km.toLocaleString('pt-BR')} km</span>
          </div>
          <div className="flex items-center text-sm text-gray-600">
            <FiMapPin className="text-main-red mr-2" size={16} />
            <span>{vehicle.color}</span>
          </div>
          <div className="flex items-center text-sm text-gray-600">
            <FiStar className="text-main-red mr-2" size={16} />
            <span>{vehicle.fuel}</span>
          </div>
        </div>

        {/* Botão */}
        <div className="mt-auto">
          <Link
            to={`/vehicle/${vehicle.id}`}
            className="block w-full text-center bg-gradient-to-r from-secondary-blue to-comp-dark-blue text-white font-semibold py-3 px-4 rounded-xl hover:from-comp-dark-blue hover:to-secondary-blue transition-all duration-300 transform hover:scale-105 shadow-md"
          >
            Ver Detalhes
          </Link>
        </div>
      </div>
    </motion.div>
  );
};

export default VehicleCard;
