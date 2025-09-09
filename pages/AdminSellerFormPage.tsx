import React, { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth.tsx";
import { Seller } from "../types.ts";
import { FiSave, FiArrowLeft, FiUser, FiMail, FiPhone } from "react-icons/fi";
import { motion } from "framer-motion";
import toast from "react-hot-toast";

const AdminSellerFormPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { token } = useAuth();
  const isEditing = Boolean(id);

  const [seller, setSeller] = useState<Omit<Seller, "_id" | "id" | "createdAt" | "updatedAt">>({
    name: "",
    email: "",
    phone: "",
    active: true,
  });

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  const fetchSeller = useCallback(async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/sellers/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const sellerData = await response.json();
        setSeller({
          name: sellerData.name || "",
          email: sellerData.email || "",
          phone: sellerData.phone || "",
          active: sellerData.active !== false,
        });
      } else {
        toast.error("Erro ao carregar vendedor");
        navigate("/admin/sellers");
      }
    } catch (error) {
      toast.error("Erro ao carregar vendedor");
      navigate("/admin/sellers");
    } finally {
      setLoading(false);
    }
  }, [id, token, navigate]);

  useEffect(() => {
    if (isEditing && id) {
      fetchSeller();
    }
  }, [id, isEditing, fetchSeller]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setSeller((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!seller.name.trim()) {
      toast.error("Nome é obrigatório");
      return;
    }

    try {
      setSaving(true);
      const url = isEditing ? `/api/sellers/${id}` : "/api/sellers";
      const method = isEditing ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(seller),
      });

      if (response.ok) {
        toast.success(
          isEditing ? "Vendedor atualizado com sucesso!" : "Vendedor criado com sucesso!"
        );
        navigate("/admin/sellers");
      } else {
        const errorData = await response.json();
        toast.error(errorData.message || "Erro ao salvar vendedor");
      }
    } catch (error) {
      toast.error("Erro ao salvar vendedor");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-main-red"></div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-4 mb-4">
          <button
            onClick={() => navigate("/admin/sellers")}
            className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors duration-200"
          >
            <FiArrowLeft className="text-xl" />
          </button>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
            <FiUser className="text-main-red" />
            {isEditing ? "Editar Vendedor" : "Novo Vendedor"}
          </h1>
        </div>
        <p className="text-gray-600 dark:text-gray-400">
          {isEditing
            ? "Atualize as informações do vendedor"
            : "Preencha as informações para criar um novo vendedor"}
        </p>
      </div>

      {/* Form */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6"
      >
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Name */}
          <div>
            <label
              htmlFor="name"
              className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
            >
              Nome *
            </label>
            <div className="relative">
              <FiUser className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                id="name"
                name="name"
                value={seller.name}
                onChange={handleChange}
                required
                className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-main-red focus:border-transparent dark:bg-gray-700 dark:text-white"
                placeholder="Nome completo do vendedor"
              />
            </div>
          </div>

          {/* Email */}
          <div>
            <label
              htmlFor="email"
              className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
            >
              Email
            </label>
            <div className="relative">
              <FiMail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="email"
                id="email"
                name="email"
                value={seller.email}
                onChange={handleChange}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-main-red focus:border-transparent dark:bg-gray-700 dark:text-white"
                placeholder="email@exemplo.com"
              />
            </div>
          </div>

          {/* Phone */}
          <div>
            <label
              htmlFor="phone"
              className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
            >
              Telefone
            </label>
            <div className="relative">
              <FiPhone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="tel"
                id="phone"
                name="phone"
                value={seller.phone}
                onChange={handleChange}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-main-red focus:border-transparent dark:bg-gray-700 dark:text-white"
                placeholder="(11) 99999-9999"
              />
            </div>
          </div>

          {/* Active Status */}
          <div>
            <div className="flex items-center">
              <input
                type="checkbox"
                id="active"
                name="active"
                checked={seller.active}
                onChange={handleChange}
                className="h-4 w-4 text-main-red focus:ring-main-red border-gray-300 dark:border-gray-600 rounded"
              />
              <label
                htmlFor="active"
                className="ml-2 block text-sm text-gray-700 dark:text-gray-300"
              >
                Vendedor ativo
              </label>
            </div>
            <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
              Vendedores inativos não aparecerão nas listas de seleção
            </p>
          </div>

          {/* Submit Buttons */}
          <div className="flex items-center justify-end gap-4 pt-6 border-t border-gray-200 dark:border-gray-700">
            <button
              type="button"
              onClick={() => navigate("/admin/sellers")}
              className="px-6 py-3 text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors duration-200"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={saving}
              className="px-6 py-3 bg-main-red hover:bg-red-700 text-white rounded-lg font-medium transition-colors duration-200 flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {saving ? (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              ) : (
                <FiSave className="text-lg" />
              )}
              {saving
                ? isEditing
                  ? "Salvando..."
                  : "Criando..."
                : isEditing
                  ? "Salvar Alterações"
                  : "Criar Vendedor"}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
};

export default AdminSellerFormPage;
