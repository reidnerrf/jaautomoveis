import React from "react";
import { motion } from "framer-motion";
import {
  FiTrendingUp,
  FiTrendingDown,
  FiDollarSign,
  FiUsers,
  FiTarget,
  FiAward,
  FiCalendar,
  FiStar,
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

interface SellerStatsProps {
  sellers: any[];
  vehicles: any[];
}

const SellerStats: React.FC<SellerStatsProps> = ({ sellers, vehicles }) => {
  // Cálculos de estatísticas
  const stats = React.useMemo(() => {
    const totalSellers = sellers.length;
    const activeSellers = sellers.filter(s => s.active).length;
    const inactiveSellers = totalSellers - activeSellers;
    
    // Calcular performance de cada vendedor
    const sellerPerformance = sellers.map(seller => {
      const sellerId = seller._id || seller.id;
      const sellerVehicles = vehicles.filter(v => v.sellerId === sellerId);
      const soldVehicles = sellerVehicles.filter(v => v.status === "vendido");
      
      const totalSales = soldVehicles.length;
      const totalRevenue = soldVehicles.reduce((sum, v) => sum + (v.soldPrice || v.price || 0), 0);
      const totalCost = soldVehicles.reduce((sum, v) => sum + (v.cost || 0), 0);
      const totalProfit = totalRevenue - totalCost;
      const avgSalePrice = totalSales > 0 ? totalRevenue / totalSales : 0;
      const conversionRate = sellerVehicles.length > 0 ? (totalSales / sellerVehicles.length) * 100 : 0;
      
      return {
        ...seller,
        totalSales,
        totalRevenue,
        totalCost,
        totalProfit,
        avgSalePrice,
        conversionRate,
        vehiclesAssigned: sellerVehicles.length,
      };
    });

    // Top performers
    const topPerformers = sellerPerformance
      .filter(s => s.totalSales > 0)
      .sort((a, b) => b.totalProfit - a.totalProfit)
      .slice(0, 5);

    // Vendedor do mês (maior lucro)
    const sellerOfTheMonth = topPerformers[0] || null;

    // Estatísticas gerais
    const totalSales = sellerPerformance.reduce((sum, s) => sum + s.totalSales, 0);
    const totalRevenue = sellerPerformance.reduce((sum, s) => sum + s.totalRevenue, 0);
    const totalProfit = sellerPerformance.reduce((sum, s) => sum + s.totalProfit, 0);
    const avgSalesPerSeller = totalSellers > 0 ? totalSales / totalSellers : 0;
    const avgRevenuePerSeller = totalSellers > 0 ? totalRevenue / totalSellers : 0;

    return {
      totalSellers,
      activeSellers,
      inactiveSellers,
      totalSales,
      totalRevenue,
      totalProfit,
      avgSalesPerSeller,
      avgRevenuePerSeller,
      sellerPerformance,
      topPerformers,
      sellerOfTheMonth,
    };
  }, [sellers, vehicles]);

  // Dados para gráficos
  const performanceData = stats.topPerformers.map(seller => ({
    name: seller.name.split(" ")[0], // Primeiro nome
    vendas: seller.totalSales,
    receita: seller.totalRevenue,
    lucro: seller.totalProfit,
  }));

  const statusDistribution = [
    { name: "Ativos", value: stats.activeSellers, color: "#10B981" },
    { name: "Inativos", value: stats.inactiveSellers, color: "#EF4444" },
  ];

  const COLORS = ["#10B981", "#EF4444"];

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
                Total de Vendedores
              </p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {stats.totalSellers}
              </p>
            </div>
            <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-full">
              <FiUsers className="text-blue-600 dark:text-blue-400" size={24} />
            </div>
          </div>
          <div className="mt-2">
            <span className="text-sm text-gray-500 dark:text-gray-400">
              {stats.activeSellers} ativos
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
                Total de Vendas
              </p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {stats.totalSales}
              </p>
            </div>
            <div className="p-3 bg-green-100 dark:bg-green-900/30 rounded-full">
              <FiTarget className="text-green-600 dark:text-green-400" size={24} />
            </div>
          </div>
          <div className="mt-2">
            <span className="text-sm text-gray-500 dark:text-gray-400">
              {stats.avgSalesPerSeller.toFixed(1)} por vendedor
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
                Receita Total
              </p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                R$ {stats.totalRevenue.toLocaleString("pt-BR", { maximumFractionDigits: 0 })}
              </p>
            </div>
            <div className="p-3 bg-emerald-100 dark:bg-emerald-900/30 rounded-full">
              <FiDollarSign className="text-emerald-600 dark:text-emerald-400" size={24} />
            </div>
          </div>
          <div className="mt-2">
            <span className="text-sm text-gray-500 dark:text-gray-400">
              R$ {stats.avgRevenuePerSeller.toLocaleString("pt-BR", { maximumFractionDigits: 0 })} por vendedor
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
                Lucro Total
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
              Margem de lucro
            </span>
          </div>
        </motion.div>
      </div>

      {/* Vendedor do Mês */}
      {stats.sellerOfTheMonth && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-gradient-to-r from-yellow-50 to-orange-50 dark:from-yellow-900/20 dark:to-orange-900/20 rounded-xl p-6 shadow-lg border border-yellow-200 dark:border-yellow-800"
        >
          <div className="flex items-center space-x-4">
            <div className="p-4 bg-yellow-100 dark:bg-yellow-900/30 rounded-full">
              <FiAward className="text-yellow-600 dark:text-yellow-400" size={32} />
            </div>
            <div className="flex-1">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                Vendedor do Mês
              </h3>
              <p className="text-2xl font-semibold text-yellow-700 dark:text-yellow-300">
                {stats.sellerOfTheMonth.name}
              </p>
              <div className="grid grid-cols-3 gap-4 mt-4">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Vendas</p>
                  <p className="text-lg font-semibold text-gray-900 dark:text-white">
                    {stats.sellerOfTheMonth.totalSales}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Receita</p>
                  <p className="text-lg font-semibold text-gray-900 dark:text-white">
                    R$ {stats.sellerOfTheMonth.totalRevenue.toLocaleString("pt-BR", { maximumFractionDigits: 0 })}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Lucro</p>
                  <p className="text-lg font-semibold text-gray-900 dark:text-white">
                    R$ {stats.sellerOfTheMonth.totalProfit.toLocaleString("pt-BR", { maximumFractionDigits: 0 })}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {/* Gráficos */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Performance dos Vendedores */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg border border-gray-200 dark:border-gray-700"
        >
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Top 5 Vendedores
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={performanceData}>
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

        {/* Distribuição de Status */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg border border-gray-200 dark:border-gray-700"
        >
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Status dos Vendedores
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <ResponsiveContainer width="100%" height={200}>
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
                    {item.name}: {item.value} vendedores
                  </span>
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default SellerStats;