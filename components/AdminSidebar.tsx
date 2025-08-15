import React, { useEffect, useRef } from 'react';
import { NavLink, Link, useNavigate } from 'react-router-dom';
import { FiGrid, FiList, FiLogOut } from 'react-icons/fi';
import { useAuth } from '../hooks/useAuth.tsx';

interface AdminSidebarProps {
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
}

const AdminSidebar: React.FC<AdminSidebarProps> = ({ sidebarOpen, setSidebarOpen }) => {
  const navigate = useNavigate();
  const { logout } = useAuth();

  const trigger = useRef<any>(null);
  const sidebar = useRef<any>(null);

  // Fechar no clique fora
  useEffect(() => {
    const clickHandler = ({ target }: MouseEvent) => {
      if (!sidebar.current || !trigger.current) return;
      if (!sidebarOpen || sidebar.current.contains(target) || trigger.current.contains(target)) return;
      setSidebarOpen(false);
    };
    document.addEventListener('click', clickHandler);
    return () => document.removeEventListener('click', clickHandler);
  });

  // Fechar com ESC
  useEffect(() => {
    const keyHandler = ({ keyCode }: KeyboardEvent) => {
      if (!sidebarOpen || keyCode !== 27) return;
      setSidebarOpen(false);
    };
    document.addEventListener('keydown', keyHandler);
    return () => document.removeEventListener('keydown', keyHandler);
  });

  const handleLogout = () => {
    logout();
    navigate('/admin/login');
  };

  const getNavLinkClass = ({ isActive }: { isActive: boolean }) =>
    `group relative flex items-center gap-3 rounded-lg py-2.5 px-4 font-medium transition-all duration-300 ${
      isActive
        ? 'bg-gray-700 text-white shadow-md'
        : 'text-gray-300 hover:bg-gray-600 hover:text-white hover:shadow'
    }`;

  return (
    <aside
      ref={sidebar}
      className={`absolute left-0 top-0 z-50 flex h-screen w-60 flex-col overflow-y-hidden bg-gray-900 shadow-xl duration-300 ease-linear lg:static lg:translate-x-0 ${
        sidebarOpen ? 'translate-x-0' : '-translate-x-full'
      }`}
    >
      {/* Header */}
      <div className="flex flex-col items-center px-6 py-5 border-b border-gray-800">
        <Link to="/admin" className="flex flex-col items-center">
          <img src="/assets/logo.png" alt="Logo" className="h-12 w-auto" />
          <span className="text-sm text-gray-300 mt-1 font-semibold">Painel Admin</span>
        </Link>

        <button
          ref={trigger}
          onClick={() => setSidebarOpen(!sidebarOpen)}
          aria-controls="sidebar"
          aria-expanded={sidebarOpen}
          className="absolute right-4 top-4 block lg:hidden text-gray-400 hover:text-white"
        >
          ✕
        </button>
      </div>

      {/* Navegação */}
      <div className="flex flex-col overflow-y-auto flex-grow">
        <nav className="mt-6 px-4 flex-grow">
          <h3 className="mb-4 ml-2 text-xs font-semibold tracking-wider text-gray-500 uppercase">Menu</h3>
          <ul className="flex flex-col gap-2">
            <li>
              <NavLink to="/admin" end className={getNavLinkClass}>
                <FiGrid className="text-lg" />
                Dashboard
              </NavLink>
            </li>
            <li>
              <NavLink to="/admin/vehicles" className={getNavLinkClass}>
                <FiList className="text-lg" />
                Veículos
              </NavLink>
            </li>
          </ul>
        </nav>

        {/* Logout */}
        <div className="px-4 pb-6 mt-auto">
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 w-full rounded-lg py-2.5 px-4 font-medium text-gray-300 hover:bg-gray-600 hover:text-white transition-all duration-300"
          >
            <FiLogOut className="text-lg" />
            Sair
          </button>
        </div>
      </div>
    </aside>
  );
};

export default AdminSidebar;
