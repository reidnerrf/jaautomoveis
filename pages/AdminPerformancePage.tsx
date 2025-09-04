import React, { useState, useEffect } from "react";
import { useAuth } from "../hooks/useAuth.tsx";
import { motion } from "framer-motion";
import {
  FiCpu,
  FiHardDrive,
  FiWifi,
  FiClock,
  FiActivity,
  FiAlertTriangle,
  FiCheckCircle,
  FiRefreshCw,
  FiDownload,
  FiSettings,
} from "react-icons/fi";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
} from "recharts";
import toast from "react-hot-toast";

interface PerformanceMetrics {
  timestamp: string;
  cpu: number;
  memory: number;
  disk: number;
  network: number;
  responseTime: number;
  requests: number;
  errors: number;
}

interface SystemStatus {
  status: 'healthy' | 'warning' | 'critical';
  uptime: number;
  version: string;
  lastRestart: string;
  activeConnections: number;
  totalRequests: number;
  errorRate: number;
}

const AdminPerformancePage: React.FC = () => {
  const { token } = useAuth();
  const [metrics, setMetrics] = useState<PerformanceMetrics[]>([]);
  const [systemStatus, setSystemStatus] = useState<SystemStatus>({
    status: 'healthy',
    uptime: 0,
    version: '1.0.0',
    lastRestart: '',
    activeConnections: 0,
    totalRequests: 0,
    errorRate: 0,
  });
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchPerformanceData();
    const interval = setInterval(fetchPerformanceData, 10000); // Update every 10 seconds
    return () => clearInterval(interval);
  }, [token]);

  const fetchPerformanceData = async () => {
    if (!token) return;

    try {
      setRefreshing(true);
      const [metricsRes, statusRes] = await Promise.all([
        fetch("/api/performance/metrics", {
          headers: { Authorization: `Bearer ${token}` },
        }),
        fetch("/api/performance/status", {
          headers: { Authorization: `Bearer ${token}` },
        }),
      ]);

      if (metricsRes.ok) {
        const metricsData = await metricsRes.json();
        setMetrics(metricsData.slice(-24) || []); // Last 24 data points
      }

      if (statusRes.ok) {
        const statusData = await statusRes.json();
        setSystemStatus(statusData);
      }
    } catch (error) {
      toast.error("Erro ao buscar dados de performance:");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = async () => {
    await fetchPerformanceData();
    toast.success("Dados de performance atualizados!");
  };

  const handleExportMetrics = async () => {
    if (!token) return;
    try {
      const res = await fetch("/api/performance/export", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const blob = await res.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `performance-metrics-${new Date().toISOString().split('T')[0]}.csv`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
        toast.success("Métricas exportadas com sucesso!");
      }
    } catch (error) {
      toast.error("Erro ao exportar métricas:");
    }
  };

  const formatUptime = (seconds: number) => {
    const days = Math.floor(seconds / 86400);
    const hours = Math.floor((seconds % 86400) / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    return `${days}d ${hours}h ${minutes}m`;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'healthy': return 'text-green-500';
      case 'warning': return 'text-yellow-500';
      case 'critical': return 'text-red-500';
      default: return 'text-gray-500';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'healthy': return <FiCheckCircle className="text-green-500" />;
      case 'warning': return <FiAlertTriangle className="text-yellow-500" />;
      case 'critical': return <FiAlertTriangle className="text-red-500" />;
      default: return <FiActivity className="text-gray-500" />;
    }
  };

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
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
              Performance & Monitoramento
            </h1>
            <p className="text-gray-600 dark:text-gray-300">
              Monitoramento em tempo real do sistema e métricas de performance
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={handleRefresh}
              disabled={refreshing}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium bg-blue-600 hover:bg-blue-700 text-white disabled:opacity-60 transition-colors"
            >
              <FiRefreshCw className={`${refreshing ? 'animate-spin' : ''}`} />
              {refreshing ? 'Atualizando...' : 'Atualizar'}
            </button>
            <button
              onClick={handleExportMetrics}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium bg-green-600 hover:bg-green-700 text-white transition-colors"
            >
              <FiDownload />
              Exportar
            </button>
          </div>
        </div>
      </motion.div>

      {/* System Status Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <motion.div
          className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg p-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Status do Sistema</p>
              <p className={`text-2xl font-bold ${getStatusColor(systemStatus.status)}`}>
                {systemStatus.status === 'healthy' ? 'Saudável' : 
                 systemStatus.status === 'warning' ? 'Atenção' : 'Crítico'}
              </p>
            </div>
            <div className="text-3xl">
              {getStatusIcon(systemStatus.status)}
            </div>
          </div>
        </motion.div>

        <motion.div
          className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg p-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Uptime</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {formatUptime(systemStatus.uptime)}
              </p>
            </div>
            <FiClock className="text-3xl text-blue-500" />
          </div>
        </motion.div>

        <motion.div
          className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg p-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Conexões Ativas</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {systemStatus.activeConnections}
              </p>
            </div>
            <FiWifi className="text-3xl text-green-500" />
          </div>
        </motion.div>

        <motion.div
          className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg p-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Taxa de Erro</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {systemStatus.errorRate.toFixed(2)}%
              </p>
            </div>
            <FiActivity className="text-3xl text-red-500" />
          </div>
        </motion.div>
      </div>

      {/* Performance Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* CPU & Memory Usage */}
        <motion.div
          className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg p-6"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.5 }}
        >
          <h3 className="text-xl font-semibold text-gray-800 dark:text-white mb-4 flex items-center gap-2">
            <FiCpu className="text-blue-500" />
            CPU & Memória
          </h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={metrics}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                <XAxis 
                  dataKey="timestamp" 
                  tick={{ fill: "#6B7280" }}
                  tickFormatter={(value) => new Date(value).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                />
                <YAxis tick={{ fill: "#6B7280" }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#1F2937",
                    border: "none",
                    borderRadius: "8px",
                    color: "white",
                  }}
                />
                <Line type="monotone" dataKey="cpu" stroke="#3B82F6" strokeWidth={2} name="CPU %" />
                <Line type="monotone" dataKey="memory" stroke="#10B981" strokeWidth={2} name="Memória %" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* Response Time & Requests */}
        <motion.div
          className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg p-6"
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.6 }}
        >
          <h3 className="text-xl font-semibold text-gray-800 dark:text-white mb-4 flex items-center gap-2">
            <FiActivity className="text-green-500" />
            Tempo de Resposta & Requisições
          </h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={metrics}>
                <defs>
                  <linearGradient id="colorResponseTime" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#F59E0B" stopOpacity={0.8} />
                    <stop offset="95%" stopColor="#F59E0B" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="colorRequests" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#8B5CF6" stopOpacity={0.8} />
                    <stop offset="95%" stopColor="#8B5CF6" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                <XAxis 
                  dataKey="timestamp" 
                  tick={{ fill: "#6B7280" }}
                  tickFormatter={(value) => new Date(value).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                />
                <YAxis tick={{ fill: "#6B7280" }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#1F2937",
                    border: "none",
                    borderRadius: "8px",
                    color: "white",
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="responseTime"
                  stroke="#F59E0B"
                  fillOpacity={1}
                  fill="url(#colorResponseTime)"
                  name="Tempo de Resposta (ms)"
                />
                <Area
                  type="monotone"
                  dataKey="requests"
                  stroke="#8B5CF6"
                  fillOpacity={1}
                  fill="url(#colorRequests)"
                  name="Requisições/min"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </motion.div>
      </div>

      {/* System Information */}
      <motion.div
        className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg p-6"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.7 }}
      >
        <h3 className="text-xl font-semibold text-gray-800 dark:text-white mb-4 flex items-center gap-2">
          <FiSettings className="text-gray-500" />
          Informações do Sistema
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div>
            <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Versão</p>
            <p className="text-lg font-semibold text-gray-900 dark:text-white">{systemStatus.version}</p>
          </div>
          <div>
            <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Último Reinício</p>
            <p className="text-lg font-semibold text-gray-900 dark:text-white">
              {systemStatus.lastRestart ? new Date(systemStatus.lastRestart).toLocaleString('pt-BR') : 'N/A'}
            </p>
          </div>
          <div>
            <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total de Requisições</p>
            <p className="text-lg font-semibold text-gray-900 dark:text-white">
              {systemStatus.totalRequests.toLocaleString('pt-BR')}
            </p>
          </div>
          <div>
            <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Ambiente</p>
            <p className="text-lg font-semibold text-gray-900 dark:text-white">Produção</p>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default AdminPerformancePage;