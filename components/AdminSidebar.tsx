import React, { useEffect, useRef, useState } from "react";
import { NavLink, Link, useNavigate, useLocation } from "react-router-dom";
import { FiGrid, FiList, FiLogOut, FiMessageSquare } from "react-icons/fi";
import { useAuth } from "../hooks/useAuth.tsx";
import { io, Socket } from "socket.io-client";
import toast from "react-hot-toast";

interface AdminSidebarProps {
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
}

const AdminSidebar: React.FC<AdminSidebarProps> = ({ sidebarOpen, setSidebarOpen }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { logout } = useAuth();

  const trigger = useRef<any>(null);
  const sidebar = useRef<any>(null);
  const [unread, setUnread] = useState(0);
  const socketRef = useRef<Socket | null>(null);

  // Fechar no clique fora (but ignore clicks on the header toggle button)
  useEffect(() => {
    const clickHandler = (event: MouseEvent) => {
      if (!sidebar.current) return;
      const target = event.target as Node | null;
      if (!sidebarOpen) return;
      // If click is inside the sidebar, ignore
      if (target && sidebar.current.contains(target)) return;
      // If click originated from a button with aria-label Toggle sidebar, ignore
      const path = (event.composedPath?.() || []) as EventTarget[];
      const interactedWithHeaderToggle = path.some((el) => {
        return (
          el instanceof Element &&
          el.getAttribute &&
          el.getAttribute("aria-label") === "Toggle sidebar"
        );
      });
      if (interactedWithHeaderToggle) return;
      setSidebarOpen(false);
    };
    document.addEventListener("click", clickHandler, true);
    return () => document.removeEventListener("click", clickHandler, true);
  }, [sidebarOpen, setSidebarOpen]);

  // Fechar com ESC
  useEffect(() => {
    const keyHandler = ({ keyCode }: KeyboardEvent) => {
      if (!sidebarOpen || keyCode !== 27) return;
      setSidebarOpen(false);
    };
    document.addEventListener("keydown", keyHandler);
    return () => document.removeEventListener("keydown", keyHandler);
  });

  // Reset unread on chat page
  useEffect(() => {
    if (location.pathname.startsWith("/admin/chat")) {
      setUnread(0);
    }
  }, [location.pathname]);

  // Socket listener for new chat notifications
  useEffect(() => {
    const s = io("/chat", { path: "/socket.io", transports: ["websocket"], withCredentials: true });
    socketRef.current = s;
    s.on("connect", () => {
      s.emit("join_admin");
    });
    s.on("new_chat", ({ roomId }: { roomId: string }) => {
      setUnread((u) => u + 1);
      toast.custom((t) => (
        <div className="bg-gray-800 text-white px-4 py-3 rounded-lg shadow-lg flex items-center gap-3">
          <FiMessageSquare className="text-main-red" />
          <div className="text-sm">Novo chat iniciado: {roomId}</div>
          <button onClick={() => { toast.dismiss(t.id); navigate("/admin/chat"); }} className="ml-3 bg-main-red hover:bg-red-700 text-white text-xs px-2 py-1 rounded-md">Abrir</button>
        </div>
      ), { duration: 6000 });
    });
    return () => s.disconnect();
  }, [navigate]);

  const handleLogout = () => {
    logout();
    navigate("/admin/login");
  };

  const getNavLinkClass = ({ isActive }: { isActive: boolean }) =>
    `group relative flex items-center gap-3 rounded-lg py-2.5 px-4 font-medium transition-all duration-300 ${
      isActive
        ? "bg-gray-700 text-white shadow-md"
        : "text-gray-300 hover:bg-gray-600 hover:text-white hover:shadow"
    }`;

  return (
    <aside
      ref={sidebar}
      className={`absolute left-0 top-0 z-50 flex h-screen w-60 flex-col overflow-y-hidden bg-gray-900 shadow-xl duration-300 ease-linear lg:static lg:translate-x-0 ${
        sidebarOpen ? "translate-x-0" : "-translate-x-full"
      }`}
    >
      {/* Header */}
      <div className="flex flex-col items-center px-6 py-5 border-b border-gray-800">
        <Link to="/admin" className="flex flex-col items-center">
          <img
            src="/assets/logo.png"
            alt="Logo"
            className="h-12 w-auto"
            loading="lazy"
            decoding="async"
          />
          <span className="text-sm text-gray-300 mt-1 font-semibold">Painel Admin</span>
        </Link>

        <button
          ref={trigger}
          onClick={(e) => {
            e.stopPropagation();
            setSidebarOpen(!sidebarOpen);
          }}
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
          <h3 className="mb-4 ml-2 text-xs font-semibold tracking-wider text-gray-500 uppercase">
            Menu
          </h3>
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
            <li>
              <NavLink to="/admin/chat" className={getNavLinkClass}>
                <div className="relative flex items-center gap-3">
                  <FiMessageSquare className="text-lg" />
                  <span>Chat</span>
                  {unread > 0 && (
                    <span className="ml-auto inline-flex items-center justify-center text-[10px] font-bold bg-main-red text-white rounded-full px-2 py-0.5">
                      {unread}
                    </span>
                  )}
                </div>
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
