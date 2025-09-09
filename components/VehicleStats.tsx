import React from "react";
import { motion } from "framer-motion";
import {
  FiDollarSign,
  FiTrendingUp,
  FiTrendingDown,
  FiTarget,
  FiClock,
  FiStar,
  FiUsers,
} from "react-icons/fi";
import { FaCar } from "react-icons/fa";
import {
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";

interface VehicleStatsProps {
  vehicles: any[];
}

const VehicleStats: React.FC<VehicleStatsProps> = ({ vehicles }) => {
  // Cálculos de estatísticas
  const stats = React.useMemo(() => {
    const totalVehicles = vehicles.length;
    const availableVehicles = vehicles.filter((v) => v.status === "disponivel").length;
    const soldVehicles = vehicles.filter((v) => v.status === "vendido").length;
    const reservedVehicles = vehicles.filter((v) => v.status === "reservado").length;

    const totalValue = vehicles.reduce((sum, v) => sum + (v.price || 0), 0);
    const totalCost = vehicles.reduce((sum, v) => sum + (v.cost || 0), 0);
    const totalProfit = totalValue - totalCost;

    const avgPrice = totalVehicles > 0 ? totalValue / totalVehicles : 0;
    const avgCost = totalVehicles > 0 ? totalCost / totalVehicles : 0;
    const avgProfit = totalVehicles > 0 ? totalProfit / totalVehicles : 0;

    const conversionRate = totalVehicles > 0 ? (soldVehicles / totalVehicles) * 100 : 0;

    // Top marcas
    const makeStats = vehicles.reduce(
      (acc, v) => {
        const make = v.make || "Outros";
        acc[make] = (acc[make] || 0) + 1;
        return acc;
      },
      {} as Record<string, number>
    );

    const topMakes = Object.entries(makeStats)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 5)
      .map(([make, count]) => ({ make, count }));

    // Top modelos
    const modelStats = vehicles.reduce(
      (acc, v) => {
        const model = v.model || "Outros";
        acc[model] = (acc[model] || 0) + 1;
        return acc;
      },
      {} as Record<string, number>
    );

    const topModels = Object.entries(modelStats)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 5)
      .map(([model, count]) => ({ model, count }));

    // Distribuição por status
    const statusDistribution = [
      { name: "Disponíveis", value: availableVehicles, color: "#10B981" },
      { name: "Vendidos", value: soldVehicles, color: "#3B82F6" },
      { name: "Reservados", value: reservedVehicles, color: "#F59E0B" },
    ];

    // Distribuição por faixa de preço
    const priceRanges = [
      { range: "Até R$ 50k", min: 0, max: 50000, color: "#10B981" },
      { range: "R$ 50k - R$ 100k", min: 50000, max: 100000, color: "#3B82F6" },
      { range: "R$ 100k - R$ 200k", min: 100000, max: 200000, color: "#F59E0B" },
      { range: "Acima de R$ 200k", min: 200000, max: Infinity, color: "#EF4444" },
    ];

    const priceDistribution = priceRanges.map((range) => ({
      range: range.range,
      count: vehicles.filter((v) => {
        const price = v.price || 0;
        return price >= range.min && price < range.max;
      }).length,
      color: range.color,
    }));

    // Veículos mais antigos no estoque
    const oldVehicles = vehicles
      .filter((v) => v.status === "disponivel" && v.createdAt)
      .map((v) => ({
        ...v,
        daysInStock: Math.floor(
          (Date.now() - new Date(v.createdAt).getTime()) / (1000 * 60 * 60 * 24)
        ),
      }))
      .sort((a, b) => b.daysInStock - a.daysInStock)
      .slice(0, 5);

    return {
      totalVehicles,
      availableVehicles,
      soldVehicles,
      reservedVehicles,
      totalValue,
      totalCost,
      totalProfit,
      avgPrice,
      avgCost,
      avgProfit,
      conversionRate,
      topMakes,
      topModels,
      statusDistribution,
      priceDistribution,
      oldVehicles,
    };
  }, [vehicles]);

  const COLORS = ["#10B981", "#3B82F6", "#F59E0B", "#EF4444"];

  return (
    <div className="space-y-6">
      {/* Métricas Principais */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg border border-gray-200 dark:border-gray-700"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                Total de Veículos
              </p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {stats.totalVehicles}
              </p>
            </div>
            <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-full">
              <FaCar className="text-blue-600 dark:text-blue-400" size={24} />
            </div>
          </div>
          <div className="mt-2">
            <span className="text-sm text-gray-500 dark:text-gray-400">
              {stats.availableVehicles} disponíveis
            </span>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg border border-gray-200 dark:border-gray-700"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                Taxa de Conversão
              </p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {stats.conversionRate.toFixed(1)}%
              </p>
            </div>
            <div className="p-3 bg-green-100 dark:bg-green-900/30 rounded-full">
              <FiTarget className="text-green-600 dark:text-green-400" size={24} />
            </div>
          </div>
          <div className="mt-2">
            <span className="text-sm text-gray-500 dark:text-gray-400">
              {stats.soldVehicles} vendidos
            </span>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg border border-gray-200 dark:border-gray-700"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Valor Total</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                R$ {stats.totalValue.toLocaleString("pt-BR", { maximumFractionDigits: 0 })}
              </p>
            </div>
            <div className="p-3 bg-emerald-100 dark:bg-emerald-900/30 rounded-full">
              <FiDollarSign className="text-emerald-600 dark:text-emerald-400" size={24} />
            </div>
          </div>
          <div className="mt-2">
            <span className="text-sm text-gray-500 dark:text-gray-400">
              R$ {stats.avgPrice.toLocaleString("pt-BR", { maximumFractionDigits: 0 })} média
            </span>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg border border-gray-200 dark:border-gray-700"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                Lucro Potencial
              </p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                R$ {stats.totalProfit.toLocaleString("pt-BR", { maximumFractionDigits: 0 })}
              </p>
            </div>
            <div className="p-3 bg-purple-100 dark:bg-purple-900/30 rounded-full">
              <FiTrendingUp className="text-purple-600 dark:text-purple-400" size={24} />
            </div>
          </div>
          <div className="mt-2">
            <span className="text-sm text-gray-500 dark:text-gray-400">
              R$ {stats.avgProfit.toLocaleString("pt-BR", { maximumFractionDigits: 0 })} média
            </span>
          </div>
        </motion.div>
      </div>

      {/* Gráficos */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Distribuição por Status */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg border border-gray-200 dark:border-gray-700"
        >
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Distribuição por Status
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie
                  data={stats.statusDistribution}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {stats.statusDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
            <div className="space-y-3">
              {stats.statusDistribution.map((item, index) => (
                <div key={index} className="flex items-center space-x-3">
                  <div className="w-4 h-4 rounded-full" style={{ backgroundColor: item.color }} />
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    {item.name}: {item.value} veículos
                  </span>
                </div>
              ))}
            </div>
          </div>
        </motion.div>

        {/* Top Marcas */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg border border-gray-200 dark:border-gray-700"
        >
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Top 5 Marcas</h3>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={stats.topMakes}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="make" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="count" fill="#3B82F6" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </motion.div>
      </div>

      {/* Veículos Antigos no Estoque */}
      {stats.oldVehicles.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg border border-gray-200 dark:border-gray-700"
        >
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Veículos Antigos no Estoque
          </h3>
          <div className="space-y-3">
            {stats.oldVehicles.map((vehicle, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg"
              >
                <div>
                  <h4 className="font-medium text-gray-900 dark:text-white">{vehicle.name}</h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {vehicle.make} {vehicle.model} - {vehicle.year}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium text-gray-900 dark:text-white">
                    {vehicle.daysInStock} dias
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    R$ {vehicle.price?.toLocaleString("pt-BR")}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      )}
    </div>
  );
};

export default VehicleStats;
