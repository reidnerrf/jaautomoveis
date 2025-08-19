// Advanced runtime optimization utilities
import { useEffect, useRef, useState, useCallback } from "react";

interface RuntimeMetrics {
  memoryUsage: number;
  jsHeapSize: number;
  renderCount: number;
  interactionDelay: number;
  apiResponseTime: number;
}

interface OptimizationConfig {
  enableMemoryOptimization: boolean;
  enableRenderOptimization: boolean;
  enableNetworkOptimization: boolean;
  enableCacheOptimization: boolean;
}

class RuntimeOptimizer {
  private config: OptimizationConfig;
  private metrics: RuntimeMetrics;
  private observers: Set<() => void> = new Set();

  constructor(
    config: OptimizationConfig = {
      enableMemoryOptimization: true,
      enableRenderOptimization: true,
      enableNetworkOptimization: true,
      enableCacheOptimization: true,
    },
  ) {
    this.config = config;
    this.metrics = {
      memoryUsage: 0,
      jsHeapSize: 0,
      renderCount: 0,
      interactionDelay: 0,
      apiResponseTime: 0,
    };
    this.initialize();
  }

  private initialize() {
    if (typeof window !== "undefined") {
      this.setupMemoryMonitoring();
      this.setupRenderOptimization();
      this.setupNetworkOptimization();
      this.setupCacheOptimization();
    }
  }

  private setupMemoryMonitoring() {
    if (!this.config.enableMemoryOptimization || !("memory" in performance))
      return;

    const checkMemory = () => {
      const memory = (performance as any).memory;
      this.metrics.memoryUsage = memory.usedJSHeapSize;
      this.metrics.jsHeapSize = memory.totalJSHeapSize;

      // Detect memory leaks
      if (memory.usedJSHeapSize > 100 * 1024 * 1024) {
        // 100MB threshold
        this.triggerGarbageCollection();
        this.notifyObservers();
      }
    };

    setInterval(checkMemory, 5000);
  }

  private setupRenderOptimization() {
    if (!this.config.enableRenderOptimization) return;

    // Optimize requestAnimationFrame usage
    let rafId: number | null = null;
    const optimizedRaf = (callback: FrameRequestCallback) => {
      if (rafId !== null) {
        cancelAnimationFrame(rafId);
      }
      rafId = requestAnimationFrame(callback);
    };

    // Override native raf for optimization
    if (typeof window !== "undefined") {
      const originalRaf = window.requestAnimationFrame;
      window.requestAnimationFrame = optimizedRaf;
    }
  }

  private setupNetworkOptimization() {
    if (!this.config.enableNetworkOptimization) return;

    // Optimize fetch requests
    const originalFetch = window.fetch;
    window.fetch = async (...args) => {
      const startTime = performance.now();
      try {
        const response = await originalFetch(...args);
        const endTime = performance.now();
        this.metrics.apiResponseTime = endTime - startTime;

        // Implement request deduplication
        const url = typeof args[0] === "string" ? args[0] : args[0].url;
        this.deduplicateRequest(url, response.clone());

        return response;
      } catch (error) {
        console.error("Network request failed:", error);
        throw error;
      }
    };
  }

  private setupCacheOptimization() {
    if (!this.config.enableCacheOptimization || !("caches" in window)) return;

    // Implement intelligent cache invalidation
    this.setupCacheInvalidation();

    // Implement cache warming
    this.warmCache();
  }

  private async setupCacheInvalidation() {
    const invalidateCache = async () => {
      try {
        const cacheNames = await caches.keys();
        for (const cacheName of cacheNames) {
          const cache = await caches.open(cacheName);
          const keys = await cache.keys();

          for (const request of keys) {
            const response = await cache.match(request);
            if (response) {
              const timestamp = response.headers.get("x-cache-timestamp");
              if (timestamp && Date.now() - parseInt(timestamp) > 3600000) {
                // 1 hour
                await cache.delete(request);
              }
            }
          }
        }
      } catch (error) {
        console.error("Cache invalidation failed:", error);
      }
    };

    setInterval(invalidateCache, 300000); // Every 5 minutes
  }

  private async warmCache() {
    const criticalResources = [
      "/api/vehicles?limit=10",
      "/api/categories",
      "/api/vehicles/stats",
    ];

    try {
      const cache = await caches.open("runtime-cache");
      await Promise.all(
        criticalResources.map(async (url) => {
          try {
            const response = await fetch(url);
            if (response.ok) {
              await cache.put(url, response);
            }
          } catch (error) {
            console.warn("Failed to warm cache for:", url);
          }
        }),
      );
    } catch (error) {
      console.error("Cache warming failed:", error);
    }
  }

  private deduplicateRequest(url: string, response: Response) {
    // Implement request deduplication logic
    const cacheKey = `dedup_${url}`;
    sessionStorage.setItem(
      cacheKey,
      JSON.stringify({
        response: response.clone(),
        timestamp: Date.now(),
      }),
    );
  }

  private triggerGarbageCollection() {
    // Force garbage collection hints
    if (window.gc) {
      window.gc();
    }

    // Clear unused references
    this.clearUnusedReferences();
  }

  private clearUnusedReferences() {
    // Clear old event listeners
    this.observers.clear();

    // Clear session storage for deduplication
    const keys = Object.keys(sessionStorage);
    keys.forEach((key) => {
      if (key.startsWith("dedup_")) {
        const data = JSON.parse(sessionStorage.getItem(key) || "{}");
        if (Date.now() - data.timestamp > 300000) {
          // 5 minutes
          sessionStorage.removeItem(key);
        }
      }
    });
  }

  public getMetrics(): RuntimeMetrics {
    return { ...this.metrics };
  }

  public subscribe(callback: () => void) {
    this.observers.add(callback);
    return () => this.observers.delete(callback);
  }

  private notifyObservers() {
    this.observers.forEach((callback) => callback());
  }

  public async optimizeImages() {
    if (!("createImageBitmap" in window)) return;

    const images = document.querySelectorAll("img[data-src]");
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const img = entry.target as HTMLImageElement;
          const src = img.getAttribute("data-src");
          if (src) {
            this.loadOptimizedImage(img, src);
          }
        }
      });
    });

    images.forEach((img) => observer.observe(img));
  }

  private async loadOptimizedImage(img: HTMLImageElement, src: string) {
    try {
      const response = await fetch(src);
      const blob = await response.blob();

      // Create optimized version
      const bitmap = await createImageBitmap(blob);
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");

      if (ctx) {
        const maxWidth = 800;
        const scale = Math.min(maxWidth / bitmap.width, 1);
        canvas.width = bitmap.width * scale;
        canvas.height = bitmap.height * scale;

        ctx.drawImage(bitmap, 0, 0, canvas.width, canvas.height);

        const optimizedBlob = await new Promise<Blob>((resolve) => {
          canvas.toBlob(resolve, "image/webp", 0.8);
        });

        const optimizedUrl = URL.createObjectURL(optimizedBlob);
        img.src = optimizedUrl;
      }
    } catch (error) {
      console.error("Failed to optimize image:", error);
      img.src = src;
    }
  }

  public async prefetchCriticalResources() {
    const criticalResources = [
      "/api/vehicles?limit=20",
      "/api/categories",
      "/api/vehicles/stats",
      "/assets/logo.png",
    ];

    const link = document.createElement("link");
    link.rel = "prefetch";

    criticalResources.forEach((resource) => {
      const linkClone = link.cloneNode() as HTMLLinkElement;
      linkClone.href = resource;
      document.head.appendChild(linkClone);
    });
  }

  public measurePerformance() {
    return {
      memoryUsage: this.metrics.memoryUsage,
      jsHeapSize: this.metrics.jsHeapSize,
      apiResponseTime: this.metrics.apiResponseTime,
      interactionDelay: this.metrics.interactionDelay,
    };
  }
}

// React hooks for runtime optimization
export function useRuntimeOptimizer(config?: Partial<OptimizationConfig>) {
  const [metrics, setMetrics] = useState<RuntimeMetrics>({
    memoryUsage: 0,
    jsHeapSize: 0,
    renderCount: 0,
    interactionDelay: 0,
    apiResponseTime: 0,
  });

  const optimizerRef = useRef<RuntimeOptimizer | null>(null);

  useEffect(() => {
    if (typeof window !== "undefined") {
      optimizerRef.current = new RuntimeOptimizer({
        enableMemoryOptimization: true,
        enableRenderOptimization: true,
        enableNetworkOptimization: true,
        enableCacheOptimization: true,
        ...config,
      });

      const unsubscribe = optimizerRef.current.subscribe(() => {
        setMetrics(optimizerRef.current!.getMetrics());
      });

      return unsubscribe;
    }
  }, [config]);

  const optimizeImages = useCallback(() => {
    optimizerRef.current?.optimizeImages();
  }, []);

  const prefetchResources = useCallback(() => {
    optimizerRef.current?.prefetchCriticalResources();
  }, []);

  return {
    metrics,
    optimizeImages,
    prefetchResources,
    measurePerformance: () => optimizerRef.current?.measurePerformance(),
  };
}

export function useMemoryOptimization() {
  const [memoryUsage, setMemoryUsage] = useState(0);

  useEffect(() => {
    if (!("memory" in performance)) return;

    const interval = setInterval(() => {
      const memory = (performance as any).memory;
      setMemoryUsage(memory.usedJSHeapSize);

      if (memory.usedJSHeapSize > 100 * 1024 * 1024) {
        console.warn("High memory usage detected:", memory.usedJSHeapSize);
      }
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  return { memoryUsage };
}

export function useNetworkOptimization() {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [connection, setConnection] = useState(navigator.connection);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    const handleConnectionChange = () => setConnection(navigator.connection);

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    if ("connection" in navigator) {
      navigator.connection.addEventListener("change", handleConnectionChange);
    }

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);

      if ("connection" in navigator) {
        navigator.connection.removeEventListener(
          "change",
          handleConnectionChange,
        );
      }
    };
  }, []);

  const shouldUseLowBandwidth = () => {
    if (!connection) return false;
    return connection.effectiveType === "2g" || connection.saveData === true;
  };

  return {
    isOnline,
    connection,
    shouldUseLowBandwidth,
  };
}

// Global runtime optimizer instance
let globalOptimizer: RuntimeOptimizer | null = null;

export function getRuntimeOptimizer() {
  if (!globalOptimizer && typeof window !== "undefined") {
    globalOptimizer = new RuntimeOptimizer();
  }
  return globalOptimizer;
}
