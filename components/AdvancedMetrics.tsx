import React from "react";
import { motion } from "framer-motion";
import {
  FiTrendingUp,
  FiTrendingDown,
  FiDollarSign,
  FiUsers,
  FiCar,
  FiTarget,
  FiClock,
  FiAward,
} from "react-icons/fi";
import {
  LineChart,
  Line,
  AreaChart,
  Area,
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

interface AdvancedMetricsProps {
  vehicles: any[];
  sellers: any[];
  monthlyData: any[];
  performanceData: any[];
}

const AdvancedMetrics: React.FC<AdvancedMetricsProps> = ({
  vehicles,
  sellers,
  monthlyData,
  performanceData,
}) => {
  // Cálculos avançados
  const metrics = React.useMemo(() => {
    const totalVehicles = vehicles.length;
    const availableVehicles = vehicles.filter(v => v.status === "disponivel").length;
    const soldVehicles = vehicles.filter(v => v.status === "vendido").length;
    const totalRevenue = soldVehicles.reduce((sum, v) => sum + (v.soldPrice || v.price || 0), 0);
    const totalCost = vehicles.reduce((sum, v) => sum + (v.cost || 0), 0);
    const totalProfit = totalRevenue - totalCost;
    const conversionRate = totalVehicles > 0 ? (soldVehicles / totalVehicles) * 100 : 0;
    const avgSalePrice = soldVehicles > 0 ? totalRevenue / soldVehicles : 0;
    const avgProfit = soldVehicles > 0 ? totalProfit / soldVehicles : 0;
    const activeSellers = sellers.filter(s => s.active).length;
    const totalSellers = sellers.length;

    return {
      totalVehicles,
      availableVehicles,
      soldVehicles,
      totalRevenue,
      totalCost,
      totalProfit,
      conversionRate,
      avgSalePrice,
      avgProfit,
      activeSellers,
      totalSellers,
    };
  }, [vehicles, sellers]);

  // Dados para gráficos
  const salesTrendData = monthlyData.map(item => ({
    month: item.month,
    vendidos: item.vendidos || 0,
    disponiveis: item.disponiveis || 0,
    receita: item.receita || 0,
    lucro: item.lucro || 0,
  }));

  const sellerPerformanceData = performanceData.map(seller => ({
    name: seller.name,
    vendas: seller.sales || 0,
    receita: seller.revenue || 0,
    lucro: seller.profit || 0,
  }));

  const statusDistribution = [
    { name: "Disponíveis", value: metrics.availableVehicles, color: "#10B981" },
    { name: "Vendidos", value: metrics.soldVehicles, color: "#3B82F6" },
  ];

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
                Taxa de Conversão
              </p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {metrics.conversionRate.toFixed(1)}%
              </p>
            </div>
            <div className="p-3 bg-green-100 dark:bg-green-900/30 rounded-full">
              <FiTarget className="text-green-600 dark:text-green-400" size={24} />
            </div>
          </div>
          <div className="mt-4">
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
              <div
                className="bg-green-500 h-2 rounded-full transition-all duration-500"
                style={{ width: `${Math.min(metrics.conversionRate, 100)}%` }}
              />
            </div>
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
                Preço Médio de Venda
              </p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                R$ {metrics.avgSalePrice.toLocaleString("pt-BR", { maximumFractionDigits: 0 })}
              </p>
            </div>
            <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-full">
              <FiDollarSign className="text-blue-600 dark:text-blue-400" size={24} />
            </div>
          </div>
          <div className="mt-2">
            <span className="text-sm text-gray-500 dark:text-gray-400">
              {metrics.soldVehicles} veículos vendidos
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
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                Lucro Médio por Venda
              </p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                R$ {metrics.avgProfit.toLocaleString("pt-BR", { maximumFractionDigits: 0 })}
              </p>
            </div>
            <div className="p-3 bg-emerald-100 dark:bg-emerald-900/30 rounded-full">
              <FiTrendingUp className="text-emerald-600 dark:text-emerald-400" size={24} />
            </div>
          </div>
          <div className="mt-2">
            <span className="text-sm text-gray-500 dark:text-gray-400">
              Margem de lucro
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
                Vendedores Ativos
              </p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {metrics.activeSellers}/{metrics.totalSellers}
              </p>
            </div>
            <div className="p-3 bg-purple-100 dark:bg-purple-900/30 rounded-full">
              <FiUsers className="text-purple-600 dark:text-purple-400" size={24} />
            </div>
          </div>
          <div className="mt-2">
            <span className="text-sm text-gray-500 dark:text-gray-400">
              {((metrics.activeSellers / metrics.totalSellers) * 100).toFixed(0)}% ativos
            </span>
          </div>
        </motion.div>
      </div>

      {/* Gráficos */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Tendência de Vendas */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg border border-gray-200 dark:border-gray-700"
        >
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Tendência de Vendas
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={salesTrendData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Area
                type="monotone"
                dataKey="vendidos"
                stackId="1"
                stroke="#3B82F6"
                fill="#3B82F6"
                fillOpacity={0.6}
              />
              <Area
                type="monotone"
                dataKey="disponiveis"
                stackId="1"
                stroke="#10B981"
                fill="#10B981"
                fillOpacity={0.6}
              />
            </AreaChart>
          </ResponsiveContainer>
        </motion.div>

        {/* Performance dos Vendedores */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg border border-gray-200 dark:border-gray-700"
        >
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Performance dos Vendedores
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={sellerPerformanceData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="vendas" fill="#3B82F6" name="Vendas" />
              <Bar dataKey="receita" fill="#10B981" name="Receita" />
            </BarChart>
          </ResponsiveContainer>
        </motion.div>
      </div>

      {/* Distribuição de Status */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.7 }}
        className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg border border-gray-200 dark:border-gray-700"
      >
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Distribuição de Veículos
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie
                data={statusDistribution}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {statusDistribution.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
          <div className="space-y-3">
            {statusDistribution.map((item, index) => (
              <div key={index} className="flex items-center space-x-3">
                <div
                  className="w-4 h-4 rounded-full"
                  style={{ backgroundColor: item.color }}
                />
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  {item.name}: {item.value} veículos
                </span>
              </div>
            ))}
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default AdvancedMetrics;