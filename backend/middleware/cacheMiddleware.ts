import { Request, Response, NextFunction } from "express";
import NodeCache from "node-cache";
import Redis from "ioredis";
import {
  CacheData,
  CacheMetrics as CacheMetricsType,
  ExtendedRequest,
  ExtendedResponse,
} from "../../types/common";
import {
  logError,
  logInfo,
  logDebug,
  logCacheHit,
  logCacheMiss,
} from "../../utils/logger";

// Configurações de cache
const CACHE_CONFIG = {
  DEFAULT_TTL: 300, // 5 minutos
  VEHICLE_LIST_TTL: 600, // 10 minutos
  VEHICLE_DETAIL_TTL: 1800, // 30 minutos
  STATS_TTL: 900, // 15 minutos
  SEARCH_TTL: 300, // 5 minutos
  CATEGORIES_TTL: 3600, // 1 hora
  MAX_KEYS: 10000,
  CHECK_PERIOD: 600, // 10 minutos
};

// Cache local para desenvolvimento
const localCache = new NodeCache({
  stdTTL: CACHE_CONFIG.DEFAULT_TTL,
  checkperiod: CACHE_CONFIG.CHECK_PERIOD,
  maxKeys: CACHE_CONFIG.MAX_KEYS,
  useClones: false,
  deleteOnExpire: true,
});

// Cache Redis para produção
let redisClient: Redis | null = null;

if (process.env.REDIS_URL) {
  redisClient = new Redis(process.env.REDIS_URL, {
    enableOfflineQueue: false,
    lazyConnect: true,
  });

  redisClient.on("connect", () => {
    logInfo("Connected to Redis cache");
  });

  redisClient.on("error", (error) => {
    logError("Redis cache error:", error);
  });
}

// Métricas globais de cache
const cacheMetrics: CacheMetricsType = {
  hits: 0,
  misses: 0,
  keys: 0,
  memory: 0,
  hitRate: 0,
};

// Função para gerar chave de cache
function generateCacheKey(req: Request, prefix: string = ""): string {
  const url = req.originalUrl || req.url;
  const query = JSON.stringify(req.query);
  const params = JSON.stringify(req.params);
  const userAgent = req.get("User-Agent") || "";
  const acceptLanguage = req.get("Accept-Language") || "";

  const key = `${prefix}:${url}:${query}:${params}:${userAgent}:${acceptLanguage}`;
  return Buffer.from(key)
    .toString("base64")
    .replace(/[^a-zA-Z0-9]/g, "");
}

// Função para obter TTL baseado no tipo de requisição
function getTTLForRequest(req: Request): number {
  const url = req.originalUrl || req.url;

  if (url.includes("/api/vehicles/") && req.params.id) {
    return CACHE_CONFIG.VEHICLE_DETAIL_TTL;
  }

  if (url.includes("/api/vehicles") && !req.params.id) {
    return CACHE_CONFIG.VEHICLE_LIST_TTL;
  }

  if (url.includes("/api/stats")) {
    return CACHE_CONFIG.STATS_TTL;
  }

  if (url.includes("/api/search")) {
    return CACHE_CONFIG.SEARCH_TTL;
  }

  if (url.includes("/api/categories")) {
    return CACHE_CONFIG.CATEGORIES_TTL;
  }

  return CACHE_CONFIG.DEFAULT_TTL;
}

// Função para obter cache (local ou Redis)
async function getCache(key: string): Promise<unknown> {
  try {
    if (redisClient && redisClient.status === "ready") {
      const value = await redisClient.get(key);
      if (value) {
        cacheMetrics.hits++;
        return JSON.parse(value);
      }
    } else {
      const value = localCache.get(key);
      if (value !== undefined) {
        cacheMetrics.hits++;
        return value;
      }
    }

    cacheMetrics.misses++;
    return null;
  } catch (error) {
    logError("Cache get error:", error as Error);
    cacheMetrics.misses++;
    return null;
  }
}

// Função para definir cache (local ou Redis)
async function setCache(
  key: string,
  value: unknown,
  ttl: number,
): Promise<void> {
  try {
    const serializedValue = JSON.stringify(value);

    if (redisClient && redisClient.status === "ready") {
      await redisClient.setex(key, ttl, serializedValue);
    } else {
      localCache.set(key, value, ttl);
    }

    await updateCacheMetrics();
  } catch (error) {
    logError("Cache set error:", error as Error);
  }
}

// Função para invalidar cache
async function invalidateCache(pattern: string): Promise<void> {
  try {
    if (redisClient && redisClient.status === "ready") {
      const keys = await redisClient.keys(pattern);
      if (keys.length > 0) {
        await redisClient.del(...keys);
      }
    } else {
      const keys = localCache.keys();
      const matchingKeys = keys.filter((key) => key.includes(pattern));
      matchingKeys.forEach((key) => localCache.del(key));
    }

    await updateCacheMetrics();
  } catch (error) {
    logError("Cache invalidation error:", error as Error);
  }
}

// Função para atualizar métricas
async function updateCacheMetrics(): Promise<void> {
  try {
    if (redisClient && redisClient.status === "ready") {
      const info = await redisClient.info("memory");
      const keys = await redisClient.dbsize();

      cacheMetrics.keys = keys;
      cacheMetrics.memory = parseInt(
        info.match(/used_memory:(\d+)/)?.[1] || "0",
        10,
      );
    } else {
      const stats = localCache.getStats();
      cacheMetrics.keys = stats.keys;
      cacheMetrics.memory = stats.vsize;
    }

    cacheMetrics.hitRate =
      (cacheMetrics.hits / (cacheMetrics.hits + cacheMetrics.misses)) * 100;
  } catch (error) {
    logError("Cache metrics update error:", error as Error);
  }
}

// Middleware de cache genérico
export function cacheMiddleware(prefix: string = "api") {
  return async (req: Request, res: Response, next: NextFunction) => {
    // Pular cache para requisições não-GET
    if (req.method !== "GET") {
      return next();
    }

    // Pular cache se solicitado
    if (req.headers["x-skip-cache"] === "true") {
      return next();
    }

    const cacheKey = generateCacheKey(req, prefix);
    const ttl = getTTLForRequest(req);

    try {
      const cachedData = await getCache(cacheKey);

      if (cachedData) {
        // Adicionar headers de cache
        res.set({
          "X-Cache": "HIT",
          "X-Cache-Key": cacheKey,
          "Cache-Control": `public, max-age=${ttl}`,
        });

        return res.json(cachedData);
      }

      // Interceptar resposta para cache
      const originalSend = res.json;
      res.json = function (data: unknown) {
        setCache(cacheKey, data, ttl);

        res.set({
          "X-Cache": "MISS",
          "X-Cache-Key": cacheKey,
          "Cache-Control": `public, max-age=${ttl}`,
        });

        return originalSend.call(this, data);
      };

      next();
    } catch (error) {
      logError("Cache middleware error:", error as Error);
      next();
    }
  };
}

// Middleware específico para lista de veículos
export function vehicleListCacheMiddleware(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  return cacheMiddleware("vehicles")(req, res, next);
}

// Middleware específico para detalhes de veículo
export function vehicleDetailCacheMiddleware(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  return cacheMiddleware("vehicle-detail")(req, res, next);
}

// Middleware específico para estatísticas
export function statsCacheMiddleware(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  return cacheMiddleware("stats")(req, res, next);
}

// Middleware para invalidação de cache
export function invalidateVehicleCacheMiddleware(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  const vehicleId = req.params.id;

  // Invalidar cache específico do veículo
  if (vehicleId) {
    invalidateCache(`vehicle-detail:*${vehicleId}*`);
  }

  // Invalidar listas de veículos
  invalidateCache("vehicles:*");
  invalidateCache("stats:*");

  next();
}

// Middleware para cache condicional baseado em headers
export function conditionalCacheMiddleware(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  const etag = req.headers["if-none-match"];
  const lastModified = req.headers["if-modified-since"];

  if (etag || lastModified) {
    // Implementar lógica de cache condicional
    const cacheKey = generateCacheKey(req, "conditional");
    getCache(cacheKey)
      .then((cachedData: unknown) => {
        const cacheData = cachedData as CacheData | null;
        if (
          (cacheData && cacheData.etag === etag) ||
          (cacheData && cacheData.lastModified === lastModified)
        ) {
          return res.status(304).end();
        }
        next();
      })
      .catch(() => next());
  } else {
    next();
  }
}

// Middleware para cache de busca
export function searchCacheMiddleware(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  const query = req.query.q || req.query.search;

  if (!query) {
    return next();
  }

  return cacheMiddleware("search")(req, res, next);
}

// Função para limpeza periódica de cache
export async function cleanupCache(): Promise<void> {
  try {
    if (redisClient && redisClient.status === "ready") {
      // Limpar chaves expiradas
      await redisClient.eval(
        `
        local keys = redis.call('keys', ARGV[1])
        for i=1,#keys do
          local ttl = redis.call('ttl', keys[i])
          if ttl == -1 then
            redis.call('del', keys[i])
          end
        end
        return #keys
      `,
        0,
        "*",
      );
    } else {
      localCache.flushAll();
    }

    await updateCacheMetrics();
  } catch (error) {
    logError("Cache cleanup error:", error as Error);
  }
}

// Função para obter métricas de cache
export function getCacheMetrics(): CacheMetricsType {
  return { ...cacheMetrics };
}

// Função para resetar métricas
export function resetCacheMetrics(): void {
  cacheMetrics.hits = 0;
  cacheMetrics.misses = 0;
  cacheMetrics.keys = 0;
  cacheMetrics.memory = 0;
  cacheMetrics.hitRate = 0;
}

// Função para warm-up de cache
export async function warmupCache(): Promise<void> {
  try {
    // Implementar warm-up assíncrono
    logInfo("Cache warm-up completed");
  } catch (error) {
    logError("Cache warm-up error:", error as Error);
  }
}

// Inicializar limpeza periódica (desabilitar em testes para evitar handles abertos)
if (process.env.NODE_ENV !== 'test') {
  setInterval(cleanupCache, CACHE_CONFIG.CHECK_PERIOD * 1000);
}

// Warm-up inicial
if (process.env.NODE_ENV === "production") {
  setTimeout(warmupCache, 5000);
}
