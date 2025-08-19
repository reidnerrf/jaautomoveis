import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { FiMenu, FiLogOut, FiCalendar, FiMapPin } from "react-icons/fi";
import { useAuth } from "../hooks/useAuth.tsx";
import DarkModeToggle from "./DarkModeToggle.tsx";

interface AdminHeaderProps {
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
}

const AdminHeader: React.FC<AdminHeaderProps> = ({
  sidebarOpen,
  setSidebarOpen,
}) => {
  const { logout } = useAuth();
  const navigate = useNavigate();

  const today = new Date().toLocaleDateString("pt-BR", {
    weekday: "long",
    day: "2-digit",
    month: "long",
    year: "numeric",
  });

  // Função para lidar com o logout
  // Redireciona para a página de login após o logout

  const handleLogout = async () => {
    await logout();
    navigate("/admin/login");
  };

  const adminName = "Admin";

  return (
    <header className="sticky top-0 z-40 flex w-full items-center justify-between bg-white/80 backdrop-blur border-b border-gray-200 px-4 py-3 dark:bg-gray-900/80 dark:border-gray-800">
      <div className="flex items-center gap-3">
        <button
          onClick={(e) => {
            e.stopPropagation();
            setSidebarOpen(!sidebarOpen);
          }}
          aria-label="Toggle sidebar"
          className="inline-flex h-10 w-10 items-center justify-center rounded-md text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800 lg:hidden"
        >
          <FiMenu className="text-xl" />
        </button>

        <Link to="/admin" className="hidden md:flex items-center gap-2 text-gray-700 dark:text-gray-200">
          <img src="/assets/logo.png" alt="Logo" className="h-8 w-auto" loading="lazy" decoding="async" />
          <span className="font-semibold">Painel Admin</span>
        </Link>
      </div>

      <div className="flex items-center gap-4">
        <div className="hidden sm:flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300">
          <FiCalendar />
          <span>{today}</span>
        </div>

        <div className="hidden lg:flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300">
          <FiMapPin />
          <span>Admin • {adminName}</span>
        </div>

        <DarkModeToggle />

        <button
          onClick={handleLogout}
          className="inline-flex items-center gap-2 rounded-md bg-red-600 px-3 py-2 text-sm font-medium text-white hover:bg-red-700"
        >
          <FiLogOut />
          <span className="hidden sm:inline">Sair</span>
        </button>
      </div>
    </header>
  );
};

export default AdminHeader;