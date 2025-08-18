import React, { useMemo, useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useVehicleData } from '../hooks/useVehicleData.tsx';
import StatCard from '../components/StatCard.tsx';
import { FiEye, FiDollarSign, FiTrendingUp, FiArrowRight, FiActivity, FiHeart } from 'react-icons/fi';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from 'recharts';
import { Vehicle } from '../types.ts';
import { useAuth } from '../hooks/useAuth.tsx';
import { motion } from 'framer-motion';

const AdminDashboardPage: React.FC = () => {
  const { vehicles, loading } = useVehicleData();
  const { token } = useAuth();
  const [monthlyViews, setMonthlyViews] = useState<Array<{ month: string; ['Visualizações']: number }>>([]);
  const [dashboardStats, setDashboardStats] = useState({
    totalViews: 0,
    todayViews: 0,
    whatsappClicks: 0,
    instagramClicks: 0,
    likedVehicles: 0,
    totalLikes: 0,
  });

  useEffect(() => {
    const fetchAnalyticsData = async () => {
      if (!token) return;

      try {
        const [monthlyRes, dashboardRes] = await Promise.all([
          fetch('/api/analytics/monthly-views', {
            headers: { 'Authorization': `Bearer ${token}` }
          }),
          fetch('/api/analytics/dashboard-stats', {
            headers: { 'Authorization': `Bearer ${token}` }
          })
        ]);

        if (monthlyRes.ok) {
          const monthlyData = await monthlyRes.json();
          const normalized: Array<{ month: string; ['Visualizações']: number }> = Array.isArray(monthlyData)
            ? monthlyData.map((item: any) => ({ month: item.month || item._id?.month || '', ['Visualizações']: Number(item.views ?? item.count ?? 0) }))
            : [];
          setMonthlyViews(normalized);
        } else {
          setMonthlyViews([]);
        }

        if (dashboardRes.ok) {
          const dashboardData = await dashboardRes.json();
          // Normaliza e protege contra campos ausentes/undefined
          setDashboardStats({
            totalViews: Number(dashboardData?.totalViews ?? 0) || 0,
            todayViews: Number(dashboardData?.todayViews ?? 0) || 0,
            whatsappClicks: Number(dashboardData?.whatsappClicks ?? 0) || 0,
            instagramClicks: Number(dashboardData?.instagramClicks ?? 0) || 0,
            likedVehicles: Number(dashboardData?.likedVehicles ?? 0) || 0,
            totalLikes: Number(dashboardData?.totalLikes ?? 0) || 0,
          });
        } else {
          // Mantém valores seguros (zero) em caso de 401/erro para evitar NaN
          setDashboardStats((prev) => ({ ...prev }));
        }
      } catch (error) {
        console.error('Erro ao buscar dados:', error);
      }
    };

    fetchAnalyticsData();
    const interval = setInterval(fetchAnalyticsData, 30000);
    return () => clearInterval(interval);
  }, [token]);

  const vehicleStats = useMemo(() => {
    if (!vehicles || vehicles.length === 0) {
      return {
        totalViews: 0,
        totalValue: 0,
        totalVehicles: 0,
        averagePrice: 0,
        topVehicles: [] as Vehicle[],
      };
    }

    const totalValue = vehicles.reduce((sum, v) => sum + v.price, 0);
    const totalViews = vehicles.reduce((sum, v) => sum + (v.views || 0), 0);

    const topVehicles = [...vehicles]
      .sort((a, b) => (b.views || 0) - (a.views || 0))
      .slice(0, 5);

    return {
      totalViews,
      totalValue,
      totalVehicles: vehicles.length,
      averagePrice: vehicles.length > 0 ? totalValue / vehicles.length : 0,
      topVehicles,
    };
  }, [vehicles]);

  const formatCurrency = (value: number) =>
    new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);

  const formatNumber = (value: number) =>
    new Intl.NumberFormat('pt-BR').format(value);

  const estimatedSales = Math.max(0, Math.floor((dashboardStats.whatsappClicks || 0) * 0.2));

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-screen-2xl p-4 md:p-6 2xl:p-10 space-y-8">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Dashboard Administrativo</h1>
        <p className="text-gray-600 dark:text-gray-300">Visão geral do desempenho</p>
      </motion.div>

      {/* Main Stats Cards */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-4">
        <StatCard title="Total de Visualizações" value={formatNumber(dashboardStats.totalViews)} rate="12.5%" levelUp>
          <FiEye className="text-primary" size={24} />
        </StatCard>
        <StatCard title="Visualizações Hoje" value={formatNumber(dashboardStats.todayViews)} rate="8.2%" levelUp>
          <FiActivity className="text-green-500" size={24} />
        </StatCard>
        <StatCard title="Valor Total do Estoque" value={formatCurrency(vehicleStats.totalValue)} rate="4.35%" levelUp>
          <FiDollarSign className="text-primary" size={24} />
        </StatCard>
        <StatCard title="Vendas Estimadas" value={formatNumber(estimatedSales)} rate={'+20%'} levelUp>
          <FiTrendingUp className="text-emerald-500" size={24} />
        </StatCard>
      </div>

      {/* Social Media & Likes Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard title="Cliques no WhatsApp" value={formatNumber(dashboardStats.whatsappClicks)} rate="15.3%" levelUp>
          <div className="w-6 h-6 bg-green-500 rounded flex items-center justify-center text-white text-xs font-bold">W</div>
        </StatCard>
        <StatCard title="Cliques no Instagram" value={formatNumber(dashboardStats.instagramClicks)} rate="7.8%" levelUp>
          <div className="w-6 h-6 bg-pink-500 rounded flex items-center justify-center text-white text-xs font-bold">I</div>
        </StatCard>
        <StatCard title="Veículos com Like" value={formatNumber(dashboardStats.likedVehicles)} rate="3.1%" levelUp>
          <FiHeart className="text-red-500" size={22} />
        </StatCard>
      </div>

      {/* Monthly Views Chart */}
      <motion.div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg p-6" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.2 }}>
        <h3 className="text-xl font-semibold text-gray-800 dark:text-white mb-4">Visualizações Mensais (Últimos 6 Meses)</h3>
        <div className="h-96">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={monthlyViews} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="colorViews" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3C50E0" stopOpacity={0.8} />
                  <stop offset="95%" stopColor="#3C50E0" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
              <XAxis dataKey="month" tick={{ fill: '#6B7280' }} />
              <YAxis tick={{ fill: '#6B7280' }} />
              <Tooltip contentStyle={{ backgroundColor: '#1F2937', border: 'none', borderRadius: '8px', color: 'white' }} />
              <Area type="monotone" dataKey="Visualizações" stroke="#3C50E0" fillOpacity={1} fill="url(#colorViews)" strokeWidth={3} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </motion.div>

      {/* Top Vehicles */}
      <motion.div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg p-6" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.3 }}>
        <h3 className="text-xl font-semibold text-gray-800 dark:text-white mb-4">Top 5 Veículos Mais Visualizados</h3>
        <div className="space-y-3">
          {vehicleStats.topVehicles.map((vehicle, index) => (
            <Link to={vehicle.id ? `/vehicle/${vehicle.id}` : '#'} key={vehicle.id || index} className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors group">
              <div className="flex items-center">
                <div className="w-12 h-12 flex-shrink-0 mr-3">
                  <img src={vehicle.images[0]} alt={vehicle.name} className="w-full h-full rounded-lg object-cover" />
                </div>
                <div>
                  <h4 className="font-medium text-gray-800 dark:text-white group-hover:text-primary transition-colors">{vehicle.name}</h4>
                  <p className="text-sm text-gray-500 dark:text-gray-400">{vehicle.make}</p>
                </div>
              </div>
              <div className="flex items-center text-gray-600 dark:text-gray-300">
                <FiEye className="mr-2" />
                <span className="font-medium">{formatNumber(vehicle.views || 0)}</span>
              </div>
            </Link>
          ))}
        </div>
        <Link to="/admin/vehicles" className="mt-4 flex items-center justify-center gap-2 rounded-lg bg-primary/10 py-2 text-sm font-medium text-primary hover:bg-primary/20 transition-colors">
          <span>Ver Todos</span>
          <FiArrowRight />
        </Link>
      </motion.div>

      {/* Conversion Funnel */}
      <motion.div className="col-span-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg p-6" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 1.0 }}>
        <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-6">Funil de Conversão</h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="text-center">
            <div className="w-full h-20 bg-gradient-to-t from-blue-500 to-blue-400 rounded-t-lg flex items-center justify-center">
              <span className="text-white font-bold text-2xl">{Number(dashboardStats.totalViews || 0)}</span>
            </div>
            <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-b-lg">
              <h4 className="font-semibold text-blue-700 dark:text-blue-400">Visualizações</h4>
              <p className="text-sm text-gray-600 dark:text-gray-400">Total de acessos</p>
            </div>
          </div>
          <div className="text-center">
            <div className="w-full h-20 bg-gradient-to-t from-green-500 to-green-400 rounded-t-lg flex items-center justify-center">
              <span className="text-white font-bold text-2xl">{Math.floor(Number(dashboardStats.totalViews || 0) * 0.3)}</span>
            </div>
            <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-b-lg">
              <h4 className="font-semibold text-green-700 dark:text-green-400">Interesse</h4>
              <p className="text-sm text-gray-600 dark:text-gray-400">Clicaram em veículos</p>
            </div>
          </div>
          <div className="text-center">
            <div className="w-full h-20 bg-gradient-to-t from-yellow-500 to-yellow-400 rounded-t-lg flex items-center justify-center">
              <span className="text-white font-bold text-2xl">{Number(dashboardStats.whatsappClicks || 0)}</span>
            </div>
            <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-b-lg">
              <h4 className="font-semibold text-yellow-700 dark:text-yellow-400">Contato</h4>
              <p className="text-sm text-gray-600 dark:text-gray-400">WhatsApp clicks</p>
            </div>
          </div>
          <div className="text-center">
            <div className="w-full h-20 bg-gradient-to-t from-red-500 to-red-400 rounded-t-lg flex items-center justify-center">
              <span className="text-white font-bold text-2xl">{estimatedSales}</span>
            </div>
            <div className="p-4 bg-red-50 dark:bg-red-900/20 rounded-b-lg">
              <h4 className="font-semibold text-red-700 dark:text-red-400">Conversão</h4>
              <p className="text-sm text-gray-600 dark:text-gray-400">Vendas estimadas</p>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default AdminDashboardPage;