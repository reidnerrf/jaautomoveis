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
	FiBarChart,
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
}