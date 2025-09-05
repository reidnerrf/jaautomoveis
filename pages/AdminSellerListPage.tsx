import React, { useState, useEffect, useMemo, useCallback } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../hooks/useAuth.tsx";
import SellerStats from "../components/SellerStats.tsx";
import {
  FiEdit,
  FiTrash2,
  FiPlus,
  FiSearch,
  FiRefreshCw,
  FiUsers,
  FiMail,
  FiPhone,
  FiCalendar,
} from "react-icons/fi";
import { motion, AnimatePresence } from "framer-motion";
import toast from "react-hot-toast";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

interface Seller {
  _id?: string;
  id?: string;
  name: string;
  email?: string;
  phone?: string;
  active?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

const AdminSellerListPage: React.FC = () => {
  const { token } = useAuth();
  const [sellers, setSellers] = useState<Seller[]>([]);
  const [vehicles, setVehicles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [activeFilter, setActiveFilter] = useState<"all" | "active" | "inactive">("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [sellerPerformance, setSellerPerformance] = useState<any[]>([]);
  const [sellerOfTheMonth, setSellerOfTheMonth] = useState<Seller | null>(null);

  const itemsPerPage = 10;

  const fetchSellers = useCallback(async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/sellers?page=${currentPage}&limit=${itemsPerPage}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setSellers(data.sellers || []);
        setTotalPages(data.pagination?.pages || 1);
      } else {
        toast.error("Erro ao carregar vendedores");
      }
    } catch (error) {
      toast.error("Erro ao carregar vendedores");
    } finally {
      setLoading(false);
    }
  }, [currentPage, token]);

  const fetchVehicles = useCallback(async () => {
    try {
      const response = await fetch("/api/vehicles", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setVehicles(data.vehicles || []);
      }
    } catch (error) {
      console.error("Erro ao buscar veículos:", error);
    }
  }, [token]);

  useEffect(() => {
    fetchSellers();
    fetchVehicles();
  }, [fetchSellers, fetchVehicles]);

  // Fetch vehicles and calculate seller performance
  useEffect(() => {
    const fetchVehiclesAndPerformance = async () => {
      try {
        const response = await fetch("/api/vehicles", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (response.ok) {
          const data = await response.json();
          const vehiclesData = data.vehicles || data || [];

          // Calculate seller performance
          const performance = calculateSellerPerformance(vehiclesData, sellers);
          setSellerPerformance(performance);

          // Find seller of the month
          const topSeller = performance.length > 0 ? performance[0] : null;
          if (topSeller) {
            const seller = sellers.find((s) => (s._id || s.id) === topSeller.sellerId);
            setSellerOfTheMonth(seller || null);
          }
        }
      } catch (error) {
        console.error("Error fetching vehicles:", error);
      }
    };

    if (token && sellers.length > 0) {
      fetchVehiclesAndPerformance();
    }
  }, [token, sellers]);

  const calculateSellerPerformance = (vehicles: any[], sellers: Seller[]) => {
    const performance: any[] = [];

    sellers.forEach((seller) => {
      const sellerId = seller._id || seller.id;
      const soldVehicles = vehicles.filter(
        (v) => v.sellerId === sellerId && v.status === "vendido"
      );
      const totalSales = soldVehicles.reduce((sum, v) => sum + (v.soldPrice || v.price || 0), 0);
      const totalProfit = soldVehicles.reduce((sum, v) => {
        const revenue = v.soldPrice || v.price || 0;
        const cost = v.cost || 0;
        return sum + (revenue - cost);
      }, 0);

      if (soldVehicles.length > 0) {
        performance.push({
          sellerId,
          sellerName: seller.name,
          sales: soldVehicles.length,
          revenue: totalSales,
          profit: totalProfit,
        });
      }
    });

    // Sort by profit (descending)
    return performance.sort((a, b) => b.profit - a.profit);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Tem certeza que deseja excluir este vendedor?")) return;

    try {
      setDeletingId(id);
      const response = await fetch(`/api/sellers/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        toast.success("Vendedor excluído com sucesso");
        fetchSellers();
      } else {
        toast.error("Erro ao excluir vendedor");
      }
    } catch (error) {
      toast.error("Erro ao excluir vendedor");
    } finally {
      setDeletingId(null);
    }
  };

  const filteredSellers = useMemo(() => {
    return sellers.filter((seller) => {
      const matchesSearch =
        seller.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (seller.email && seller.email.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (seller.phone && seller.phone.includes(searchTerm));

      const matchesActive =
        activeFilter === "all" ||
        (activeFilter === "active" && seller.active !== false) ||
        (activeFilter === "inactive" && seller.active === false);

      return matchesSearch && matchesActive;
    });
  }, [sellers, searchTerm, activeFilter]);

  const sellerStats = useMemo(() => {
    const total = sellers.length;
    const active = sellers.filter((s) => s.active !== false).length;
    const inactive = sellers.filter((s) => s.active === false).length;

    return { total, active, inactive };
  }, [sellers]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-main-red"></div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
              <FiUsers className="text-main-red" />
              Vendedores
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-2">
              Gerencie os vendedores da concessionária
            </p>
          </div>
          <Link
            to="/admin/sellers/new"
            className="bg-main-red hover:bg-red-700 text-white px-6 py-3 rounded-lg font-medium transition-colors duration-200 flex items-center gap-2"
          >
            <FiPlus className="text-lg" />
            Novo Vendedor
          </Link>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {sellerStats.total}
              </p>
            </div>
            <FiUsers className="text-2xl text-main-red" />
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Ativos</p>
              <p className="text-2xl font-bold text-green-600">{sellerStats.active}</p>
            </div>
            <FiUsers className="text-2xl text-green-600" />
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Inativos</p>
              <p className="text-2xl font-bold text-red-600">{sellerStats.inactive}</p>
            </div>
            <FiUsers className="text-2xl text-red-600" />
          </div>
        </motion.div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Top Sellers Chart */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6"
        >
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Top Vendedores por Lucro
          </h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={sellerPerformance.slice(0, 5)}
                margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                <XAxis
                  dataKey="sellerName"
                  tick={{ fill: "#6B7280", fontSize: 12 }}
                  angle={-45}
                  textAnchor="end"
                  height={80}
                />
                <YAxis tick={{ fill: "#6B7280" }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#1F2937",
                    border: "none",
                    borderRadius: "8px",
                    color: "white",
                  }}
                  formatter={(value: number) => [
                    new Intl.NumberFormat("pt-BR", {
                      style: "currency",
                      currency: "BRL",
                    }).format(value),
                    "Lucro",
                  ]}
                />
                <Bar dataKey="profit" fill="#10B981" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* Seller of the Month Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-gradient-to-br from-yellow-400 to-orange-500 rounded-lg shadow-md p-6 text-white"
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold">Vendedor do Mês</h3>
            <div className="w-12 h-12 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
              <FiUsers className="text-2xl" />
            </div>
          </div>

          {sellerOfTheMonth ? (
            <div>
              <h4 className="text-2xl font-bold mb-2">{sellerOfTheMonth.name}</h4>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-yellow-100">Vendas:</span>
                  <span className="font-semibold">
                    {sellerPerformance.find(
                      (p) => p.sellerId === (sellerOfTheMonth._id || sellerOfTheMonth.id)
                    )?.sales || 0}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-yellow-100">Receita:</span>
                  <span className="font-semibold">
                    {new Intl.NumberFormat("pt-BR", {
                      style: "currency",
                      currency: "BRL",
                    }).format(
                      sellerPerformance.find(
                        (p) => p.sellerId === (sellerOfTheMonth._id || sellerOfTheMonth.id)
                      )?.revenue || 0
                    )}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-yellow-100">Lucro:</span>
                  <span className="font-semibold">
                    {new Intl.NumberFormat("pt-BR", {
                      style: "currency",
                      currency: "BRL",
                    }).format(
                      sellerPerformance.find(
                        (p) => p.sellerId === (sellerOfTheMonth._id || sellerOfTheMonth.id)
                      )?.profit || 0
                    )}
                  </span>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center">
              <p className="text-yellow-100">Nenhum vendedor com vendas ainda</p>
            </div>
          )}
        </motion.div>
      </div>

      {/* Filters */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-6">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Buscar vendedores..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-main-red focus:border-transparent dark:bg-gray-700 dark:text-white"
              />
            </div>
          </div>
          <div className="flex gap-2">
            <select
              value={activeFilter}
              onChange={(e) => setActiveFilter(e.target.value as "all" | "active" | "inactive")}
              className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-main-red focus:border-transparent dark:bg-gray-700 dark:text-white"
            >
              <option value="all">Todos</option>
              <option value="active">Ativos</option>
              <option value="inactive">Inativos</option>
            </select>
            <button
              onClick={fetchSellers}
              className="px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors duration-200"
            >
              <FiRefreshCw className="text-lg" />
            </button>
          </div>
        </div>
      </div>

      {/* Sellers Table */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Nome
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Email
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Telefone
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Veículos Vendidos
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Criado em
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Ações
                </th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              <AnimatePresence>
                {filteredSellers.map((seller, index) => (
                  <motion.tr
                    key={seller._id || seller.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ delay: index * 0.05 }}
                    className="hover:bg-gray-50 dark:hover:bg-gray-700"
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900 dark:text-white">
                        {seller.name}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                        {seller.email ? (
                          <>
                            <FiMail className="mr-2" />
                            {seller.email}
                          </>
                        ) : (
                          <span className="text-gray-400">-</span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                        {seller.phone ? (
                          <>
                            <FiPhone className="mr-2" />
                            {seller.phone}
                          </>
                        ) : (
                          <span className="text-gray-400">-</span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          seller.active !== false
                            ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                            : "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
                        }`}
                      >
                        {seller.active !== false ? "Ativo" : "Inativo"}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-600 dark:text-gray-400">
                        {(() => {
                          const sellerId = seller._id || seller.id;
                          const soldVehicles = vehicles.filter(
                            (v) => v.sellerId === sellerId && v.status === "vendido"
                          );
                          if (soldVehicles.length === 0) {
                            return <span className="text-gray-400">Nenhum</span>;
                          }
                          return (
                            <div className="space-y-1">
                              <div className="font-medium text-gray-900 dark:text-white">
                                {soldVehicles.length} veículo(s)
                              </div>
                              <div className="text-xs space-y-1">
                                {soldVehicles.slice(0, 2).map((vehicle) => (
                                  <div key={vehicle.id} className="truncate">
                                    {vehicle.make} {vehicle.model} ({vehicle.year})
                                  </div>
                                ))}
                                {soldVehicles.length > 2 && (
                                  <div className="text-gray-500">
                                    +{soldVehicles.length - 2} mais...
                                  </div>
                                )}
                              </div>
                            </div>
                          );
                        })()}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                        <FiCalendar className="mr-2" />
                        {seller.createdAt
                          ? new Date(seller.createdAt).toLocaleDateString("pt-BR")
                          : "-"}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex items-center justify-end gap-2">
                        <Link
                          to={`/admin/sellers/edit/${seller._id || seller.id}`}
                          className="text-main-red hover:text-red-700 transition-colors duration-200"
                        >
                          <FiEdit className="text-lg" />
                        </Link>
                        <button
                          onClick={() => handleDelete(seller._id || seller.id || "")}
                          disabled={deletingId === (seller._id || seller.id)}
                          className="text-red-600 hover:text-red-800 transition-colors duration-200 disabled:opacity-50"
                        >
                          {deletingId === (seller._id || seller.id) ? (
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-red-600"></div>
                          ) : (
                            <FiTrash2 className="text-lg" />
                          )}
                        </button>
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </AnimatePresence>
            </tbody>
          </table>
        </div>

        {filteredSellers.length === 0 && (
          <div className="text-center py-12">
            <FiUsers className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">
              Nenhum vendedor encontrado
            </h3>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              {searchTerm || activeFilter !== "all"
                ? "Tente ajustar os filtros de busca"
                : "Comece criando um novo vendedor"}
            </p>
          </div>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between mt-6">
          <div className="text-sm text-gray-700 dark:text-gray-300">
            Página {currentPage} de {totalPages}
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
              disabled={currentPage === 1}
              className="px-3 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
            >
              Anterior
            </button>
            <button
              onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
              disabled={currentPage === totalPages}
              className="px-3 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
            >
              Próxima
            </button>
          </div>
        </div>
      )}

      {/* Advanced Seller Statistics */}
      <motion.div
        className="mt-8"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
      >
        <SellerStats sellers={sellers} vehicles={vehicles} />
      </motion.div>
    </div>
  );
};

export default AdminSellerListPage;
