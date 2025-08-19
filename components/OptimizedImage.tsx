import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useImageOptimization, useLazyLoad } from '../utils/imageOptimization';

type BaseImgProps = Omit<React.ImgHTMLAttributes<HTMLImageElement>, 'src' | 'alt' | 'loading' | 'ref'>;

export interface OptimizedImageProps extends BaseImgProps {
  src: string;
  alt: string;
  width?: number;
  height?: number;
  sizes?: string;
  priority?: boolean;
}

const OptimizedImage: React.FC<OptimizedImageProps> = ({
  src,
  alt,
  className,
  width,
  height,
  sizes,
  priority = false,
  style,
  ...rest
}) => {
  const imageRef = useRef<HTMLImageElement>(null);
  const { getOptimizedImageUrl, getResponsiveImageSet } = useImageOptimization();
  const { isInView } = useLazyLoad(imageRef, src);

  const [currentSrc, setCurrentSrc] = useState<string>('');
  const [hasError, setHasError] = useState<boolean>(false);

  // Tiny inline SVG placeholder (neutral gray)
  const placeholderSrc = useMemo(() => {
    const svg = `<svg xmlns='http://www.w3.org/2000/svg' width='10' height='10'><rect width='100%' height='100%' fill='#e5e7eb'/></svg>`;
    return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
  }, []);

  useEffect(() => {
    setHasError(false);
    if (priority || isInView) {
      setCurrentSrc(getOptimizedImageUrl(src, width, height));
    }
  }, [src, width, height, priority, isInView, getOptimizedImageUrl]);

  const handleError = () => {
    if (hasError) return;
    setHasError(true);
    const fallback = src.replace(/\.(webp|avif)$/i, '.jpg');
    setCurrentSrc(getOptimizedImageUrl(fallback, width, height));
  };

  const loadingAttr: 'eager' | 'lazy' = priority ? 'eager' : 'lazy';

  return (
    <img
      ref={imageRef}
      src={currentSrc || placeholderSrc}
      alt={alt}
      className={className}
      width={width}
      height={height}
      sizes={sizes}
      srcSet={currentSrc ? getResponsiveImageSet(currentSrc) : undefined}
      loading={loadingAttr}
      decoding="async"
      style={style}
      onError={handleError}
      {...rest}
    />
  );
};

export default OptimizedImage;

