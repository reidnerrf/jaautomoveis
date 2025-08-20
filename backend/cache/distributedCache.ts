import Redis, { Cluster, ClusterOptions } from "ioredis";

interface CacheConfig {
  nodes: string[];
  options?: ClusterOptions;
  defaultTTL?: number;
}

interface CacheStats {
  hits: number;
  misses: number;
  keys: number;
  memory: number;
  connected: boolean;
}

class DistributedCache {
  private cluster: Cluster;
  private stats: CacheStats;
  private defaultTTL: number;

  constructor(config: CacheConfig) {
    this.defaultTTL = config.defaultTTL || 3600; // 1 hour default
    this.stats = {
      hits: 0,
      misses: 0,
      keys: 0,
      memory: 0,
      connected: false,
    };

    this.cluster = new Redis.Cluster(config.nodes, {
      scaleReads: "slave", // Read from slaves
      retryDelayOnFailover: 100,
      enableOfflineQueue: false,
      enableReadyCheck: true,
      clusterRetryStrategy: (times: number) => {
        const delay = Math.min(times * 50, 2000);
        return delay;
      },
      ...config.options,
    });

    this.setupEventHandlers();
  }

  private setupEventHandlers() {
    this.cluster.on("connect", () => (this.stats.connected = true));
    this.cluster.on("ready", () => {});
    this.cluster.on("error", () => (this.stats.connected = false));
    this.cluster.on("node:connect", () => {});
    this.cluster.on("node:error", () => {});
  }

  // Basic cache operations
  async get(key: string): Promise<any> {
    try {
      const value = await this.cluster.get(key);
      if (value !== null) {
        this.stats.hits++;
        return JSON.parse(value);
      } else {
        this.stats.misses++;
        return null;
      }
    } catch (error) {
      this.stats.misses++;
      throw error;
    }
  }

  async set(key: string, value: any, ttl?: number): Promise<void> {
    try {
      const serializedValue = JSON.stringify(value);
      const finalTTL = ttl || this.defaultTTL;

      await this.cluster.pipeline().setex(key, finalTTL, serializedValue).exec();
      await this.updateStats();
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error("Cache set error:", error);
    }
  }

  async del(key: string): Promise<void> {
    try {
      await this.cluster.del(key);
      await this.updateStats();
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error("Cache del error:", error);
    }
  }

  async exists(key: string): Promise<boolean> {
    try {
      const result = await this.cluster.exists(key);
      return result === 1;
    } catch (error) {
      console.error("Cache exists error:", error);
      return false;
    }
  }

  // Advanced cache operations
  async mget(keys: string[]): Promise<Map<string, any>> {
    try {
      const values = await this.cluster.mget(...keys);
      const result = new Map<string, any>();

      keys.forEach((key, index) => {
        if (values[index] !== null) {
          result.set(key, JSON.parse(values[index]));
          this.stats.hits++;
        } else {
          this.stats.misses++;
        }
      });

      return result;
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error("Cache mget error:", error);
      return new Map();
    }
  }

  async mset(keyValuePairs: Map<string, any>, ttl?: number): Promise<void> {
    try {
      const pipeline = this.cluster.pipeline();
      const finalTTL = ttl || this.defaultTTL;

      for (const [key, value] of keyValuePairs) {
        const serializedValue = JSON.stringify(value);
        pipeline.setex(key, finalTTL, serializedValue);
      }

      await pipeline.exec();
      await this.updateStats();
    } catch (error) {
      console.error("Cache mset error:", error);
    }
  }

  // Pattern-based operations
  async keys(pattern: string): Promise<string[]> {
    try {
      const keys: string[] = [];

      // Scan all nodes in the cluster
      for (const node of this.cluster.nodes()) {
        let cursor = "0";
        do {
          const [newCursor, nodeKeys] = await node.scan(cursor, "MATCH", pattern, "COUNT", "100");
          cursor = newCursor;
          keys.push(...nodeKeys);
        } while (cursor !== "0");
      }

      return [...new Set(keys)]; // Remove duplicates
    } catch (error) {
      console.error("Cache keys error:", error);
      return [];
    }
  }

  async delPattern(pattern: string): Promise<number> {
    try {
      const keys = await this.keys(pattern);
      if (keys.length > 0) {
        await this.cluster.del(...keys);
        await this.updateStats();
        return keys.length;
      }
      return 0;
    } catch (error) {
      console.error("Cache delPattern error:", error);
      return 0;
    }
  }

  // Hash operations
  async hget(key: string, field: string): Promise<any> {
    try {
      const value = await this.cluster.hget(key, field);
      if (value !== null) {
        this.stats.hits++;
        return JSON.parse(value);
      } else {
        this.stats.misses++;
        return null;
      }
    } catch (error) {
      console.error("Cache hget error:", error);
      this.stats.misses++;
      return null;
    }
  }

  async hset(key: string, field: string, value: any, ttl?: number): Promise<void> {
    try {
      const serializedValue = JSON.stringify(value);
      const finalTTL = ttl || this.defaultTTL;

      await this.cluster.hset(key, field, serializedValue);
      await this.cluster.expire(key, finalTTL);
    } catch (error) {
      console.error("Cache hset error:", error);
    }
  }

  async hgetall(key: string): Promise<Map<string, any>> {
    try {
      const hash = await this.cluster.hgetall(key);
      const result = new Map<string, any>();

      for (const [field, value] of Object.entries(hash)) {
        result.set(field, JSON.parse(value as string));
      }

      return result;
    } catch (error) {
      console.error("Cache hgetall error:", error);
      return new Map();
    }
  }

  // List operations
  async lpush(key: string, value: any, ttl?: number): Promise<void> {
    try {
      const serializedValue = JSON.stringify(value);
      const finalTTL = ttl || this.defaultTTL;

      await this.cluster.lpush(key, serializedValue);
      await this.cluster.expire(key, finalTTL);
    } catch (error) {
      console.error("Cache lpush error:", error);
    }
  }

  async lrange(key: string, start: number, stop: number): Promise<any[]> {
    try {
      const values = await this.cluster.lrange(key, start, stop);
      return values.map((value: string) => JSON.parse(value));
    } catch (error) {
      console.error("Cache lrange error:", error);
      return [];
    }
  }

  // Set operations
  async sadd(key: string, value: any, ttl?: number): Promise<void> {
    try {
      const serializedValue = JSON.stringify(value);
      const finalTTL = ttl || this.defaultTTL;

      await this.cluster.sadd(key, serializedValue);
      await this.cluster.expire(key, finalTTL);
    } catch (error) {
      console.error("Cache sadd error:", error);
    }
  }

  async smembers(key: string): Promise<any[]> {
    try {
      const values = await this.cluster.smembers(key);
      return values.map((value: string) => JSON.parse(value));
    } catch (error) {
      console.error("Cache smembers error:", error);
      return [];
    }
  }

  // Cache invalidation strategies
  async invalidateByPattern(pattern: string): Promise<number> {
    return await this.delPattern(pattern);
  }

  async invalidateByTags(tags: string[]): Promise<number> {
    let totalDeleted = 0;

    for (const tag of tags) {
      const tagKey = `tag:${tag}`;
      const keys = await this.smembers(tagKey);

      if (keys.length > 0) {
        await this.cluster.del(...keys);
        await this.cluster.del(tagKey);
        totalDeleted += keys.length + 1;
      }
    }

    await this.updateStats();
    return totalDeleted;
  }

  async addTags(key: string, tags: string[]): Promise<void> {
    try {
      for (const tag of tags) {
        const tagKey = `tag:${tag}`;
        await this.sadd(tagKey, key);
      }
    } catch (error) {
      console.error("Cache addTags error:", error);
    }
  }

  // Cache warming
  async warmCache(data: Map<string, any>, ttl?: number): Promise<void> {
    try {
      await this.mset(data, ttl);
      console.log(`Warmed cache with ${data.size} items`);
    } catch (error) {
      console.error("Cache warming error:", error);
    }
  }

  // Cache statistics
  async getStats(): Promise<CacheStats> {
    await this.updateStats();
    return { ...this.stats };
  }

  private async updateStats(): Promise<void> {
    try {
      let totalKeys = 0;
      let totalMemory = 0;

      for (const node of this.cluster.nodes()) {
        const info = await node.info("memory");
        const keyspace = await node.info("keyspace");

        // Parse memory info
        const memoryMatch = info.match(/used_memory_human:(\d+)/);
        if (memoryMatch) {
          totalMemory += parseInt(memoryMatch[1]);
        }

        // Parse keyspace info
        const keysMatch = keyspace.match(/keys=(\d+)/);
        if (keysMatch) {
          totalKeys += parseInt(keysMatch[1]);
        }
      }

      this.stats.keys = totalKeys;
      this.stats.memory = totalMemory;
    } catch (error) {
      console.error("Error updating cache stats:", error);
    }
  }

  // Health check
  async healthCheck(): Promise<boolean> {
    try {
      await this.cluster.ping();
      return true;
    } catch (error) {
      console.error("Cache health check failed:", error);
      return false;
    }
  }

  // Graceful shutdown
  async disconnect(): Promise<void> {
    try {
      await this.cluster.disconnect();
      console.log("Redis cluster disconnected");
    } catch (error) {
      console.error("Error disconnecting from Redis cluster:", error);
    }
  }

  // Cache middleware for Express
  cacheMiddleware(ttl?: number) {
    return async (req: any, res: any, next: any) => {
      const key = `api:${req.method}:${req.originalUrl}`;

      try {
        const cachedResponse = await this.get(key);
        if (cachedResponse) {
          return res.json(cachedResponse);
        }

        // Store original send method
        const originalSend = res.json;

        // Override send method to cache response
        res.json = (data: any) => {
          this.set(key, data, ttl);
          return originalSend.call(res, data);
        };

        next();
      } catch (error) {
        // eslint-disable-next-line no-console
        console.error("Cache middleware error:", error);
        next();
      }
    };
  }
}

// Factory function to create cache instance
export function createDistributedCache(config: CacheConfig): DistributedCache {
  return new DistributedCache(config);
}

// Default cache instance
export const distributedCache = new DistributedCache({
  nodes: [
    process.env.REDIS_NODE_1 || "redis://localhost:7000",
    process.env.REDIS_NODE_2 || "redis://localhost:7001",
    process.env.REDIS_NODE_3 || "redis://localhost:7002",
  ],
  defaultTTL: 3600,
});

export default distributedCache;
