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

interface VehicleContextType {
  vehicles: Vehicle[] | undefined;
  getVehicleById: (id: string) => Promise<Vehicle | undefined>;
  addVehicle: (vehicle: Omit<Vehicle, "id">) => Promise<Vehicle | undefined>;
  updateVehicle: (vehicle: Vehicle) => Promise<Vehicle | undefined>;
  deleteVehicle: (id: string) => Promise<boolean>;
  loading: boolean;
  error: string | null;
  refreshVehicles: () => Promise<void>;
}

const VehicleContext = createContext<VehicleContextType | undefined>(undefined);

const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

export const VehicleProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [vehicles, setVehicles] = useState<Vehicle[]>();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { token } = useAuth();

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
        headers: { "Cache-Control": "max-age=300" },
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

      // Cache the normalized data
      apiCache.set(cacheKey, normalized, CACHE_DURATION);
    } catch (err: any) {
      console.error("Error fetching vehicles:", err);
      setError(err.message || "Erro ao carregar veículos");
    } finally {
      setLoading(false);
    }
  }, []);

  const refreshVehicles = useCallback(async () => {
    await fetchVehicles();
  }, [fetchVehicles]);

  useEffect(() => {
    fetchVehicles();
  }, [fetchVehicles]);

  const getVehicleById = useCallback(
    async (id: string): Promise<Vehicle | undefined> => {
      if (!id || typeof id !== "string") {
        console.error("Invalid vehicle ID provided:", id);
        return undefined;
      }

      try {
        const response = await fetch(`/api/vehicles/${id}`, {
          headers: {
            "Cache-Control": "max-age=300",
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
        });

        if (!response.ok) {
          if (response.status === 404) {
            console.warn(`Vehicle with ID ${id} not found`);
            return undefined;
          }
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        return data;
      } catch (err: any) {
        console.error("Error fetching vehicle by ID:", err);
        setError(err.message || "Erro ao carregar veículo");
        return undefined;
      }
    },
    [token],
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
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const newVehicle = await response.json();

        // Invalidate cache and refresh
        const cacheKey = createCacheKey("vehicles");
        apiCache.delete(cacheKey);

        setVehicles((prev) => [...(prev || []), newVehicle]);
        return newVehicle;
      } catch (err: any) {
        console.error("Error adding vehicle:", err);
        setError(err.message || "Erro ao adicionar veículo");
        return undefined;
      }
    },
    [token],
  );

  const updateVehicle = useCallback(
    async (updatedVehicle: Vehicle) => {
      if (!updatedVehicle.id) {
        setError("ID do veículo é obrigatório");
        return undefined;
      }

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
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const updatedData = await response.json();

        // Invalidate cache and update local state
        const cacheKey = createCacheKey("vehicles");
        apiCache.delete(cacheKey);

        setVehicles((prev) => {
          const index = (prev || []).findIndex(
            (v) => v.id === updatedVehicle.id,
          );
          if (index !== -1) {
            const updatedVehicles = [...(prev || [])];
            updatedVehicles[index] = updatedData;
            return updatedVehicles;
          }
          return prev;
        });

        return updatedData;
      } catch (err: any) {
        console.error("Error updating vehicle:", err);
        setError(err.message || "Erro ao atualizar veículo");
        return undefined;
      }
    },
    [token],
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
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        // Invalidate cache and update local state
        const cacheKey = createCacheKey("vehicles");
        apiCache.delete(cacheKey);

        setVehicles((prev) => (prev || []).filter((v) => v.id !== id));
        return true;
      } catch (err: any) {
        console.error("Error deleting vehicle:", err);
        setError(err.message || "Erro ao deletar veículo");
        return false;
      }
    },
    [token],
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
    ],
  );

  return (
    <VehicleContext.Provider value={contextValue}>
      {children}
    </VehicleContext.Provider>
  );
};

export const useVehicleData = (): VehicleContextType => {
  const context = useContext(VehicleContext);
  if (!context) {
    throw new Error("useVehicleData must be used within a VehicleProvider");
  }
  return context;
};
