interface CacheItem<T> {
  data: T;
  expires: number;
  size: number;
  lastAccessed: number;
}

class CacheManager {
  private cache = new Map<string, CacheItem<any>>();
  private defaultTTL = 5 * 60 * 1000; // 5 minutes
  private maxSize = 50 * 1024 * 1024; // 50MB
  private currentSize = 0;
  private cleanupInterval: NodeJS.Timeout;

  constructor() {
    // Cleanup expired items every minute
    this.cleanupInterval = setInterval(() => this.cleanup(), 60000);
  }

  set<T>(key: string, data: T, ttl: number = this.defaultTTL): void {
    const size = this.calculateSize(data);
    const expires = Date.now() + ttl;

    // Remove old item if exists
    if (this.cache.has(key)) {
      this.currentSize -= this.cache.get(key)!.size;
    }

    // Check if we need to free space
    this.freeSpace(size);

    const item: CacheItem<T> = {
      data,
      expires,
      size,
      lastAccessed: Date.now()
    };

    this.cache.set(key, item);
    this.currentSize += size;
  }

  get<T>(key: string): T | null {
    const item = this.cache.get(key);
    if (!item || Date.now() > item.expires) {
      if (item) this.delete(key);
      return null;
    }

    // Update last accessed time
    item.lastAccessed = Date.now();
    return item.data;
  }

  delete(key: string): void {
    const item = this.cache.get(key);
    if (item) {
      this.currentSize -= item.size;
      this.cache.delete(key);
    }
  }

  clear(): void {
    this.cache.clear();
    this.currentSize = 0;
  }

  has(key: string): boolean {
    const item = this.cache.get(key);
    if (!item || Date.now() > item.expires) {
      if (item) this.delete(key);
      return false;
    }
    return true;
  }

  // Get cache statistics
  getStats() {
    return {
      size: this.currentSize,
      maxSize: this.maxSize,
      itemCount: this.cache.size,
      usage: (this.currentSize / this.maxSize * 100).toFixed(2) + '%'
    };
  }

  private calculateSize(data: any): number {
    return JSON.stringify(data).length * 2; // Rough estimate
  }

  private freeSpace(needed: number): void {
    if (this.currentSize + needed <= this.maxSize) return;

    // Sort by last accessed time (LRU)
    const sortedEntries = Array.from(this.cache.entries())
      .sort(([, a], [, b]) => a.lastAccessed - b.lastAccessed);

    for (const [key] of sortedEntries) {
      this.delete(key);
      if (this.currentSize + needed <= this.maxSize) break;
    }
  }

  private cleanup(): void {
    const now = Date.now();
    for (const [key, item] of this.cache.entries()) {
      if (now > item.expires) {
        this.delete(key);
      }
    }
  }

  destroy(): void {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
    }
    this.clear();
  }
}

export const apiCache = new CacheManager();

export const createCacheKey = (...parts: (string | number)[]): string => {
  return parts.join(':');
};