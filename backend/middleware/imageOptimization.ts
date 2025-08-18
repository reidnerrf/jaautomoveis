import sharp from 'sharp';
import { Request, Response, NextFunction } from 'express';
import path from 'path';
import fs from 'fs/promises';
import crypto from 'crypto';

// Extend Multer File interface to include custom properties
declare module 'multer' {
  interface File {
    optimized?: boolean;
    originalSize?: number;
    optimizedSize?: number;
    thumbnailPath?: string;
  }
}

// Configurações de otimização
const IMAGE_CONFIG = {
  QUALITY: 80,
  WEBP_QUALITY: 85,
  AVIF_QUALITY: 80,
  MAX_WIDTH: 1920,
  MAX_HEIGHT: 1080,
  THUMBNAIL_WIDTH: 300,
  THUMBNAIL_HEIGHT: 200,
  CACHE_DIR: 'uploads/cache',
  SUPPORTED_FORMATS: ['jpeg', 'jpg', 'png', 'webp', 'avif'],
  COMPRESSION_LEVELS: {
    low: { quality: 60, effort: 2 },
    medium: { quality: 80, effort: 4 },
    high: { quality: 90, effort: 6 }
  }
};

// Interface para opções de otimização
interface OptimizationOptions {
  width?: number;
  height?: number;
  quality?: number;
  format?: 'jpeg' | 'png' | 'webp' | 'avif';
  compression?: 'low' | 'medium' | 'high';
  blur?: number;
  sharpen?: boolean;
  grayscale?: boolean;
  rotate?: number;
  flip?: boolean;
  flop?: boolean;
}

// Cache de imagens otimizadas
const imageCache = new Map<string, string>();

// Função para gerar hash da imagem
function generateImageHash(buffer: Buffer, options: OptimizationOptions): string {
  const data = buffer.toString('base64') + JSON.stringify(options);
  return crypto.createHash('md5').update(data).digest('hex');
}

// Função para verificar se o navegador suporta formatos modernos
function getSupportedFormats(req: Request): string[] {
  const accept = req.headers.accept || '';
  const userAgent = req.headers['user-agent'] || '';
  
  const formats = ['jpeg'];
  
  if (accept.includes('image/webp') || userAgent.includes('Chrome')) {
    formats.push('webp');
  }
  
  if (accept.includes('image/avif') || userAgent.includes('Chrome/85')) {
    formats.push('avif');
  }
  
  return formats;
}

// Função para otimizar imagem
async function optimizeImage(
  buffer: Buffer,
  options: OptimizationOptions = {},
  supportedFormats: string[] = ['jpeg']
): Promise<{ buffer: Buffer; format: string; size: number }> {
  let pipeline = sharp(buffer);
  
  // Redimensionamento
  if (options.width || options.height) {
    pipeline = pipeline.resize(options.width, options.height, {
      fit: 'inside',
      withoutEnlargement: true
    });
  }
  
  // Rotação
  if (options.rotate) {
    pipeline = pipeline.rotate(options.rotate);
  }
  
  // Flip/Flop
  if (options.flip) {
    pipeline = pipeline.flip();
  }
  
  if (options.flop) {
    pipeline = pipeline.flop();
  }
  
  // Filtros
  if (options.blur) {
    pipeline = pipeline.blur(options.blur);
  }
  
  if (options.sharpen) {
    pipeline = pipeline.sharpen();
  }
  
  if (options.grayscale) {
    pipeline = pipeline.grayscale();
  }
  
  // Determinar melhor formato
  const format = options.format || getBestFormat(supportedFormats);
  const quality = options.quality || IMAGE_CONFIG.QUALITY;
  
  // Aplicar otimizações específicas do formato
  switch (format) {
    case 'webp':
      pipeline = pipeline.webp({ 
        quality,
        effort: IMAGE_CONFIG.COMPRESSION_LEVELS[options.compression || 'medium'].effort
      });
      break;
    case 'avif':
      pipeline = pipeline.avif({ 
        quality: IMAGE_CONFIG.AVIF_QUALITY,
        effort: IMAGE_CONFIG.COMPRESSION_LEVELS[options.compression || 'medium'].effort
      });
      break;
    case 'png':
      pipeline = pipeline.png({ 
          compressionLevel: IMAGE_CONFIG.COMPRESSION_LEVELS[options.compression || 'medium'].effort
        });
      break;
    default:
      pipeline = pipeline.jpeg({ 
        quality,
        mozjpeg: true,
        progressive: true
      });
  }
  
  const optimizedBuffer = await pipeline.toBuffer();
  
  return {
    buffer: optimizedBuffer,
    format,
    size: optimizedBuffer.length
  };
}

// Função para determinar melhor formato
function getBestFormat(supportedFormats: string[]): string {
  if (supportedFormats.includes('avif')) return 'avif';
  if (supportedFormats.includes('webp')) return 'webp';
  return 'jpeg';
}

// Função para criar thumbnail
async function createThumbnail(buffer: Buffer): Promise<Buffer> {
  return sharp(buffer)
    .resize(IMAGE_CONFIG.THUMBNAIL_WIDTH, IMAGE_CONFIG.THUMBNAIL_HEIGHT, {
      fit: 'cover',
      position: 'center'
    })
    .jpeg({ quality: 70, progressive: true })
    .toBuffer();
}

// Função para salvar imagem otimizada
async function saveOptimizedImage(
  originalPath: string,
  optimizedBuffer: Buffer,
  format: string,
  options: OptimizationOptions
): Promise<string> {
  const hash = generateImageHash(await fs.readFile(originalPath), options);
  const filename = `${hash}.${format}`;
  const cachePath = path.join(IMAGE_CONFIG.CACHE_DIR, filename);
  
  // Criar diretório de cache se não existir
  await fs.mkdir(IMAGE_CONFIG.CACHE_DIR, { recursive: true });
  
  // Salvar imagem otimizada
  await fs.writeFile(cachePath, optimizedBuffer);
  
  return cachePath;
}

// Middleware principal de otimização de imagens
export async function vehicleImageOptimization(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    // Verificar se é uma requisição de imagem
    if (!req.file && !req.path.includes('/uploads/')) {
      return next();
    }
    
    const imagePath = req.file?.path || req.path.replace('/uploads/', 'uploads/');
    
    if (!imagePath || !(await fs.access(imagePath).then(() => true).catch(() => false))) {
      return next();
    }
    
    // Verificar se já está no cache
    const cacheKey = `${imagePath}-${JSON.stringify(req.query)}`;
    if (imageCache.has(cacheKey)) {
      const cachedPath = imageCache.get(cacheKey)!;
      return res.sendFile(path.resolve(cachedPath));
    }
    
    // Ler imagem original
    const originalBuffer = await fs.readFile(imagePath);
    const supportedFormats = getSupportedFormats(req);
    
    // Extrair opções da query string
    const options: OptimizationOptions = {
      width: req.query.w ? parseInt(req.query.w as string) : undefined,
      height: req.query.h ? parseInt(req.query.h as string) : undefined,
      quality: req.query.q ? parseInt(req.query.q as string) : undefined,
      format: req.query.f as any,
      compression: req.query.c as any,
      blur: req.query.blur ? parseFloat(req.query.blur as string) : undefined,
      sharpen: req.query.sharpen === 'true',
      grayscale: req.query.grayscale === 'true',
      rotate: req.query.rotate ? parseInt(req.query.rotate as string) : undefined,
      flip: req.query.flip === 'true',
      flop: req.query.flop === 'true'
    };
    
    // Otimizar imagem
    const { buffer: optimizedBuffer, format, size } = await optimizeImage(
      originalBuffer,
      options,
      supportedFormats
    );
    
    // Salvar imagem otimizada
    const optimizedPath = await saveOptimizedImage(imagePath, optimizedBuffer, format, options);
    
    // Adicionar ao cache
    imageCache.set(cacheKey, optimizedPath);
    
    // Configurar headers de resposta
    res.set({
      'Content-Type': `image/${format}`,
      'Content-Length': size.toString(),
      'Cache-Control': 'public, max-age=31536000', // 1 ano
      'X-Image-Optimized': 'true',
      'X-Original-Size': originalBuffer.length.toString(),
      'X-Optimized-Size': size.toString(),
      'X-Compression-Ratio': `${((1 - size / originalBuffer.length) * 100).toFixed(1)}%`
    });
    
    res.send(optimizedBuffer);
    
  } catch (error) {
    console.error('Image optimization error:', error);
    next();
  }
}

// Middleware para otimização automática de uploads
export async function autoImageOptimization(
  req: Request,
  res: Response,
  next: NextFunction
) {
  if (!req.file) {
    return next();
  }
  
  try {
    const originalBuffer = await fs.readFile(req.file.path);
    const metadata = await sharp(originalBuffer).metadata();
    
    // Verificar se precisa de otimização
    const needsOptimization = 
      metadata.width! > IMAGE_CONFIG.MAX_WIDTH ||
      metadata.height! > IMAGE_CONFIG.MAX_HEIGHT ||
      originalBuffer.length > 1024 * 1024; // 1MB
    
    if (needsOptimization) {
      const { buffer: optimizedBuffer } = await optimizeImage(originalBuffer, {
        width: Math.min(metadata.width!, IMAGE_CONFIG.MAX_WIDTH),
        height: Math.min(metadata.height!, IMAGE_CONFIG.MAX_HEIGHT),
        quality: IMAGE_CONFIG.QUALITY
      });
      
      // Substituir arquivo original
      await fs.writeFile(req.file.path, optimizedBuffer);
      
      // Criar thumbnail
      const thumbnailBuffer = await createThumbnail(optimizedBuffer);
      const thumbnailPath = req.file.path.replace(/\.[^/.]+$/, '_thumb.jpg');
      await fs.writeFile(thumbnailPath, thumbnailBuffer);
      
      // Adicionar informações ao req.file
      (req.file as any).optimized = true;
      (req.file as any).originalSize = originalBuffer.length;
      (req.file as any).optimizedSize = optimizedBuffer.length;
      (req.file as any).thumbnailPath = thumbnailPath;
    }
    
    next();
  } catch (error) {
    console.error('Auto image optimization error:', error);
    next();
  }
}

// Função para otimizar imagem em lote
export async function batchImageOptimization(
  imagePaths: string[],
  options: OptimizationOptions = {}
): Promise<{ original: string; optimized: string; savings: number }[]> {
  const results = [];
  
  for (const imagePath of imagePaths) {
    try {
      const originalBuffer = await fs.readFile(imagePath);
      const { buffer: optimizedBuffer, size } = await optimizeImage(originalBuffer, options);
      
      const optimizedPath = await saveOptimizedImage(imagePath, optimizedBuffer, 'jpeg', options);
      const savings = originalBuffer.length - size;
      
      results.push({
        original: imagePath,
        optimized: optimizedPath,
        savings
      });
    } catch (error) {
      console.error(`Error optimizing ${imagePath}:`, error);
    }
  }
  
  return results;
}

// Função para limpar cache de imagens
export async function clearImageCache(): Promise<void> {
  try {
    await fs.rm(IMAGE_CONFIG.CACHE_DIR, { recursive: true, force: true });
    imageCache.clear();
    console.log('Image cache cleared');
  } catch (error) {
    console.error('Error clearing image cache:', error);
  }
}

// Função para obter estatísticas de otimização
export async function getImageOptimizationStats(): Promise<{
  cacheSize: number;
  cacheEntries: number;
  totalSavings: number;
}> {
  try {
    const cacheFiles = await fs.readdir(IMAGE_CONFIG.CACHE_DIR);
    let totalSize = 0;
    
    for (const file of cacheFiles) {
      const filePath = path.join(IMAGE_CONFIG.CACHE_DIR, file);
      const stats = await fs.stat(filePath);
      totalSize += stats.size;
    }
    
    return {
      cacheSize: totalSize,
      cacheEntries: cacheFiles.length,
      totalSavings: imageCache.size * 1024 * 1024 // Estimativa
    };
  } catch (error) {
    return {
      cacheSize: 0,
      cacheEntries: 0,
      totalSavings: 0
    };
  }
}

// Limpeza periódica do cache
setInterval(async () => {
  try {
    const cacheFiles = await fs.readdir(IMAGE_CONFIG.CACHE_DIR);
    const now = Date.now();
    const maxAge = 7 * 24 * 60 * 60 * 1000; // 7 dias
    
    for (const file of cacheFiles) {
      const filePath = path.join(IMAGE_CONFIG.CACHE_DIR, file);
      const stats = await fs.stat(filePath);
      
      if (now - stats.mtime.getTime() > maxAge) {
        await fs.unlink(filePath);
      }
    }
  } catch (error) {
    console.error('Cache cleanup error:', error);
  }
}, 24 * 60 * 60 * 1000); // Diariamente