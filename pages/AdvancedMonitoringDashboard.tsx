import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  FiActivity,
  FiDatabase,
  FiServer,
  FiCpu,
  FiHardDrive,
  FiWifi,
  FiAlertTriangle,
  FiCheckCircle,
  FiClock,
  FiTrendingUp,
  FiUsers,
  FiEye,
  FiShoppingCart,
  FiDollarSign,
  FiBarChart3,
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
  Legend,
  ResponsiveContainer,
} from "recharts";

interface SystemMetrics {
  cpu: number;
  memory: number;
  disk: number;
  network: number;
  uptime: number;
  requests: number;
  errors: number;
  responseTime: number;
}

interface DatabaseMetrics {
  connections: number;
  queries: number;
  slowQueries: number;
  cacheHitRate: number;
  shardHealth: Map<string, boolean>;
  replicaLag: number;
}

interface CacheMetrics {
  hits: number;
  misses: number;
  keys: number;
  memory: number;
  connected: boolean;
  nodes: number;
}

interface QueueMetrics {
  waiting: number;
  active: number;
  completed: number;
  failed: number;
  processingTime: number;
}

interface BusinessMetrics {
  activeUsers: number;
  pageViews: number;
  conversions: number;
  revenue: number;
  topVehicles: any[];
  userSessions: number;
}

const AdvancedMonitoringDashboard: React.FC = () => {
  const [systemMetrics, setSystemMetrics] = useState<SystemMetrics>({
    cpu: 0,
    memory: 0,
    disk: 0,
    network: 0,
    uptime: 0,
    requests: 0,
    errors: 0,
    responseTime: 0,
  });

  const [databaseMetrics, setDatabaseMetrics] = useState<DatabaseMetrics>({
    connections: 0,
    queries: 0,
    slowQueries: 0,
    cacheHitRate: 0,
    shardHealth: new Map(),
    replicaLag: 0,
  });

  const [cacheMetrics, setCacheMetrics] = useState<CacheMetrics>({
    hits: 0,
    misses: 0,
    keys: 0,
    memory: 0,
    connected: false,
    nodes: 0,
  });

  const [queueMetrics, setQueueMetrics] = useState<QueueMetrics>({
    waiting: 0,
    active: 0,
    completed: 0,
    failed: 0,
    processingTime: 0,
  });

  const [businessMetrics, setBusinessMetrics] = useState<BusinessMetrics>({
    activeUsers: 0,
    pageViews: 0,
    conversions: 0,
    revenue: 0,
    topVehicles: [],
    userSessions: 0,
  });

  const [timeRange, setTimeRange] = useState("1h");
  const [autoRefresh, setAutoRefresh] = useState(true);

  // Mock data for charts
  const performanceData = [
    { time: "00:00", cpu: 45, memory: 60, responseTime: 120 },
    { time: "01:00", cpu: 52, memory: 65, responseTime: 135 },
    { time: "02:00", cpu: 38, memory: 58, responseTime: 110 },
    { time: "03:00", cpu: 41, memory: 62, responseTime: 125 },
    { time: "04:00", cpu: 48, memory: 67, responseTime: 140 },
    { time: "05:00", cpu: 55, memory: 70, responseTime: 155 },
    { time: "06:00", cpu: 62, memory: 75, responseTime: 170 },
  ];

  const trafficData = [
    { time: "00:00", requests: 1200, errors: 12, users: 450 },
    { time: "01:00", requests: 1350, errors: 8, users: 520 },
    { time: "02:00", requests: 980, errors: 15, users: 380 },
    { time: "03:00", requests: 1100, errors: 10, users: 420 },
    { time: "04:00", requests: 1250, errors: 18, users: 480 },
    { time: "05:00", requests: 1400, errors: 22, users: 550 },
    { time: "06:00", requests: 1600, errors: 25, users: 620 },
  ];

  const cacheData = [
    { name: "Hits", value: 85, color: "#10B981" },
    { name: "Misses", value: 15, color: "#EF4444" },
  ];

  const queueData = [
    { name: "Waiting", value: 12, color: "#F59E0B" },
    { name: "Active", value: 8, color: "#3B82F6" },
    { name: "Completed", value: 156, color: "#10B981" },
    { name: "Failed", value: 3, color: "#EF4444" },
  ];

  useEffect(() => {
    const fetchMetrics = async () => {
      try {
        // Fetch system metrics
        const systemResponse = await fetch("/api/monitoring/system");
        const systemData = await systemResponse.json();
        setSystemMetrics(systemData);

        // Fetch database metrics
        const dbResponse = await fetch("/api/monitoring/database");
        const dbData = await dbResponse.json();
        setDatabaseMetrics(dbData);

        // Fetch cache metrics
        const cacheResponse = await fetch("/api/monitoring/cache");
        const cacheData = await cacheResponse.json();
        setCacheMetrics(cacheData);

        // Fetch queue metrics
        const queueResponse = await fetch("/api/monitoring/queues");
        const queueData = await queueResponse.json();
        setQueueMetrics(queueData);

        // Fetch business metrics
        const businessResponse = await fetch("/api/monitoring/business");
        const businessData = await businessResponse.json();
        setBusinessMetrics(businessData);
      } catch (error) {
        console.error("Error fetching metrics:", error);
      }
    };

    fetchMetrics();

    if (autoRefresh) {
      const interval = setInterval(fetchMetrics, 30000); // Refresh every 30 seconds
      return () => clearInterval(interval);
    }
  }, [autoRefresh, timeRange]);

  const getStatusColor = (value: number, thresholds: { warning: number; critical: number }) => {
    if (value >= thresholds.critical) return "text-red-500";
    if (value >= thresholds.warning) return "text-yellow-500";
    return "text-green-500";
  };

  const getStatusIcon = (value: number, thresholds: { warning: number; critical: number }) => {
    if (value >= thresholds.critical) return <FiAlertTriangle className="text-red-500" />;
    if (value >= thresholds.warning) return <FiClock className="text-yellow-500" />;
    return <FiCheckCircle className="text-green-500" />;
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Advanced Monitoring Dashboard</h1>
          <div className="flex items-center justify-between">
            <p className="text-gray-600">Real-time system monitoring and performance analytics</p>
            <div className="flex items-center space-x-4">
              <select
                value={timeRange}
                onChange={(e) => setTimeRange(e.target.value)}
                className="border border-gray-300 rounded-md px-3 py-2"
              >
                <option value="1h">Last Hour</option>
                <option value="6h">Last 6 Hours</option>
                <option value="24h">Last 24 Hours</option>
                <option value="7d">Last 7 Days</option>
              </select>
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={autoRefresh}
                  onChange={(e) => setAutoRefresh(e.target.checked)}
                  className="mr-2"
                />
                Auto Refresh
              </label>
            </div>
          </div>
        </div>

        {/* System Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-lg shadow p-6"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">CPU Usage</p>
                <p
                  className={`text-2xl font-bold ${getStatusColor(systemMetrics.cpu, { warning: 70, critical: 90 })}`}
                >
                  {systemMetrics.cpu}%
                </p>
              </div>
              {getStatusIcon(systemMetrics.cpu, { warning: 70, critical: 90 })}
            </div>
            <div className="mt-4">
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${systemMetrics.cpu}%` }}
                ></div>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white rounded-lg shadow p-6"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Memory Usage</p>
                <p
                  className={`text-2xl font-bold ${getStatusColor(systemMetrics.memory, { warning: 80, critical: 95 })}`}
                >
                  {systemMetrics.memory}%
                </p>
              </div>
              {getStatusIcon(systemMetrics.memory, {
                warning: 80,
                critical: 95,
              })}
            </div>
            <div className="mt-4">
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-green-500 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${systemMetrics.memory}%` }}
                ></div>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white rounded-lg shadow p-6"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Response Time</p>
                <p
                  className={`text-2xl font-bold ${getStatusColor(systemMetrics.responseTime, { warning: 500, critical: 1000 })}`}
                >
                  {systemMetrics.responseTime}ms
                </p>
              </div>
              <FiTrendingUp className="text-blue-500" />
            </div>
            <div className="mt-4">
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-purple-500 h-2 rounded-full transition-all duration-300"
                  style={{
                    width: `${Math.min((systemMetrics.responseTime / 1000) * 100, 100)}%`,
                  }}
                ></div>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-white rounded-lg shadow p-6"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Error Rate</p>
                <p
                  className={`text-2xl font-bold ${getStatusColor(systemMetrics.errors, { warning: 5, critical: 10 })}`}
                >
                  {systemMetrics.errors}%
                </p>
              </div>
              <FiAlertTriangle className="text-red-500" />
            </div>
            <div className="mt-4">
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-red-500 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${systemMetrics.errors}%` }}
                ></div>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Performance Chart */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-white rounded-lg shadow p-6"
          >
            <h3 className="text-lg font-semibold text-gray-900 mb-4">System Performance</h3>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={performanceData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="time" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="cpu" stroke="#3B82F6" strokeWidth={2} />
                <Line type="monotone" dataKey="memory" stroke="#10B981" strokeWidth={2} />
                <Line type="monotone" dataKey="responseTime" stroke="#8B5CF6" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </motion.div>

          {/* Traffic Chart */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-white rounded-lg shadow p-6"
          >
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Traffic Overview</h3>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={trafficData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="time" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Area
                  type="monotone"
                  dataKey="requests"
                  stackId="1"
                  stroke="#3B82F6"
                  fill="#3B82F6"
                  fillOpacity={0.6}
                />
                <Area
                  type="monotone"
                  dataKey="users"
                  stackId="2"
                  stroke="#10B981"
                  fill="#10B981"
                  fillOpacity={0.6}
                />
              </AreaChart>
            </ResponsiveContainer>
          </motion.div>
        </div>

        {/* Database and Cache Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* Database Metrics */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-lg shadow p-6"
          >
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <FiDatabase className="mr-2" />
              Database
            </h3>
            <div className="space-y-4">
              <div>
                <p className="text-sm text-gray-600">Active Connections</p>
                <p className="text-xl font-bold text-blue-600">{databaseMetrics.connections}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Queries/sec</p>
                <p className="text-xl font-bold text-green-600">{databaseMetrics.queries}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Cache Hit Rate</p>
                <p className="text-xl font-bold text-purple-600">{databaseMetrics.cacheHitRate}%</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Replica Lag</p>
                <p className="text-xl font-bold text-orange-600">{databaseMetrics.replicaLag}ms</p>
              </div>
            </div>
          </motion.div>

          {/* Cache Metrics */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white rounded-lg shadow p-6"
          >
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <FiHardDrive className="mr-2" />
              Cache
            </h3>
            <div className="space-y-4">
              <div>
                <p className="text-sm text-gray-600">Hit Rate</p>
                <p className="text-xl font-bold text-green-600">
                  {cacheMetrics.hits > 0
                    ? Math.round(
                        (cacheMetrics.hits / (cacheMetrics.hits + cacheMetrics.misses)) * 100
                      )
                    : 0}
                  %
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Total Keys</p>
                <p className="text-xl font-bold text-blue-600">
                  {cacheMetrics.keys.toLocaleString()}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Memory Usage</p>
                <p className="text-xl font-bold text-purple-600">
                  {(cacheMetrics.memory / 1024 / 1024).toFixed(1)} MB
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Nodes</p>
                <p className="text-xl font-bold text-orange-600">{cacheMetrics.nodes}</p>
              </div>
            </div>
            <div className="mt-4">
              <ResponsiveContainer width="100%" height={100}>
                <PieChart>
                  <Pie
                    data={cacheData}
                    cx="50%"
                    cy="50%"
                    innerRadius={20}
                    outerRadius={40}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {cacheData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
            </div>
          </motion.div>

          {/* Queue Metrics */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white rounded-lg shadow p-6"
          >
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <FiActivity className="mr-2" />
              Queues
            </h3>
            <div className="space-y-4">
              <div>
                <p className="text-sm text-gray-600">Waiting</p>
                <p className="text-xl font-bold text-yellow-600">{queueMetrics.waiting}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Active</p>
                <p className="text-xl font-bold text-blue-600">{queueMetrics.active}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Completed</p>
                <p className="text-xl font-bold text-green-600">{queueMetrics.completed}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Failed</p>
                <p className="text-xl font-bold text-red-600">{queueMetrics.failed}</p>
              </div>
            </div>
            <div className="mt-4">
              <ResponsiveContainer width="100%" height={100}>
                <BarChart data={queueData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="value" fill="#8884d8" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </motion.div>
        </div>

        {/* Business Metrics */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-lg shadow p-6"
        >
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <FiBarChart3 className="mr-2" />
            Business Metrics
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="text-center">
              <FiUsers className="text-3xl text-blue-500 mx-auto mb-2" />
              <p className="text-sm text-gray-600">Active Users</p>
              <p className="text-2xl font-bold text-blue-600">{businessMetrics.activeUsers}</p>
            </div>
            <div className="text-center">
              <FiEye className="text-3xl text-green-500 mx-auto mb-2" />
              <p className="text-sm text-gray-600">Page Views</p>
              <p className="text-2xl font-bold text-green-600">
                {businessMetrics.pageViews.toLocaleString()}
              </p>
            </div>
            <div className="text-center">
              <FiShoppingCart className="text-3xl text-purple-500 mx-auto mb-2" />
              <p className="text-sm text-gray-600">Conversions</p>
              <p className="text-2xl font-bold text-purple-600">{businessMetrics.conversions}</p>
            </div>
            <div className="text-center">
              <FiDollarSign className="text-3xl text-orange-500 mx-auto mb-2" />
              <p className="text-sm text-gray-600">Revenue</p>
              <p className="text-2xl font-bold text-orange-600">
                R$ {businessMetrics.revenue.toLocaleString()}
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default AdvancedMonitoringDashboard;
