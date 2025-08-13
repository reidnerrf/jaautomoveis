
import React, { createContext, useContext, useState, ReactNode, useEffect, useCallback } from 'react';
import { Vehicle } from '../types.ts';
import { useAuth } from './useAuth.tsx';

interface VehicleContextType {
  vehicles: Vehicle[];
  getVehicleById: (id: string) => Promise<Vehicle | undefined>;
  addVehicle: (vehicle: Omit<Vehicle, 'id'>) => Promise<void>;
  updateVehicle: (vehicle: Vehicle) => Promise<void>;
  deleteVehicle: (id: string) => Promise<void>;
  loading: boolean;
  error: string | null;
}

const VehicleContext = createContext<VehicleContextType | undefined>(undefined);

export const VehicleProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { token } = useAuth();

  const fetchVehicles = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/vehicles');
      if (!response.ok) throw new Error('Failed to fetch vehicles');
      const data: Vehicle[] = await response.json();
      setVehicles(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchVehicles();
  }, [fetchVehicles]);

  const getVehicleById = useCallback(async (id: string): Promise<Vehicle | undefined> => {
     setLoading(true);
     try {
        const response = await fetch(`/api/vehicles/${id}`);
        if (!response.ok) throw new Error('Failed to fetch vehicle');
        const data: Vehicle = await response.json();
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
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(vehicle),
      });
      if (!response.ok) throw new Error('Failed to add vehicle');
      await fetchVehicles(); // Refetch
    } catch (err: any) {
      setError(err.message);
    }
  }, [token, fetchVehicles]);

  const updateVehicle = useCallback(async (updatedVehicle: Vehicle) => {
    try {
      const response = await fetch(`/api/vehicles/${updatedVehicle.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(updatedVehicle),
      });
      if (!response.ok) throw new Error('Failed to update vehicle');
      await fetchVehicles(); // Refetch
    } catch (err: any) {
      setError(err.message);
    }
  }, [token, fetchVehicles]);

  const deleteVehicle = useCallback(async (id: string) => {
    try {
      const response = await fetch(`/api/vehicles/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!response.ok) throw new Error('Failed to delete vehicle');
      await fetchVehicles(); // Refetch
    } catch (err: any) {
      setError(err.message);
    }
  }, [token, fetchVehicles]);

  return (
    <VehicleContext.Provider value={{ vehicles, getVehicleById, addVehicle, updateVehicle, deleteVehicle, loading, error }}>
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