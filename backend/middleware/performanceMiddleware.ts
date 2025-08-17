import { Request, Response, NextFunction } from 'express';
import { performance } from 'perf_hooks';
import os from 'os';

// Interface para métricas de performance
interface PerformanceMetrics {
  timestamp: number;
  route: string;
  method: string;
  responseTime: number;
  statusCode: number;
  memoryUsage: NodeJS.MemoryUsage;
  cpuUsage: NodeJS.CpuUsage;
  activeConnections: number;
  errorCount: number;
  cacheHits: number;
  cacheMisses: number;
}

// Interface para alertas
interface PerformanceAlert {
  type: 'response_time' | 'memory_usage' | 'error_rate' | 'cpu_usage';
  severity: 'low' | 'medium' | 'high' | 'critical';
  message: string;
  timestamp: number;
  value: number;
  threshold: number;
}

// Configurações de performance
const PERFORMANCE_CONFIG = {
  RESPONSE_TIME_THRESHOLD: 1000, // 1 segundo
  MEMORY_USAGE_THRESHOLD: 0.8, // 80% da memória
  CPU_USAGE_THRESHOLD: 0.7, // 70% da CPU
  ERROR_RATE_THRESHOLD: 0.05, // 5% de erros
  METRICS_RETENTION: 24 * 60 * 60 * 1000, // 24 horas
  ALERT_COOLDOWN: 5 * 60 * 1000, // 5 minutos
  SAMPLE_RATE: 0.1 // 10% das requisições
};

// Armazenamento de métricas
const metrics: PerformanceMetrics[] = [];
const alerts: PerformanceAlert[] = [];
const routeStats = new Map<string, {
  count: number;
  totalTime: number;
  errors: number;
  avgResponseTime: number;
}>();

// Contadores globais
let totalRequests = 0;
let totalErrors = 0;
let totalCacheHits = 0;
let totalCacheMisses = 0;
let lastAlertTime = 0;

// Função para obter uso de CPU
function getCpuUsage(): NodeJS.CpuUsage {
  const cpus = os.cpus();
  let totalIdle = 0;
  let totalTick = 0;

  cpus.forEach(cpu => {
    for (const type in cpu.times) {
      totalTick += cpu.times[type as keyof typeof cpu.times];
    }
    totalIdle += cpu.times.idle;
  });

  return {
    user: totalTick - totalIdle,
    system: totalIdle
  };
}

// Função para obter uso de memória
function getMemoryUsage(): NodeJS.MemoryUsage {
  const memUsage = process.memoryUsage();
  const totalMem = os.totalmem();
  const freeMem = os.freemem();
  
  return {
    ...memUsage,
    external: memUsage.external || 0,
    heapTotal: memUsage.heapTotal,
    heapUsed: memUsage.heapUsed,
    rss: memUsage.rss,
    system: totalMem - freeMem
  };
}

// Função para verificar alertas
function checkAlerts(metrics: PerformanceMetrics): void {
  const now = Date.now();
  
  // Cooldown para evitar spam de alertas
  if (now - lastAlertTime < PERFORMANCE_CONFIG.ALERT_COOLDOWN) {
    return;
  }

  // Alertas de tempo de resposta
  if (metrics.responseTime > PERFORMANCE_CONFIG.RESPONSE_TIME_THRESHOLD) {
    const severity = metrics.responseTime > 5000 ? 'critical' : 
                    metrics.responseTime > 2000 ? 'high' : 
                    metrics.responseTime > 1000 ? 'medium' : 'low';
    
    alerts.push({
      type: 'response_time',
      severity,
      message: `Response time exceeded threshold: ${metrics.responseTime}ms`,
      timestamp: now,
      value: metrics.responseTime,
      threshold: PERFORMANCE_CONFIG.RESPONSE_TIME_THRESHOLD
    });
    
    lastAlertTime = now;
  }

  // Alertas de uso de memória
  const memoryUsagePercent = metrics.memoryUsage.heapUsed / metrics.memoryUsage.heapTotal;
  if (memoryUsagePercent > PERFORMANCE_CONFIG.MEMORY_USAGE_THRESHOLD) {
    alerts.push({
      type: 'memory_usage',
      severity: memoryUsagePercent > 0.9 ? 'critical' : 'high',
      message: `Memory usage exceeded threshold: ${(memoryUsagePercent * 100).toFixed(1)}%`,
      timestamp: now,
      value: memoryUsagePercent,
      threshold: PERFORMANCE_CONFIG.MEMORY_USAGE_THRESHOLD
    });
    
    lastAlertTime = now;
  }

  // Alertas de taxa de erro
  const errorRate = totalErrors / Math.max(totalRequests, 1);
  if (errorRate > PERFORMANCE_CONFIG.ERROR_RATE_THRESHOLD) {
    alerts.push({
      type: 'error_rate',
      severity: errorRate > 0.1 ? 'critical' : 'high',
      message: `Error rate exceeded threshold: ${(errorRate * 100).toFixed(1)}%`,
      timestamp: now,
      value: errorRate,
      threshold: PERFORMANCE_CONFIG.ERROR_RATE_THRESHOLD
    });
    
    lastAlertTime = now;
  }
}

// Middleware principal de performance
export function performanceMiddleware(req: Request, res: Response, next: NextFunction) {
  // Amostragem para reduzir overhead
  if (Math.random() > PERFORMANCE_CONFIG.SAMPLE_RATE) {
    return next();
  }

  const startTime = performance.now();
  const startCpu = getCpuUsage();
  const startMemory = getMemoryUsage();
  
  // Interceptar resposta
  const originalSend = res.send;
  const originalJson = res.json;
  
  res.send = function(data: any) {
    recordMetrics(req, res, startTime, startCpu, startMemory);
    return originalSend.call(this, data);
  };
  
  res.json = function(data: any) {
    recordMetrics(req, res, startTime, startCpu, startMemory);
    return originalJson.call(this, data);
  };
  
  next();
}

// Função para registrar métricas
function recordMetrics(
  req: Request, 
  res: Response, 
  startTime: number, 
  startCpu: NodeJS.CpuUsage, 
  startMemory: NodeJS.MemoryUsage
) {
  const endTime = performance.now();
  const responseTime = endTime - startTime;
  const endCpu = getCpuUsage();
  const endMemory = getMemoryUsage();
  
  totalRequests++;
  if (res.statusCode >= 400) {
    totalErrors++;
  }
  
  // Atualizar estatísticas da rota
  const route = req.route?.path || req.path;
  const method = req.method;
  const routeKey = `${method} ${route}`;
  
  if (!routeStats.has(routeKey)) {
    routeStats.set(routeKey, {
      count: 0,
      totalTime: 0,
      errors: 0,
      avgResponseTime: 0
    });
  }
  
  const stats = routeStats.get(routeKey)!;
  stats.count++;
  stats.totalTime += responseTime;
  stats.avgResponseTime = stats.totalTime / stats.count;
  
  if (res.statusCode >= 400) {
    stats.errors++;
  }
  
  // Criar métrica
  const metric: PerformanceMetrics = {
    timestamp: Date.now(),
    route,
    method,
    responseTime,
    statusCode: res.statusCode,
    memoryUsage: endMemory,
    cpuUsage: {
      user: endCpu.user - startCpu.user,
      system: endCpu.system - startCpu.system
    },
    activeConnections: (req as any).socket?.server?.connections || 0,
    errorCount: res.statusCode >= 400 ? 1 : 0,
    cacheHits: parseInt(res.get('X-Cache-Hits') || '0'),
    cacheMisses: parseInt(res.get('X-Cache-Misses') || '0')
  };
  
  metrics.push(metric);
  
  // Verificar alertas
  checkAlerts(metric);
  
  // Limpar métricas antigas
  cleanupOldMetrics();
}

// Função para limpar métricas antigas
function cleanupOldMetrics(): void {
  const cutoff = Date.now() - PERFORMANCE_CONFIG.METRICS_RETENTION;
  
  // Limpar métricas antigas
  const oldMetricsIndex = metrics.findIndex(m => m.timestamp > cutoff);
  if (oldMetricsIndex > 0) {
    metrics.splice(0, oldMetricsIndex);
  }
  
  // Limpar alertas antigos
  const oldAlertsIndex = alerts.findIndex(a => a.timestamp > cutoff);
  if (oldAlertsIndex > 0) {
    alerts.splice(0, oldAlertsIndex);
  }
}

// Middleware para métricas de memória
export function memoryMetricsMiddleware(req: Request, res: Response, next: NextFunction) {
  const memoryUsage = getMemoryUsage();
  
  res.set({
    'X-Memory-Usage': JSON.stringify({
      heapUsed: memoryUsage.heapUsed,
      heapTotal: memoryUsage.heapTotal,
      rss: memoryUsage.rss,
      external: memoryUsage.external
    })
  });
  
  next();
}

// Função para obter métricas de performance
export function getPerformanceMetrics(): {
  current: PerformanceMetrics[];
  summary: {
    totalRequests: number;
    totalErrors: number;
    avgResponseTime: number;
    errorRate: number;
    memoryUsage: NodeJS.MemoryUsage;
    cpuUsage: NodeJS.CpuUsage;
    routeStats: Map<string, any>;
    alerts: PerformanceAlert[];
    cacheStats: {
      hits: number;
      misses: number;
      hitRate: number;
    };
  };
} {
  const recentMetrics = metrics.filter(m => 
    m.timestamp > Date.now() - 60 * 60 * 1000 // Última hora
  );
  
  const avgResponseTime = recentMetrics.length > 0 
    ? recentMetrics.reduce((sum, m) => sum + m.responseTime, 0) / recentMetrics.length 
    : 0;
  
  const errorRate = totalRequests > 0 ? totalErrors / totalRequests : 0;
  
  const cacheHitRate = (totalCacheHits + totalCacheMisses) > 0 
    ? totalCacheHits / (totalCacheHits + totalCacheMisses) 
    : 0;
  
  return {
    current: recentMetrics,
    summary: {
      totalRequests,
      totalErrors,
      avgResponseTime,
      errorRate,
      memoryUsage: getMemoryUsage(),
      cpuUsage: getCpuUsage(),
      routeStats: new Map(routeStats),
      alerts: alerts.slice(-10), // Últimos 10 alertas
      cacheStats: {
        hits: totalCacheHits,
        misses: totalCacheMisses,
        hitRate: cacheHitRate
      }
    }
  };
}

// Função para limpar métricas
export function clearPerformanceMetrics(): void {
  metrics.length = 0;
  alerts.length = 0;
  routeStats.clear();
  totalRequests = 0;
  totalErrors = 0;
  totalCacheHits = 0;
  totalCacheMisses = 0;
}

// Função para obter estatísticas de rota
export function getRouteStats(): Map<string, any> {
  return new Map(routeStats);
}

// Função para obter alertas ativos
export function getActiveAlerts(): PerformanceAlert[] {
  return alerts.filter(alert => 
    alert.timestamp > Date.now() - 60 * 60 * 1000 // Última hora
  );
}

// Função para verificar saúde do sistema
export function getSystemHealth(): {
  status: 'healthy' | 'warning' | 'critical';
  checks: {
    responseTime: boolean;
    memoryUsage: boolean;
    errorRate: boolean;
    cpuUsage: boolean;
  };
  recommendations: string[];
} {
  const health = getPerformanceMetrics();
  const checks = {
    responseTime: health.summary.avgResponseTime < PERFORMANCE_CONFIG.RESPONSE_TIME_THRESHOLD,
    memoryUsage: (health.summary.memoryUsage.heapUsed / health.summary.memoryUsage.heapTotal) < PERFORMANCE_CONFIG.MEMORY_USAGE_THRESHOLD,
    errorRate: health.summary.errorRate < PERFORMANCE_CONFIG.ERROR_RATE_THRESHOLD,
    cpuUsage: true // Implementar verificação de CPU
  };
  
  const failedChecks = Object.values(checks).filter(check => !check).length;
  const status = failedChecks === 0 ? 'healthy' : 
                 failedChecks <= 2 ? 'warning' : 'critical';
  
  const recommendations = [];
  if (!checks.responseTime) {
    recommendations.push('Consider implementing caching or database optimization');
  }
  if (!checks.memoryUsage) {
    recommendations.push('Consider increasing memory or optimizing memory usage');
  }
  if (!checks.errorRate) {
    recommendations.push('Investigate and fix error sources');
  }
  
  return { status, checks, recommendations };
}

// Limpeza automática de métricas
setInterval(cleanupOldMetrics, 60 * 1000); // A cada minuto

export default performanceMiddleware;