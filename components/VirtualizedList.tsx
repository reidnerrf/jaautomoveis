import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';

interface VirtualizedListProps<T> {
  items: T[];
  height: number;
  itemHeight: number;
  renderItem: (item: T, index: number) => React.ReactNode;
  overscan?: number;
  onScroll?: (scrollTop: number) => void;
  className?: string;
  containerClassName?: string;
  loading?: boolean;
  loadingComponent?: React.ReactNode;
  emptyComponent?: React.ReactNode;
}

interface VirtualizedListState {
  scrollTop: number;
  containerHeight: number;
}

function VirtualizedList<T>({
  items,
  height,
  itemHeight,
  renderItem,
  overscan = 5,
  onScroll,
  className = '',
  containerClassName = '',
  loading = false,
  loadingComponent,
  emptyComponent
}: VirtualizedListProps<T>) {
  const [state, setState] = useState<VirtualizedListState>({
    scrollTop: 0,
    containerHeight: height
  });

  const containerRef = useRef<HTMLDivElement>(null);
  const scrollElementRef = useRef<HTMLDivElement>(null);

  // Calculate visible range
  const { startIndex, endIndex, visibleItems } = useMemo(() => {
    const startIndex = Math.max(0, Math.floor(state.scrollTop / itemHeight) - overscan);
    const endIndex = Math.min(
      items.length - 1,
      Math.ceil((state.scrollTop + state.containerHeight) / itemHeight) + overscan
    );

    const visibleItems = items.slice(startIndex, endIndex + 1);

    return {
      startIndex,
      endIndex,
      visibleItems
    };
  }, [items, state.scrollTop, state.containerHeight, itemHeight, overscan]);

  // Handle scroll events
  const handleScroll = useCallback((event: React.UIEvent<HTMLDivElement>) => {
    const scrollTop = event.currentTarget.scrollTop;
    setState(prev => ({ ...prev, scrollTop }));
    onScroll?.(scrollTop);
  }, [onScroll]);

  // Calculate total height and transform
  const totalHeight = items.length * itemHeight;
  const transform = `translateY(${startIndex * itemHeight}px)`;

  // Auto-scroll to top when items change
  useEffect(() => {
    if (scrollElementRef.current) {
      scrollElementRef.current.scrollTop = 0;
      setState(prev => ({ ...prev, scrollTop: 0 }));
    }
  }, [items.length]);

  // Resize observer for dynamic height
  useEffect(() => {
    if (!containerRef.current) return;

    const resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        setState(prev => ({
          ...prev,
          containerHeight: entry.contentRect.height
        }));
      }
    });

    resizeObserver.observe(containerRef.current);

    return () => resizeObserver.disconnect();
  }, []);

  // Loading state
  if (loading) {
    return (
      <div className={`virtualized-list ${className}`} style={{ height }}>
        {loadingComponent || (
          <div className="flex items-center justify-center h-full">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        )}
      </div>
    );
  }

  // Empty state
  if (items.length === 0) {
    return (
      <div className={`virtualized-list ${className}`} style={{ height }}>
        {emptyComponent || (
          <div className="flex items-center justify-center h-full text-gray-500">
            Nenhum item encontrado
          </div>
        )}
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className={`virtualized-list-container ${containerClassName}`}
      style={{ height, overflow: 'auto' }}
      onScroll={handleScroll}
    >
      <div
        ref={scrollElementRef}
        style={{
          height: totalHeight,
          position: 'relative'
        }}
      >
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            transform
          }}
        >
          {visibleItems.map((item, index) => (
            <div
              key={startIndex + index}
              style={{
                height: itemHeight,
                position: 'relative'
              }}
            >
              {renderItem(item, startIndex + index)}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// Hook para virtualização customizada
export function useVirtualization<T>(
  items: T[],
  itemHeight: number,
  containerHeight: number,
  overscan = 5
) {
  const [scrollTop, setScrollTop] = useState(0);

  const { startIndex, endIndex, visibleItems } = useMemo(() => {
    const startIndex = Math.max(0, Math.floor(scrollTop / itemHeight) - overscan);
    const endIndex = Math.min(
      items.length - 1,
      Math.ceil((scrollTop + containerHeight) / itemHeight) + overscan
    );

    const visibleItems = items.slice(startIndex, endIndex + 1);

    return {
      startIndex,
      endIndex,
      visibleItems
    };
  }, [items, scrollTop, containerHeight, itemHeight, overscan]);

  const totalHeight = items.length * itemHeight;
  const transform = `translateY(${startIndex * itemHeight}px)`;

  return {
    scrollTop,
    setScrollTop,
    startIndex,
    endIndex,
    visibleItems,
    totalHeight,
    transform
  };
}

// Componente otimizado para listas de veículos
interface VehicleListProps {
  vehicles: any[];
  height?: number;
  onVehicleClick?: (vehicle: any) => void;
  loading?: boolean;
}

export const VirtualizedVehicleList: React.FC<VehicleListProps> = ({
  vehicles,
  height = 600,
  onVehicleClick,
  loading = false
}) => {
  const renderVehicleItem = useCallback((vehicle: any, index: number) => (
    <div
      key={vehicle._id || index}
      className="p-4 border-b border-gray-200 hover:bg-gray-50 cursor-pointer transition-colors"
      onClick={() => onVehicleClick?.(vehicle)}
    >
      <div className="flex items-center space-x-4">
        <div className="w-16 h-16 bg-gray-200 rounded-lg overflow-hidden">
          {vehicle.images?.[0] && (
            <img
              src={vehicle.images[0]}
              alt={vehicle.title}
              className="w-full h-full object-cover"
              loading="lazy"
            />
          )}
        </div>
        <div className="flex-1">
          <h3 className="font-semibold text-gray-900">{vehicle.title}</h3>
          <p className="text-sm text-gray-600">{vehicle.brand} {vehicle.model}</p>
          <p className="text-lg font-bold text-blue-600">
            R$ {vehicle.price?.toLocaleString('pt-BR')}
          </p>
        </div>
        <div className="text-right">
          <span className="text-xs text-gray-500">{vehicle.year}</span>
          <p className="text-sm text-gray-600">{vehicle.mileage}km</p>
        </div>
      </div>
    </div>
  ), [onVehicleClick]);

  return (
    <VirtualizedList
      items={vehicles}
      height={height}
      itemHeight={100}
      renderItem={renderVehicleItem}
      overscan={3}
      loading={loading}
      loadingComponent={
        <div className="flex items-center justify-center h-full">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      }
      emptyComponent={
        <div className="flex items-center justify-center h-full text-gray-500">
          Nenhum veículo encontrado
        </div>
      }
    />
  );
};

// Componente para listas infinitas
interface InfiniteVirtualizedListProps<T> extends VirtualizedListProps<T> {
  hasMore: boolean;
  onLoadMore: () => void;
  loadingMore?: boolean;
}

export function InfiniteVirtualizedList<T>({
  items,
  hasMore,
  onLoadMore,
  loadingMore = false,
  ...props
}: InfiniteVirtualizedListProps<T>) {
  const handleScroll = useCallback((scrollTop: number) => {
    const { height, itemHeight } = props;
    const totalHeight = items.length * itemHeight;
    const scrollPercentage = scrollTop / (totalHeight - height);

    if (scrollPercentage > 0.8 && hasMore && !loadingMore) {
      onLoadMore();
    }
  }, [items.length, props.height, props.itemHeight, hasMore, loadingMore, onLoadMore]);

  return (
    <VirtualizedList
      {...props}
      items={items}
      onScroll={handleScroll}
      loadingComponent={
        <div className="flex items-center justify-center h-full">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      }
    />
  );
}

export default VirtualizedList;