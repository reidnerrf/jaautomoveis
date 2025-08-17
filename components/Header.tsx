import React, { useState, useEffect } from 'react';
import { Link, NavLink, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { FiMenu, FiX } from 'react-icons/fi';
import { useAuth } from '../hooks/useAuth.tsx';
import DarkModeToggle from './DarkModeToggle';

const baseNavLinks = [
  { name: 'Início', path: '/' },
  { name: 'Estoque', path: '/inventory' },
  { name: 'Financiamento', path: '/financing' },
  { name: 'Consórcio', path: '/consortium' },
  { name: 'Sobre Nós', path: '/about' },
  { name: 'Contato', path: '/contact' },
];

const Header: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { isAuthenticated } = useAuth();
  const [isScrolled, setIsScrolled] = useState(false);
  const location = useLocation();

  const navLinks = isAuthenticated
    ? [...baseNavLinks, { name: 'Admin', path: '/admin' }]
    : baseNavLinks;

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const isHome = location.pathname === '/';
  const isTransparent = isHome && !isScrolled;

  const getNavLinkClass = ({ isActive }: { isActive: boolean }) =>
    `relative block py-2 px-3 transition-all duration-300 font-medium
    ${isActive ? 'text-main-red font-semibold' : (isTransparent ? 'text-white/95 hover:text-white drop-shadow-[0_1px_1px_rgba(0,0,0,0.5)]' : 'text-gray-700 hover:text-main-red dark:text-gray-300 dark:hover:text-main-red')}`;

  return (
          <motion.header
        className={`fixed top-0 left-0 w-full z-50 transition-all duration-300 ${
          isScrolled
            ? 'bg-white/85 dark:bg-gray-900/85 backdrop-blur-md shadow-lg dark:shadow-gray-800/20'
            : 'bg-gradient-to-b from-black/30 to-transparent dark:from-black/40 backdrop-blur-sm'
        }`}
      >
      <nav className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
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
          <div className={`hidden lg:flex items-center space-x-8 ${isTransparent ? 'text-white drop-shadow-[0_1px_1px_rgba(0,0,0,0.4)]' : ''}`}>
            {navLinks.map((link) => (
              <NavLink
                key={link.name}
                to={link.path}
                end={link.path === '/'}
                className={getNavLinkClass}
              >
                {link.name}
              </NavLink>
            ))}
            <div className="hidden lg:flex items-center space-x-6">
              <DarkModeToggle />
            </div>
          </div>

          {/* Botão Mobile */}
          <div className="md:hidden flex items-center">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className={`focus:outline-none ml-4 ${isTransparent ? 'text-white/95 hover:text-white drop-shadow-[0_1px_1px_rgba(0,0,0,0.5)]' : 'text-gray-700 hover:text-main-red dark:text-gray-300 dark:hover:text-main-red'}`}
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
            className="md:hidden bg-white dark:bg-gray-900 shadow-lg border-t border-gray-200 dark:border-gray-700"
          >
            <div className="px-4 pt-4 pb-6 space-y-3">
              {navLinks.map((link) => (
                <NavLink
                  key={link.name}
                  to={link.path}
                  end={link.path === '/'}
                  className={({ isActive }) =>
                    `block py-2 px-3 rounded-md transition-all duration-300 ${
                      isActive ? 'text-main-red font-semibold' : 'text-gray-700 hover:text-main-red dark:text-gray-300 dark:hover:text-main-red'
                    }`
                  }
                  onClick={() => setIsOpen(false)}
                >
                  {link.name}
                </NavLink>
              ))}
              <div className="flex items-center space-x-4 mt-4">
                <DarkModeToggle />
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.header>
  );
};

export default Header;