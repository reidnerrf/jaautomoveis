import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Vehicle } from '../types.ts';
import { apiCache, createCacheKey } from '../utils/cache';

interface UseTopVehiclesOptions {
	limit?: number;
	periodDays?: number; // 0 = total, >0 = janela de tempo
	cacheTtlMs?: number;
}

interface UseTopVehiclesResult {
	vehicles: Vehicle[];
	loading: boolean;
	error: string | null;
	refresh: () => Promise<void>;
}

const DEFAULT_TTL = 5 * 60 * 1000; // 5 minutos

export const useTopVehicles = (options: UseTopVehiclesOptions = {}): UseTopVehiclesResult => {
	const { limit = 10, periodDays = 30, cacheTtlMs = DEFAULT_TTL } = options;
	const [vehicles, setVehicles] = useState<Vehicle[]>([]);
	const [loading, setLoading] = useState<boolean>(false);
	const [error, setError] = useState<string | null>(null);

	const cacheKey = useMemo(() => createCacheKey('top-vehicles', limit, periodDays), [limit, periodDays]);

	const fetchTop = useCallback(async () => {
		try {
			setLoading(true);
			const cached = apiCache.get<Vehicle[]>(cacheKey);
			if (cached) {
				setVehicles(cached);
				setLoading(false);
				return;
			}

			const params = new URLSearchParams({ limit: String(limit), periodDays: String(periodDays) });
			const response = await fetch(`/api/vehicles/most-viewed?${params.toString()}`, {
				headers: { 'Cache-Control': 'max-age=300' }
			});
			if (!response.ok) throw new Error('Falha ao carregar veículos mais vistos');
			const data: Vehicle[] = await response.json();
			setVehicles(data);
			apiCache.set(cacheKey, data, cacheTtlMs);
		} catch (err: any) {
			setError(err.message || 'Erro desconhecido');
		} finally {
			setLoading(false);
		}
	}, [cacheKey, cacheTtlMs, limit, periodDays]);

	useEffect(() => {
		fetchTop();
	}, [fetchTop]);

	return {
		vehicles,
		loading,
		error,
		refresh: fetchTop
	};
};

export default useTopVehicles;