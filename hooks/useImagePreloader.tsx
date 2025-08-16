
import { useState, useEffect } from 'react';

export const useImagePreloader = (imageUrls: string[]) => {
  const [loadedImages, setLoadedImages] = useState<Set<string>>(new Set());
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (imageUrls.length === 0) {
      setIsLoading(false);
      return;
    }

    let loadedCount = 0;
    const newLoadedImages = new Set<string>();

    const checkAllLoaded = () => {
      loadedCount++;
      if (loadedCount === imageUrls.length) {
        setLoadedImages(newLoadedImages);
        setIsLoading(false);
      }
    };

    imageUrls.forEach((url) => {
      const img = new Image();
      img.onload = () => {
        newLoadedImages.add(url);
        checkAllLoaded();
      };
      img.onerror = () => {
        checkAllLoaded();
      };
      img.src = url;
    });

    return () => {
      setLoadedImages(new Set());
      setIsLoading(true);
    };
  }, [imageUrls]);

  return { loadedImages, isLoading };
};
