import React, { createContext, useContext, useState, ReactNode, useEffect, useCallback, useMemo } from 'react';
import { Vehicle } from '../types.ts';
import { useAuth } from './useAuth.tsx';
import { apiCache, createCacheKey } from '../utils/cache';

interface VehicleContextType {
  vehicles: Vehicle[];
  getVehicleById: (id: string) => Promise<Vehicle | undefined>;
  addVehicle: (vehicle: Omit<Vehicle, 'id'>) => Promise<void>;
  updateVehicle: (vehicle: Vehicle) => Promise<void>;
  deleteVehicle: (id: string) => Promise<void>;
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
      const cacheKey = createCacheKey('vehicles');
      const cachedData = apiCache.get<Vehicle[]>(cacheKey);

      if (cachedData) {
        setVehicles(cachedData);
        setLoading(false);
        return;
      }

      const response = await fetch('/api/vehicles', {
        headers: {
          'Cache-Control': 'max-age=300', // 5 minutes cache
        },
      });
      if (!response.ok) throw new Error('Failed to fetch vehicles');
      const data: Vehicle[] = await response.json();
      setVehicles(data);

      // Update cache with fetched vehicles
      apiCache.set(cacheKey, data, 5 * 60 * 1000); // Cache for 5 minutes
      data.forEach(vehicle => {
        vehicleCache.set(vehicle.id, {
          vehicle,
          timestamp: Date.now()
        });
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
    // Check cache first
    const cached = vehicleCache.get(id);
    if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
      return cached.vehicle;
    }

    setLoading(true);
    try {
      const response = await fetch(`/api/vehicles/${id}`, {
        headers: {
          'Cache-Control': 'max-age=300',
        },
      });
      if (!response.ok) throw new Error('Failed to fetch vehicle');
      const data: Vehicle = await response.json();

      // Update cache
      vehicleCache.set(id, {
        vehicle: data,
        timestamp: Date.now()
      });

      return data;
    } catch (err: any) {
      setError(err.message);
      return undefined;
    } finally {
      setLoading(false);
    }
  }, []);

  const addVehicle = useCallback(async (vehicle: Omit<Vehicle, 'id'>) => {
    try {
      const response = await fetch('/api/vehicles', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json', 
          Authorization: `Bearer ${token}` 
        },
        body: JSON.stringify(vehicle),
      });
      if (!response.ok) throw new Error('Failed to add vehicle');

      // Optimistic update
      const newVehicle = await response.json();
      setVehicles(prev => [...prev, newVehicle]);
      vehicleCache.set(newVehicle.id, {
        vehicle: newVehicle,
        timestamp: Date.now()
      });
    } catch (err: any) {
      setError(err.message);
      throw err; // Re-throw to allow component to handle
    }
  }, [token]);

  const updateVehicle = useCallback(async (updatedVehicle: Vehicle) => {
    try {
      const response = await fetch(`/api/vehicles/${updatedVehicle.id}`, {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json', 
          Authorization: `Bearer ${token}` 
        },
        body: JSON.stringify(updatedVehicle),
      });
      if (!response.ok) throw new Error('Failed to update vehicle');

      // Optimistic update
      setVehicles(prev => prev.map(v => v.id === updatedVehicle.id ? updatedVehicle : v));
      vehicleCache.set(updatedVehicle.id, {
        vehicle: updatedVehicle,
        timestamp: Date.now()
      });
    } catch (err: any) {
      setError(err.message);
      throw err;
    }
  }, [token]);

  const deleteVehicle = useCallback(async (id: string) => {
    try {
      const response = await fetch(`/api/vehicles/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!response.ok) throw new Error('Failed to delete vehicle');

      // Optimistic update
      setVehicles(prev => prev.filter(v => v.id !== id));
      vehicleCache.delete(id);
    } catch (err: any) {
      setError(err.message);
      throw err;
    }
  }, [token]);

  // Memoize context value to prevent unnecessary re-renders
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
  if (context === undefined) {
    throw new Error('useVehicleData must be used within a VehicleProvider');
  }
  return context;
};