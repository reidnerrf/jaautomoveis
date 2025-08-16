import React, { useState, useEffect } from 'react';
import { Link, NavLink } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { FiMenu, FiX } from 'react-icons/fi';
import { useAuth } from '../hooks/useAuth.tsx';
import DarkModeToggle from './DarkModeToggle';
import { FaWhatsapp, FaInstagram } from 'react-icons/fa';

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

  const getNavLinkClass = ({ isActive }: { isActive: boolean }) =>
    `relative block py-2 px-3 rounded-md transition-all duration-300 
    ${isActive ? 'text-main-red font-semibold' : 'text-gray-700 hover:text-main-red dark:text-gray-300 dark:hover:text-main-red'}
    after:content-[''] after:absolute after:left-0 after:bottom-0 after:h-[2px]
    after:bg-main-red after:w-0 hover:after:w-full after:transition-all after:duration-300`;

  return (
    <motion.header
      className={`fixed top-0 left-0 w-full z-50 transition-all duration-300 ${
        isScrolled
          ? 'bg-white/95 dark:bg-gray-900/95 backdrop-blur-md shadow-lg dark:shadow-gray-800/20'
          : 'bg-transparent'
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
          <div className="hidden lg:flex items-center space-x-6">
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
              <a
                href="https://api.whatsapp.com/send?phone=5524999037716"
                target="_blank"
                rel="noopener noreferrer"
                className="text-green-600 hover:text-green-700 dark:text-green-400 dark:hover:text-green-300 transition-colors p-2 rounded-lg hover:bg-green-50 dark:hover:bg-green-900/20"
              >
                <FaWhatsapp size={20} />
              </a>
              <a
                href="https://www.instagram.com/_jaautomoveis/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-pink-600 hover:text-pink-700 dark:text-pink-400 dark:hover:text-pink-300 transition-colors p-2 rounded-lg hover:bg-pink-50 dark:hover:bg-pink-900/20"
              >
                <FaInstagram size={20} />
              </a>
            </div>
          </div>

          {/* Botão Mobile */}
          <div className="md:hidden flex items-center">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="text-gray-700 hover:text-main-red dark:text-gray-300 dark:hover:text-main-red focus:outline-none ml-4"
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
                <a
                  href="https://api.whatsapp.com/send?phone=5524999037716"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-green-600 hover:text-green-700 dark:text-green-400 dark:hover:text-green-300 transition-colors p-2 rounded-lg hover:bg-green-50 dark:hover:bg-green-900/20"
                >
                  <FaWhatsapp size={20} />
                </a>
                <a
                  href="https://www.instagram.com/_jaautomoveis/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-pink-600 hover:text-pink-700 dark:text-pink-400 dark:hover:text-pink-300 transition-colors p-2 rounded-lg hover:bg-pink-50 dark:hover:bg-pink-900/20"
                >
                  <FaInstagram size={20} />
                </a>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.header>
  );
};

export default Header;