import React, { useState, useRef, useEffect, useCallback } from 'react';

interface OptimizedImageProps {
  src: string;
  alt: string;
  className?: string;
  placeholder?: string;
  width?: number;
  height?: number;
  onLoad?: () => void;
  onError?: () => void;
}

const OptimizedImage: React.FC<OptimizedImageProps> = ({
  src,
  alt,
  className = '',
  placeholder = '/api/placeholder/400/300',
  ...props
}) => {
  const [imageSrc, setImageSrc] = useState<string>(placeholder);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [retryCount, setRetryCount] = useState(0);
  const imgRef = useRef<HTMLImageElement>(null);
  const maxRetries = 3;

  // Generate WebP and fallback sources
  const getImageSources = (originalSrc: string) => {
    const webpSrc = originalSrc.replace(/\.(jpg|jpeg|png)$/i, '.webp');
    return { webpSrc, originalSrc };
  };

  const loadImage = useCallback((imageSrc: string) => {
    const { webpSrc, originalSrc } = getImageSources(imageSrc);

    // Try WebP first, fallback to original
    const img = new Image();

    img.onload = () => {
      setImageSrc(webpSrc);
      setIsLoading(false);
      setHasError(false);
    };

    img.onerror = () => {
      // Fallback to original format
      const fallbackImg = new Image();
      fallbackImg.onload = () => {
        setImageSrc(originalSrc);
        setIsLoading(false);
        setHasError(false);
      };

      fallbackImg.onerror = () => {
        if (retryCount < maxRetries) {
          setTimeout(() => {
            setRetryCount(prev => prev + 1);
            loadImage(imageSrc);
          }, 1000 * Math.pow(2, retryCount)); // Exponential backoff
        } else {
          setHasError(true);
          setIsLoading(false);
        }
      };

      fallbackImg.src = originalSrc;
    };

    img.src = webpSrc;
  }, [retryCount, maxRetries]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            loadImage(src);
            observer.unobserve(entry.target);
          }
        });
      },
      { 
        threshold: 0.1,
        rootMargin: '50px 0px' // Load 50px before entering viewport
      }
    );

    if (imgRef.current) {
      observer.observe(imgRef.current);
    }

    return () => observer.disconnect();
  }, [src, loadImage]);

  if (hasError) {
    return (
      <div className={`bg-gray-200 flex items-center justify-center ${className}`}>
        <div className="text-center p-4">
          <span className="text-gray-500 text-sm block mb-2">Imagem não disponível</span>
          <button 
            onClick={() => {
              setHasError(false);
              setRetryCount(0);
              setIsLoading(true);
              loadImage(src);
            }}
            className="text-blue-500 text-xs hover:underline"
          >
            Tentar novamente
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={`relative ${className}`}>
      <img
        ref={imgRef}
        src={imageSrc}
        alt={alt}
        className={`transition-opacity duration-300 ${isLoading ? 'opacity-50' : 'opacity-100'}`}
        loading="lazy"
        decoding="async"
        {...props}
      />
      {Boolean(isLoading) && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
        </div>
      )}
    </div>
  );
};

export default OptimizedImage;