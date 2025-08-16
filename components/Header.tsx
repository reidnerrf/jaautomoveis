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
    `relative block py-2 px-3 rounded-md transition-all duration-300 
    ${isActive ? 'text-main-red font-semibold' : (isTransparent ? 'text-white hover:text-white/80' : 'text-gray-700 hover:text-main-red dark:text-gray-300 dark:hover:text-main-red')}
    after:content-[''] after:absolute after:left-0 after:bottom-0 after:h-[2px]
    after:bg-main-red after:w-0 hover:after:w-full after:transition-all after:duration-300`;

  return (
    <motion.header
      className={`fixed top-0 left-0 w-full z-50 transition-all duration-300 ${
        isScrolled
          ? 'bg-white/80 dark:bg-gray-900/80 backdrop-blur-md shadow-lg dark:shadow-gray-800/20'
          : 'bg-transparent backdrop-blur-none shadow-none'
      }`}
    >
      <nav className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Logo */}
          <Link to="/" className="flex items-center group">
            <motion.img
              src="/assets/logo.png"
              alt="JA Automóveis Logo"
              className="h-16 w-auto transition-transform group-hover:scale-105"
              whileHover={{ rotate: -2, scale: 1.05 }}
            />
          </Link>

          {/* Menu Desktop */}
          <div className={`hidden lg:flex items-center space-x-6 ${isTransparent ? 'text-white' : ''}`}>
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
              className={`focus:outline-none ml-4 ${isTransparent ? 'text-white hover:text-white/80' : 'text-gray-700 hover:text-main-red dark:text-gray-300 dark:hover:text-main-red'}`}
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