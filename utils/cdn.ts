import { useState, useEffect, useCallback } from "react";

// Sistema de CDN Global para otimização de performance

// Interface para configuração de CDN
interface CDNConfig {
  provider: "cloudflare" | "aws" | "azure" | "google" | "custom";
  domain: string;
  apiKey?: string;
  zoneId?: string;
  region?: string;
  ssl: boolean;
  compression: boolean;
  cacheHeaders: Record<string, string>;
  fallback?: string;
}

// Interface para resultado de otimização
interface CDNOptimizationResult {
  originalUrl: string;
  optimizedUrl: string;
  provider: string;
  compression: number;
  sizeReduction: number;
  loadTime: number;
  cacheHit: boolean;
}

// Interface para métricas de CDN
interface CDNMetrics {
  requests: number;
  bandwidth: number;
  cacheHitRate: number;
  responseTime: number;
  errors: number;
  uptime: number;
}

// Configurações de CDN por ambiente
const CDN_CONFIGS: Record<string, CDNConfig> = {
  production: {
    provider: "cloudflare",
    domain: "cdn.jaautomoveis.com",
    apiKey: process.env.CLOUDFLARE_API_KEY,
    zoneId: process.env.CLOUDFLARE_ZONE_ID,
    ssl: true,
    compression: true,
    cacheHeaders: {
      "Cache-Control": "public, max-age=31536000, immutable",
      "CDN-Cache-Control": "public, max-age=31536000",
      "Cloudflare-CDN-Cache-Control": "public, max-age=31536000",
    },
  },
  staging: {
    provider: "aws",
    domain: "cdn-staging.jaautomoveis.com",
    region: "us-east-1",
    ssl: true,
    compression: true,
    cacheHeaders: {
      "Cache-Control": "public, max-age=86400",
      "CDN-Cache-Control": "public, max-age=86400",
    },
  },
  development: {
    provider: "custom",
    domain: "localhost:3000",
    ssl: false,
    compression: false,
    cacheHeaders: {
      "Cache-Control": "no-cache",
    },
  },
};

// Cache de URLs otimizadas
const cdnCache = new Map<string, CDNOptimizationResult>();

// Métricas de CDN
const cdnMetrics: CDNMetrics = {
  requests: 0,
  bandwidth: 0,
  cacheHitRate: 0,
  responseTime: 0,
  errors: 0,
  uptime: 100,
};

class CDNManager {
  private config: CDNConfig;
  private providers: Map<string, CDNProvider>;
  private isInitialized = false;

  constructor(environment: string = "production") {
    this.config = CDN_CONFIGS[environment] || CDN_CONFIGS.production;
    this.providers = new Map();
    this.initializeProviders();
  }

  // Inicializar provedores de CDN
  private initializeProviders(): void {
    // Cloudflare
    this.providers.set("cloudflare", new CloudflareProvider(this.config));

    // AWS CloudFront
    this.providers.set("aws", new AWSProvider(this.config));

    // Azure CDN
    this.providers.set("azure", new AzureProvider(this.config));

    // Google Cloud CDN
    this.providers.set("google", new GoogleProvider(this.config));

    // Custom/Development
    this.providers.set("custom", new CustomProvider(this.config));
  }

  // Otimizar URL para CDN
  public optimizeUrl(
    originalUrl: string,
    options: {
      format?: "webp" | "avif" | "jpeg" | "png";
      width?: number;
      height?: number;
      quality?: number;
      compression?: boolean;
      cache?: boolean;
    } = {}
  ): string {
    // Verificar cache
    const cacheKey = this.generateCacheKey(originalUrl, options);
    if (options.cache !== false && cdnCache.has(cacheKey)) {
      const cached = cdnCache.get(cacheKey)!;
      cdnMetrics.requests++;
      cdnMetrics.cacheHitRate = (cdnMetrics.cacheHitRate + 1) / 2;
      return cached.optimizedUrl;
    }

    const provider = this.providers.get(this.config.provider);
    if (!provider) {
      console.warn(`CDN provider ${this.config.provider} not available`);
      return originalUrl;
    }

    const optimizedUrl = provider.optimizeUrl(originalUrl, options);

    // Armazenar no cache
    if (options.cache !== false) {
      cdnCache.set(cacheKey, {
        originalUrl,
        optimizedUrl,
        provider: this.config.provider,
        compression: options.compression ? 0.7 : 1,
        sizeReduction: 0.3,
        loadTime: 0,
        cacheHit: false,
      });
    }

    cdnMetrics.requests++;
    return optimizedUrl;
  }

  // Otimizar múltiplas URLs
  public optimizeUrls(urls: string[], options: any = {}): string[] {
    return urls.map((url) => this.optimizeUrl(url, options));
  }

  // Otimizar imagem com transformações
  public optimizeImage(
    imageUrl: string,
    transformations: {
      width?: number;
      height?: number;
      format?: "webp" | "avif" | "jpeg" | "png";
      quality?: number;
      fit?: "cover" | "contain" | "fill" | "inside" | "outside";
      crop?: "top" | "bottom" | "left" | "right" | "center";
      blur?: number;
      sharpen?: number;
      grayscale?: boolean;
      sepia?: boolean;
    } = {}
  ): string {
    const provider = this.providers.get(this.config.provider);
    if (!provider) {
      return imageUrl;
    }

    return provider.optimizeImage(imageUrl, transformations);
  }

  // Invalidar cache
  public async invalidateCache(urls: string[]): Promise<void> {
    const provider = this.providers.get(this.config.provider);
    if (provider && provider.invalidateCache) {
      await provider.invalidateCache(urls);
    }

    // Limpar cache local
    urls.forEach((url) => {
      for (const [key, value] of cdnCache.entries()) {
        if (value.originalUrl === url) {
          cdnCache.delete(key);
        }
      }
    });
  }

  // Pré-carregar recursos
  public async preloadResources(urls: string[]): Promise<void> {
    const provider = this.providers.get(this.config.provider);
    if (provider && provider.preloadResources) {
      await provider.preloadResources(urls);
    }
  }

  // Obter métricas
  public getMetrics(): CDNMetrics {
    return { ...cdnMetrics };
  }

  // Health check
  public async healthCheck(): Promise<{
    status: string;
    providers: Record<string, boolean>;
  }> {
    const providerStatus: Record<string, boolean> = {};

    for (const [name, provider] of this.providers) {
      try {
        const isHealthy = await provider.healthCheck();
        providerStatus[name] = isHealthy;
      } catch (error) {
        providerStatus[name] = false;
      }
    }

    const allHealthy = Object.values(providerStatus).some((status) => status);

    return {
      status: allHealthy ? "healthy" : "degraded",
      providers: providerStatus,
    };
  }

  // Gerar chave de cache
  private generateCacheKey(url: string, options: any): string {
    const optionsStr = JSON.stringify(options);
    return `${url}:${optionsStr}`;
  }
}

// Interface base para provedores de CDN
interface CDNProvider {
  optimizeUrl(url: string, options: any): string;
  optimizeImage?(url: string, transformations: any): string;
  invalidateCache?(urls: string[]): Promise<void>;
  preloadResources?(urls: string[]): Promise<void>;
  healthCheck(): Promise<boolean>;
}

// Provedor Cloudflare
class CloudflareProvider implements CDNProvider {
  private config: CDNConfig;

  constructor(config: CDNConfig) {
    this.config = config;
  }

  optimizeUrl(url: string, options: any = {}): string {
    if (!url.startsWith("http")) {
      return url;
    }

    const urlObj = new URL(url);
    const cdnUrl = new URL(urlObj.pathname + urlObj.search, `https://${this.config.domain}`);

    // Adicionar parâmetros de otimização
    if (options.format) {
      cdnUrl.searchParams.set("format", options.format);
    }
    if (options.width) {
      cdnUrl.searchParams.set("width", options.width.toString());
    }
    if (options.height) {
      cdnUrl.searchParams.set("height", options.height.toString());
    }
    if (options.quality) {
      cdnUrl.searchParams.set("quality", options.quality.toString());
    }
    if (options.compression) {
      cdnUrl.searchParams.set("compression", "true");
    }

    return cdnUrl.toString();
  }

  optimizeImage(url: string, transformations: any = {}): string {
    const cdnUrl = this.optimizeUrl(url);
    const urlObj = new URL(cdnUrl);

    // Adicionar transformações de imagem
    if (transformations.width) {
      urlObj.searchParams.set("w", transformations.width.toString());
    }
    if (transformations.height) {
      urlObj.searchParams.set("h", transformations.height.toString());
    }
    if (transformations.format) {
      urlObj.searchParams.set("f", transformations.format);
    }
    if (transformations.quality) {
      urlObj.searchParams.set("q", transformations.quality.toString());
    }
    if (transformations.fit) {
      urlObj.searchParams.set("fit", transformations.fit);
    }
    if (transformations.crop) {
      urlObj.searchParams.set("crop", transformations.crop);
    }
    if (transformations.blur) {
      urlObj.searchParams.set("blur", transformations.blur.toString());
    }
    if (transformations.sharpen) {
      urlObj.searchParams.set("sharpen", transformations.sharpen.toString());
    }
    if (transformations.grayscale) {
      urlObj.searchParams.set("grayscale", "true");
    }
    if (transformations.sepia) {
      urlObj.searchParams.set("sepia", "true");
    }

    return urlObj.toString();
  }

  async invalidateCache(urls: string[]): Promise<void> {
    if (!this.config.apiKey || !this.config.zoneId) {
      console.warn("Cloudflare API credentials not configured");
      return;
    }

    try {
      const response = await fetch(
        `https://api.cloudflare.com/client/v4/zones/${this.config.zoneId}/purge_cache`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${this.config.apiKey}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            files: urls,
          }),
        }
      );

      if (!response.ok) {
        throw new Error(`Failed to invalidate cache: ${response.statusText}`);
      }
    } catch (error) {
      console.error("Cache invalidation failed:", error);
      throw error;
    }
  }

  async preloadResources(urls: string[]): Promise<void> {
    // Cloudflare não tem API específica para preload, mas pode usar headers
    console.log("Preloading resources:", urls);
  }

  async healthCheck(): Promise<boolean> {
    try {
      const response = await fetch(`https://${this.config.domain}/cdn-cgi/trace`);
      return response.ok;
    } catch (error) {
      return false;
    }
  }
}

// Provedor AWS CloudFront
class AWSProvider implements CDNProvider {
  private config: CDNConfig;

  constructor(config: CDNConfig) {
    this.config = config;
  }

  optimizeUrl(url: string, options: any = {}): string {
    if (!url.startsWith("http")) {
      return url;
    }

    const urlObj = new URL(url);
    const cdnUrl = new URL(urlObj.pathname + urlObj.search, `https://${this.config.domain}`);

    // Adicionar parâmetros de otimização
    if (options.format) {
      cdnUrl.searchParams.set("fmt", options.format);
    }
    if (options.width) {
      cdnUrl.searchParams.set("w", options.width.toString());
    }
    if (options.height) {
      cdnUrl.searchParams.set("h", options.height.toString());
    }
    if (options.quality) {
      cdnUrl.searchParams.set("q", options.quality.toString());
    }

    return cdnUrl.toString();
  }

  async healthCheck(): Promise<boolean> {
    try {
      const response = await fetch(`https://${this.config.domain}/health`);
      return response.ok;
    } catch (error) {
      return false;
    }
  }
}

// Provedor Azure CDN
class AzureProvider implements CDNProvider {
  private config: CDNConfig;

  constructor(config: CDNConfig) {
    this.config = config;
  }

  optimizeUrl(url: string, options: any = {}): string {
    if (!url.startsWith("http")) {
      return url;
    }

    const urlObj = new URL(url);
    const cdnUrl = new URL(urlObj.pathname + urlObj.search, `https://${this.config.domain}`);

    // Adicionar parâmetros de otimização
    if (options.format) {
      cdnUrl.searchParams.set("format", options.format);
    }
    if (options.width) {
      cdnUrl.searchParams.set("width", options.width.toString());
    }
    if (options.height) {
      cdnUrl.searchParams.set("height", options.height.toString());
    }

    return cdnUrl.toString();
  }

  async healthCheck(): Promise<boolean> {
    try {
      const response = await fetch(`https://${this.config.domain}/health`);
      return response.ok;
    } catch (error) {
      return false;
    }
  }
}

// Provedor Google Cloud CDN
class GoogleProvider implements CDNProvider {
  private config: CDNConfig;

  constructor(config: CDNConfig) {
    this.config = config;
  }

  optimizeUrl(url: string, options: any = {}): string {
    if (!url.startsWith("http")) {
      return url;
    }

    const urlObj = new URL(url);
    const cdnUrl = new URL(urlObj.pathname + urlObj.search, `https://${this.config.domain}`);

    // Adicionar parâmetros de otimização
    if (options.format) {
      cdnUrl.searchParams.set("fmt", options.format);
    }
    if (options.width) {
      cdnUrl.searchParams.set("w", options.width.toString());
    }
    if (options.height) {
      cdnUrl.searchParams.set("h", options.height.toString());
    }

    return cdnUrl.toString();
  }

  async healthCheck(): Promise<boolean> {
    try {
      const response = await fetch(`https://${this.config.domain}/health`);
      return response.ok;
    } catch (error) {
      return false;
    }
  }
}

// Provedor Custom/Development
class CustomProvider implements CDNProvider {
  private config: CDNConfig;

  constructor(config: CDNConfig) {
    this.config = config;
  }

  optimizeUrl(url: string, options: any = {}): string {
    // Em desenvolvimento, retornar URL original
    return url;
  }

  async healthCheck(): Promise<boolean> {
    try {
      const response = await fetch(`http://${this.config.domain}/health`);
      return response.ok;
    } catch (error) {
      return false;
    }
  }
}

// Funções utilitárias para CDN

// Otimizar URL simples
export function optimizeUrl(url: string, options: any = {}): string {
  const cdnManager = new CDNManager();
  return cdnManager.optimizeUrl(url, options);
}

// Otimizar imagem
export function optimizeImage(url: string, transformations: any = {}): string {
  const cdnManager = new CDNManager();
  return cdnManager.optimizeImage(url, transformations);
}

// Otimizar múltiplas URLs
export function optimizeUrls(urls: string[], options: any = {}): string[] {
  const cdnManager = new CDNManager();
  return cdnManager.optimizeUrls(urls, options);
}

// Invalidar cache
export async function invalidateCache(urls: string[]): Promise<void> {
  const cdnManager = new CDNManager();
  await cdnManager.invalidateCache(urls);
}

// Pré-carregar recursos
export async function preloadResources(urls: string[]): Promise<void> {
  const cdnManager = new CDNManager();
  await cdnManager.preloadResources(urls);
}

// Obter métricas
export function getCDNMetrics(): CDNMetrics {
  const cdnManager = new CDNManager();
  return cdnManager.getMetrics();
}

// Health check
export async function cdnHealthCheck(): Promise<{
  status: string;
  providers: Record<string, boolean>;
}> {
  const cdnManager = new CDNManager();
  return cdnManager.healthCheck();
}

// Hook React para CDN
export function useCDN() {
  const [metrics, setMetrics] = useState<CDNMetrics>(getCDNMetrics());
  const [health, setHealth] = useState<{
    status: string;
    providers: Record<string, boolean>;
  } | null>(null);

  useEffect(() => {
    const interval = setInterval(() => {
      setMetrics(getCDNMetrics());
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  const checkHealth = useCallback(async () => {
    const healthStatus = await cdnHealthCheck();
    setHealth(healthStatus);
  }, []);

  useEffect(() => {
    checkHealth();
  }, [checkHealth]);

  return {
    optimizeUrl,
    optimizeImage,
    optimizeUrls,
    invalidateCache,
    preloadResources,
    metrics,
    health,
    checkHealth,
  };
}

// Instância singleton
export const cdnManager = new CDNManager();

export default cdnManager;
