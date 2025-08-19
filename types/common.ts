// Common TypeScript interfaces to replace 'any' types

// Cache related interfaces
export interface CacheData {
  data: unknown;
  timestamp: number;
  ttl: number;
  etag?: string;
  lastModified?: string;
}

export interface CacheMetrics {
  hits: number;
  misses: number;
  keys: number;
  memory: number;
  hitRate: number;
}

// Request/Response interfaces
export interface ExtendedRequest extends Request {
  socket?: {
    server?: {
      connections?: number;
    };
  };
  route?: {
    path?: string;
  };
}

export interface ExtendedResponse extends Response {
  get(header: string): string | undefined;
  set(header: string, value: string): void;
  set(headers: Record<string, string>): void;
}

// Performance monitoring interfaces
export interface PerformanceMetrics {
  timestamp: number;
  route: string;
  method: string;
  responseTime: number;
  statusCode: number;
  memoryUsage: NodeJS.MemoryUsage;
  cpuUsage: {
    user: number;
    system: number;
  };
  activeConnections: number;
  errorCount: number;
  cacheHits: number;
  cacheMisses: number;
}

export interface RouteStats {
  count: number;
  totalTime: number;
  errors: number;
  avgResponseTime: number;
}

// Queue related interfaces
export interface JobData {
  type: string;
  payload: Record<string, unknown>;
  priority?: number;
  delay?: number;
  attempts?: number;
}

export interface QueueJob {
  id: string;
  data: JobData;
  queue: {
    name: string;
  };
}

// WebSocket interfaces
export interface WebSocketMessage {
  type: string;
  data: Record<string, unknown>;
  timestamp: number;
  userId?: string;
}

export interface WebSocketConnection {
  id: string;
  userId?: string;
  page: string;
  connectedAt: number;
  lastActivity: number;
}

// Analytics interfaces
export interface AnalyticsEvent {
  event: string;
  properties: Record<string, unknown>;
  timestamp: number;
  userId?: string;
  sessionId?: string;
}

// Vehicle related interfaces
export interface Vehicle {
  id: string;
  brand: string;
  model: string;
  year: number;
  price: number;
  mileage: number;
  fuel: string;
  transmission: string;
  color: string;
  features: string[];
  images: string[];
  description: string;
  location: string;
  contact: {
    phone: string;
    email: string;
  };
  createdAt: Date;
  updatedAt: Date;
}

// User related interfaces
export interface User {
  id: string;
  email: string;
  name: string;
  role: "admin" | "user";
  preferences: Record<string, unknown>;
  createdAt: Date;
  updatedAt: Date;
}

// Error interfaces
export interface AppError extends Error {
  code?: string;
  statusCode?: number;
  isOperational?: boolean;
}

// Configuration interfaces
export interface CacheConfig {
  ttl: number;
  maxKeys: number;
  checkPeriod: number;
  staleWhileRevalidate: number;
}

export interface PerformanceConfig {
  sampleRate: number;
  metricsRetention: number;
  alertThresholds: {
    responseTime: number;
    errorRate: number;
    memoryUsage: number;
  };
}

// Edge function interfaces
export interface EdgeConfig {
  cache: CacheConfig;
  security: {
    rateLimit: {
      windowMs: number;
      maxRequests: number;
    };
  };
}

// Image optimization interfaces
export interface ImageOptimizationOptions {
  width?: number;
  height?: number;
  quality?: number;
  format?: "jpeg" | "png" | "webp" | "avif";
  compression?: "low" | "medium" | "high";
  blur?: number;
  sharpen?: boolean;
  grayscale?: boolean;
  rotate?: number;
  flip?: boolean;
  flop?: boolean;
}

// ML interfaces
export interface MLConfig {
  modelType: "collaborative" | "content" | "hybrid" | "neural";
  algorithm: "knn" | "svd" | "matrix" | "deep";
  parameters: Record<string, unknown>;
  trainingData: unknown[];
  validationSplit: number;
  epochs: number;
  learningRate: number;
  batchSize: number;
}

export interface UserProfile {
  userId: string;
  preferences: Record<string, number>;
  behavior: {
    views: string[];
    clicks: string[];
    purchases: string[];
    searches: string[];
    timeSpent: Record<string, number>;
  };
  demographics: {
    age?: number;
    location?: string;
    interests?: string[];
  };
  lastUpdated: Date;
}

export interface Recommendation {
  vehicleId: string;
  score: number;
  reason: string;
  confidence: number;
  algorithm: string;
}
