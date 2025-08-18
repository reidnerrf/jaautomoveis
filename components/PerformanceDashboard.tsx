import React, { useState, useEffect, useCallback } from 'react';
import { LineChart, Line, AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { AlertTriangle, CheckCircle, Clock, Activity, Database, Cpu, Memory, TrendingUp, TrendingDown } from 'lucide-react';

interface PerformanceMetrics {
  timestamp: number;
  route: string;
  method: string;
  responseTime: number;
  statusCode: number;
  memoryUsage: {
    heapUsed: number;
    heapTotal: number;
    rss: number;
    external: number;
  };
  cpuUsage: {
    user: number;
    system: number;
  };
  activeConnections: number;
  errorCount: number;
  cacheHits: number;
  cacheMisses: number;
}

interface PerformanceSummary {
  totalRequests: number;
  totalErrors: number;
  avgResponseTime: number;
  errorRate: number;
  memoryUsage: any;
  cpuUsage: any;
  routeStats: Map<string, any>;
  alerts: any[];
  cacheStats: {
    hits: number;
    misses: number;
    hitRate: number;
  };
}

interface SystemHealth {
  status: 'healthy' | 'warning' | 'critical';
  checks: {
    responseTime: boolean;
    memoryUsage: boolean;
    errorRate: boolean;
    cpuUsage: boolean;
  };
  recommendations: string[];
}

const PerformanceDashboard: React.FC = () => {
  const [metrics, setMetrics] = useState<PerformanceMetrics[]>([]);
  const [summary, setSummary] = useState<PerformanceSummary | null>(null);
  const [health, setHealth] = useState<SystemHealth | null>(null);
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [selectedTimeRange, setSelectedTimeRange] = useState('1h');
  const [loading, setLoading] = useState(true);

  // Cores para gráficos
  const colors = {
    primary: '#3B82F6',
    success: '#10B981',
    warning: '#F59E0B',
    danger: '#EF4444',
    info: '#06B6D4',
    secondary: '#6B7280'
  };

  // Função para buscar métricas
  const fetchMetrics = useCallback(async () => {
    try {
      const response = await fetch('/api/performance/metrics');
      const data = await response.json();
      setMetrics(data.current || []);
      setSummary(data.summary || null);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching performance metrics:', error);
      setLoading(false);
    }
  }, []);

  // Função para buscar saúde do sistema
  const fetchHealth = useCallback(async () => {
    try {
      const response = await fetch('/api/performance/health');
      const data = await response.json();
      setHealth(data);
    } catch (error) {
      console.error('Error fetching system health:', error);
    }
  }, []);

  // Auto-refresh
  useEffect(() => {
    if (autoRefresh) {
      const interval = setInterval(() => {
        fetchMetrics();
        fetchHealth();
      }, 5000); // 5 segundos

      return () => clearInterval(interval);
    }
  }, [autoRefresh, fetchMetrics, fetchHealth]);

  // Carregamento inicial
  useEffect(() => {
    fetchMetrics();
    fetchHealth();
  }, [fetchMetrics, fetchHealth]);

  // Preparar dados para gráficos
  const responseTimeData = metrics.slice(-20).map(m => ({
    time: new Date(m.timestamp).toLocaleTimeString(),
    responseTime: m.responseTime,
    route: m.route
  }));

  const memoryData = metrics.slice(-20).map(m => ({
    time: new Date(m.timestamp).toLocaleTimeString(),
    heapUsed: Math.round(m.memoryUsage.heapUsed / 1024 / 1024),
    heapTotal: Math.round(m.memoryUsage.heapTotal / 1024 / 1024),
    rss: Math.round(m.memoryUsage.rss / 1024 / 1024)
  }));

  const routeStatsData = summary?.routeStats ? 
    Array.from(summary.routeStats.entries()).map(([route, stats]) => ({
      route: route.length > 30 ? route.substring(0, 30) + '...' : route,
      avgResponseTime: stats.avgResponseTime,
      count: stats.count,
      errors: stats.errors
    })).sort((a, b) => b.count - a.count).slice(0, 10) : [];

  const cacheData = summary?.cacheStats ? [
    { name: 'Cache Hits', value: summary.cacheStats.hits, color: colors.success },
    { name: 'Cache Misses', value: summary.cacheStats.misses, color: colors.warning }
  ] : [];

  // Componente de card de métrica
  const MetricCard: React.FC<{
    title: string;
    value: string | number;
    icon: React.ReactNode;
    color: string;
    trend?: 'up' | 'down' | 'stable';
    subtitle?: string;
  }> = ({ title, value, icon, color, trend, subtitle }) => (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-2xl font-bold text-gray-900">{value}</p>
          {subtitle && <p className="text-xs text-gray-500">{subtitle}</p>}
        </div>
        <div className={`p-3 rounded-full ${color}`}>
          {icon}
        </div>
      </div>
      {trend && (
        <div className="mt-2 flex items-center">
          {trend === 'up' ? (
            <TrendingUp className="w-4 h-4 text-green-500" />
          ) : trend === 'down' ? (
            <TrendingDown className="w-4 h-4 text-red-500" />
          ) : (
            <div className="w-4 h-4 text-gray-400">—</div>
          )}
        </div>
      )}
    </div>
  );

  // Componente de status de saúde
  const HealthStatus: React.FC<{ health: SystemHealth }> = ({ health }) => (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">System Health</h3>
        <div className={`px-3 py-1 rounded-full text-sm font-medium ${
          health.status === 'healthy' ? 'bg-green-100 text-green-800' :
          health.status === 'warning' ? 'bg-yellow-100 text-yellow-800' :
          'bg-red-100 text-red-800'
        }`}>
          {health.status.toUpperCase()}
        </div>
      </div>
      
      <div className="space-y-3">
        {Object.entries(health.checks).map(([check, status]) => (
          <div key={check} className="flex items-center justify-between">
            <span className="text-sm text-gray-600 capitalize">
              {check.replace(/([A-Z])/g, ' $1').trim()}
            </span>
            {status ? (
              <CheckCircle className="w-5 h-5 text-green-500" />
            ) : (
              <AlertTriangle className="w-5 h-5 text-red-500" />
            )}
          </div>
        ))}
      </div>
      
      {health.recommendations.length > 0 && (
        <div className="mt-4 pt-4 border-t border-gray-200">
          <h4 className="text-sm font-medium text-gray-900 mb-2">Recommendations</h4>
          <ul className="text-sm text-gray-600 space-y-1">
            {health.recommendations.map((rec, index) => (
              <li key={index} className="flex items-start">
                <span className="text-red-500 mr-2">•</span>
                {rec}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Performance Dashboard</h1>
        <div className="flex items-center space-x-4">
          <select
            value={selectedTimeRange}
            onChange={(e) => setSelectedTimeRange(e.target.value)}
            className="border border-gray-300 rounded-md px-3 py-2 text-sm"
          >
            <option value="1h">Last Hour</option>
            <option value="6h">Last 6 Hours</option>
            <option value="24h">Last 24 Hours</option>
          </select>
          <button
            onClick={() => setAutoRefresh(!autoRefresh)}
            className={`px-4 py-2 rounded-md text-sm font-medium ${
              autoRefresh 
                ? 'bg-green-100 text-green-800' 
                : 'bg-gray-100 text-gray-800'
            }`}
          >
            {autoRefresh ? 'Auto-refresh ON' : 'Auto-refresh OFF'}
          </button>
        </div>
      </div>

      {/* Métricas principais */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard
          title="Total Requests"
          value={summary?.totalRequests.toLocaleString() || '0'}
          icon={<Activity className="w-6 h-6 text-white" />}
          color="bg-blue-500"
          trend="up"
        />
        <MetricCard
          title="Avg Response Time"
          value={`${summary?.avgResponseTime.toFixed(2) || '0'}ms`}
          icon={<Clock className="w-6 h-6 text-white" />}
          color="bg-green-500"
          trend={summary?.avgResponseTime > 1000 ? 'up' : 'stable'}
        />
        <MetricCard
          title="Error Rate"
          value={`${((summary?.errorRate || 0) * 100).toFixed(2)}%`}
          icon={<AlertTriangle className="w-6 h-6 text-white" />}
          color="bg-red-500"
          trend={(summary?.errorRate || 0) > 0.05 ? 'up' : 'stable'}
        />
        <MetricCard
          title="Cache Hit Rate"
          value={`${((summary?.cacheStats.hitRate || 0) * 100).toFixed(1)}%`}
          icon={<Database className="w-6 h-6 text-white" />}
          color="bg-purple-500"
          trend={(summary?.cacheStats.hitRate || 0) > 0.8 ? 'up' : 'down'}
        />
      </div>

      {/* Gráficos */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Response Time Chart */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Response Time Trend</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={responseTimeData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="time" />
              <YAxis />
              <Tooltip />
              <Line 
                type="monotone" 
                dataKey="responseTime" 
                stroke={colors.primary} 
                strokeWidth={2}
                dot={false}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Memory Usage Chart */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Memory Usage</h3>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={memoryData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="time" />
              <YAxis />
              <Tooltip />
              <Area 
                type="monotone" 
                dataKey="heapUsed" 
                stackId="1"
                stroke={colors.warning} 
                fill={colors.warning}
                fillOpacity={0.6}
              />
              <Area 
                type="monotone" 
                dataKey="heapTotal" 
                stackId="1"
                stroke={colors.danger} 
                fill={colors.danger}
                fillOpacity={0.6}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Route Performance e Cache Stats */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Route Performance */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Top Routes by Requests</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={routeStatsData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="route" angle={-45} textAnchor="end" height={80} />
              <YAxis />
              <Tooltip />
              <Bar dataKey="count" fill={colors.primary} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Cache Stats */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Cache Performance</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={cacheData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {cacheData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* System Health */}
      {health && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <HealthStatus health={health} />
          </div>
          
          {/* Recent Alerts */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Alerts</h3>
            <div className="space-y-3">
              {(summary?.alerts || []).slice(0, 5).map((alert, index) => (
                <div key={index} className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg">
                  <AlertTriangle className="w-5 h-5 text-red-500 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-gray-900">{alert.message}</p>
                    <p className="text-xs text-gray-500">
                      {new Date(alert.timestamp).toLocaleString()}
                    </p>
                  </div>
                </div>
              ))
              {(!summary?.alerts || summary.alerts.length === 0) && (
                <p className="text-sm text-gray-500">No recent alerts</p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PerformanceDashboard;