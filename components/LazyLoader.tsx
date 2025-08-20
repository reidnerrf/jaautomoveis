import React, { Suspense, lazy, Component, ReactNode } from "react";

interface LazyLoaderProps {
  component: () => Promise<{
    default: React.ComponentType<Record<string, unknown>>;
  }>;
  fallback?: ReactNode;
  errorFallback?: ReactNode;
  onLoad?: () => void;
  onError?: (error: Error) => void;
}

interface LazyLoaderState {
  hasError: boolean;
  error?: Error;
}

class ErrorBoundary extends Component<
  {
    children: ReactNode;
    fallback: ReactNode;
    onError?: (error: Error) => void;
  },
  LazyLoaderState
> {
  constructor(props: {
    children: ReactNode;
    fallback: ReactNode;
    onError?: (error: Error) => void;
  }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): LazyLoaderState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, _errorInfo: React.ErrorInfo) {
    // Log error silently
    this.props.onError?.(error);
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback;
    }

    return this.props.children;
  }
}

const LazyLoader: React.FC<LazyLoaderProps> = ({
  component,
  fallback = (
    <div className="flex items-center justify-center p-8">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
    </div>
  ),
  errorFallback = (
    <div className="flex items-center justify-center p-8 text-red-600">
      Erro ao carregar componente
    </div>
  ),
  onLoad,
  onError,
}) => {
  const LazyComponent = lazy(component);

  return (
    <ErrorBoundary fallback={errorFallback}>
      <Suspense fallback={fallback}>
        <LazyComponent {...(onLoad ? { onLoad } : {})} />
      </Suspense>
    </ErrorBoundary>
  );
};

export default LazyLoader;

// Componentes lazy predefinidos
// The following components may not exist in this project structure.
// They were causing module-not-found errors during type checking, so they are disabled.
// If needed in the future, re-enable with correct paths or implementations.
// export const LazyVehicleList = lazy(() => import("./VehicleList"));
// export const LazyVehicleDetail = lazy(() => import("./VehicleDetail"));
// export const LazyVehicleForm = lazy(() => import("./VehicleForm"));
// export const LazyDashboard = lazy(() => import("./Dashboard"));
// export const LazyAnalytics = lazy(() => import("./Analytics"));
// export const LazyCharts = lazy(() => import("./Charts"));
// export const LazyMaps = lazy(() => import("./Maps"));
// export const LazyPDF = lazy(() => import("./PDFGenerator"));

// HOC para lazy loading com retry
export function withLazyRetry<T extends object>(
  importFunc: () => Promise<{ default: React.ComponentType<T> }>,
  retries = 3
) {
  const WrappedComponent: React.FC<T> = (props) => {
    const [Component, setComponent] = React.useState<React.ComponentType<T> | null>(null);
    const [error, setError] = React.useState<Error | null>(null);
    const [retryCount, setRetryCount] = React.useState(0);

    const loadComponent = React.useCallback(async () => {
      try {
        const module = await importFunc();
        setComponent(() => module.default);
        setError(null);
      } catch (err) {
        setError(err as Error);
        if (retryCount < retries) {
          setTimeout(
            () => {
              setRetryCount((prev) => prev + 1);
              loadComponent();
            },
            1000 * Math.pow(2, retryCount)
          ); // Exponential backoff
        }
      }
    }, [importFunc, retryCount, retries]);

    React.useEffect(() => {
      loadComponent();
    }, [loadComponent]);

    if (error && retryCount >= retries) {
      return <div className="text-red-600 p-4">Erro ao carregar componente</div>;
    }

    if (!Component) {
      return <div className="animate-pulse bg-gray-200 h-32 rounded"></div>;
    }

    return <Component {...(props as T)} />;
  };

  WrappedComponent.displayName = "withLazyRetry";
  return WrappedComponent;
}

// Hook para lazy loading com intersection observer
export function useLazyLoad<T>(
  importFunc: () => Promise<T>,
  options: IntersectionObserverInit = {}
) {
  const [data, setData] = React.useState<T | null>(null);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<Error | null>(null);
  const ref = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        const [entry] = entries;
        if (entry.isIntersecting && !data && !loading) {
          (async () => {
            setLoading(true);
            try {
              const result = await importFunc();
              setData(result);
              setError(null);
            } catch (err) {
              setError(err as Error);
            } finally {
              setLoading(false);
            }
          })();
        }
      },
      { threshold: 0.1, ...options }
    );

    if (ref.current) {
      observer.observe(ref.current);
    }

    return () => observer.disconnect();
  }, [importFunc, data, loading, options]);

  return { ref, data, loading, error };
}
