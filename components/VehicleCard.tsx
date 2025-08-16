import React from 'react';
import { Link } from 'react-router-dom';
import { Vehicle } from '../types.ts';
import { motion } from 'framer-motion';

interface VehicleCardProps {
  vehicle: Vehicle;
}

const VehicleCard: React.FC<VehicleCardProps> = ({ vehicle }) => {
  return (
    <motion.div
      className="bg-white rounded-2xl shadow-md overflow-hidden flex flex-col group transition-all duration-300"
      whileHover={{
        y: -6,
        boxShadow: "0 20px 40px -10px rgba(0,0,0,0.2)"
      }}
      transition={{ duration: 0.3 }}
    >
      {/* Imagem */}
      <div className="relative overflow-hidden">
        <img
          src={vehicle.images[0]}
          alt={vehicle.name}
          loading="lazy"
          decoding="async"
          className="w-full h-56 object-cover transform transition-transform duration-500 group-hover:scale-105"
        />
        {/* Preço */}
        <div className="absolute top-3 right-3 bg-gradient-to-r from-main-red to-red-500 text-white py-1 px-4 rounded-full font-bold shadow-lg text-sm">
          {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(vehicle.price)}
        </div>
      </div>

      {/* Conteúdo */}
      <div className="p-4 flex flex-col flex-grow">
        <h3 className="text-lg font-bold text-gray-800 truncate group-hover:text-main-red transition-colors">
          {vehicle.name}
        </h3>
        <p className="text-gray-500 text-sm">
          {vehicle.make} / {vehicle.model}
        </p>

        {/* Detalhes */}
        <div className="mt-3 flex justify-between text-xs text-gray-500 border-t border-gray-100 pt-2">
          <span>{vehicle.year}</span>
          <span>{vehicle.km.toLocaleString('pt-BR')} km</span>
        </div>

        {/* Botão */}
        <div className="mt-auto pt-4">
          <Link
            to={`/vehicle/${vehicle.id}`}
            className="block w-full text-center bg-secondary-blue text-white font-semibold py-2 px-4 rounded-lg hover:bg-comp-dark-blue transition-colors duration-300"
          >
            Saiba Mais
          </Link>
        </div>
      </div>
    </motion.div>
  );
};

export default VehicleCard;
