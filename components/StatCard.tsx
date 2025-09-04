import React from "react";
import { FiArrowUp, FiArrowDown, FiTrendingUp, FiTrendingDown } from "react-icons/fi";

interface StatCardProps {
  title: string;
  value: string;
  rate: string;
  levelUp?: boolean;
  levelDown?: boolean;
  children: React.ReactNode;
  subtitle?: string;
  trend?: number;
  loading?: boolean;
}

const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  rate,
  levelUp,
  levelDown,
  children,
  subtitle,
  trend,
  loading = false,
}) => {
  return (
    <div className="relative overflow-hidden rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-6 shadow-md hover:shadow-xl transition-all duration-300 group">
      {/* Background gradient effect */}
      <div className="absolute inset-0 bg-gradient-to-br from-transparent via-transparent to-gray-50 dark:to-gray-700 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      
      {/* Ícone com destaque */}
      <div className="relative flex h-14 w-14 items-center justify-center rounded-xl bg-gradient-to-tr from-indigo-500 to-indigo-400 text-white shadow-md group-hover:scale-110 transition-transform duration-300">
        {children}
      </div>

      {/* Conteúdo */}
      <div className="relative mt-5 flex items-end justify-between">
        <div className="min-w-0 flex-1">
          <h4 className="text-3xl font-extrabold text-gray-900 dark:text-white">
            {loading ? (
              <div className="animate-pulse bg-gray-300 dark:bg-gray-600 h-8 w-24 rounded"></div>
            ) : (
              value
            )}
          </h4>
          <span className="text-sm font-medium text-gray-500 dark:text-gray-400">{title}</span>
          {subtitle && (
            <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">{subtitle}</p>
          )}
        </div>

        {/* Indicador de variação */}
        <div className="flex flex-col items-end gap-1">
          <span
            className={`shrink-0 flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold shadow-sm
              ${levelUp ? "bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400" : ""}
              ${levelDown ? "bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400" : ""}
              ${!levelUp && !levelDown ? "bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400" : ""}
            `}
          >
            {rate}
            {levelUp ? <FiArrowUp className="w-3 h-3" /> : null}
            {levelDown ? <FiArrowDown className="w-3 h-3" /> : null}
          </span>
          {trend !== undefined && (
            <div className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400">
              {trend > 0 ? (
                <FiTrendingUp className="w-3 h-3 text-green-500" />
              ) : trend < 0 ? (
                <FiTrendingDown className="w-3 h-3 text-red-500" />
              ) : null}
              <span>{Math.abs(trend)}% vs mês anterior</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default StatCard;
