import React, {
  createContext,
  useContext,
  useState,
  ReactNode,
  useEffect,
  useCallback,
  useMemo,
} from "react";
import { Vehicle } from "../types.ts";
import { useAuth } from "./useAuth.tsx";
import { apiCache, createCacheKey } from "../utils/cache";
import { analytics } from "../utils/analytics";

interface VehicleContextType {
  vehicles: Vehicle[] | undefined;
  getVehicleById: (id: string) => Promise<Vehicle | undefined>;
  addVehicle: (vehicle: Omit<Vehicle, "id">) => Promise<Vehicle | undefined>;
  updateVehicle: (vehicle: Vehicle) => Promise<Vehicle | undefined>;
  deleteVehicle: (id: string) => Promise<boolean>;
  loading: boolean;
  error: string | null;
  refreshVehicles: () => Promise<void>;
  clearError: () => void;
}

const VehicleContext = createContext<VehicleContextType | undefined>(undefined);

const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

export const VehicleProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [vehicles, setVehicles] = useState<Vehicle[]>();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { token } = useAuth();

  const clearError = useCallback(() => setError(null), []);

  const fetchVehicles = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const cacheKey = createCacheKey("vehicles");
      const cachedData = apiCache.get<Vehicle[]>(cacheKey);

      if (cachedData) {
        setVehicles(cachedData);
        setLoading(false);
        return;
      }

      const response = await fetch("/api/vehicles?limit=1000", {
        // Force fresh data: bypass SW/server caches
        headers: { "Cache-Control": "no-store", "x-skip-cache": "true" },
        cache: "no-store",
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      const items = Array.isArray(data)
        ? data
        : Array.isArray((data as any)?.vehicles)
          ? (data as any).vehicles
          : [];

      const normalized = items.map((v: any) => ({
        ...v,
        id: v.id || v._id || String(v._id),
        views: v.views || 0,
        images: v.images || [],
        optionals: v.optionals || [],
        additionalInfo: v.additionalInfo || "",
      }));

      setVehicles(normalized);
      apiCache.set(cacheKey, normalized, CACHE_DURATION);
    } catch (err: any) {
      console.error("Error fetching vehicles:", err);
      setError(err.message || "Erro ao carregar veículos");
    } finally {
      setLoading(false);
    }
  }, []);

  const refreshVehicles = useCallback(async () => {
    // Invalidate cache then refetch
    apiCache.delete(createCacheKey("vehicles"));
    await fetchVehicles();
  }, [fetchVehicles]);

  useEffect(() => {
    // Ensure fresh cache on full reloads
    apiCache.clear();
    fetchVehicles();

    // subscribe to real-time updates using shared socket
    const offCreated = analytics.on("vehicle-created", () => refreshVehicles());
    const offUpdated = analytics.on("vehicle-updated", () => refreshVehicles());
    const offDeleted = analytics.on("vehicle-deleted", () => refreshVehicles());

    return () => {
      if (typeof offCreated === "function") offCreated();
      if (typeof offUpdated === "function") offUpdated();
      if (typeof offDeleted === "function") offDeleted();
    };
  }, [fetchVehicles, refreshVehicles]);

  const getVehicleById = useCallback(
    async (id: string): Promise<Vehicle | undefined> => {
      if (!id || typeof id !== "string") {
        setError("ID de veículo inválido");
        return undefined;
      }

      try {
        const response = await fetch(`/api/vehicles/${id}`, {
          headers: {
            "Cache-Control": "no-store",
            "x-skip-cache": "true",
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
          cache: "no-store",
        });

        if (!response.ok) {
          if (response.status === 404) {
            console.warn(`Vehicle with ID ${id} not found`);
            return undefined;
          }
          throw new Error(`Erro HTTP: ${response.status}`);
        }

        const data = await response.json();
        return data;
      } catch (err: any) {
        console.error("Error fetching vehicle by ID:", err);
        setError(err.message || "Erro ao carregar veículo");
        return undefined;
      }
    },
    [token]
  );

  const addVehicle = useCallback(
    async (vehicle: Omit<Vehicle, "id">) => {
      try {
        const response = await fetch("/api/vehicles", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
          body: JSON.stringify(vehicle),
        });

        if (!response.ok) {
          throw new Error("Failed to add vehicle");
        }

        const newVehicle = await response.json();
        setVehicles((prev) => [...(prev || []), newVehicle]);

        // Clear cache to force refresh
        apiCache.delete(createCacheKey("vehicles"));

        return newVehicle;
      } catch (err: any) {
        setError(err.message);
        return undefined;
      }
    },
    [token]
  );

  const updateVehicle = useCallback(
    async (updatedVehicle: Vehicle) => {
      try {
        const response = await fetch(`/api/vehicles/${updatedVehicle.id}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
          body: JSON.stringify(updatedVehicle),
        });

        if (!response.ok) {
          const msg = await response.text().catch(() => "");
          throw new Error(`Failed to update vehicle ${response.status}: ${msg}`);
        }

        const saved = await response.json();
        setVehicles((prev) => {
          const index = (prev || []).findIndex((v) => v.id === updatedVehicle.id);
          if (index !== -1) {
            const updatedVehicles = [...(prev || [])];
            updatedVehicles[index] = { ...updatedVehicle, ...saved } as Vehicle;
            return updatedVehicles;
          }
          return prev;
        });

        // Clear cache to force refresh
        apiCache.delete(createCacheKey("vehicles"));

        return saved;
      } catch (err: any) {
        setError(err.message);
        return undefined;
      }
    },
    [token]
  );

  const deleteVehicle = useCallback(
    async (id: string) => {
      if (!id || typeof id !== "string") {
        setError("ID de veículo inválido");
        return false;
      }

      try {
        const response = await fetch(`/api/vehicles/${id}`, {
          method: "DELETE",
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        });

        if (!response.ok) {
          throw new Error("Failed to delete vehicle");
        }

        setVehicles((prev) => (prev || []).filter((v) => v.id !== id));

        // Clear cache to force refresh
        apiCache.delete(createCacheKey("vehicles"));

        return true;
      } catch (err: any) {
        setError(err.message);
        return false;
      }
    },
    [token]
  );

  const contextValue = useMemo(
    () => ({
      vehicles,
      getVehicleById,
      addVehicle,
      updateVehicle,
      deleteVehicle,
      loading,
      error,
      refreshVehicles,
      clearError,
    }),
    [
      vehicles,
      getVehicleById,
      addVehicle,
      updateVehicle,
      deleteVehicle,
      loading,
      error,
      refreshVehicles,
      clearError,
    ]
  );

  return <VehicleContext.Provider value={contextValue}>{children}</VehicleContext.Provider>;
};

export const useVehicleData = (): VehicleContextType => {
  const context = useContext(VehicleContext);
  if (!context) {
    throw new Error("useVehicleData must be used within a VehicleProvider");
  }
  return context;
};
