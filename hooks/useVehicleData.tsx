import React, { createContext, useContext, useState, ReactNode, useEffect, useCallback, useMemo } from 'react';
import { Vehicle } from '../types.ts';
import { useAuth } from './useAuth.tsx';
import { apiCache, createCacheKey } from '../utils/cache';

interface VehicleContextType {
  vehicles: Vehicle[];
  getVehicleById: (id: string) => Promise<Vehicle | undefined>;
  addVehicle: (vehicle: Omit<Vehicle, 'id'>) => Promise<Vehicle | undefined>;
  updateVehicle: (vehicle: Vehicle) => Promise<Vehicle | undefined>;
  deleteVehicle: (id: string) => Promise<boolean>;
  loading: boolean;
  error: string | null;
  refreshVehicles: () => Promise<void>;
}

const VehicleContext = createContext<VehicleContextType | undefined>(undefined);

// Cache for individual vehicles
const vehicleCache = new Map<string, { vehicle: Vehicle; timestamp: number }>();
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

export const VehicleProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { token } = useAuth();

  const fetchVehicles = useCallback(async () => {
  try {
    setLoading(true);
    setError(null);

    const cacheKey = createCacheKey('vehicles');
    const cachedData = apiCache.get<Vehicle[]>(cacheKey);

    if (cachedData && Array.isArray(cachedData)) {
      setVehicles(cachedData);
      return;
    }

    const response = await fetch('/api/vehicles', {
      headers: { 'Cache-Control': 'max-age=300' },
    });
    if (!response.ok) throw new Error('Failed to fetch vehicles');

    const data = await response.json();
    const rawVehicles = Array.isArray(data)
      ? data
      : Array.isArray(data?.vehicles)
      ? data.vehicles
      : [];

    // 🔹 Normaliza os veículos (sempre id)
    const normalized = rawVehicles.map((v: any) => ({
      ...v,
      id: v.id || v._id,
    }));

    setVehicles(normalized);

    apiCache.set(cacheKey, normalized, CACHE_DURATION);
    normalized.forEach(vehicle => {
      if (vehicle?.id) {
        vehicleCache.set(vehicle.id, { vehicle, timestamp: Date.now() });
      }
    });
  } catch (err: any) {
    setError(err.message);
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

  const getVehicleById = useCallback(async (id: string): Promise<Vehicle | undefined> => {
  const cached = vehicleCache.get(id);
  if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
    return cached.vehicle;
  }

  try {
    setLoading(true);
    const response = await fetch(`/api/vehicles/${id}`, {
      headers: { 
        'Cache-Control': 'max-age=300',
        ...(token ? { Authorization: `Bearer ${token}` } : {})
      },
    });
    if (!response.ok) throw new Error('Failed to fetch vehicle');
    const data: Vehicle = await response.json();

    if (data?.id) {
      vehicleCache.set(id, { vehicle: data, timestamp: Date.now() });
      setVehicles(prev => {
        // evita duplicar o veículo se já existir
        const exists = prev.some(v => v.id === data.id);
        return exists ? prev.map(v => v.id === data.id ? data : v) : [...prev, data];
      });
    }
    return data;
  } catch (err: any) {
    setError(err.message);
    return undefined;
  } finally {
    setLoading(false);
  }
}, [token]);

  const addVehicle = useCallback(async (vehicle: Omit<Vehicle, 'id'>) => {
    try {
      const response = await fetch('/api/vehicles', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json', 
          ...(token ? { Authorization: `Bearer ${token}` } : {})
        },
        body: JSON.stringify(vehicle),
      });
      if (!response.ok) throw new Error('Failed to add vehicle');

      const newVehicle = await response.json();
      if (newVehicle?.id) {
        setVehicles(prev => [...prev, newVehicle]);
        vehicleCache.set(newVehicle.id, { vehicle: newVehicle, timestamp: Date.now() });
      }
      return newVehicle;
    } catch (err: any) {
      setError(err.message);
      return undefined;
    }
  }, [token]);

  const updateVehicle = useCallback(async (updatedVehicle: Vehicle) => {
    try {
      const response = await fetch(`/api/vehicles/${updatedVehicle.id}`, {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {})
        },
        body: JSON.stringify(updatedVehicle),
      });
      if (!response.ok) throw new Error('Failed to update vehicle');

      setVehicles(prev => prev.map(v => v.id === updatedVehicle.id ? updatedVehicle : v));
      vehicleCache.set(updatedVehicle.id, { vehicle: updatedVehicle, timestamp: Date.now() });

      return updatedVehicle;
    } catch (err: any) {
      setError(err.message);
      return undefined;
    }
  }, [token]);

  const deleteVehicle = useCallback(async (id: string) => {
    try {
      const response = await fetch(`/api/vehicles/${id}`, {
        method: 'DELETE',
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      if (!response.ok) throw new Error('Failed to delete vehicle');

      setVehicles(prev => prev.filter(v => v.id !== id));
      vehicleCache.delete(id);
      return true;
    } catch (err: any) {
      setError(err.message);
      return false;
    }
  }, [token]);

  const contextValue = useMemo(() => ({
    vehicles,
    getVehicleById,
    addVehicle,
    updateVehicle,
    deleteVehicle,
    loading,
    error,
    refreshVehicles,
  }), [vehicles, getVehicleById, addVehicle, updateVehicle, deleteVehicle, loading, error, refreshVehicles]);

  return (
    <VehicleContext.Provider value={contextValue}>
      {children}
    </VehicleContext.Provider>
  );
};

export const useVehicleData = (): VehicleContextType => {
  const context = useContext(VehicleContext);
  if (!context) {
    throw new Error('useVehicleData must be used within a VehicleProvider');
  }
  return context;
};
