
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
      className="bg-white rounded-lg shadow-lg overflow-hidden flex flex-col group"
      whileHover={{ y: -5, boxShadow: "0 25px 50px -12px rgb(0 0 0 / 0.25)" }}
      transition={{ duration: 0.3 }}
    >
      <div className="relative">
        <img src={vehicle.images[0]} alt={vehicle.name} className="w-full h-56 object-cover" />
        <div className="absolute top-0 right-0 bg-main-red text-white py-1 px-4 rounded-bl-lg font-bold">
          {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(vehicle.price)}
        </div>
      </div>
      <div className="p-4 flex flex-col flex-grow">
        <h3 className="text-xl font-bold text-gray-800 truncate">{vehicle.name}</h3>
        <p className="text-gray-600">{vehicle.make} / {vehicle.model}</p>
        <div className="mt-4 flex justify-between text-sm text-gray-500">
          <span>{vehicle.year}</span>
          <span>{vehicle.km.toLocaleString('pt-BR')} km</span>
        </div>
        <div className="mt-auto pt-4">
          <Link to={`/vehicle/${vehicle.id}`} className="block w-full text-center bg-secondary-blue text-white font-bold py-2 px-4 rounded-md hover:bg-comp-dark-blue transition-colors duration-300">
            Saiba Mais
          </Link>
        </div>
      </div>
    </motion.div>
  );
};

export default VehicleCard;