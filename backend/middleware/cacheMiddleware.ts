import { Request, Response, NextFunction } from 'express';
import NodeCache from 'node-cache';

// Cache com TTL de 5 minutos por padrão
const cache = new NodeCache({ 
  stdTTL: 300, // 5 minutos
  checkperiod: 60, // Verificar expiração a cada minuto
  useClones: false // Melhor performance
});

interface CacheOptions {
  ttl?: number; // Time to live em segundos
  key?: string; // Chave customizada
  condition?: (req: Request) => boolean; // Condição para usar cache
}

export const cacheMiddleware = (options: CacheOptions = {}) => {
  return (req: Request, res: Response, next: NextFunction) => {
    // Pular cache em desenvolvimento ou se condição não for atendida
    if (process.env.NODE_ENV === 'development' || 
        (options.condition && !options.condition(req))) {
      return next();
    }

    // Gerar chave do cache
    const key = options.key || `${req.method}:${req.originalUrl}:${JSON.stringify(req.query)}`;
    
    // Verificar se existe no cache
    const cachedResponse = cache.get(key);
    if (cachedResponse) {
      return res.json(cachedResponse);
    }

    // Interceptar a resposta para cachear
    const originalSend = res.json;
    res.json = function(body: any) {
      // Cachear apenas respostas de sucesso
      if (res.statusCode === 200) {
        cache.set(key, body, options.ttl || 300);
      }
      return originalSend.call(this, body);
    };

    next();
  };
};

// Middleware específico para veículos
export const vehicleCacheMiddleware = cacheMiddleware({
  ttl: 600, // 10 minutos para veículos
  key: (req: Request) => `vehicles:${req.query.page || 1}:${req.query.limit || 12}:${JSON.stringify(req.query)}`,
  condition: (req: Request) => req.method === 'GET' && req.path === '/api/vehicles'
});

// Middleware para veículo individual
export const singleVehicleCacheMiddleware = cacheMiddleware({
  ttl: 1800, // 30 minutos para veículo individual
  key: (req: Request) => `vehicle:${req.params.id}`,
  condition: (req: Request) => req.method === 'GET' && req.path.match(/^\/api\/vehicles\/[^\/]+$/)
});

// Middleware para estatísticas
export const statsCacheMiddleware = cacheMiddleware({
  ttl: 3600, // 1 hora para estatísticas
  key: 'stats:dashboard',
  condition: (req: Request) => req.method === 'GET' && req.path === '/api/analytics/dashboard'
});

// Função para invalidar cache
export const invalidateCache = (pattern: string) => {
  const keys = cache.keys();
  const matchingKeys = keys.filter(key => key.includes(pattern));
  cache.del(matchingKeys);
};

// Função para limpar todo o cache
export const clearCache = () => {
  cache.flushAll();
};

// Middleware para invalidar cache em operações de escrita
export const invalidateCacheMiddleware = (pattern: string) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const originalSend = res.json;
    res.json = function(body: any) {
      // Invalidar cache após operações de sucesso
      if (res.statusCode >= 200 && res.statusCode < 300) {
        invalidateCache(pattern);
      }
      return originalSend.call(this, body);
    };
    next();
  };
};

// Middleware para invalidar cache de veículos
export const invalidateVehicleCacheMiddleware = invalidateCacheMiddleware('vehicle');

// Estatísticas do cache
export const getCacheStats = () => {
  return {
    keys: cache.keys().length,
    hits: cache.getStats().hits,
    misses: cache.getStats().misses,
    hitRate: cache.getStats().hits / (cache.getStats().hits + cache.getStats().misses)
  };
};

export default cache;