import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  FiActivity, 
  FiClock, 
  FiTrendingUp, 
  FiAlertTriangle, 
  FiRefreshCw,
  FiDatabase,
  FiHardDrive,
  FiCpu
} from 'react-icons/fi';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';

interface PerformanceMetrics {
  routeStats: {
    count: number;
    avgDuration: number;
    p95Duration: number;
    p99Duration: number;
    minDuration: number;
    maxDuration: number;
    errorRate: number;
  };
  topSlowRoutes: Array<{
    route: string;
    avgDuration: number;
    count: number;
  }>;
  memoryUsage: {
    heapUsed: string;
    heapTotal: string;
    external: string;
    rss: string;
  };
  uptime: number;
  timestamp: string;
}

const PerformanceDashboardPage: React.FC = () => {
  const [metrics, setMetrics] = useState<PerformanceMetrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [autoRefresh, setAutoRefresh] = useState(false);

  const fetchMetrics = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/performance/metrics');
      if (!response.ok) throw new Error('Failed to fetch metrics');
      
      const data = await response.json();
      setMetrics(data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  const clearMetrics = async () => {
    try {
      await fetch('/api/performance/metrics', { method: 'DELETE' });
      await fetchMetrics();
    } catch (err) {
      console.error('Error clearing metrics:', err);
    }
  };

  useEffect(() => {
    fetchMetrics();
  }, []);

  useEffect(() => {
    if (!autoRefresh) return;

    const interval = setInterval(fetchMetrics, 5000); // Refresh every 5 seconds
    return () => clearInterval(interval);
  }, [autoRefresh]);

  const formatDuration = (ms: number) => {
    if (ms < 1000) return `${ms.toFixed(2)}ms`;
    return `${(ms / 1000).toFixed(2)}s`;
  };

  const formatUptime = (seconds: number) => {
    const days = Math.floor(seconds / 86400);
    const hours = Math.floor((seconds % 86400) / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    
    if (days > 0) return `${days}d ${hours}h ${minutes}m`;
    if (hours > 0) return `${hours}h ${minutes}m`;
    return `${minutes}m`;
  };

  const getPerformanceColor = (duration: number) => {
    if (duration < 100) return 'text-green-500';
    if (duration < 500) return 'text-yellow-500';
    return 'text-red-500';
  };

  if (loading && !metrics) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <FiAlertTriangle className="mx-auto h-12 w-12 text-red-500 mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Error Loading Metrics</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={fetchMetrics}
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Performance Dashboard</h1>
            <p className="text-gray-600 mt-2">Real-time performance metrics and monitoring</p>
          </div>
          <div className="flex space-x-4">
            <button
              onClick={fetchMetrics}
              className="flex items-center space-x-2 bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
            >
              <FiRefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
              <span>Refresh</span>
            </button>
            <button
              onClick={() => setAutoRefresh(!autoRefresh)}
              className={`flex items-center space-x-2 px-4 py-2 rounded ${
                autoRefresh 
                  ? 'bg-green-500 text-white hover:bg-green-600' 
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              <FiActivity className="h-4 w-4" />
              <span>Auto Refresh</span>
            </button>
            <button
              onClick={clearMetrics}
              className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
            >
              Clear Metrics
            </button>
          </div>
        </div>

        {metrics && (
          <>
            {/* Overview Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-lg shadow p-6"
              >
                <div className="flex items-center">
                  <FiClock className="h-8 w-8 text-blue-500" />
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Avg Response Time</p>
                    <p className={`text-2xl font-bold ${getPerformanceColor(metrics.routeStats.avgDuration)}`}>
                      {formatDuration(metrics.routeStats.avgDuration)}
                    </p>
                  </div>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="bg-white rounded-lg shadow p-6"
              >
                <div className="flex items-center">
                  <FiTrendingUp className="h-8 w-8 text-green-500" />
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Total Requests</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {metrics.routeStats.count.toLocaleString()}
                    </p>
                  </div>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="bg-white rounded-lg shadow p-6"
              >
                <div className="flex items-center">
                  <FiCpu className="h-8 w-8 text-purple-500" />
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Memory Usage</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {metrics.memoryUsage.heapUsed}
                    </p>
                  </div>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="bg-white rounded-lg shadow p-6"
              >
                <div className="flex items-center">
                  <FiDatabase className="h-8 w-8 text-orange-500" />
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Uptime</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {formatUptime(metrics.uptime)}
                    </p>
                  </div>
                </div>
              </motion.div>
            </div>

            {/* Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
              {/* Response Time Distribution */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="bg-white rounded-lg shadow p-6"
              >
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Response Time Distribution</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={[
                    { name: 'Min', value: metrics.routeStats.minDuration },
                    { name: 'Avg', value: metrics.routeStats.avgDuration },
                    { name: 'P95', value: metrics.routeStats.p95Duration },
                    { name: 'P99', value: metrics.routeStats.p99Duration },
                    { name: 'Max', value: metrics.routeStats.maxDuration }
                  ]}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip formatter={(value) => formatDuration(value as number)} />
                    <Bar dataKey="value" fill="#3B82F6" />
                  </BarChart>
                </ResponsiveContainer>
              </motion.div>

              {/* Top Slow Routes */}
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="bg-white rounded-lg shadow p-6"
              >
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Top Slow Routes</h3>
                <div className="space-y-4">
                  {metrics.topSlowRoutes.slice(0, 5).map((route, index) => (
                    <div key={route.route} className="flex justify-between items-center">
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-900 truncate">
                          {route.route}
                        </p>
                        <p className="text-xs text-gray-500">
                          {route.count} requests
                        </p>
                      </div>
                      <div className="text-right">
                        <p className={`text-sm font-semibold ${getPerformanceColor(route.avgDuration)}`}>
                          {formatDuration(route.avgDuration)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>
            </div>

            {/* Detailed Stats */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-lg shadow p-6"
            >
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Detailed Statistics</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <h4 className="text-sm font-medium text-gray-600 mb-2">Performance Metrics</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span>Error Rate:</span>
                      <span className="font-medium">{(metrics.routeStats.errorRate * 100).toFixed(2)}%</span>
                    </div>
                    <div className="flex justify-between">
                      <span>P95 Response:</span>
                      <span className="font-medium">{formatDuration(metrics.routeStats.p95Duration)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>P99 Response:</span>
                      <span className="font-medium">{formatDuration(metrics.routeStats.p99Duration)}</span>
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="text-sm font-medium text-gray-600 mb-2">Memory Usage</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span>Heap Used:</span>
                      <span className="font-medium">{metrics.memoryUsage.heapUsed}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Heap Total:</span>
                      <span className="font-medium">{metrics.memoryUsage.heapTotal}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>RSS:</span>
                      <span className="font-medium">{metrics.memoryUsage.rss}</span>
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="text-sm font-medium text-gray-600 mb-2">System Info</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span>Last Updated:</span>
                      <span className="font-medium">
                        {new Date(metrics.timestamp).toLocaleTimeString()}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Uptime:</span>
                      <span className="font-medium">{formatUptime(metrics.uptime)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Auto Refresh:</span>
                      <span className="font-medium">{autoRefresh ? 'On' : 'Off'}</span>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </div>
    </div>
  );
};

export default PerformanceDashboardPage;