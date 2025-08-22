import React, { useState, useEffect } from "react";
import { Link, NavLink, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { FiMenu, FiX } from "react-icons/fi";
import { useAuth } from "../hooks/useAuth.tsx";
import DarkModeToggle from "./DarkModeToggle";
import { prefetchRoute } from "../utils/prefetch.ts";
import { FaInstagram } from "react-icons/fa";
 

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

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 80);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const isHome = location.pathname === "/";
  const isTransparent = isHome && !isScrolled;

  // Fechar ao clicar fora do menu mobile
  useEffect(() => {
    if (!isOpen) return;
    const onClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (target.closest("nav") == null) {
        setIsOpen(false);
      }
    };
    document.addEventListener("click", onClick, true);
    return () => document.removeEventListener("click", onClick, true);
  }, [isOpen]);

  const getNavLinkClass = ({ isActive }: { isActive: boolean }) =>
    `relative block py-2 px-3 transition-colors duration-300 font-medium group
     ${
       isActive
         ? "text-main-red font-semibold"
         : isTransparent
           ? "text-white/95 hover:text-white drop-shadow-[0_1px_1px_rgba(0,0,0,0.5)]"
           : "text-gray-700 hover:text-main-red dark:text-gray-300 dark:hover:text-main-red"
     }`;

  return (
    <motion.header
      className={`fixed top-0 left-0 w-full z-50 transition-all duration-500 ${
        isTransparent
          ? "bg-gradient-to-b from-black/40 to-transparent dark:from-black/50 backdrop-blur-sm"
          : "bg-white/90 dark:bg-gray-900/90 backdrop-blur-lg shadow-lg"
      }`}
    >
      <nav className="container mx-auto px-4 sm:px-6 lg:px-8" onClick={(e) => e.stopPropagation()}>
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
              className="h-14 w-auto transition-transform group-hover:scale-105 drop-shadow-[0_2px_6px_rgba(0,0,0,0.4)]"
              whileHover={{ rotate: -2, scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            />
          </Link>

          {/* Menu Desktop */}
          <div
            className={`hidden lg:flex flex-1 justify-center items-center space-x-8 ${isTransparent ? "text-white" : ""}`}
          >
            {baseNavLinks.map((link) => (
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
            </div>
            <div className="hidden lg:flex items-center gap-4">
              <a
                href="https://www.instagram.com/_jaautomoveis/"
                target="_blank"
                rel="noopener noreferrer"
                className={`transition-colors ${
                  isTransparent
                    ? "text-white/95 hover:text-pink-500 drop-shadow-[0_1px_1px_rgba(0,0,0,0.5)]"
                    : "text-gray-700 hover:text-pink-500 dark:text-gray-300 dark:hover:text-pink-500"
                }`}
              >
                <FaInstagram size={22} />
              </a>
              <DarkModeToggle />
            </div>
          

          {/* Botão Mobile */}
          <div className="lg:hidden flex items-center gap-3">
            <a
              href="https://www.instagram.com/_jaautomoveis/"
              target="_blank"
              rel="noopener noreferrer"
              className={`transition-colors ${
                isTransparent
                  ? "text-white/95 hover:text-pink-500 drop-shadow-[0_1px_1px_rgba(0,0,0,0.5)]"
                  : "text-gray-700 hover:text-pink-500 dark:text-gray-300 dark:hover:text-pink-500"
              }`}
            >
              <FaInstagram size={22} />
            </a>
            <DarkModeToggle />
            <button
              onClick={(e) => {
                e.stopPropagation();
                setIsOpen(!isOpen);
              }}
              aria-label="Toggle menu"
              className={`focus:outline-none transition-colors ${
                isTransparent
                  ? "text-white/95 hover:text-white drop-shadow-[0_1px_1px_rgba(0,0,0,0.5)]"
                  : "text-gray-700 hover:text-main-red dark:text-gray-300 dark:hover:text-main-red"
              }`}
            >
              {isOpen ? <FiX size={28} /> : <FiMenu size={28} />}
            </button>
          </div>
        </div>
      </nav>

      {/* Menu Mobile */}
      <AnimatePresence>
        {isOpen ? (
          <motion.div
            initial={{ opacity: 0, y: -15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            transition={{ duration: 0.25 }}
            className="lg:hidden bg-white dark:bg-gray-900 shadow-xl border-t border-gray-200 dark:border-gray-700"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="px-4 pt-4 pb-6 space-y-3">
              {baseNavLinks.map((link) => (
                <NavLink
                  key={link.name}
                  to={link.path}
                  end={link.path === "/"}
                  className={({ isActive }) =>
                    `block py-2 px-3 rounded-lg transition-all duration-300 ${
                      isActive
                        ? "text-main-red font-semibold bg-red-50 dark:bg-red-900/30"
                        : "text-gray-700 hover:text-main-red hover:bg-gray-100 dark:text-gray-300 dark:hover:text-main-red dark:hover:bg-gray-800/40"
                    }`
                  }
                  onMouseEnter={() => prefetchRoute(link.path)}
                  onClick={() => setIsOpen(false)}
                >
                  {link.name}
                </NavLink>
              ))}
            </div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </motion.header>
  );
};

export default Header;