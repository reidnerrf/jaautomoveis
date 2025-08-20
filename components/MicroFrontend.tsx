import React, { Suspense, useState, useEffect, useCallback } from "react";
import ErrorBoundary from "./ErrorBoundary";

// Interface para configuração de micro-frontend
interface MicroFrontendConfig {
  name: string;
  url: string;
  scope: string;
  module: string;
  fallback?: React.ReactNode;
  errorFallback?: React.ReactNode;
  props?: Record<string, unknown>;
  version?: string;
  cache?: boolean;
}

// Interface para registro de micro-frontends
interface MicroFrontendRegistry {
  [key: string]: MicroFrontendConfig;
}

// Registro de micro-frontends disponíveis
const MICRO_FRONTEND_REGISTRY: MicroFrontendRegistry = {
  vehicleList: {
    name: "VehicleList",
    url: "http://localhost:3001",
    scope: "vehicleList",
    module: "./VehicleList",
    version: "1.0.0",
  },
  vehicleDetail: {
    name: "VehicleDetail",
    url: "http://localhost:3002",
    scope: "vehicleDetail",
    module: "./VehicleDetail",
    version: "1.0.0",
  },
  analytics: {
    name: "Analytics",
    url: "http://localhost:3003",
    scope: "analytics",
    module: "./Analytics",
    version: "1.0.0",
  },
  admin: {
    name: "Admin",
    url: "http://localhost:3004",
    scope: "admin",
    module: "./Admin",
    version: "1.0.0",
  },
  search: {
    name: "Search",
    url: "http://localhost:3005",
    scope: "search",
    module: "./Search",
    version: "1.0.0",
  },
};

// Cache de micro-frontends carregados
const microFrontendCache = new Map<string, React.ComponentType<any>>();

// Interface para o componente MicroFrontend
interface MicroFrontendProps {
  name: string;
  props?: Record<string, unknown>;
  fallback?: React.ReactNode;
  errorFallback?: React.ReactNode;
  onLoad?: () => void;
  onError?: (error: Error) => void;
  version?: string;
  cache?: boolean;
}

// Componente principal de Micro-Frontend
const MicroFrontend: React.FC<MicroFrontendProps> = ({
  name,
  props = {},
  fallback,
  errorFallback,
  onLoad,
  onError,
  version,
  cache = true,
}) => {
  const [Component, setComponent] = useState<React.ComponentType<any> | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const config = MICRO_FRONTEND_REGISTRY[name];
  const cacheKey = `${name}${version ? `@${version}` : ""}`;

  // Carregar micro-frontend
  const loadMicroFrontend = useCallback(async () => {
    if (!config) {
      const error = new Error(`Micro-frontend ${name} not found in registry`);
      setError(error);
      onError?.(error);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      // Verificar cache
      if (cache && microFrontendCache.has(cacheKey)) {
        const cachedComponent = microFrontendCache.get(cacheKey)!;
        setComponent(() => cachedComponent);
        setLoading(false);
        onLoad?.();
        return;
      }

      // Carregar módulo remoto
      const remoteModule = await loadRemoteModule(config);
      const RemoteComponent = remoteModule.default || remoteModule[config.name];

      if (!RemoteComponent) {
        throw new Error(`Component ${config.name} not found in remote module`);
      }

      // Armazenar no cache
      if (cache) {
        microFrontendCache.set(cacheKey, RemoteComponent);
      }

      setComponent(() => RemoteComponent);
      setLoading(false);
      onLoad?.();
    } catch (err) {
      const error = err instanceof Error ? err : new Error(String(err));
      setError(error);
      setLoading(false);
      onError?.(error);
    }
  }, [name, config, cache, cacheKey, onLoad, onError]);

  // Carregar micro-frontend quando o componente montar
  useEffect(() => {
    loadMicroFrontend();
  }, [loadMicroFrontend]);

  // Fallback padrão
  const defaultFallback = (
    <div className="flex items-center justify-center p-8">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      <span className="ml-2 text-gray-600">Carregando {name}...</span>
    </div>
  );

  // Fallback de erro padrão
  const defaultErrorFallback = (
    <div className="flex items-center justify-center p-8 text-red-600">
      <div className="text-center">
        <div className="text-xl font-semibold mb-2">Erro ao carregar {name}</div>
        <div className="text-sm text-gray-500 mb-4">{error?.message}</div>
        <button
          onClick={loadMicroFrontend}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          Tentar novamente
        </button>
      </div>
    </div>
  );

  if (loading) {
    return fallback || defaultFallback;
  }

  if (error) {
    return errorFallback || defaultErrorFallback;
  }

  if (!Component) {
    return errorFallback || defaultErrorFallback;
  }

  return (
    <ErrorBoundary fallback={errorFallback || defaultErrorFallback}>
      <Suspense fallback={fallback || defaultFallback}>
        <Component {...props} />
      </Suspense>
    </ErrorBoundary>
  );
};

// Função para carregar módulo remoto
async function loadRemoteModule(config: MicroFrontendConfig): Promise<any> {
  // Verificar se o Module Federation está disponível
  if (typeof window !== "undefined" && (window as any).__webpack_require__) {
    try {
      // Tentar carregar via Module Federation
      const container = await loadContainer(config);
      const factory = await container.get(config.module);
      return factory();
    } catch (error) {
      console.warn("Module Federation failed, falling back to dynamic import:", error);
    }
  }

  // Fallback para import dinâmico
  return loadDynamicModule(config);
}

// Função para carregar container do Module Federation
async function loadContainer(config: MicroFrontendConfig): Promise<any> {
  const container = (window as any)[config.scope];

  if (!container) {
    // Carregar script do container
    await loadScript(`${config.url}/remoteEntry.js`);

    // Inicializar container
    await (window as any)[config.scope].init({
      shared: {
        react: { singleton: true, requiredVersion: "^18.0.0" },
        "react-dom": { singleton: true, requiredVersion: "^18.0.0" },
      },
    });
  }

  return (window as any)[config.scope];
}

// Função para carregar script dinamicamente
function loadScript(src: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const script = document.createElement("script");
    script.src = src;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error(`Failed to load script: ${src}`));
    document.head.appendChild(script);
  });
}

// Função para carregar módulo dinamicamente
async function loadDynamicModule(config: MicroFrontendConfig): Promise<any> {
  // Simular carregamento de módulo remoto
  // Em produção, isso seria uma chamada real para o servidor
  const response = await fetch(`${config.url}/api/module/${config.module}`);

  if (!response.ok) {
    throw new Error(`Failed to load module: ${config.module}`);
  }

  const moduleData = await response.json();

  // Criar componente dinamicamente
  return {
    default: React.lazy(() =>
      Promise.resolve({
        default: moduleData.component,
      })
    ),
  };
}

// Hook para gerenciar micro-frontends
export function useMicroFrontend(name: string) {
  const [status, setStatus] = useState<"idle" | "loading" | "loaded" | "error">("idle");
  const [error, setError] = useState<Error | null>(null);

  const load = useCallback(async () => {
    setStatus("loading");
    setError(null);

    try {
      const config = MICRO_FRONTEND_REGISTRY[name];
      if (!config) {
        throw new Error(`Micro-frontend ${name} not found`);
      }

      await loadRemoteModule(config);
      setStatus("loaded");
    } catch (err) {
      const error = err instanceof Error ? err : new Error(String(err));
      setError(error);
      setStatus("error");
    }
  }, [name]);

  return { status, error, load };
}

// Componente para carregar múltiplos micro-frontends
interface MultiMicroFrontendProps {
  names: string[];
  props?: Record<string, unknown>;
  fallback?: React.ReactNode;
  errorFallback?: React.ReactNode;
  onAllLoaded?: () => void;
  onError?: (errors: Record<string, Error>) => void;
}

const MultiMicroFrontend: React.FC<MultiMicroFrontendProps> = ({
  names,
  props = {},
  fallback,
  errorFallback,
  onAllLoaded,
  onError,
}) => {
  // Track progress internally only; no external reads to avoid unused-var lint
  const [, setLoadedCount] = useState(0);
  const [, setErrors] = useState<Record<string, Error>>({});

  const handleLoad = useCallback(() => {
    setLoadedCount((prev) => {
      const newCount = prev + 1;
      if (newCount === names.length) {
        onAllLoaded?.();
      }
      return newCount;
    });
  }, [names.length, onAllLoaded]);

  const handleError = useCallback(
    (name: string, error: Error) => {
      setErrors((prev) => {
        const newErrors = { ...prev, [name]: error };
        onError?.(newErrors);
        return newErrors;
      });
    },
    [onError]
  );

  return (
    <div className="multi-micro-frontend">
      {names.map((name) => (
        <MicroFrontend
          key={name}
          name={name}
          props={(props as any)?.[name] || props}
          fallback={fallback}
          errorFallback={errorFallback}
          onLoad={handleLoad}
          onError={(error) => handleError(name, error)}
        />
      ))}
    </div>
  );
};

// Componente para versão específica de micro-frontend
interface VersionedMicroFrontendProps extends MicroFrontendProps {
  version: string;
  fallbackVersion?: string;
}

const VersionedMicroFrontend: React.FC<VersionedMicroFrontendProps> = ({
  name,
  version,
  fallbackVersion,
  ...props
}) => {
  const [currentVersion, setCurrentVersion] = useState(version);

  const handleError = useCallback(
    (error: Error) => {
      if (fallbackVersion && currentVersion === version) {
        console.warn(`Failed to load version ${version}, falling back to ${fallbackVersion}`);
        setCurrentVersion(fallbackVersion);
      } else {
        props.onError?.(error);
      }
    },
    [version, fallbackVersion, currentVersion, props]
  );

  return <MicroFrontend {...props} name={name} version={currentVersion} onError={handleError} />;
};

// Componente para micro-frontend com cache inteligente
interface CachedMicroFrontendProps extends MicroFrontendProps {
  cacheStrategy?: "memory" | "localStorage" | "sessionStorage";
  cacheTTL?: number;
}

const CachedMicroFrontend: React.FC<CachedMicroFrontendProps> = ({
  name,
  cacheStrategy = "memory",
  cacheTTL = 3600000, // 1 hora
  ...props
}) => {
  const [cachedComponent, setCachedComponent] = useState<React.ComponentType<any> | null>(null);

  useEffect(() => {
    if (cacheStrategy === "memory") {
      const cached = microFrontendCache.get(name);
      if (cached) {
        setCachedComponent(() => cached);
      }
    } else if (cacheStrategy === "localStorage" || cacheStrategy === "sessionStorage") {
      const storage = cacheStrategy === "localStorage" ? localStorage : sessionStorage;
      const cached = storage.getItem(`micro-frontend-${name}`);

      if (cached) {
        try {
          const { component, timestamp } = JSON.parse(cached);
          if (Date.now() - timestamp < cacheTTL) {
            // Recriar componente do cache
            const Component = eval(component); // Em produção, usar método mais seguro
            setCachedComponent(() => Component);
          } else {
            storage.removeItem(`micro-frontend-${name}`);
          }
        } catch (error) {
          console.warn("Failed to load cached component:", error);
        }
      }
    }
  }, [name, cacheStrategy, cacheTTL]);

  if (cachedComponent) {
    const Component = cachedComponent;
    return <Component {...props} />;
  }

  return (
    <MicroFrontend
      {...props}
      name={name}
      cache={false}
      onLoad={() => {
        // Implementar cache aqui se necessário
        props.onLoad?.();
      }}
    />
  );
};

// Exportar componentes e hooks
export { MicroFrontend, MultiMicroFrontend, VersionedMicroFrontend, CachedMicroFrontend };

// Exportar registro para uso externo
export { MICRO_FRONTEND_REGISTRY };

export default MicroFrontend;
