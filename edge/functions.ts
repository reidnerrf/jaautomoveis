import { Request, Response } from "express";
import sharp from "sharp";
import crypto from "crypto";

// Interface para configurações de edge functions
interface EdgeConfig {
  imageOptimization: {
    quality: number;
    formats: string[];
    maxWidth: number;
    maxHeight: number;
  };
  security: {
    rateLimit: number;
    botDetection: boolean;
    geoBlocking: boolean;
  };
  cache: {
    ttl: number;
    staleWhileRevalidate: number;
  };
}

// Configurações padrão
const EDGE_CONFIG: EdgeConfig = {
  imageOptimization: {
    quality: 80,
    formats: ["webp", "avif", "jpeg"],
    maxWidth: 1920,
    maxHeight: 1080,
  },
  security: {
    rateLimit: 100,
    botDetection: true,
    geoBlocking: false,
  },
  cache: {
    ttl: 3600,
    staleWhileRevalidate: 86400,
  },
};

// Cache de edge functions
const edgeCache = new Map<
  string,
  { data: unknown; timestamp: number; ttl: number }
>();

// Função para otimização de imagens no edge
export async function edgeImageOptimization(
  req: Request,
  res: Response,
  options: Partial<EdgeConfig["imageOptimization"]> = {},
): Promise<void> {
  try {
    const config = { ...EDGE_CONFIG.imageOptimization, ...options };
    const imageUrl = req.query.url as string;
    const width = parseInt(req.query.w as string) || config.maxWidth;
    const height = parseInt(req.query.h as string) || config.maxHeight;
    const format = (req.query.f as string) || "webp";
    const quality = parseInt(req.query.q as string) || config.quality;

    if (!imageUrl) {
      res.status(400).json({ error: "Image URL is required" });
      return;
    }

    // Verificar cache
    const cacheKey = `image:${imageUrl}:${width}:${height}:${format}:${quality}`;
    const cached = edgeCache.get(cacheKey);

    if (cached && Date.now() - cached.timestamp < cached.ttl * 1000) {
      res.set({
        "Content-Type": `image/${format}`,
        "Cache-Control": `public, max-age=${config.ttl}, stale-while-revalidate=${config.staleWhileRevalidate}`,
        "X-Edge-Cache": "HIT",
      });
      res.send(cached.data);
      return;
    }

    // Buscar imagem original
    const imageResponse = await fetch(imageUrl);
    if (!imageResponse.ok) {
      res.status(404).json({ error: "Image not found" });
      return;
    }

    const imageBuffer = await imageResponse.arrayBuffer();

    // Otimizar imagem
    let optimizedImage = sharp(Buffer.from(imageBuffer)).resize(width, height, {
      fit: "inside",
      withoutEnlargement: true,
    });

    // Aplicar formato
    switch (format) {
      case "webp":
        optimizedImage = optimizedImage.webp({ quality });
        break;
      case "avif":
        optimizedImage = optimizedImage.avif({ quality });
        break;
      case "jpeg":
        optimizedImage = optimizedImage.jpeg({ quality, progressive: true });
        break;
      default:
        optimizedImage = optimizedImage.webp({ quality });
    }

    const optimizedBuffer = await optimizedImage.toBuffer();

    // Armazenar no cache
    edgeCache.set(cacheKey, {
      data: optimizedBuffer,
      timestamp: Date.now(),
      ttl: config.ttl,
    });

    // Configurar headers
    res.set({
      "Content-Type": `image/${format}`,
      "Cache-Control": `public, max-age=${config.ttl}, stale-while-revalidate=${config.staleWhileRevalidate}`,
      "X-Edge-Cache": "MISS",
      "X-Image-Optimized": "true",
    });

    res.send(optimizedBuffer);
  } catch (error) {
    console.error("Edge image optimization error:", error);
    res.status(500).json({ error: "Image optimization failed" });
  }
}

// Função para rate limiting no edge
export function edgeRateLimiting(
  req: Request,
  res: Response,
  options: Partial<EdgeConfig["security"]> = {},
): boolean {
  const config = { ...EDGE_CONFIG.security, ...options };
  const clientIP = req.ip || req.connection.remoteAddress || "unknown";
  const userAgent = req.get("User-Agent") || "";

  // Gerar chave única para o cliente
  const clientKey = crypto
    .createHash("md5")
    .update(`${clientIP}:${userAgent}`)
    .digest("hex");

  // Verificar rate limit
  const now = Date.now();
  const windowMs = 60 * 1000; // 1 minuto
  const maxRequests = config.rateLimit;

  const clientRequests = getClientRequests(clientKey);
  const recentRequests = clientRequests.filter(
    (timestamp) => now - timestamp < windowMs,
  );

  if (recentRequests.length >= maxRequests) {
    res.status(429).json({ error: "Rate limit exceeded" });
    return false;
  }

  // Adicionar requisição atual
  recentRequests.push(now);
  setClientRequests(clientKey, recentRequests);

  return true;
}

// Função para detecção de bots
export function edgeBotDetection(req: Request): boolean {
  const userAgent = req.get("User-Agent") || "";

  // Lista de padrões de bots conhecidos
  const botPatterns = [
    /bot/i,
    /crawler/i,
    /spider/i,
    /scraper/i,
    /curl/i,
    /wget/i,
    /python/i,
    /java/i,
    /phantomjs/i,
    /headless/i,
  ];

  // Verificar padrões de bot
  const isBot = botPatterns.some((pattern) => pattern.test(userAgent));

  // Verificar comportamento suspeito
  const suspiciousBehavior = checkSuspiciousBehavior(req);

  return isBot || suspiciousBehavior;
}

// Função para geolocalização e personalização
export function edgeGeolocation(req: Request): {
  country: string;
  city: string;
  region: string;
  timezone: string;
  personalized: boolean;
} {
  // Simular geolocalização (em produção, usar serviço real)
  const geoData = {
    country: "BR",
    city: "São Paulo",
    region: "SP",
    timezone: "America/Sao_Paulo",
    personalized: false,
  };

  // Personalização baseada em localização
  if (geoData.country === "BR") {
    geoData.personalized = true;
  }

  return geoData;
}

// Função para cache inteligente no edge
export function edgeCacheMiddleware(
  req: Request,
  res: Response,
  options: Partial<EdgeConfig["cache"]> = {},
): boolean {
  const config = { ...EDGE_CONFIG.cache, ...options };
  const cacheKey = generateCacheKey(req);

  // Verificar cache
  const cached = edgeCache.get(cacheKey);
  if (cached && Date.now() - cached.timestamp < cached.ttl * 1000) {
    res.set({
      "X-Edge-Cache": "HIT",
      "Cache-Control": `public, max-age=${config.ttl}, stale-while-revalidate=${config.staleWhileRevalidate}`,
    });
    res.json(cached.data);
    return true;
  }

  return false;
}

// Função para A/B testing no edge
export function edgeABTesting(req: Request): {
  variant: string;
  experiment: string;
  userId: string;
} {
  const userAgent = req.get("User-Agent") || "";
  const ip = req.ip || req.connection.remoteAddress || "";

  // Gerar ID de usuário consistente
  const userId = crypto
    .createHash("md5")
    .update(`${ip}:${userAgent}`)
    .digest("hex");

  // Determinar variante baseada no ID do usuário
  const hash = parseInt(userId.substring(0, 8), 16);
  const variant = hash % 2 === 0 ? "A" : "B";

  return {
    variant,
    experiment: "performance_optimization",
    userId,
  };
}

// Função para analytics em tempo real no edge
export function edgeAnalytics(req: Request): void {
  const analytics = {
    timestamp: Date.now(),
    ip: req.ip || req.connection.remoteAddress || "unknown",
    userAgent: req.get("User-Agent") || "",
    path: req.path,
    method: req.method,
    referer: req.get("Referer") || "",
    geo: edgeGeolocation(req),
    abTest: edgeABTesting(req),
    isBot: edgeBotDetection(req),
  };

  // Enviar analytics para processamento (em produção, usar fila)
  console.log("Edge Analytics:", analytics);
}

// Função para compressão no edge
export function edgeCompression(req: Request, res: Response): void {
  const acceptEncoding = req.get("Accept-Encoding") || "";

  if (acceptEncoding.includes("br")) {
    res.set("Content-Encoding", "br");
  } else if (acceptEncoding.includes("gzip")) {
    res.set("Content-Encoding", "gzip");
  } else if (acceptEncoding.includes("deflate")) {
    res.set("Content-Encoding", "deflate");
  }
}

// Função para segurança no edge
export function edgeSecurity(req: Request, res: Response): boolean {
  // Verificar headers de segurança
  const securityHeaders = {
    "X-Content-Type-Options": "nosniff",
    "X-Frame-Options": "DENY",
    "X-XSS-Protection": "1; mode=block",
    "Referrer-Policy": "strict-origin-when-cross-origin",
    "Permissions-Policy": "geolocation=(), microphone=(), camera=()",
  };

  Object.entries(securityHeaders).forEach(([header, value]) => {
    res.set(header, value);
  });

  // Verificar se é um bot
  if (edgeBotDetection(req)) {
    res.set("X-Bot-Detected", "true");
  }

  return true;
}

// Funções auxiliares
function generateCacheKey(req: Request): string {
  const url = req.originalUrl || req.url;
  const query = JSON.stringify(req.query);
  const params = JSON.stringify(req.params);
  const userAgent = req.get("User-Agent") || "";

  return crypto
    .createHash("md5")
    .update(`${url}:${query}:${params}:${userAgent}`)
    .digest("hex");
}

function getClientRequests(_clientKey: string): number[] {
  // Em produção, usar Redis ou similar
  return [];
}

function setClientRequests(_clientKey: string, _requests: number[]): void {
  // Em produção, usar Redis ou similar
}

function checkSuspiciousBehavior(req: Request): boolean {
  const userAgent = req.get("User-Agent") || "";

  // Verificar padrões suspeitos
  const suspiciousPatterns = [
    /sqlmap/i,
    /nikto/i,
    /nmap/i,
    /masscan/i,
    /dirb/i,
  ];

  return suspiciousPatterns.some((pattern) => pattern.test(userAgent));
}

// Middleware principal de edge functions
export function edgeMiddleware(
  req: Request,
  res: Response,
  next: () => void,
  options: Partial<EdgeConfig> = {},
): void {
  const config = { ...EDGE_CONFIG, ...options };

  // Aplicar segurança
  edgeSecurity(req, res);

  // Verificar rate limiting
  if (!edgeRateLimiting(req, res, config.security)) {
    return;
  }

  // Aplicar compressão
  edgeCompression(req, res);

  // Coletar analytics
  edgeAnalytics(req);

  // Verificar cache para requisições GET
  if (req.method === "GET" && edgeCacheMiddleware(req, res, config.cache)) {
    return;
  }

  next();
}

// Função para limpeza de cache
export function cleanupEdgeCache(): void {
  const now = Date.now();

  for (const [key, value] of edgeCache.entries()) {
    if (now - value.timestamp > value.ttl * 1000) {
      edgeCache.delete(key);
    }
  }
}

// Limpeza automática a cada 5 minutos
setInterval(cleanupEdgeCache, 5 * 60 * 1000);
