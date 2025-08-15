import React, { useMemo } from 'react';
import { Vehicle } from '../types.ts';
import { FiCheckCircle, FiTrendingUp, FiTrendingDown, FiInfo } from 'react-icons/fi';
import { motion } from 'framer-motion';

interface PriceComparisonProps {
  vehicle: Vehicle;
}

const PriceComparison: React.FC<PriceComparisonProps> = ({ vehicle }) => {
  const formatCurrency = (value: number) =>
    new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);

  const { advertisedPrice, fipePrice, iCarrosPrice, status, maxPrice, tag } = useMemo(() => {
    const advertised = vehicle.price;
    const fipe = advertised * 0.98;
    const iCarros = advertised * 1.015;

    let tagLabel = '';
    let statusElement: React.ReactNode;
    if (advertised <= fipe) {
      tagLabel = 'Oferta Imperdível';
      statusElement = (
        <p className="text-green-700 font-medium">
          <span className="font-bold">Abaixo da Tabela FIPE</span> — Excelente negócio!
        </p>
      );
    } else if (advertised <= iCarros) {
      tagLabel = 'Preço Justo';
      statusElement = (
        <p className="text-yellow-600 font-medium">
          <span className="font-bold">Na média do mercado</span> — Ótima opção.
        </p>
      );
    } else {
      tagLabel = 'Pode Negociar';
      statusElement = (
        <p className="text-red-600 font-medium">
          <span className="font-bold">Acima da média</span> — Vale conversar.
        </p>
      );
    }

    const maxValue = Math.max(advertised, fipe, iCarros);
    const maxPriceWithPadding = maxValue * 1.05;

    return {
      advertisedPrice: advertised,
      fipePrice: fipe,
      iCarrosPrice: iCarros,
      status: statusElement,
      tag: tagLabel,
      maxPrice: maxPriceWithPadding,
    };
  }, [vehicle.price]);

  const getBarWidth = (value: number) => `${(value / maxPrice) * 100}%`;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="relative bg-white/80 backdrop-blur-lg p-6 rounded-2xl shadow-xl border border-gray-100 hover:shadow-2xl transition-all duration-300"
    >
      {/* Etiqueta no topo */}
      <span className="absolute -top-3 left-4 bg-main-red text-white text-xs font-bold px-3 py-1 rounded-full shadow-md">
        {tag}
      </span>

      <h2 className="text-xl font-extrabold text-gray-900 mb-4 flex items-center gap-2">
        <FiInfo className="text-main-red" size={22} /> Comparativo de Preços
      </h2>

      {/* Status */}
      <div className="flex items-center gap-2 bg-comp-light-gray/50 p-3 rounded-lg mb-5">
        <FiCheckCircle className="text-main-red" size={20} />
        {status}
      </div>

      <div className="space-y-5">
        {/* Valor anunciado */}
        <div>
          <div className="flex justify-between items-center text-sm mb-1">
            <span className="text-gray-600 flex items-center gap-1 font-medium">
              <FiTrendingUp /> Valor anunciado
            </span>
            <span className="font-bold text-green-600">{formatCurrency(advertisedPrice)}</span>
          </div>
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: getBarWidth(advertisedPrice) }}
            transition={{ duration: 0.8 }}
            className="h-2 rounded-full bg-gradient-to-r from-green-400 to-green-600 shadow-inner"
          />
        </div>

        {/* iCarros */}
        <div>
          <div className="flex justify-between items-center text-sm mb-1">
            <span className="text-gray-600 flex items-center gap-1 font-medium">
              <FiTrendingUp /> iCarros
            </span>
            <span className="font-semibold text-gray-700">{formatCurrency(iCarrosPrice)}</span>
          </div>
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: getBarWidth(iCarrosPrice) }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="h-2 rounded-full bg-gradient-to-r from-gray-300 to-gray-500 shadow-inner"
          />
        </div>

        {/* FIPE */}
        <div>
          <div className="flex justify-between items-center text-sm mb-1">
            <span className="text-gray-600 flex items-center gap-1 font-medium">
              <FiTrendingDown /> Tabela FIPE
            </span>
            <span className="font-semibold text-gray-700">{formatCurrency(fipePrice)}</span>
          </div>
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: getBarWidth(fipePrice) }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="h-2 rounded-full bg-gradient-to-r from-red-400 to-red-600 shadow-inner"
          />
        </div>
      </div>
    </motion.div>
  );
};

export default PriceComparison;
