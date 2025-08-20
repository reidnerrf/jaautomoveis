import { useState, useEffect } from "react";
import type React from "react";

export const useImageOptimization = () => {
  const [isWebPSupported, setIsWebPSupported] = useState(true);

  useEffect(() => {
    const checkWebPSupport = async () => {
      if (typeof window !== "undefined") {
        const canvas = document.createElement("canvas");
        canvas.width = 1;
        canvas.height = 1;
        const webPData = canvas.toDataURL("image/webp");
        setIsWebPSupported(webPData.indexOf("data:image/webp") === 0);
      }
    };
    checkWebPSupport();
  }, []);

  const getOptimizedImageUrl = (
    src: string,
    width?: number,
    height?: number,
  ): string => {
    if (!src) return src;

    // Do not append params for remote avatars (e.g., Google) or data URLs
    const isRemote = /^https?:\/\//i.test(src) || src.startsWith("data:");
    if (isRemote) return src;

    // Respect WebP support
    const baseSrc = !isWebPSupported ? src.replace(/\.webp$/i, ".jpg") : src;

    if (width && height) {
      // Backend expects short param keys: w, h, f
      const separator = baseSrc.includes("?") ? "&" : "?";
      return `${baseSrc}${separator}w=${width}&h=${height}&f=${isWebPSupported ? 'webp' : 'jpg'}`;
    }

    return baseSrc;
  };

  const getResponsiveImageSet = (src: string): string => {
    if (!src || /^https?:\/\//i.test(src) || src.startsWith("data:")) return "";

    const [clean, existingQuery] = src.split("?");
    const formatParam = isWebPSupported ? "webp" : "jpg";
    const widths = [320, 640, 1024, 1280];

    return widths
      .map((w) => {
        const sep = clean.includes("?") ? "&" : "?";
        const versionSuffix = existingQuery ? `&${existingQuery}` : "";
        return `${clean}${sep}w=${w}&f=${formatParam}${versionSuffix} ${w}w`;
      })
      .join(", ");
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
export const useLazyLoad = (
  ref: React.RefObject<HTMLImageElement>,
  src: string,
) => {
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
      { threshold: 0.1 },
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
