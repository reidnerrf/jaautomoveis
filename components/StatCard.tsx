import React from 'react';
import { FiArrowUp, FiArrowDown } from 'react-icons/fi';

interface StatCardProps {
    title: string;
    value: string;
    rate: string;
    levelUp?: boolean;
    levelDown?: boolean;
    children: React.ReactNode;
}

const StatCard: React.FC<StatCardProps> = ({ title, value, rate, levelUp, levelDown, children }) => {
  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-md hover:shadow-xl transition-all duration-300">
      
      {/* Ícone com destaque */}
      <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-gradient-to-tr from-indigo-500 to-indigo-400 text-white shadow-md">
        {children}
      </div>

      {/* Conteúdo */}
      <div className="mt-5 flex items-end justify-between">
        <div>
          <h4 className="text-3xl font-extrabold text-gray-900">{value}</h4>
          <span className="text-sm font-medium text-gray-500">{title}</span>
        </div>

        {/* Indicador de variação */}
        <span
          className={`flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold shadow-sm
            ${levelUp ? 'bg-green-100 text-green-600' : ''}
            ${levelDown ? 'bg-red-100 text-red-600' : ''}
          `}
        >
          {rate}
          {levelUp && <FiArrowUp />}
          {levelDown && <FiArrowDown />}
        </span>
      </div>
    </div>
  );
};

export default StatCard;
