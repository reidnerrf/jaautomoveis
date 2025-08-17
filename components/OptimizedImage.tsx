import React, { useState, useRef, useEffect, useCallback } from 'react';

interface OptimizedImageProps {
	src: string;
	alt: string;
	className?: string;
	placeholder?: string;
	width?: number;
	height?: number;
	sizes?: string;
	priority?: boolean;
	onLoad?: () => void;
	onError?: () => void;
}

const DEFAULT_PLACEHOLDER = 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="600" height="400"><rect width="100%" height="100%" fill="%23e5e7eb"/><text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" fill="%239ca3af" font-size="20">Carregando imagem...</text></svg>';

const OptimizedImage: React.FC<OptimizedImageProps> = ({
	src,
	alt,
	className = '',
	placeholder = DEFAULT_PLACEHOLDER,
	width,
	height,
	sizes = '(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw',
	priority = false,
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

		// If original is already webp or data URL, use it directly
		if (/\.webp$/i.test(imageSrc) || imageSrc.startsWith('data:')) {
			setImageSrc(imageSrc);
			setIsLoading(false);
			setHasError(false);
			return;
		}

		img.src = webpSrc;
	}, [retryCount, maxRetries]);

	useEffect(() => {
		const observer = new IntersectionObserver(
			(entries) => {
				entries.forEach((entry) => {
					if (entry.isIntersecting || priority) {
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
	}, [src, loadImage, priority]);

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
				loading={priority ? 'eager' : 'lazy'}
				decoding="async"
				width={width}
				height={height}
				sizes={sizes}
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