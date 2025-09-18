import React, { useEffect, useMemo, useState } from "react";
import VehicleCard from "./VehicleCard.tsx";

interface RecommendationItem {
  id: string;
  name: string;
  make: string;
  model: string;
  year: number;
  price: number;
  km: number;
  color?: string;
  fuel?: string;
  gearbox?: string;
  doors?: number;
  images?: string[];
  views?: number;
}

interface RecommendationsProps {
  title?: string;
  limit?: number;
}

const Skeleton: React.FC = () => (
  <div className="card animate-pulse">
    <div className="card-body space-y-3">
      <div className="h-40 w-full bg-gray-200 rounded-xl" />
      <div className="h-4 w-3/4 bg-gray-200 rounded" />
      <div className="h-4 w-1/2 bg-gray-200 rounded" />
      <div className="h-8 w-full bg-gray-200 rounded" />
    </div>
  </div>
);

const Recommendations: React.FC<RecommendationsProps> = ({ title = "Recomendados para você", limit = 6 }) => {
  const [items, setItems] = useState<RecommendationItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>("");

  useEffect(() => {
    let active = true;
    (async () => {
      setLoading(true);
      setError("");
      try {
        const res = await fetch(`/api/recommendations?limit=${limit}`, { headers: { "Cache-Control": "no-store" }, cache: "no-store" as any });
        if (!res.ok) throw new Error("failed");
        const data = await res.json();
        if (active && Array.isArray(data)) setItems(data);
      } catch (e) {
        if (active) setError("Falha ao carregar recomendações");
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => {
      active = false;
    };
  }, [limit]);

  const content = useMemo(() => {
    if (loading) {
      return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {Array.from({ length: Math.min(6, limit) }).map((_, i) => (
            <Skeleton key={i} />
          ))}
        </div>
      );
    }
    if (error) {
      return (
        <div className="text-center py-8 text-sm text-gray-600 dark:text-gray-300">
          {error}
        </div>
      );
    }
    if (!items.length) {
      return (
        <div className="text-center py-8">
          <div className="text-6xl mb-2">🧭</div>
          <div className="text-gray-600 dark:text-gray-300">Sem recomendações no momento.</div>
        </div>
      );
    }
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {items.slice(0, limit).map((vehicle) => (
          <VehicleCard key={vehicle.id} vehicle={vehicle as any} />
        ))}
      </div>
    );
  }, [loading, error, items, limit]);

  return (
    <section className="my-10">
      <h2 className="text-2xl font-bold mb-4 text-gray-800 dark:text-white">{title}</h2>
      {content}
    </section>
  );
};

export default Recommendations;

