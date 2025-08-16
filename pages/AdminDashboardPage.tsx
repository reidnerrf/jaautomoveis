
import React, { useMemo, useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useVehicleData } from '../hooks/useVehicleData.tsx';
import StatCard from '../components/StatCard.tsx';
import { FiEye, FiDollarSign, FiGrid, FiTrendingUp, FiArrowRight, FiMonitor, FiSmartphone, FiTablet, FiMapPin, FiActivity } from 'react-icons/fi';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  LineChart,
  Line
} from 'recharts';
import { Vehicle } from '../types.ts';
import { useAuth } from '../hooks/useAuth.tsx';
import { motion } from 'framer-motion';
import { io, Socket } from 'socket.io-client';

const AdminDashboardPage: React.FC = () => {
  const { vehicles, loading } = useVehicleData();
  const { token } = useAuth();
  const [monthlyViews, setMonthlyViews] = useState([]);
  const [dashboardStats, setDashboardStats] = useState({
    totalViews: 0,
    todayViews: 0,
    whatsappClicks: 0,
    instagramClicks: 0,
    deviceStats: [],
    locationStats: [],
    browserStats: []
  });
  const [realtimeData, setRealtimeData] = useState([]);
  const [liveActions, setLiveActions] = useState([]);
  const [socket, setSocket] = useState<Socket | null>(null);

  useEffect(() => {
    const newSocket = io(process.env.NODE_ENV === 'production' ? '' : 'http://localhost:5000');
    setSocket(newSocket);

    // Listen for real-time actions
    newSocket.on('user-action-live', (action) => {
      setLiveActions(prev => [action, ...prev.slice(0, 9)]); // Keep last 10 actions
    });

    return () => newSocket.close();
  }, []);

  useEffect(() => {
    const fetchAnalyticsData = async () => {
      if (!token) return;
      
      try {
        const [monthlyRes, dashboardRes, realtimeRes] = await Promise.all([
          fetch('/api/analytics/monthly-views', {
            headers: { 'Authorization': `Bearer ${token}` }
          }),
          fetch('/api/analytics/dashboard-stats', {
            headers: { 'Authorization': `Bearer ${token}` }
          }),
          fetch('/api/analytics/realtime-stats', {
            headers: { 'Authorization': `Bearer ${token}` }
          })
        ]);

        if (monthlyRes.ok) {
          const monthlyData = await monthlyRes.json();
          setMonthlyViews(monthlyData);
        }

        if (dashboardRes.ok) {
          const dashboardData = await dashboardRes.json();
          setDashboardStats(dashboardData);
        }

        if (realtimeRes.ok) {
          const realtimeDataRes = await realtimeRes.json();
          setRealtimeData(realtimeDataRes);
        }
      } catch (error) {
        console.error("Erro ao buscar dados:", error);
      }
    };

    fetchAnalyticsData();
    const interval = setInterval(fetchAnalyticsData, 30000); // Update every 30 seconds
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

  // Chart colors
  const COLORS = ['#3C50E0', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#06B6D4'];

  // Device chart data
  const deviceChartData = dashboardStats.deviceStats.map((item, index) => ({
    name: item._id === 'mobile' ? 'Mobile' : item._id === 'tablet' ? 'Tablet' : 'Desktop',
    value: item.count,
    color: COLORS[index % COLORS.length]
  }));

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
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          Dashboard Administrativo
        </h1>
        <p className="text-gray-600 dark:text-gray-300">
          Visão geral do desempenho e estatísticas em tempo real
        </p>
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
        <StatCard title="Total de Veículos" value={vehicleStats.totalVehicles.toString()} rate="2.59%" levelUp>
          <FiGrid className="text-primary" size={24} />
        </StatCard>
      </div>

      {/* Social Media Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <StatCard title="Cliques no WhatsApp" value={formatNumber(dashboardStats.whatsappClicks)} rate="15.3%" levelUp>
          <div className="w-6 h-6 bg-green-500 rounded flex items-center justify-center text-white text-xs font-bold">
            W
          </div>
        </StatCard>
        <StatCard title="Cliques no Instagram" value={formatNumber(dashboardStats.instagramClicks)} rate="7.8%" levelUp>
          <div className="w-6 h-6 bg-pink-500 rounded flex items-center justify-center text-white text-xs font-bold">
            I
          </div>
        </StatCard>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-12 gap-6">
        
        {/* Monthly Views Chart */}
        <motion.div 
          className="col-span-12 xl:col-span-8 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg p-6"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
        >
          <h3 className="text-xl font-semibold text-gray-800 dark:text-white mb-4">
            Visualizações Mensais (Últimos 6 Meses)
          </h3>
          <div className="h-96">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={monthlyViews} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorViews" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3C50E0" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#3C50E0" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                <XAxis dataKey="month" tick={{ fill: '#6B7280' }} />
                <YAxis tick={{ fill: '#6B7280' }} />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#1F2937', 
                    border: 'none', 
                    borderRadius: '8px',
                    color: 'white'
                  }}
                />
                <Area 
                  type="monotone" 
                  dataKey="Visualizações" 
                  stroke="#3C50E0" 
                  fillOpacity={1} 
                  fill="url(#colorViews)" 
                  strokeWidth={3}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* Top Vehicles */}
        <motion.div 
          className="col-span-12 xl:col-span-4 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg p-6"
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3 }}
        >
          <h3 className="text-xl font-semibold text-gray-800 dark:text-white mb-4">
            Top 5 Veículos Mais Visualizados
          </h3>
          <div className="space-y-3">
            {vehicleStats.topVehicles.map((vehicle, index) => (
              <Link
                to={`/vehicle/${vehicle.id}`}
                key={index}
                className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors group"
              >
                <div className="flex items-center">
                  <div className="w-12 h-12 flex-shrink-0 mr-3">
                    <img 
                      src={vehicle.images[0]} 
                      alt={vehicle.name} 
                      className="w-full h-full rounded-lg object-cover" 
                    />
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-800 dark:text-white group-hover:text-primary transition-colors">
                      {vehicle.name}
                    </h4>
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
          <Link
            to="/admin/vehicles"
            className="mt-4 flex items-center justify-center gap-2 rounded-lg bg-primary/10 py-2 text-sm font-medium text-primary hover:bg-primary/20 transition-colors"
          >
            <span>Ver Todos</span>
            <FiArrowRight />
          </Link>
        </motion.div>
      </div>

      {/* Device and Location Analytics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        
        {/* Device Analytics */}
        <motion.div 
          className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg p-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">
            Dispositivos
          </h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={deviceChartData}
                  cx="50%"
                  cy="50%"
                  innerRadius={40}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {deviceChartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-4 space-y-2">
            {deviceChartData.map((item, index) => (
              <div key={index} className="flex items-center justify-between">
                <div className="flex items-center">
                  <div 
                    className="w-3 h-3 rounded-full mr-2"
                    style={{ backgroundColor: item.color }}
                  ></div>
                  <span className="text-sm text-gray-600 dark:text-gray-300">{item.name}</span>
                </div>
                <span className="text-sm font-medium text-gray-900 dark:text-white">
                  {item.value}
                </span>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Location Analytics */}
        <motion.div 
          className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg p-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">
            Top Cidades
          </h3>
          <div className="space-y-3">
            {dashboardStats.locationStats.slice(0, 8).map((location, index) => (
              <div key={index} className="flex items-center justify-between">
                <div className="flex items-center">
                  <FiMapPin className="text-red-500 mr-2" size={16} />
                  <span className="text-sm text-gray-600 dark:text-gray-300">
                    {location._id || 'Desconhecido'}
                  </span>
                </div>
                <span className="text-sm font-medium text-gray-900 dark:text-white">
                  {location.count}
                </span>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Real-time Actions */}
        <motion.div 
          className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg p-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
        >
          <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">
            Atividade em Tempo Real
          </h3>
          <div className="space-y-3 max-h-64 overflow-y-auto">
            {liveActions.length > 0 ? (
              liveActions.map((action, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="flex items-start justify-between p-2 bg-gray-50 dark:bg-gray-700 rounded-lg"
                >
                  <div>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                      {action.action.replace('_', ' ')}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {action.location} • {new Date(action.timestamp).toLocaleTimeString('pt-BR')}
                    </p>
                  </div>
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                </motion.div>
              ))
            ) : (
              <p className="text-sm text-gray-500 dark:text-gray-400 text-center py-8">
                Aguardando atividades...
              </p>
            )}
          </div>
        </motion.div>
      </div>

      {/* Browser Analytics */}
      <motion.div 
        className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg p-6"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.7 }}
      >
        <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">
          Navegadores Mais Utilizados
        </h3>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={dashboardStats.browserStats.slice(0, 6)} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="_id" tick={{ fill: '#6B7280' }} />
              <YAxis tick={{ fill: '#6B7280' }} />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: '#1F2937', 
                  border: 'none', 
                  borderRadius: '8px',
                  color: 'white'
                }}
              />
              <Bar dataKey="count" fill="#3C50E0" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </motion.div>

      {/* Hourly Traffic Pattern */}
      <motion.div 
        className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg p-6"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8 }}
      >
        <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">
          Padrão de Tráfego por Hora (Hoje)
        </h3>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={realtimeData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="hour" tick={{ fill: '#6B7280' }} />
              <YAxis tick={{ fill: '#6B7280' }} />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: '#1F2937', 
                  border: 'none', 
                  borderRadius: '8px',
                  color: 'white'
                }}
              />
              <Line 
                type="monotone" 
                dataKey="views" 
                stroke="#10B981" 
                strokeWidth={3}
                dot={{ fill: '#10B981', strokeWidth: 2, r: 4 }}
                activeDot={{ r: 6, stroke: '#10B981', strokeWidth: 2, fill: '#fff' }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </motion.div>

      {/* Top Vehicles Performance */}
      <motion.div 
        className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg p-6"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.9 }}
      >
        <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">
          Veículos Mais Visualizados
        </h3>
        <div className="space-y-4">
          {vehicles.slice(0, 5).map((vehicle, index) => (
            <div key={vehicle.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <div className="flex items-center gap-3">
                <span className="flex items-center justify-center w-8 h-8 bg-blue-500 text-white rounded-full text-sm font-bold">
                  {index + 1}
                </span>
                <img
                  src={vehicle.images[0]}
                  alt={vehicle.name}
                  className="w-12 h-8 object-cover rounded"
                />
                <div>
                  <p className="font-medium text-gray-900 dark:text-white text-sm">
                    {vehicle.name}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {formatCurrency(vehicle.price)}
                  </p>
                </div>
              </div>
              <div className="text-right">
                <p className="font-semibold text-blue-600 dark:text-blue-400">
                  {Math.floor(Math.random() * 500) + 100} views
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  +{Math.floor(Math.random() * 50) + 10}% hoje
                </p>
              </div>
            </div>
          ))}
        </div>
      </motion.div>

      {/* Conversion Funnel */}
      <motion.div 
        className="col-span-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg p-6"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.0 }}
      >
        <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-6">
          Funil de Conversão
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="text-center">
            <div className="w-full h-20 bg-gradient-to-t from-blue-500 to-blue-400 rounded-t-lg flex items-center justify-center">
              <span className="text-white font-bold text-2xl">{dashboardStats.totalViews}</span>
            </div>
            <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-b-lg">
              <h4 className="font-semibold text-blue-700 dark:text-blue-400">Visualizações</h4>
              <p className="text-sm text-gray-600 dark:text-gray-400">Total de acessos</p>
            </div>
          </div>
          
          <div className="text-center">
            <div className="w-full h-20 bg-gradient-to-t from-green-500 to-green-400 rounded-t-lg flex items-center justify-center">
              <span className="text-white font-bold text-2xl">{Math.floor(dashboardStats.totalViews * 0.3)}</span>
            </div>
            <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-b-lg">
              <h4 className="font-semibold text-green-700 dark:text-green-400">Interesse</h4>
              <p className="text-sm text-gray-600 dark:text-gray-400">Clicaram em veículos</p>
            </div>
          </div>
          
          <div className="text-center">
            <div className="w-full h-20 bg-gradient-to-t from-yellow-500 to-yellow-400 rounded-t-lg flex items-center justify-center">
              <span className="text-white font-bold text-2xl">{dashboardStats.whatsappClicks}</span>
            </div>
            <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-b-lg">
              <h4 className="font-semibold text-yellow-700 dark:text-yellow-400">Contato</h4>
              <p className="text-sm text-gray-600 dark:text-gray-400">WhatsApp clicks</p>
            </div>
          </div>
          
          <div className="text-center">
            <div className="w-full h-20 bg-gradient-to-t from-red-500 to-red-400 rounded-t-lg flex items-center justify-center">
              <span className="text-white font-bold text-2xl">{Math.floor(dashboardStats.whatsappClicks * 0.2)}</span>
            </div>
            <div className="p-4 bg-red-50 dark:bg-red-900/20 rounded-b-lg">
              <h4 className="font-semibold text-red-700 dark:text-red-400">Conversão</h4>
              <p className="text-sm text-gray-600 dark:text-gray-400">Vendas estimadas</p>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Live Activity Feed */}
      <motion.div
        className="mt-8 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg p-6"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.1 }}
      >
        <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4 flex items-center gap-2">
          <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
          Atividade em Tempo Real
        </h3>
        <div className="space-y-3 max-h-96 overflow-y-auto">
          {liveActions.length > 0 ? (
            liveActions.map((action, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg"
              >
                <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                <div className="flex-1">
                  <p className="text-sm text-gray-800 dark:text-gray-200">
                    {action.action === 'page_view' && `Usuário de ${action.location} visualizou ${action.page}`}
                    {action.action === 'vehicle_view' && `Usuário interessado no veículo ${action.vehicleName}`}
                    {action.action === 'whatsapp_click' && `Contato via WhatsApp para ${action.vehicleName}`}
                    {action.action === 'instagram_click' && `Visitou nosso Instagram`}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {new Date(action.timestamp).toLocaleTimeString('pt-BR')} • {action.device} • {action.location}
                  </p>
                </div>
              </motion.div>
            ))
          ) : (
            <p className="text-gray-500 dark:text-gray-400 text-center py-8">
              Aguardando atividade em tempo real...
            </p>
          )}
        </div>
      </motion.div>
    </div>
  );
};

export default AdminDashboardPage;
