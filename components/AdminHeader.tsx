import React from 'react';
import { Link } from 'react-router-dom';
import { FiMenu, FiCalendar } from 'react-icons/fi';
import { useAuth } from '../hooks/useAuth.tsx';

interface AdminHeaderProps {
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
}

const AdminHeader: React.FC<AdminHeaderProps> = ({ sidebarOpen, setSidebarOpen }) => {
  useAuth();

  const today = new Date().toLocaleDateString('pt-BR', {
    weekday: 'long',
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  });

  return (
    <header className="sticky top-0 z-40 flex w-full bg-white shadow-sm border-b border-gray-200">
      <div className="flex flex-grow items-center justify-between py-4 px-4 md:px-6 2xl:px-11">
        
        {/* Botão menu e logo para mobile */}
        <div className="flex items-center gap-3 lg:hidden">
          <button
            aria-controls="sidebar"
            onClick={(e) => {
              e.stopPropagation();
              setSidebarOpen(!sidebarOpen);
            }}
            className="block rounded-md border border-gray-300 bg-white p-1.5 shadow-sm hover:bg-gray-100 transition"
          >
            <FiMenu size={22} />
          </button>
          <Link to="/admin" className="block">
            <img src="/assets/logo.png" alt="Logo" className="h-10 w-auto" />
          </Link>
        </div>

        {/* Informação do sistema */}
        <div className="hidden sm:flex items-center gap-4 px-4 py-2 rounded-lg border border-gray-200 shadow-sm bg-gradient-to-r from-gray-50 via-gray-100 to-gray-50">
          {/* Data */}
          <div className="flex items-center gap-2 text-gray-700 text-sm font-medium">
            <FiCalendar size={18} className="text-gray-500" />
            <span>{today}</span>
          </div>

          {/* Status do sistema */}
          <div className="flex items-center gap-2 text-sm font-medium text-gray-700">
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-green-500"></span>
            </span>
            Sistema Online
          </div>
        </div>

        {/* Perfil do usuário */}
        <div className="flex items-center gap-3">
          <div className="hidden lg:block text-right">
            <span className="block text-sm font-semibold text-gray-800">
              Admin
            </span>
            <span className="block text-xs text-gray-500">
              Administrador
            </span>
          </div>
          <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center text-gray-500 font-bold">
            A
          </div>
        </div>
      </div>
    </header>
  );
};

export default AdminHeader;
