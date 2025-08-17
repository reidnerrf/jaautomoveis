// Edge Functions para Vercel/Cloudflare Workers
// Otimização de performance e redução de latência

export interface EdgeContext {
  request: Request;
  env: any;
  ctx: any;
}

// Função para otimização de imagens no edge
export async function optimizeImage(context: EdgeContext): Promise<Response> {
  const { request } = context;
  const url = new URL(request.url);
  const imageUrl = url.searchParams.get('url');
  const width = parseInt(url.searchParams.get('w') || '800');
  const quality = parseInt(url.searchParams.get('q') || '80');
  const format = url.searchParams.get('f') || 'webp';

  if (!imageUrl) {
    return new Response('Missing image URL', { status: 400 });
  }

  try {
    // Fetch original image
    const imageResponse = await fetch(imageUrl);
    const imageBuffer = await imageResponse.arrayBuffer();

    // Use Sharp-like processing (simplified for edge)
    const optimizedImage = await processImage(imageBuffer, {
      width,
      quality,
      format
    });

    return new Response(optimizedImage, {
      headers: {
        'Content-Type': `image/${format}`,
        'Cache-Control': 'public, max-age=31536000',
        'CDN-Cache-Control': 'public, max-age=31536000'
      }
    });
  } catch (error) {
    return new Response('Image processing failed', { status: 500 });
  }
}

// Função para cache inteligente no edge
export async function edgeCache(context: EdgeContext): Promise<Response> {
  const { request } = context;
  const cacheKey = generateCacheKey(request);
  
  // Check edge cache first
  const cachedResponse = await caches.default.match(cacheKey);
  if (cachedResponse) {
    return cachedResponse;
  }

  // Fetch from origin
  const response = await fetch(request);
  
  // Cache successful responses
  if (response.ok) {
    const cacheResponse = response.clone();
    const cache = await caches.default;
    await cache.put(cacheKey, cacheResponse);
  }

  return response;
}

// Função para A/B testing no edge
export async function abTesting(context: EdgeContext): Promise<Response> {
  const { request } = context;
  const url = new URL(request.url);
  
  // Determine variant based on user
  const userId = getUserId(request);
  const variant = getVariant(userId, url.pathname);
  
  // Modify response based on variant
  const response = await fetch(request);
  const html = await response.text();
  
  const modifiedHtml = injectVariant(html, variant);
  
  return new Response(modifiedHtml, {
    headers: {
      'Content-Type': 'text/html',
      'X-AB-Variant': variant
    }
  });
}

// Função para geolocalização e personalização
export async function geoPersonalization(context: EdgeContext): Promise<Response> {
  const { request } = context;
  const country = request.headers.get('CF-IPCountry') || 'BR';
  const city = request.headers.get('CF-IPCITY') || 'São Paulo';
  
  // Personalizar conteúdo baseado na localização
  const personalizedContent = await getPersonalizedContent(country, city);
  
  const response = await fetch(request);
  const html = await response.text();
  
  const modifiedHtml = injectPersonalizedContent(html, personalizedContent);
  
  return new Response(modifiedHtml, {
    headers: {
      'Content-Type': 'text/html',
      'X-Geo-Country': country,
      'X-Geo-City': city
    }
  });
}

// Função para rate limiting no edge
export async function edgeRateLimit(context: EdgeContext): Promise<Response> {
  const { request } = context;
  const clientIP = request.headers.get('CF-Connecting-IP') || 'unknown';
  const endpoint = new URL(request.url).pathname;
  
  const key = `rate_limit:${clientIP}:${endpoint}`;
  const limit = getRateLimit(endpoint);
  
  // Check current usage
  const currentUsage = await getCurrentUsage(key);
  
  if (currentUsage >= limit) {
    return new Response('Rate limit exceeded', {
      status: 429,
      headers: {
        'Retry-After': '60',
        'X-RateLimit-Limit': limit.toString(),
        'X-RateLimit-Remaining': '0'
      }
    });
  }
  
  // Increment usage
  await incrementUsage(key);
  
  // Continue with request
  return fetch(request);
}

// Função para bot detection e security
export async function botDetection(context: EdgeContext): Promise<Response> {
  const { request } = context;
  const userAgent = request.headers.get('User-Agent') || '';
  const clientIP = request.headers.get('CF-Connecting-IP') || '';
  
  // Detect bots and malicious traffic
  if (isBot(userAgent) || isMalicious(clientIP)) {
    return new Response('Access denied', { status: 403 });
  }
  
  // Add security headers
  const response = await fetch(request);
  const newResponse = new Response(response.body, response);
  
  newResponse.headers.set('X-Content-Type-Options', 'nosniff');
  newResponse.headers.set('X-Frame-Options', 'DENY');
  newResponse.headers.set('X-XSS-Protection', '1; mode=block');
  newResponse.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  
  return newResponse;
}

// Função para analytics em tempo real
export async function realTimeAnalytics(context: EdgeContext): Promise<Response> {
  const { request } = context;
  const url = new URL(request.url);
  
  // Collect analytics data
  const analyticsData = {
    timestamp: Date.now(),
    url: url.pathname,
    userAgent: request.headers.get('User-Agent'),
    referer: request.headers.get('Referer'),
    ip: request.headers.get('CF-Connecting-IP'),
    country: request.headers.get('CF-IPCountry'),
    device: getDeviceType(request.headers.get('User-Agent')),
    performance: await getPerformanceMetrics(request)
  };
  
  // Send to analytics service
  await sendAnalytics(analyticsData);
  
  // Continue with request
  return fetch(request);
}

// Função para SEO optimization no edge
export async function seoOptimization(context: EdgeContext): Promise<Response> {
  const { request } = context;
  const url = new URL(request.url);
  
  // Check if it's a crawler
  const userAgent = request.headers.get('User-Agent') || '';
  const isCrawler = isSearchEngineBot(userAgent);
  
  if (isCrawler) {
    // Optimize for crawlers
    const response = await fetch(request);
    const html = await response.text();
    
    const optimizedHtml = await optimizeForSEO(html, url.pathname);
    
    return new Response(optimizedHtml, {
      headers: {
        'Content-Type': 'text/html',
        'X-SEO-Optimized': 'true'
      }
    });
  }
  
  return fetch(request);
}

// Utility functions
function generateCacheKey(request: Request): string {
  const url = new URL(request.url);
  return `${request.method}:${url.pathname}:${url.search}`;
}

function getUserId(request: Request): string {
  // Extract user ID from cookies or headers
  const cookies = request.headers.get('Cookie') || '';
  const match = cookies.match(/userId=([^;]+)/);
  return match ? match[1] : 'anonymous';
}

function getVariant(userId: string, pathname: string): string {
  // Simple hash-based variant assignment
  const hash = simpleHash(userId + pathname);
  return hash % 2 === 0 ? 'A' : 'B';
}

function simpleHash(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32-bit integer
  }
  return Math.abs(hash);
}

function isBot(userAgent: string): boolean {
  const botPatterns = [
    /bot/i, /crawler/i, /spider/i, /scraper/i,
    /googlebot/i, /bingbot/i, /slurp/i, /duckduckbot/i
  ];
  
  return botPatterns.some(pattern => pattern.test(userAgent));
}

function isMalicious(ip: string): boolean {
  // Implement IP reputation check
  // This would typically call an external service
  return false;
}

function getDeviceType(userAgent: string): string {
  if (/mobile/i.test(userAgent)) return 'mobile';
  if (/tablet/i.test(userAgent)) return 'tablet';
  return 'desktop';
}

function isSearchEngineBot(userAgent: string): boolean {
  const searchEngines = [
    /googlebot/i, /bingbot/i, /slurp/i, /duckduckbot/i,
    /baiduspider/i, /yandexbot/i
  ];
  
  return searchEngines.some(pattern => pattern.test(userAgent));
}

// Placeholder functions (would be implemented based on specific needs)
async function processImage(buffer: ArrayBuffer, options: any): Promise<ArrayBuffer> {
  // Implement image processing logic
  return buffer;
}

async function getPersonalizedContent(country: string, city: string): Promise<any> {
  // Implement personalization logic
  return {};
}

async function getRateLimit(endpoint: string): Promise<number> {
  // Implement rate limiting logic
  return 100;
}

async function getCurrentUsage(key: string): Promise<number> {
  // Implement usage tracking
  return 0;
}

async function incrementUsage(key: string): Promise<void> {
  // Implement usage increment
}

async function sendAnalytics(data: any): Promise<void> {
  // Implement analytics sending
}

async function optimizeForSEO(html: string, pathname: string): Promise<string> {
  // Implement SEO optimization
  return html;
}

function injectVariant(html: string, variant: string): string {
  // Inject A/B test variant
  return html.replace('</head>', `<script>window.AB_VARIANT='${variant}';</script></head>`);
}

function injectPersonalizedContent(html: string, content: any): string {
  // Inject personalized content
  return html;
}

async function getPerformanceMetrics(request: Request): Promise<any> {
  // Collect performance metrics
  return {};
}

export default {
  optimizeImage,
  edgeCache,
  abTesting,
  geoPersonalization,
  edgeRateLimit,
  botDetection,
  realTimeAnalytics,
  seoOptimization
};