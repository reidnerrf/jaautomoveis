import { Request, Response, NextFunction } from 'express';
import { performance } from 'perf_hooks';

interface PerformanceMetrics {
  route: string;
  method: string;
  duration: number;
  statusCode: number;
  timestamp: Date;
  userAgent?: string;
  ip?: string;
}

class PerformanceMonitor {
  private metrics: PerformanceMetrics[] = [];
  private maxMetrics = 1000; // Manter apenas as últimas 1000 métricas

  addMetric(metric: PerformanceMetrics) {
    this.metrics.push(metric);
    
    // Limpar métricas antigas se exceder o limite
    if (this.metrics.length > this.maxMetrics) {
      this.metrics = this.metrics.slice(-this.maxMetrics);
    }
  }

  getMetrics() {
    return this.metrics;
  }

  getRouteStats(route?: string) {
    const filteredMetrics = route 
      ? this.metrics.filter(m => m.route === route)
      : this.metrics;

    if (filteredMetrics.length === 0) {
      return {
        count: 0,
        avgDuration: 0,
        p95Duration: 0,
        p99Duration: 0,
        minDuration: 0,
        maxDuration: 0,
        errorRate: 0
      };
    }

    const durations = filteredMetrics.map(m => m.duration).sort((a, b) => a - b);
    const errorCount = filteredMetrics.filter(m => m.statusCode >= 400).length;

    return {
      count: filteredMetrics.length,
      avgDuration: durations.reduce((a, b) => a + b, 0) / durations.length,
      p95Duration: durations[Math.floor(durations.length * 0.95)],
      p99Duration: durations[Math.floor(durations.length * 0.99)],
      minDuration: durations[0],
      maxDuration: durations[durations.length - 1],
      errorRate: errorCount / filteredMetrics.length
    };
  }

  getTopSlowRoutes(limit = 10) {
    const routeStats = new Map<string, any>();
    
    this.metrics.forEach(metric => {
      if (!routeStats.has(metric.route)) {
        routeStats.set(metric.route, []);
      }
      routeStats.get(metric.route).push(metric.duration);
    });

    return Array.from(routeStats.entries())
      .map(([route, durations]) => ({
        route,
        avgDuration: durations.reduce((a: number, b: number) => a + b, 0) / durations.length,
        count: durations.length
      }))
      .sort((a, b) => b.avgDuration - a.avgDuration)
      .slice(0, limit);
  }

  clear() {
    this.metrics = [];
  }
}

const performanceMonitor = new PerformanceMonitor();

export const performanceMiddleware = (req: Request, res: Response, next: NextFunction) => {
  const startTime = performance.now();
  const startHrTime = process.hrtime();

  // Interceptar o final da resposta
  res.on('finish', () => {
    const endTime = performance.now();
    const duration = endTime - startTime;

    const metric: PerformanceMetrics = {
      route: req.route?.path || req.path,
      method: req.method,
      duration,
      statusCode: res.statusCode,
      timestamp: new Date(),
      userAgent: req.get('User-Agent'),
      ip: req.ip || req.connection.remoteAddress
    };

    performanceMonitor.addMetric(metric);

    // Log de rotas lentas
    if (duration > 1000) { // Mais de 1 segundo
      console.warn(`Slow route detected: ${req.method} ${req.path} - ${duration.toFixed(2)}ms`);
    }
  });

  next();
};

// Middleware para métricas de memória
export const memoryMetricsMiddleware = (req: Request, res: Response, next: NextFunction) => {
  const memUsage = process.memoryUsage();
  
  // Log de uso de memória alto
  if (memUsage.heapUsed > 500 * 1024 * 1024) { // Mais de 500MB
    console.warn(`High memory usage: ${(memUsage.heapUsed / 1024 / 1024).toFixed(2)}MB`);
  }

  // Adicionar headers de métricas
  res.setHeader('X-Memory-Usage', `${(memUsage.heapUsed / 1024 / 1024).toFixed(2)}MB`);
  res.setHeader('X-Memory-Total', `${(memUsage.heapTotal / 1024 / 1024).toFixed(2)}MB`);

  next();
};

// Rota para obter métricas de performance
export const getPerformanceMetrics = (req: Request, res: Response) => {
  const route = req.query.route as string;
  const stats = performanceMonitor.getRouteStats(route);
  const topSlowRoutes = performanceMonitor.getTopSlowRoutes(10);
  const memUsage = process.memoryUsage();

  res.json({
    routeStats: stats,
    topSlowRoutes,
    memoryUsage: {
      heapUsed: `${(memUsage.heapUsed / 1024 / 1024).toFixed(2)}MB`,
      heapTotal: `${(memUsage.heapTotal / 1024 / 1024).toFixed(2)}MB`,
      external: `${(memUsage.external / 1024 / 1024).toFixed(2)}MB`,
      rss: `${(memUsage.rss / 1024 / 1024).toFixed(2)}MB`
    },
    uptime: process.uptime(),
    timestamp: new Date().toISOString()
  });
};

// Rota para limpar métricas
export const clearPerformanceMetrics = (req: Request, res: Response) => {
  performanceMonitor.clear();
  res.json({ message: 'Performance metrics cleared' });
};

// Middleware para monitorar queries do MongoDB
export const mongoQueryMiddleware = () => {
  return (req: Request, res: Response, next: NextFunction) => {
    const startTime = performance.now();
    
    // Interceptar queries do MongoDB (se disponível)
    if (req.app.locals.mongoose) {
      const originalQuery = req.app.locals.mongoose.Query.prototype.exec;
      
      req.app.locals.mongoose.Query.prototype.exec = function(...args: any[]) {
        const queryStartTime = performance.now();
        
        return originalQuery.apply(this, args).then((result: any) => {
          const queryDuration = performance.now() - queryStartTime;
          
          if (queryDuration > 100) { // Queries lentas
            console.warn(`Slow MongoDB query: ${this.mongooseCollection.name} - ${queryDuration.toFixed(2)}ms`);
          }
          
          return result;
        });
      };
    }
    
    next();
  };
};

export { performanceMonitor };
export default performanceMiddleware;