
import React, { useMemo } from 'react';
import { Vehicle } from '../types.ts';
import { FiCheck } from 'react-icons/fi';

interface PriceComparisonProps {
  vehicle: Vehicle;
}

const PriceComparison: React.FC<PriceComparisonProps> = ({ vehicle }) => {
  const formatCurrency = (value: number) => 
    new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);

  const { advertisedPrice, fipePrice, iCarrosPrice, status, maxPrice } = useMemo(() => {
    const advertised = vehicle.price;
    // Mocking data for FIPE and iCarros based on the advertised price
    // These values are for demonstration purposes to replicate the UI.
    const fipe = advertised * 0.98; // Simulating FIPE is slightly lower
    const iCarros = advertised * 1.015; // Simulating iCarros average is slightly higher

    let statusElement: React.ReactNode;

    if (advertised <= fipe) {
      statusElement = <p className="text-gray-600">Este anúncio está <span className="font-bold text-green-600">abaixo da Tabela FIPE</span></p>;
    } else if (advertised <= iCarros) {
      statusElement = <p className="text-gray-600">Este anúncio está <span className="font-bold text-main-red">na média do iCarros</span></p>;
    } else {
      statusElement = <p className="text-gray-600">Este anúncio está <span className="font-bold text-main-red">acima da média do iCarros</span></p>;
    }
    
    // Add a little padding to maxPrice so no bar is 100% wide, which looks better.
    const maxValue = Math.max(advertised, fipe, iCarros);
    const maxPriceWithPadding = maxValue * 1.05;

    return {
      advertisedPrice: advertised,
      fipePrice: fipe,
      iCarrosPrice: iCarros,
      status: statusElement,
      maxPrice: maxPriceWithPadding,
    };
  }, [vehicle.price]);
  
  const getBarWidth = (value: number) => {
    return `${(value / maxPrice) * 100}%`;
  };

  return (
    <div>
      <h2 className="text-xl font-bold text-gray-800 mb-4">Compare os valores</h2>
      
      <div className="flex items-center text-sm mb-6">
        <FiCheck className="text-main-red mr-2 flex-shrink-0" size={20} />
        {status}
      </div>

      <div className="space-y-5">
        {/* Advertised Price */}
        <div>
          <div className="flex justify-between items-baseline text-sm mb-1.5">
            <span className="text-gray-500">Valor anunciado</span>
            <span className="font-bold text-main-red">{formatCurrency(advertisedPrice)}</span>
          </div>
          <div className="bg-main-red h-2 rounded-full" style={{ width: getBarWidth(advertisedPrice) }}></div>
        </div>
        
        {/* iCarros Price */}
        <div>
          <div className="flex justify-between items-baseline text-sm mb-1.5">
            <span className="text-gray-500">iCarros</span>
            <span className="font-semibold text-gray-700">{formatCurrency(iCarrosPrice)}</span>
          </div>
          <div className="bg-gray-300 h-2 rounded-full" style={{ width: getBarWidth(iCarrosPrice) }}></div>
        </div>

        {/* FIPE Price */}
        <div>
          <div className="flex justify-between items-baseline text-sm mb-1.5">
            <span className="text-gray-500">Tabela FIPE</span>
            <span className="font-semibold text-gray-700">{formatCurrency(fipePrice)}</span>
          </div>
          <div className="bg-gray-300 h-2 rounded-full" style={{ width: getBarWidth(fipePrice) }}></div>
        </div>
      </div>
    </div>
  );
};

export default PriceComparison;
