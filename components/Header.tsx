import React, { useState, useEffect } from "react";
import { Link, NavLink, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { FiMenu, FiX } from "react-icons/fi";
import { useAuth } from "../hooks/useAuth.tsx";
import DarkModeToggle from "./DarkModeToggle";
import { prefetchRoute } from "../utils/prefetch.ts";

const baseNavLinks = [
  { name: "Início", path: "/" },
  { name: "Estoque", path: "/inventory" },
  { name: "Financiamento", path: "/financing" },
  { name: "Consórcio", path: "/consortium" },
  { name: "Sobre Nós", path: "/about" },
  { name: "Contato", path: "/contact" },
];

const Header: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { isAuthenticated } = useAuth();
  const [isScrolled, setIsScrolled] = useState(false);
  const location = useLocation();

  const navLinks = isAuthenticated
    ? [...baseNavLinks, { name: "Admin", path: "/admin" }]
    : baseNavLinks;

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 80);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const isHome = location.pathname === "/";
  const isTransparent = isHome && !isScrolled;

  const getNavLinkClass = ({ isActive }: { isActive: boolean }) =>
    `relative block py-2 px-3 transition-all duration-300 font-medium group
     ${
       isActive
         ? "text-main-red font-semibold"
         : isTransparent
         ? "text-white/95 hover:text-white drop-shadow-[0_1px_1px_rgba(0,0,0,0.5)]"
         : "text-gray-700 hover:text-main-red dark:text-gray-300 dark:hover:text-main-red"
     }`;

  return (
    <motion.header
      className={`fixed top-0 left-0 w-full z-50 transition-all duration-300 ${
        isTransparent
          ? "bg-gradient-to-b from-black/30 to-transparent dark:from-black/40 backdrop-blur-sm"
          : "bg-white/90 dark:bg-gray-900/90 backdrop-blur-md shadow-md"
      }`}
    >
      <nav className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div
          className={`flex items-center justify-between ${
            isScrolled ? "h-16" : "h-20"
          } transition-[height] duration-300`}
        >
          {/* Logo */}
          <Link to="/" className="flex items-center group">
            <motion.img
              src="/assets/logo.png"
              alt="JA Automóveis Logo"
              className="h-16 w-auto transition-transform group-hover:scale-105 drop-shadow-[0_2px_4px_rgba(0,0,0,0.4)]"
              whileHover={{ rotate: -2, scale: 1.05 }}
            />
          </Link>

          {/* Menu Desktop */}
          <div
            className={`hidden lg:flex items-center space-x-8 ${
              isTransparent
                ? "text-white drop-shadow-[0_1px_1px_rgba(0,0,0,0.4)]"
                : ""
            }`}
          >
            {navLinks.map((link) => (
              <NavLink
                key={link.name}
                to={link.path}
                end={link.path === "/"}
                className={getNavLinkClass}
                onMouseEnter={() => prefetchRoute(link.path)}
              >
                <span className="relative inline-block">
                  {link.name}
                  <span className="absolute left-0 -bottom-1 h-0.5 w-0 bg-current transition-all duration-300 group-hover:w-full" />
                </span>
              </NavLink>
            ))}

            {/* Botão de Ação removido conforme solicitação */}

            {/* DarkMode */}
            <DarkModeToggle />
          </div>

          {/* Botão Mobile */}
          <div className="lg:hidden flex items-center gap-3">
            <DarkModeToggle />
            <button
              onClick={() => setIsOpen(!isOpen)}
              className={`focus:outline-none ${
                isTransparent
                  ? "text-white/95 hover:text-white drop-shadow-[0_1px_1px_rgba(0,0,0,0.5)]"
                  : "text-gray-700 hover:text-main-red dark:text-gray-300 dark:hover:text-main-red"
              }`}
            >
              {isOpen ? <FiX size={26} /> : <FiMenu size={26} />}
            </button>
          </div>
        </div>
      </nav>

      {/* Menu Mobile */}
      <AnimatePresence>
        {Boolean(isOpen) && (
          <motion.div
            initial={{ opacity: 0, y: -15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            className="lg:hidden bg-white dark:bg-gray-900 shadow-lg border-t border-gray-200 dark:border-gray-700"
          >
            <div className="px-4 pt-4 pb-6 space-y-3">
              {navLinks.map((link) => (
                <NavLink
                  key={link.name}
                  to={link.path}
                  end={link.path === "/"}
                  className={({ isActive }) =>
                    `block py-2 px-3 rounded-md transition-all duration-300 ${
                      isActive
                        ? "text-main-red font-semibold"
                        : "text-gray-700 hover:text-main-red dark:text-gray-300 dark:hover:text-main-red"
                    }`
                  }
                  onMouseEnter={() => prefetchRoute(link.path)}
                  onClick={() => setIsOpen(false)}
                >
                  {link.name}
                </NavLink>
              ))}

              {/* Botão de Ação no Mobile removido */}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.header>
  );
};

export default Header;
