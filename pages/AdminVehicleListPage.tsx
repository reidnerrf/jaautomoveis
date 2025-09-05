import React, { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import { useVehicleData } from "../hooks/useVehicleData.tsx";
import { useAuth } from "../hooks/useAuth.tsx";
import VehicleFilters from "../components/VehicleFilters.tsx";
import VehicleStats from "../components/VehicleStats.tsx";
import {
  FiEdit,
  FiTrash2,
  FiPlus,
  FiSearch,
  FiRefreshCw,
  FiEye,
  FiDownload,
  FiFilter,
  FiGrid,
  FiList,
  FiBarChart2,
  FiTrendingUp,
  FiDollarSign,
  FiCheck,
  FiX,
} from "react-icons/fi";
import { motion, AnimatePresence } from "framer-motion";
import { FaCarSide, FaCalendarAlt } from "react-icons/fa";
import { Seller } from "../types.ts";
import toast from "react-hot-toast";

const AdminVehicleListPage: React.FC = () => {
  const { vehicles = [], deleteVehicle, loading, refreshVehicles } = useVehicleData();
  const { token } = useAuth();
  
  // Estados para filtros
  const [filters, setFilters] = useState({
    search: "",
    make: "",
    model: "",
    year: "",
    priceMin: "",
    priceMax: "",
    status: "",
    fuel: "",
    transmission: "",
  });

  // Funções para filtros
  const handleFiltersChange = (newFilters: any) => {
    setFilters(newFilters);
  };

  const handleClearFilters = () => {
    setFilters({
      search: "",
      make: "",
      model: "",
      year: "",
      priceMin: "",
      priceMax: "",
      status: "",
      fuel: "",
      transmission: "",
    });
  };

  // Dados para filtros
  const makes = useMemo(() => {
    const uniqueMakes = [...new Set(vehicles.map(v => v.make).filter(Boolean))];
    return uniqueMakes.sort();
  }, [vehicles]);

  const models = useMemo(() => {
    const uniqueModels = [...new Set(vehicles.map(v => v.model).filter(Boolean))];
    return uniqueModels.sort();
  }, [vehicles]);

  const years = useMemo(() => {
    const uniqueYears = [...new Set(vehicles.map(v => v.year).filter(Boolean))];
    return uniqueYears.sort((a, b) => b - a);
  }, [vehicles]);

  const [nameFilter, setNameFilter] = useState("");
  const [yearFilter, setYearFilter] = useState("");
  const [colorFilter, setColorFilter] = useState("");
  const [makeFilter, setMakeFilter] = useState("");
  const [priceRangeFilter, setPriceRangeFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [sortBy, setSortBy] = useState("recent");
  const [viewMode, setViewMode] = useState<"grid" | "list">("list");
  const [showFilters, setShowFilters] = useState(false);
  const [selectedVehicles, setSelectedVehicles] = useState<string[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [sellers, setSellers] = useState<Seller[]>([]);
  const [showSellModal, setShowSellModal] = useState(false);
  const [selectedVehicleForSale, setSelectedVehicleForSale] = useState<any>(null);
  const [sellForm, setSellForm] = useState({
    sellerId: "",
    soldPrice: "",
  });
  const [selling, setSelling] = useState(false);

  const itemsPerPage = 10;

  const uniqueYears = useMemo(
    () => [...new Set(vehicles.map((v) => v.year || 0))].sort((a, b) => b - a),
    [vehicles]
  );
  const uniqueColors = useMemo(() => [...new Set(vehicles.map((v) => v.color))].sort(), [vehicles]);
  const uniqueMakes = useMemo(() => [...new Set(vehicles.map((v) => v.make))].sort(), [vehicles]);

  // Advanced statistics
  const vehicleStats = useMemo(() => {
    const totalValue = vehicles.reduce((sum, v) => sum + (v.price || 0), 0);
    const averagePrice = vehicles.length ? totalValue / vehicles.length : 0;
    const averageYear =
      vehicles.reduce((sum, v) => sum + (v.year || 0), 0) / (vehicles.length || 1);
    const averageKm = vehicles.reduce((sum, v) => sum + (v.km || 0), 0) / (vehicles.length || 1);

    const makeDistribution = vehicles.reduce(
      (acc, v) => {
        const make = v.make || "";
        acc[make] = (acc[make] || 0) + 1;
        return acc;
      },
      {} as Record<string, number>
    );

    const priceRanges = {
      "até 30k": vehicles.filter((v) => (v.price || 0) <= 30000).length,
      "30k-60k": vehicles.filter((v) => (v.price || 0) > 30000 && (v.price || 0) <= 60000).length,
      "60k-100k": vehicles.filter((v) => (v.price || 0) > 60000 && (v.price || 0) <= 100000).length,
      "100k+": vehicles.filter((v) => (v.price || 0) > 100000).length,
    };

    return {
      total: vehicles.length,
      totalValue,
      averagePrice,
      averageYear: Math.round(averageYear),
      averageKm: Math.round(averageKm),
      makeDistribution,
      priceRanges,
      mostExpensive:
        vehicles.length > 0
          ? vehicles.reduce((max, v) => ((v.price || 0) > (max.price || 0) ? v : max))
          : null,
      cheapest:
        vehicles.length > 0
          ? vehicles.reduce((min, v) => ((v.price || 0) < (min.price || 0) ? v : min))
          : null,
    };
  }, [vehicles]);

  // Fetch sellers
  React.useEffect(() => {
    const fetchSellers = async () => {
      try {
        const response = await fetch("/api/sellers", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        if (response.ok) {
          const data = await response.json();
          setSellers(data.sellers || []);
        }
      } catch (error) {
        console.error("Error fetching sellers:", error);
      }
    };

    if (token) {
      fetchSellers();
    }
  }, [token]);

  const filteredVehicles = useMemo(() => {
    return vehicles
      .filter((vehicle) => {
        const nameMatch =
          (vehicle.name || vehicle.title || "").toLowerCase().includes(nameFilter.toLowerCase()) ||
          (vehicle.make || "").toLowerCase().includes(nameFilter.toLowerCase()) ||
          (vehicle.model || "").toLowerCase().includes(nameFilter.toLowerCase());
        const yearMatch = !yearFilter || (vehicle.year || 0) === parseInt(yearFilter, 10);
        const colorMatch = !colorFilter || vehicle.color === colorFilter;
        const makeMatch = !makeFilter || (vehicle.make || "") === makeFilter;
        const priceMatch =
          !priceRangeFilter ||
          (priceRangeFilter === "30000" && (vehicle.price || 0) <= 30000) ||
          (priceRangeFilter === "30000-60000" &&
            (vehicle.price || 0) > 30000 &&
            (vehicle.price || 0) <= 60000) ||
          (priceRangeFilter === "60000-100000" &&
            (vehicle.price || 0) > 60000 &&
            (vehicle.price || 0) <= 100000) ||
          (priceRangeFilter === "100000" && (vehicle.price || 0) > 100000);

        return nameMatch && yearMatch && colorMatch && makeMatch && priceMatch;
      })
      .sort((a, b) => {
        switch (sortBy) {
          case "name":
            return (a.name || a.title || "").localeCompare(b.name || b.title || "");
          case "price-asc":
            return (a.price || 0) - (b.price || 0);
          case "price-desc":
            return (b.price || 0) - (a.price || 0);
          case "year-desc":
            return (b.year || 0) - (a.year || 0);
          case "year-asc":
            return (a.year || 0) - (b.year || 0);
          case "km-asc":
            return (a.km || 0) - (b.km || 0);
          case "km-desc":
            return (b.km || 0) - (a.km || 0);
          default:
            return 0;
        }
      });
  }, [vehicles, nameFilter, yearFilter, colorFilter, makeFilter, priceRangeFilter, sortBy]);

  const totalPages = Math.ceil(filteredVehicles.length / itemsPerPage);
  const currentVehicles = filteredVehicles.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const clearFilters = () => {
    setNameFilter("");
    setYearFilter("");
    setColorFilter("");
    setMakeFilter("");
    setPriceRangeFilter("");
    setStatusFilter("");
    setSortBy("recent");
    setCurrentPage(1);
  };

  const handleDelete = (id: string, name: string) => {
    if (window.confirm(`Tem certeza que deseja excluir "${name}"?`)) {
      deleteVehicle(id);
    }
  };

  const handleSellClick = (vehicle: any) => {
    setSelectedVehicleForSale(vehicle);
    setSellForm({
      sellerId: "",
      soldPrice: vehicle.price?.toString() || "",
    });
    setShowSellModal(true);
  };

  const handleSellSubmit = async () => {
    if (!sellForm.sellerId || !sellForm.soldPrice) {
      toast.error("Selecione um vendedor e informe o preço de venda");
      return;
    }

    try {
      setSelling(true);
      const response = await fetch(`/api/vehicles/${selectedVehicleForSale.id}/sell`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          sellerId: sellForm.sellerId,
          soldPrice: parseFloat(sellForm.soldPrice),
        }),
      });

      if (response.ok) {
        toast.success("Veículo marcado como vendido com sucesso!");
        setShowSellModal(false);
        setSelectedVehicleForSale(null);
        setSellForm({ sellerId: "", soldPrice: "" });
        // Refresh the vehicle list using the hook's refresh method
        await refreshVehicles();
      } else {
        const errorData = await response.json();
        toast.error(errorData.message || "Erro ao marcar veículo como vendido");
      }
    } catch (error) {
      toast.error("Erro ao marcar veículo como vendido");
    } finally {
      setSelling(false);
    }
  };

  const closeSellModal = () => {
    setShowSellModal(false);
    setSelectedVehicleForSale(null);
    setSellForm({ sellerId: "", soldPrice: "" });
  };

  const handleBulkDelete = () => {
    if (selectedVehicles.length === 0) return;
    if (
      window.confirm(
        `Tem certeza que deseja excluir ${selectedVehicles.length} veículos selecionados?`
      )
    ) {
      selectedVehicles.forEach((id) => {
        const vehicle = vehicles.find((v) => v.id === id);
        if (vehicle) deleteVehicle(id);
      });
      setSelectedVehicles([]);
    }
  };

  const exportToCSV = () => {
    const headers = ["Nome", "Marca", "Modelo", "Ano", "Preço", "KM", "Cor", "Combustível"];
    const csvData = filteredVehicles.map((vehicle) => [
      vehicle.name,
      vehicle.make,
      vehicle.model,
      vehicle.year,
      vehicle.price,
      vehicle.km,
      vehicle.color,
      vehicle.fuel || "Flex",
    ]);

    const csvContent = [headers, ...csvData].map((row) => row.join(",")).join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", `estoque_${new Date().toISOString().split("T")[0]}.csv`);
    link.click();
  };

  const filterCount = [
    nameFilter,
    yearFilter,
    colorFilter,
    makeFilter,
    priceRangeFilter,
    statusFilter,
  ].filter(Boolean).length;

  return (
    <div className="mx-auto max-w-screen-2xl p-4 md:p-6 2xl:p-10 space-y-8">
      {/* Header with Statistics */}
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 mb-8">
          <div>
            <h2 className="text-4xl font-black text-gray-900 dark:text-white tracking-tight mb-2">
              🚗 Gerenciamento de Estoque
            </h2>
            <p className="text-gray-600 dark:text-gray-400 text-lg">
              Gerencie seu inventário de veículos com facilidade
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <button
              onClick={exportToCSV}
              className="flex items-center gap-2 bg-green-500 hover:bg-green-600 text-white px-4 py-3 rounded-xl font-semibold transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105"
            >
              <FiDownload />
              Exportar CSV
            </button>

            {selectedVehicles.length > 0 && (
              <button
                onClick={handleBulkDelete}
                className="flex items-center gap-2 bg-red-500 hover:bg-red-600 text-white px-4 py-3 rounded-xl font-semibold transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105"
              >
                <FiTrash2 />
                Excluir Selecionados ({selectedVehicles.length})
              </button>
            )}

            <Link
              to="/admin/vehicles/new"
              className="flex items-center gap-2 bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 rounded-xl font-semibold transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105"
            >
              <FiPlus size={20} />
              Adicionar Veículo
            </Link>
          </div>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-6 gap-6 mb-8">
          <motion.div
            className="bg-gradient-to-r from-blue-500 to-blue-600 text-white p-6 rounded-2xl shadow-xl"
            whileHover={{ scale: 1.05 }}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-100 text-sm font-medium">Total de Veículos</p>
                <p className="text-3xl font-black">{vehicleStats.total}</p>
              </div>
              <FaCarSide className="text-4xl text-blue-200" />
            </div>
          </motion.div>

          <motion.div
            className="bg-gradient-to-r from-green-500 to-green-600 text-white p-6 rounded-2xl shadow-xl"
            whileHover={{ scale: 1.05 }}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-100 text-sm font-medium">Valor Total</p>
                <p className="text-2xl font-black">
                  {new Intl.NumberFormat("pt-BR", {
                    style: "currency",
                    currency: "BRL",
                    notation: "compact",
                  }).format(vehicleStats.totalValue)}
                </p>
              </div>
              <FiDollarSign className="text-4xl text-green-200" />
            </div>
          </motion.div>

          <motion.div
            className="bg-gradient-to-r from-purple-500 to-purple-600 text-white p-6 rounded-2xl shadow-xl"
            whileHover={{ scale: 1.05 }}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-purple-100 text-sm font-medium">Preço Médio</p>
                <p className="text-2xl font-black">
                  {new Intl.NumberFormat("pt-BR", {
                    style: "currency",
                    currency: "BRL",
                    notation: "compact",
                  }).format(vehicleStats.averagePrice)}
                </p>
              </div>
              <FiTrendingUp className="text-4xl text-purple-200" />
            </div>
          </motion.div>

          <motion.div
            className="bg-gradient-to-r from-yellow-500 to-yellow-600 text-white p-6 rounded-2xl shadow-xl"
            whileHover={{ scale: 1.05 }}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-yellow-100 text-sm font-medium">Ano Médio</p>
                <p className="text-3xl font-black">{vehicleStats.averageYear}</p>
              </div>
              <FaCalendarAlt className="text-4xl text-yellow-200" />
            </div>
          </motion.div>

          <motion.div
            className="bg-gradient-to-r from-indigo-500 to-indigo-600 text-white p-6 rounded-2xl shadow-xl"
            whileHover={{ scale: 1.05 }}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-indigo-100 text-sm font-medium">KM Médio</p>
                <p className="text-2xl font-black">
                  {new Intl.NumberFormat("pt-BR", {
                    notation: "compact",
                  }).format(vehicleStats.averageKm)}
                </p>
              </div>
              <FiBarChart2 className="text-4xl text-indigo-200" />
            </div>
          </motion.div>

          <motion.div
            className="bg-gradient-to-r from-red-500 to-red-600 text-white p-6 rounded-2xl shadow-xl"
            whileHover={{ scale: 1.05 }}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-red-100 text-sm font-medium">Filtrados</p>
                <p className="text-3xl font-black">{filteredVehicles.length}</p>
              </div>
              <FiFilter className="text-4xl text-red-200" />
            </div>
          </motion.div>
        </div>
      </motion.div>

      {/* Search and Filters */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
        <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-xl p-6 border border-gray-200 dark:border-gray-700">
          {/* Search and View Controls */}
          <div className="flex flex-col lg:flex-row gap-4 items-center justify-between mb-6">
            <div className="relative flex-1 max-w-md">
              <FiSearch className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 text-xl" />
              <input
                type="text"
                placeholder="Buscar por nome, marca ou modelo..."
                value={nameFilter}
                onChange={(e) => setNameFilter(e.target.value)}
                className="w-full pl-12 pr-4 py-3 text-lg rounded-xl border-2 border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-4 focus:ring-blue-500/30 focus:border-blue-500 transition-all duration-300"
              />
            </div>

            <div className="flex items-center gap-4">
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="flex items-center gap-2 px-4 py-3 bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-xl text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 transition-all duration-300 relative"
              >
                <FiFilter />
                <span>Filtros</span>
                {filterCount > 0 && (
                  <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold">
                    {filterCount}
                  </span>
                )}
              </button>

              <div className="flex bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-xl p-1">
                <button
                  onClick={() => setViewMode("list")}
                  className={`p-2 rounded-lg transition-all duration-300 ${
                    viewMode === "list"
                      ? "bg-blue-500 text-white"
                      : "text-gray-500 hover:text-gray-700 dark:text-gray-400"
                  }`}
                >
                  <FiList />
                </button>
                <button
                  onClick={() => setViewMode("grid")}
                  className={`p-2 rounded-lg transition-all duration-300 ${
                    viewMode === "grid"
                      ? "bg-blue-500 text-white"
                      : "text-gray-500 hover:text-gray-700 dark:text-gray-400"
                  }`}
                >
                  <FiGrid />
                </button>
              </div>
            </div>
          </div>

          {/* Advanced Filters */}
          <AnimatePresence>
            {showFilters ? (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="overflow-hidden"
              >
                <div className="pt-6 border-t border-gray-200 dark:border-gray-700">
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-4 mb-6">
                    <select
                      value={makeFilter}
                      onChange={(e) => setMakeFilter(e.target.value)}
                      className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                    >
                      <option value="">Todas as Marcas</option>
                      {uniqueMakes.map((make) => (
                        <option key={make} value={make}>
                          {make}
                        </option>
                      ))}
                    </select>

                    <select
                      value={yearFilter}
                      onChange={(e) => setYearFilter(e.target.value)}
                      className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                    >
                      <option value="">Todos os Anos</option>
                      {uniqueYears.map((year) => (
                        <option key={year} value={year}>
                          {year}
                        </option>
                      ))}
                    </select>

                    <select
                      value={colorFilter}
                      onChange={(e) => setColorFilter(e.target.value)}
                      className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                    >
                      <option value="">Todas as Cores</option>
                      {uniqueColors.map((color) => (
                        <option key={color} value={color}>
                          {color}
                        </option>
                      ))}
                    </select>

                    <select
                      value={priceRangeFilter}
                      onChange={(e) => setPriceRangeFilter(e.target.value)}
                      className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                    >
                      <option value="">Todas as Faixas</option>
                      <option value="30000">Até R$ 30.000</option>
                      <option value="30000-60000">R$ 30.000 - R$ 60.000</option>
                      <option value="60000-100000">R$ 60.000 - R$ 100.000</option>
                      <option value="100000">Acima de R$ 100.000</option>
                    </select>

                    <select
                      value={sortBy}
                      onChange={(e) => setSortBy(e.target.value)}
                      className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                    >
                      <option value="recent">Mais Recentes</option>
                      <option value="name">Nome A-Z</option>
                      <option value="price-asc">Menor Preço</option>
                      <option value="price-desc">Maior Preço</option>
                      <option value="year-desc">Mais Novo</option>
                      <option value="year-asc">Mais Antigo</option>
                      <option value="km-asc">Menor KM</option>
                      <option value="km-desc">Maior KM</option>
                    </select>
                  </div>

                  <button
                    onClick={clearFilters}
                    className="flex items-center gap-2 px-4 py-2 bg-red-500 text-white rounded-xl hover:bg-red-600 transition-all duration-300 font-semibold"
                  >
                    <FiRefreshCw />
                    Limpar Filtros
                  </button>
                </div>
              </motion.div>
            ) : null}
          </AnimatePresence>
        </div>
      </motion.div>

      {/* Vehicle Table/Grid */}
      {loading ? (
        <div className="flex justify-center items-center py-20">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
        </div>
      ) : viewMode === "list" ? (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl overflow-hidden border border-gray-200 dark:border-gray-700"
        >
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50 dark:bg-gray-700 text-left text-gray-700 dark:text-gray-300 border-b border-gray-200 dark:border-gray-600">
                  <th className="py-4 px-6 font-semibold">
                    <input
                      type="checkbox"
                      checked={
                        selectedVehicles.length === currentVehicles.length &&
                        currentVehicles.length > 0
                      }
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedVehicles(currentVehicles.map((v) => v.id));
                        } else {
                          setSelectedVehicles([]);
                        }
                      }}
                      className="rounded"
                    />
                  </th>
                  <th className="py-4 px-6 font-semibold">Veículo</th>
                  <th className="py-4 px-6 font-semibold">Detalhes</th>
                  <th className="py-4 px-6 font-semibold">Preço</th>
                  <th className="py-4 px-6 font-semibold hidden lg:table-cell">Status</th>
                  <th className="py-4 px-6 font-semibold">Ações</th>
                </tr>
              </thead>
              <tbody>
                {currentVehicles.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="text-center py-12 text-gray-500 dark:text-gray-400">
                      Nenhum veículo encontrado.
                    </td>
                  </tr>
                ) : (
                  currentVehicles.map((vehicle, index) => (
                    <motion.tr
                      key={vehicle.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors border-b border-gray-100 dark:border-gray-700"
                    >
                      <td className="py-4 px-6">
                        <input
                          type="checkbox"
                          checked={selectedVehicles.includes(vehicle.id)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setSelectedVehicles([...selectedVehicles, vehicle.id]);
                            } else {
                              setSelectedVehicles(
                                selectedVehicles.filter((id) => id !== vehicle.id)
                              );
                            }
                          }}
                          className="rounded"
                        />
                      </td>
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-4">
                          <img
                            src={vehicle.images[0]}
                            alt={vehicle.name}
                            className="h-16 w-24 rounded-lg object-cover shadow-md"
                          />
                          <div>
                            <p className="font-bold text-gray-900 dark:text-white text-lg">
                              {vehicle.name}
                            </p>
                            <p className="text-gray-600 dark:text-gray-400">
                              {vehicle.make} {vehicle.model}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        <div className="space-y-1 text-sm">
                          <p>
                            <span className="font-semibold">Ano:</span> {vehicle.year}
                          </p>
                          <p>
                            <span className="font-semibold">KM:</span> {vehicle.km.toLocaleString()}
                          </p>
                          <p>
                            <span className="font-semibold">Cor:</span> {vehicle.color}
                          </p>
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        <p className="text-2xl font-black text-green-600 dark:text-green-400">
                          {new Intl.NumberFormat("pt-BR", {
                            style: "currency",
                            currency: "BRL",
                          }).format(vehicle.price)}
                        </p>
                      </td>
                      <td className="py-4 px-6 hidden lg:table-cell">
                        <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${
                          vehicle.status === "vendido" 
                            ? "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400"
                            : "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400"
                        }`}>
                          {vehicle.status === "vendido" ? "Vendido" : "Disponível"}
                        </span>
                      </td>
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-2">
                          <Link
                            to={vehicle.id ? `/vehicle/${vehicle.id}` : "#"}
                            className="p-2 rounded-lg bg-blue-100 text-blue-600 hover:bg-blue-200 dark:bg-blue-900/30 dark:text-blue-400 transition-colors"
                            title="Visualizar"
                          >
                            <FiEye size={18} />
                          </Link>
                          <Link
                            to={`/admin/vehicles/edit/${vehicle.id}`}
                            className="p-2 rounded-lg bg-yellow-100 text-yellow-600 hover:bg-yellow-200 dark:bg-yellow-900/30 dark:text-yellow-400 transition-colors"
                            title="Editar"
                          >
                            <FiEdit size={18} />
                          </Link>
                          {vehicle.status !== "vendido" && (
                            <button
                              onClick={() => handleSellClick(vehicle)}
                              className="p-2 rounded-lg bg-green-100 text-green-600 hover:bg-green-200 dark:bg-green-900/30 dark:text-green-400 transition-colors"
                              title="Marcar como Vendido"
                            >
                              <FiCheck size={18} />
                            </button>
                          )}
                          <button
                            onClick={() => handleDelete(vehicle.id, vehicle.name)}
                            className="p-2 rounded-lg bg-red-100 text-red-600 hover:bg-red-200 dark:bg-red-900/30 dark:text-red-400 transition-colors"
                            title="Excluir"
                          >
                            <FiTrash2 size={18} />
                          </button>
                        </div>
                      </td>
                    </motion.tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </motion.div>
      ) : (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
        >
          {currentVehicles.map((vehicle, index) => (
            <motion.div
              key={vehicle.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden hover:shadow-xl transition-all duration-300"
            >
              <div className="relative">
                <img
                  src={vehicle.images[0]}
                  alt={vehicle.name}
                  className="w-full h-48 object-cover"
                />
                <div className="absolute top-3 left-3">
                  <input
                    type="checkbox"
                    checked={selectedVehicles.includes(vehicle.id)}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setSelectedVehicles([...selectedVehicles, vehicle.id]);
                      } else {
                        setSelectedVehicles(selectedVehicles.filter((id) => id !== vehicle.id));
                      }
                    }}
                    className="rounded w-5 h-5"
                  />
                </div>
              </div>
              <div className="p-4">
                <h3 className="font-bold text-gray-900 dark:text-white text-lg mb-2">
                  {vehicle.name}
                </h3>
                <p className="text-gray-600 dark:text-gray-400 mb-2">
                  {vehicle.make} {vehicle.model} • {vehicle.year}
                </p>
                <p className="text-2xl font-black text-green-600 dark:text-green-400 mb-4">
                  {new Intl.NumberFormat("pt-BR", {
                    style: "currency",
                    currency: "BRL",
                  }).format(vehicle.price)}
                </p>
                <div className="flex justify-between items-center">
                  <div className="flex gap-2">
                    <Link
                      to={vehicle.id ? `/vehicle/${vehicle.id}` : "#"}
                      className="p-2 rounded-lg bg-blue-100 text-blue-600 hover:bg-blue-200 transition-colors"
                    >
                      <FiEye size={16} />
                    </Link>
                    <Link
                      to={`/admin/vehicles/edit/${vehicle.id}`}
                      className="p-2 rounded-lg bg-yellow-100 text-yellow-600 hover:bg-yellow-200 transition-colors"
                    >
                      <FiEdit size={16} />
                    </Link>
                    {vehicle.status !== "vendido" && (
                      <button
                        onClick={() => handleSellClick(vehicle)}
                        className="p-2 rounded-lg bg-green-100 text-green-600 hover:bg-green-200 transition-colors"
                        title="Marcar como Vendido"
                      >
                        <FiCheck size={16} />
                      </button>
                    )}
                    <button
                      onClick={() => handleDelete(vehicle.id, vehicle.name)}
                      className="p-2 rounded-lg bg-red-100 text-red-600 hover:bg-red-200 transition-colors"
                    >
                      <FiTrash2 size={16} />
                    </button>
                  </div>
                  <span className={`text-xs px-2 py-1 rounded-full ${
                    vehicle.status === "vendido" 
                      ? "bg-red-100 text-red-800"
                      : "bg-green-100 text-green-800"
                  }`}>
                    {vehicle.status === "vendido" ? "Vendido" : "Disponível"}
                  </span>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex justify-center mt-8"
        >
          <div className="flex items-center gap-2">
            <button
              onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
              disabled={currentPage === 1}
              className="px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              Anterior
            </button>

            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
              const page = i + Math.max(1, Math.min(currentPage - 2, totalPages - 4));
              return (
                <button
                  key={page}
                  onClick={() => setCurrentPage(page)}
                  className={`px-3 py-2 rounded-lg font-semibold transition-all ${
                    currentPage === page
                      ? "bg-blue-500 text-white"
                      : "border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700"
                  }`}
                >
                  {page}
                </button>
              );
            })}

            <button
              onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
              disabled={currentPage === totalPages}
              className="px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              Próxima
            </button>
          </div>
        </motion.div>
      )}

      {/* Sell Modal */}
      <AnimatePresence>
        {showSellModal && selectedVehicleForSale ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
            onClick={closeSellModal}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full p-6"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Marcar como Vendido
                </h3>
                <button
                  onClick={closeSellModal}
                  className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                >
                  <FiX size={20} />
                </button>
              </div>

              <div className="mb-4">
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                  Veículo: <span className="font-medium">{selectedVehicleForSale.name}</span>
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Preço original:{" "}
                  <span className="font-medium">
                    {new Intl.NumberFormat("pt-BR", {
                      style: "currency",
                      currency: "BRL",
                    }).format(selectedVehicleForSale.price)}
                  </span>
                </p>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Vendedor *
                  </label>
                  <select
                    value={sellForm.sellerId}
                    onChange={(e) => setSellForm({ ...sellForm, sellerId: e.target.value })}
                    className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-main-red focus:border-transparent dark:bg-gray-700 dark:text-white"
                    required
                  >
                    <option value="">Selecione um vendedor</option>
                    {sellers
                      .filter((seller) => seller.active !== false)
                      .map((seller) => (
                        <option key={seller._id || seller.id} value={seller._id || seller.id}>
                          {seller.name}
                        </option>
                      ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Preço de Venda *
                  </label>
                  <input
                    type="number"
                    value={sellForm.soldPrice}
                    onChange={(e) => setSellForm({ ...sellForm, soldPrice: e.target.value })}
                    className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-main-red focus:border-transparent dark:bg-gray-700 dark:text-white"
                    placeholder="0.00"
                    step="0.01"
                    min="0"
                    required
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 mt-6">
                <button
                  type="button"
                  onClick={closeSellModal}
                  className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleSellSubmit}
                  disabled={selling}
                  className="px-6 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition-colors duration-200 flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {selling ? (
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  ) : (
                    <FiCheck size={16} />
                  )}
                  {selling ? "Processando..." : "Confirmar Venda"}
                </button>
              </div>
            </motion.div>
          </motion.div>
        ) : null}
      </AnimatePresence>

      {/* Advanced Filters */}
      <motion.div
        className="mt-8"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <VehicleFilters
          filters={filters}
          onFiltersChange={handleFiltersChange}
          onClearFilters={handleClearFilters}
          makes={makes}
          models={models}
          years={years}
        />
      </motion.div>

      {/* Vehicle Statistics */}
      <motion.div
        className="mt-8"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
      >
        <VehicleStats vehicles={vehicles} />
      </motion.div>
    </div>
  );
};

export default AdminVehicleListPage;
