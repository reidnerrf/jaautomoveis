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
  const { logout, token } = useAuth();
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
  const initials = adminName
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2);

  return (
    <header className="sticky top-0 z-40 flex w-full bg-white/90 dark:bg-gray-900/80 backdrop-blur-md shadow-sm border-b border-gray-200 dark:border-gray-800">
      <div className="flex flex-grow items-center justify-between py-3 px-4 md:px-6 2xl:px-11">
        {/* Botão menu + logo (mobile) */}
        <div className="flex items-center gap-3 lg:hidden">
          <button
            aria-controls="sidebar"
            onClick={(e) => {
              e.stopPropagation();
              setSidebarOpen(!sidebarOpen);
            }}
            className="block rounded-md border border-gray-300 bg-white dark:bg-gray-800 p-1.5 shadow-sm hover:bg-gray-100 dark:hover:bg-gray-700 transition"
          >
            <FiMenu size={22} />
          </button>
          <Link to="/admin" className="block">
            <img src="/assets/logo.png" alt="Logo" className="h-9 w-auto" />
          </Link>
        </div>

        {/* Informações do sistema */}
        <div className="hidden sm:flex items-center gap-5 px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm bg-gradient-to-r from-gray-50 via-gray-100 to-gray-50 dark:from-gray-800 dark:via-gray-800 dark:to-gray-800">
          {/* Data */}
          <div className="flex items-center gap-2 text-gray-600 dark:text-gray-300 text-sm font-semibold italic">
            <FiCalendar size={18} className="text-gray-500" />
            <span>{today}</span>
          </div>

          <div className="hidden md:flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300">
            <FiMapPin size={16} className="text-red-500" />
            <div className="flex gap-2">
              <span className="px-2 py-0.5 rounded-full bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-300 text-xs font-semibold">
                {"RESENDE-RJ"}
              </span>
            </div>
          </div>

          {/* Status do sistema */}
          <div className="flex items-center gap-2 text-xs font-medium">
            <span className="relative flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
            </span>
            <span className="px-2 py-0.5 bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300 rounded-full text-xs font-semibold">
              Online
            </span>
          </div>
        </div>

        {/* Ações */}
        <div className="flex items-center gap-3">
          <DarkModeToggle />
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 px-3 py-2 rounded-md border border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800 transition"
          >
            <FiLogOut />
            <span className="hidden sm:inline">Sair</span>
          </button>

          {/* Nome + Cargo */}
          <div className="hidden lg:block text-right">
            <span className="block text-sm font-semibold text-gray-800 dark:text-white">
              {adminName}
            </span>
            <span className="block text-xs text-gray-500 dark:text-gray-400">
              Administrador
            </span>
          </div>

          {/* Avatar */}
          <div className="h-10 w-10 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-bold shadow">
            {initials}
          </div>
        </div>
      </div>
    </header>
  );
};

export default AdminHeader;
