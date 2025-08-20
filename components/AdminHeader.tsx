import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FiMenu, FiLogOut, FiCalendar } from "react-icons/fi";
import { useAuth } from "../hooks/useAuth.tsx";
import DarkModeToggle from "./DarkModeToggle.tsx";

interface AdminHeaderProps {
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
}

const AdminHeader: React.FC<AdminHeaderProps> = ({ sidebarOpen, setSidebarOpen }) => {
  const { logout } = useAuth();
  const navigate = useNavigate();

  const [dateTime, setDateTime] = useState<string>("");

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const formatted = `${now.toLocaleDateString("pt-BR", {
        weekday: "long",
        day: "2-digit",
        month: "long",
        year: "numeric",
      })} • ${now.toLocaleTimeString("pt-BR", {
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
      })}`;
      setDateTime(formatted);
    };

    updateTime(); // inicial
    const interval = setInterval(updateTime, 1000); // atualiza a cada 1s
    return () => clearInterval(interval);
  }, []);

  const handleLogout = async () => {
    await logout();
    navigate("/admin/login");
  };

  const adminName = "Ja Automóveis Admin"; // Aqui você pode definir o nome do admin, se houver
  const adminImage = "../assets/semavatar.png"; // Aqui você pode definir a URL da imagem do admin, se houver

  return (
    <header className="sticky top-0 z-40 w-full bg-white/80 backdrop-blur-xl border-b border-gray-200 dark:bg-gray-900/70 dark:border-gray-800 shadow-sm">
      <div className="flex items-center justify-between px-4 py-3 md:px-6">
        {/* Left */}
        <div className="flex items-center gap-4">
          <button
            onClick={(e) => {
              e.stopPropagation();
              setSidebarOpen(!sidebarOpen);
            }}
            aria-label="Toggle sidebar"
            className="inline-flex h-10 w-10 items-center justify-center rounded-xl text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800 transition-all lg:hidden"
          >
            <FiMenu className="text-xl" />
          </button>

          <Link
            to="/admin"
            className="hidden md:flex items-center gap-2 text-gray-700 dark:text-gray-200 group"
          >
            <img
              src="/assets/logo.png"
              alt="Logo"
              className="h-8 w-auto drop-shadow-sm group-hover:scale-105 transition-transform"
              loading="lazy"
              decoding="async"
            />
            <span className="font-semibold tracking-tight text-base">Painel Admin</span>
          </Link>
        </div>

        {/* Right */}
        <div className="flex items-center gap-5">
          {/* Data + hora */}
          <div className="hidden sm:flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300">
            <FiCalendar className="text-gray-500 dark:text-gray-400" />
            <span className="font-medium">{dateTime}</span>
          </div>

          {/* Dark mode */}
          <DarkModeToggle />

          {/* Avatar + logout */}
          <div className="relative flex items-center gap-3">
            <div className="flex items-center gap-2">
              {adminImage ? (
                <img
                  src={adminImage}
                  alt={adminName}
                  className="h-9 w-9 rounded-full object-cover ring-2 ring-gray-300 dark:ring-gray-700"
                />
              ) : (
                <div className="h-9 w-9 flex items-center justify-center rounded-full bg-gradient-to-r from-indigo-500 to-purple-500 text-white font-semibold">
                  {adminName.charAt(0).toUpperCase()}
                </div>
              )}
              <span className="hidden sm:inline text-sm font-medium text-gray-700 dark:text-gray-200">
                {adminName}
              </span>
            </div>
            <button
              onClick={handleLogout}
              className="inline-flex items-center gap-2 rounded-xl bg-red-600 px-3 py-2 text-sm font-medium text-white shadow-sm hover:bg-red-700 active:scale-95 transition-all"
            >
              <FiLogOut />
              <span className="hidden sm:inline">Sair</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default AdminHeader;
