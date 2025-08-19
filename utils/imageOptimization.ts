import { useState, useEffect } from 'react';
import type React from 'react';

export const useImageOptimization = () => {
  const [isWebPSupported, setIsWebPSupported] = useState(true);

  useEffect(() => {
    const checkWebPSupport = async () => {
      if (typeof window !== 'undefined') {
        const canvas = document.createElement('canvas');
        canvas.width = 1;
        canvas.height = 1;
        const webPData = canvas.toDataURL('image/webp');
        setIsWebPSupported(webPData.indexOf('data:image/webp') === 0);
      }
    };
    checkWebPSupport();
  }, []);

  const getOptimizedImageUrl = (src: string, width?: number, height?: number): string => {
    if (!isWebPSupported) {
      return src.replace(/\.webp$/, '.jpg');
    }

    if (width && height) {
      return `${src}?w=${width}&h=${height}&format=webp`;
    }

    return src;
  };

  const getResponsiveImageSet = (src: string): string => {
    const baseName = src.replace(/\.(jpg|jpeg|png|webp)$/, '');
    return `
      ${baseName}-320w.webp 320w,
      ${baseName}-640w.webp 640w,
      ${baseName}-1024w.webp 1024w,
      ${baseName}-1280w.webp 1280w
    `;
  };

  return {
    getOptimizedImageUrl,
    getResponsiveImageSet,
    isWebPSupported,
  };
};

// Preload critical images
export const preloadImage = (src: string): Promise<void> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve();
    img.onerror = () => reject();
    img.src = src;
  });
};

// Lazy loading observer
export const useLazyLoad = (ref: React.RefObject<HTMLImageElement>, src: string) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [isInView, setIsInView] = useState(false);

  useEffect(() => {
    if (!ref.current) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true);
          observer.disconnect();
        }
      },
      { threshold: 0.1 }
    );

    observer.observe(ref.current);

    return () => {
      observer.disconnect();
    };
  }, [ref]);

  useEffect(() => {
    if (isInView && !isLoaded) {
      const img = new Image();
      img.onload = () => setIsLoaded(true);
      img.src = src;
    }
  }, [isInView, src, isLoaded]);

  return { isLoaded, isInView };
};
