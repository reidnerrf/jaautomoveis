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
    `relative block py-3 px-4 rounded-xl transition-all duration-300 font-medium
    ${isActive 
      ? 'text-primary-600 bg-primary-50 shadow-soft' 
      : 'text-neutral-600 hover:text-primary-600 hover:bg-primary-50/50'
    }
    after:content-[''] after:absolute after:left-1/2 after:bottom-0 after:h-0.5
    after:bg-gradient-to-r after:from-primary-500 after:to-primary-600 
    after:w-0 hover:after:w-full after:transition-all after:duration-300 after:-translate-x-1/2`;

  return (
    <header className="sticky top-0 z-50">
      {/* Background com glassmorphism */}
      <div className="absolute inset-0 bg-white/80 backdrop-blur-md border-b border-neutral-200/50"></div>
      
      <nav className="relative container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Logo */}
          <Link to="/" className="flex items-center group relative z-10">
            <motion.div
              className="relative"
              whileHover={{ scale: 1.05 }}
              transition={{ type: "spring", stiffness: 400, damping: 10 }}
            >
              <img
                src="/assets/logo.png"
                alt="JA Automóveis Logo"
                className="h-14 w-auto transition-all duration-300 group-hover:drop-shadow-lg"
              />
              <div className="absolute inset-0 bg-gradient-to-r from-primary-500/20 to-secondary-500/20 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            </motion.div>
          </Link>

          {/* Menu Desktop */}
          <div className="hidden lg:flex items-center space-x-2">
            {navLinks.map((link, index) => (
              <motion.div
                key={link.name}
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1, duration: 0.5 }}
              >
                <NavLink
                  to={link.path}
                  end={link.path === '/'}
                  className={getNavLinkClass}
                >
                  {link.name}
                </NavLink>
              </motion.div>
            ))}
          </div>

          {/* Botão Mobile */}
          <div className="lg:hidden relative z-10">
            <motion.button
              onClick={() => setIsOpen(!isOpen)}
              className="p-2 rounded-xl bg-white/50 backdrop-blur-sm border border-neutral-200/50 shadow-soft hover:shadow-medium transition-all duration-300"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <AnimatePresence mode="wait">
                {isOpen ? (
                  <motion.div
                    key="close"
                    initial={{ rotate: -90, opacity: 0 }}
                    animate={{ rotate: 0, opacity: 1 }}
                    exit={{ rotate: 90, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <FiX size={24} className="text-neutral-700" />
                  </motion.div>
                ) : (
                  <motion.div
                    key="menu"
                    initial={{ rotate: 90, opacity: 0 }}
                    animate={{ rotate: 0, opacity: 1 }}
                    exit={{ rotate: -90, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <FiMenu size={24} className="text-neutral-700" />
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.button>
          </div>
        </div>
      </nav>

      {/* Menu Mobile */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Overlay */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/20 backdrop-blur-sm lg:hidden z-40"
              onClick={() => setIsOpen(false)}
            />
            
            {/* Menu */}
            <motion.div
              initial={{ opacity: 0, y: -20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -20, scale: 0.95 }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              className="absolute top-full left-0 right-0 lg:hidden z-50"
            >
              <div className="bg-white/95 backdrop-blur-md border-b border-neutral-200/50 shadow-large">
                <div className="px-4 py-6 space-y-2">
                  {navLinks.map((link, index) => (
                    <motion.div
                      key={link.name}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1, duration: 0.3 }}
                    >
                      <NavLink
                        to={link.path}
                        end={link.path === '/'}
                        className={({ isActive }) =>
                          `block py-3 px-4 rounded-xl transition-all duration-300 font-medium
                          ${isActive 
                            ? 'text-primary-600 bg-primary-50 shadow-soft' 
                            : 'text-neutral-600 hover:text-primary-600 hover:bg-primary-50/50'
                          }`
                        }
                        onClick={() => setIsOpen(false)}
                      >
                        {link.name}
                      </NavLink>
                    </motion.div>
                  ))}
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </header>
  );
};

export default Header;
