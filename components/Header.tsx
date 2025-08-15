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
    `relative block py-2 px-3 rounded-md transition-all duration-300 
    ${isActive ? 'text-main-red font-semibold' : 'text-gray-700 hover:text-main-red'}
    after:content-[''] after:absolute after:left-0 after:bottom-0 after:h-[2px]
    after:bg-main-red after:w-0 hover:after:w-full after:transition-all after:duration-300`;

  return (
    <header className="bg-white/70 backdrop-blur-md shadow-md sticky top-0 z-50">
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
          <div className="hidden md:flex items-center space-x-8">
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
          </div>

          {/* Botão Mobile */}
          <div className="md:hidden">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="text-gray-700 hover:text-main-red focus:outline-none"
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
            initial={{ opacity: 0, y: -15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            className="md:hidden bg-white shadow-lg border-t border-gray-200"
          >
            <div className="px-4 pt-4 pb-6 space-y-3">
              {navLinks.map((link) => (
                <NavLink
                  key={link.name}
                  to={link.path}
                  end={link.path === '/'}
                  className={getNavLinkClass}
                  onClick={() => setIsOpen(false)}
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
