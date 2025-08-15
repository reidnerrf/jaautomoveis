import React, { useMemo, useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useVehicleData } from '../hooks/useVehicleData.tsx';
import StatCard from '../components/StatCard.tsx';
import { FiEye, FiDollarSign, FiGrid, FiTrendingUp, FiArrowRight } from 'react-icons/fi';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Vehicle } from '../types.ts';
import { useAuth } from '../hooks/useAuth.tsx';

const AdminDashboardPage: React.FC = () => {
  const { vehicles, loading } = useVehicleData();
  const { token } = useAuth();
  const [monthlyViews, setMonthlyViews] = useState([]);

  useEffect(() => {
    const fetchMonthlyViews = async () => {
      if (!token) return;
      try {
        const res = await fetch('/api/analytics/monthly-views', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        if (!res.ok) throw new Error('Erro ao buscar visualizações mensais');
        const data = await res.json();
        setMonthlyViews(data);
      } catch (error) {
        console.error("Erro:", error);
      }
    };
    fetchMonthlyViews();
  }, [token]);

  const dashboardStats = useMemo(() => {
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

  if (loading) {
    return <div className="text-center p-10 text-lg font-medium">Carregando dados...</div>;
  }

  return (
    <div className="mx-auto max-w-screen-2xl p-4 md:p-6 2xl:p-10">
      
      {/* Cards Estatísticos */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-4">
        <StatCard title="Total de Visualizações" value={formatNumber(dashboardStats.totalViews)} rate="0.43%" levelUp>
          <FiEye className="text-primary" size={24} />
        </StatCard>
        <StatCard title="Valor Total do Estoque" value={formatCurrency(dashboardStats.totalValue)} rate="4.35%" levelUp>
          <FiDollarSign className="text-primary" size={24} />
        </StatCard>
        <StatCard title="Total de Veículos" value={dashboardStats.totalVehicles.toString()} rate="2.59%" levelUp>
          <FiGrid className="text-primary" size={24} />
        </StatCard>
        <StatCard title="Preço Médio" value={formatCurrency(dashboardStats.averagePrice)} rate="0.95%" levelDown>
          <FiTrendingUp className="text-primary" size={24} />
        </StatCard>
      </div>

      {/* Gráfico e Top 5 */}
      <div className="mt-8 grid grid-cols-12 gap-6">
        
        {/* Gráfico */}
        <div className="col-span-12 xl:col-span-8 bg-white border border-gray-200 rounded-lg shadow-lg p-6">
          <h3 className="text-xl font-semibold text-gray-800 mb-4 text-center">
            Visualizações Mensais (Últimos 6 Meses)
          </h3>
          <div className="h-96">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={monthlyViews} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                <XAxis dataKey="month" tick={{ fill: '#6B7280' }} />
                <YAxis tick={{ fill: '#6B7280' }} />
                <Tooltip />
                <Area type="monotone" dataKey="Visualizações" stroke="#3C50E0" fill="#3C50E0" fillOpacity={0.15} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Top 5 Veículos */}
        <div className="col-span-12 xl:col-span-4 bg-white border border-gray-200 rounded-lg shadow-lg p-6 flex flex-col">
          <h3 className="text-xl font-semibold text-gray-800 mb-4 text-center">
            Top 5 Veículos Mais Visualizados
          </h3>
          <div className="flex flex-col gap-3 flex-grow">
            {dashboardStats.topVehicles.map((vehicle, key) => (
              <Link
                to={`/vehicle/${vehicle.id}`}
                key={key}
                className="flex items-center justify-between rounded-md p-2 hover:bg-gray-100 transition-colors"
              >
                <div className="flex items-center">
                  <div className="mr-4 h-12 w-12 flex-shrink-0">
                    <img src={vehicle.images[0]} alt={vehicle.name} className="h-full w-full rounded-md object-cover" />
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-800">{vehicle.name}</h4>
                    <p className="text-sm text-gray-500">{vehicle.make}</p>
                  </div>
                </div>
                <div className="flex items-center text-gray-600">
                  <FiEye className="mr-2" />
                  <span className="font-medium">{formatNumber(vehicle.views)}</span>
                </div>
              </Link>
            ))}
          </div>
          <Link
            to="/admin/vehicles"
            className="mt-4 flex items-center justify-center gap-2 rounded-md bg-primary/10 py-2 text-sm font-medium text-primary hover:bg-primary/20"
          >
            <span>Ver Todos</span>
            <FiArrowRight />
          </Link>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboardPage;
