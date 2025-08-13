
import React, { useState } from 'react';
import { Link, NavLink } from 'react-router-dom';
import { FiMenu, FiX } from 'react-icons/fi';
import { motion } from 'framer-motion';
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
    `block py-2 px-3 rounded ${
      isActive ? 'bg-main-red text-white' : 'text-gray-700 hover:bg-gray-100'
    } md:bg-transparent ${
      isActive ? 'md:text-main-red' : 'md:text-gray-700'
    } md:p-0 md:hover:text-main-red transition-colors duration-300`;

  return (
    <header className="bg-white/80 backdrop-blur-sm shadow-md sticky top-0 z-50">
      <nav className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          <Link to="/" className="flex items-center">
            <span className="text-2xl font-bold text-main-red">JA</span>
            <span className="text-2xl font-bold text-gray-800">Automóveis</span>
          </Link>
          <div className="hidden md:flex items-center space-x-8">
            {navLinks.map((link) => (
              <NavLink key={link.name} to={link.path} end={link.path === '/'} className={getNavLinkClass}>
                {link.name}
              </NavLink>
            ))}
          </div>
          <div className="md:hidden">
            <button onClick={() => setIsOpen(!isOpen)} className="text-gray-700 hover:text-main-red focus:outline-none">
              {isOpen ? <FiX size={24} /> : <FiMenu size={24} />}
            </button>
          </div>
        </div>
      </nav>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="md:hidden"
        >
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
            {navLinks.map((link) => (
              <NavLink key={link.name} to={link.path} end={link.path === '/'} className={getNavLinkClass} onClick={() => setIsOpen(false)}>
                {link.name}
              </NavLink>
            ))}
          </div>
        </motion.div>
      )}
    </header>
  );
};

export default Header;