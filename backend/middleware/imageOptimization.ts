import { Request, Response, NextFunction } from 'express';
import sharp from 'sharp';
import path from 'path';
import fs from 'fs/promises';

interface ImageOptimizationOptions {
  quality?: number;
  format?: 'webp' | 'avif' | 'jpeg' | 'png';
  width?: number;
  height?: number;
  fit?: 'cover' | 'contain' | 'fill' | 'inside' | 'outside';
}

export const imageOptimizationMiddleware = (options: ImageOptimizationOptions = {}) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    const { quality = 80, format = 'webp', width, height, fit = 'cover' } = options;
    
    // Verificar se é uma requisição de imagem
    if (!req.path.match(/\.(jpg|jpeg|png|webp|avif)$/i)) {
      return next();
    }

    // Extrair parâmetros da URL
    const urlParams = new URLSearchParams(req.query as any);
    const requestedWidth = parseInt(urlParams.get('w') || '') || width;
    const requestedHeight = parseInt(urlParams.get('h') || '') || height;
    const requestedQuality = parseInt(urlParams.get('q') || '') || quality;
    const requestedFormat = urlParams.get('f') || format;

    // Gerar chave do cache baseada nos parâmetros
    const cacheKey = `${req.path}-${requestedWidth}-${requestedHeight}-${requestedQuality}-${requestedFormat}`;
    const cachePath = path.join(process.cwd(), 'cache', 'images', cacheKey);

    try {
      // Verificar se existe no cache
      await fs.access(cachePath);
      return res.sendFile(cachePath);
    } catch {
      // Imagem não existe no cache, processar
    }

    const originalPath = path.join(process.cwd(), req.path);
    
    try {
      // Verificar se arquivo original existe
      await fs.access(originalPath);
    } catch {
      return res.status(404).send('Image not found');
    }

    try {
      // Criar diretório de cache se não existir
      await fs.mkdir(path.dirname(cachePath), { recursive: true });

      // Processar imagem
      let sharpInstance = sharp(originalPath);

      // Aplicar redimensionamento se especificado
      if (requestedWidth || requestedHeight) {
        sharpInstance = sharpInstance.resize(requestedWidth, requestedHeight, {
          fit,
          withoutEnlargement: true
        });
      }

      // Aplicar formato e qualidade
      switch (requestedFormat) {
        case 'webp':
          sharpInstance = sharpInstance.webp({ quality: requestedQuality });
          break;
        case 'avif':
          sharpInstance = sharpInstance.avif({ quality: requestedQuality });
          break;
        case 'jpeg':
          sharpInstance = sharpInstance.jpeg({ quality: requestedQuality });
          break;
        case 'png':
          sharpInstance = sharpInstance.png({ quality: requestedQuality });
          break;
        default:
          sharpInstance = sharpInstance.webp({ quality: requestedQuality });
      }

      // Salvar no cache
      await sharpInstance.toFile(cachePath);

      // Definir headers apropriados
      res.setHeader('Content-Type', `image/${requestedFormat}`);
      res.setHeader('Cache-Control', 'public, max-age=31536000'); // 1 ano
      res.setHeader('Vary', 'Accept');

      // Enviar arquivo processado
      res.sendFile(cachePath);

    } catch (error) {
      console.error('Error processing image:', error);
      // Fallback para arquivo original
      res.sendFile(originalPath);
    }
  };
};

// Middleware para otimização automática de imagens de veículos
export const vehicleImageOptimization = imageOptimizationMiddleware({
  quality: 85,
  format: 'webp',
  fit: 'cover'
});

// Função para limpar cache de imagens
export const clearImageCache = async () => {
  const cacheDir = path.join(process.cwd(), 'cache', 'images');
  try {
    await fs.rm(cacheDir, { recursive: true, force: true });
    console.log('Image cache cleared');
  } catch (error) {
    console.error('Error clearing image cache:', error);
  }
};

// Função para otimizar imagem em lote
export const optimizeImageBatch = async (imagePaths: string[]) => {
  const results = [];
  
  for (const imagePath of imagePaths) {
    try {
      const optimizedPath = await optimizeSingleImage(imagePath);
      results.push({ original: imagePath, optimized: optimizedPath, success: true });
    } catch (error) {
      results.push({ original: imagePath, error: error.message, success: false });
    }
  }
  
  return results;
};

// Função para otimizar uma única imagem
export const optimizeSingleImage = async (imagePath: string) => {
  const ext = path.extname(imagePath);
  const name = path.basename(imagePath, ext);
  const dir = path.dirname(imagePath);
  const optimizedPath = path.join(dir, `${name}-optimized.webp`);

  await sharp(imagePath)
    .webp({ quality: 85 })
    .toFile(optimizedPath);

  return optimizedPath;
};

export default imageOptimizationMiddleware;