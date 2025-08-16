import React, { useState } from 'react';
import { Link, NavLink } from 'react-router-dom';
import { FiMenu, FiX } from 'react-icons/fi';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../hooks/useAuth.tsx';

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

  const navLinks = isAuthenticated
    ? [...baseNavLinks, { name: 'Admin', path: '/admin' }]
    : baseNavLinks;

  const getNavLinkClass = ({ isActive }: { isActive: boolean }) =>
    `relative block py-3 px-4 rounded-lg transition-all duration-300 font-medium
    ${isActive 
      ? 'text-white bg-main-red shadow-lg' 
      : 'text-gray-700 hover:text-main-red hover:bg-gray-50'
    }
    focus:outline-none focus:ring-2 focus:ring-main-red focus:ring-offset-2`;

  return (
    <header className="bg-white/95 backdrop-blur-md shadow-lg sticky top-0 z-50 border-b border-gray-100">
      <nav className="container mx-auto px-4 sm:px-6 lg:px-8" role="navigation" aria-label="Navegação principal">
        <div className="flex items-center justify-between h-20">
          {/* Logo */}
          <Link to="/" className="flex items-center group" aria-label="Ir para página inicial">
            <motion.img
              src="/assets/logo.png"
              alt="JA Automóveis Logo"
              className="h-16 w-auto transition-transform group-hover:scale-105"
              whileHover={{ rotate: -2, scale: 1.05 }}
            />
          </Link>

          {/* Menu Desktop */}
          <div className="hidden md:flex items-center space-x-2">
            {navLinks.map((link) => (
              <NavLink
                key={link.name}
                to={link.path}
                end={link.path === '/'}
                className={getNavLinkClass}
                aria-current={link.path === '/' ? 'page' : undefined}
              >
                {link.name}
              </NavLink>
            ))}
          </div>

          {/* Botão Mobile */}
          <div className="md:hidden">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="text-gray-700 hover:text-main-red focus:outline-none focus:ring-2 focus:ring-main-red focus:ring-offset-2 p-2 rounded-lg"
              aria-label={isOpen ? 'Fechar menu' : 'Abrir menu'}
              aria-expanded={isOpen}
              aria-controls="mobile-menu"
            >
              {isOpen ? <FiX size={26} /> : <FiMenu size={26} />}
            </button>
          </div>
        </div>
      </nav>

      {/* Menu Mobile */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            id="mobile-menu"
            initial={{ opacity: 0, y: -15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            className="md:hidden bg-white shadow-xl border-t border-gray-200"
            role="menu"
          >
            <div className="px-4 pt-4 pb-6 space-y-2">
              {navLinks.map((link) => (
                <NavLink
                  key={link.name}
                  to={link.path}
                  end={link.path === '/'}
                  className={getNavLinkClass}
                  onClick={() => setIsOpen(false)}
                  role="menuitem"
                >
                  {link.name}
                </NavLink>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
};

export default Header;
