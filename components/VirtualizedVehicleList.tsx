import React, { useState, useRef, useEffect, useCallback } from "react";
import { Vehicle } from "../types";
import VehicleCard from "./VehicleCard";

interface VirtualizedVehicleListProps {
  vehicles: Vehicle[];
  itemHeight?: number;
  containerHeight?: number;
  overscan?: number;
}

const VirtualizedVehicleList: React.FC<VirtualizedVehicleListProps> = ({
  vehicles,
  itemHeight = 400, // Altura estimada de cada card
  containerHeight = 800,
  overscan = 5, // Número de itens extras para renderizar
}) => {
  const [scrollTop, setScrollTop] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);

  // Calcular quais itens devem ser renderizados
  const startIndex = Math.max(0, Math.floor(scrollTop / itemHeight) - overscan);
  const endIndex = Math.min(
    vehicles.length - 1,
    Math.floor((scrollTop + containerHeight) / itemHeight) + overscan,
  );

  // Itens visíveis
  const visibleItems = vehicles.slice(startIndex, endIndex + 1);

  // Altura total da lista
  const totalHeight = vehicles.length * itemHeight;

  // Offset para posicionar os itens
  const offsetY = startIndex * itemHeight;

  const handleScroll = useCallback((e: React.UIEvent<HTMLDivElement>) => {
    setScrollTop(e.currentTarget.scrollTop);
  }, []);

  // Intersection Observer para lazy loading de imagens
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const img = entry.target as HTMLImageElement;
            if (img.dataset.src) {
              img.src = img.dataset.src;
              img.removeAttribute("data-src");
              observer.unobserve(img);
            }
          }
        });
      },
      {
        rootMargin: "50px 0px",
        threshold: 0.1,
      },
    );

    const images = containerRef.current?.querySelectorAll("img[data-src]");
    images?.forEach((img) => observer.observe(img));

    return () => observer.disconnect();
  }, [visibleItems]);

  return (
    <div
      ref={containerRef}
      style={{
        height: containerHeight,
        overflow: "auto",
        position: "relative",
      }}
      onScroll={handleScroll}
      className="virtualized-list"
    >
      <div style={{ height: totalHeight, position: "relative" }}>
        <div
          style={{
            position: "absolute",
            top: offsetY,
            left: 0,
            right: 0,
          }}
        >
          {visibleItems.map((vehicle, index) => (
            <div
              key={vehicle.id}
              style={{ height: itemHeight }}
              className="mb-4"
            >
              <VehicleCard vehicle={vehicle} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

// Hook para otimizar re-renders
export const useVirtualizedList = (vehicles: Vehicle[]) => {
  const [filteredVehicles, setFilteredVehicles] = useState(vehicles);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState<"price" | "year" | "km" | "name">(
    "name",
  );
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");

  // Memoizar filtros e ordenação
  useEffect(() => {
    let filtered = vehicles;

    // Aplicar filtro de busca
    if (searchTerm) {
      filtered = filtered.filter(
        (vehicle) =>
          vehicle.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          vehicle.make.toLowerCase().includes(searchTerm.toLowerCase()) ||
          vehicle.model.toLowerCase().includes(searchTerm.toLowerCase()),
      );
    }

    // Aplicar ordenação
    filtered.sort((a, b) => {
      let aValue: any = a[sortBy];
      let bValue: any = b[sortBy];

      if (sortBy === "name") {
        aValue = a.name.toLowerCase();
        bValue = b.name.toLowerCase();
      }

      if (sortOrder === "asc") {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });

    setFilteredVehicles(filtered);
  }, [vehicles, searchTerm, sortBy, sortOrder]);

  return {
    filteredVehicles,
    searchTerm,
    setSearchTerm,
    sortBy,
    setSortBy,
    sortOrder,
    setSortOrder,
  };
};

export default VirtualizedVehicleList;
