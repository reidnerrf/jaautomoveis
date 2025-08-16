import React, { useState } from 'react';
import { useAuth } from '../hooks/useAuth.tsx';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiUser, FiLock, FiLogIn } from 'react-icons/fi';

const AdminLoginPage: React.FC = () => {
  const [username, setUsername] = useState('admin');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { login, loading } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    const success = await login(username, password);
    if (success === true) {
      navigate('/admin');
    } else {
      setError('Usuário ou senha inválidos. Por favor, tente novamente.');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex flex-col justify-center items-center p-4">
      <motion.div
        initial={{ opacity: 0, y: -40, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md bg-gray-800/90 backdrop-blur-md p-8 rounded-2xl shadow-xl border border-gray-700"
      >
        <div className="text-center mb-8">
          <img
            src="/assets/logo.png"
            alt="JA Automóveis Logo"
            className="h-14 w-auto mx-auto mb-3 drop-shadow-lg"
          />
          <h2 className="text-2xl font-bold text-white tracking-wide">
            Painel Administrativo
          </h2>
          <p className="text-gray-400 text-sm mt-1">
            Insira suas credenciais para entrar
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label htmlFor="username" className="block text-sm font-medium text-gray-300 mb-1">
              Usuário
            </label>
            <div className="relative">
              <FiUser className="absolute top-3.5 left-3 text-gray-400" size={18} />
              <input
                type="text"
                id="username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="pl-10 w-full bg-gray-700 border border-gray-600 text-white rounded-md py-3 px-4 shadow-sm focus:outline-none focus:ring-2 focus:ring-main-red focus:border-main-red transition"
                required
              />
            </div>
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-300 mb-1">
              Senha
            </label>
            <div className="relative">
              <FiLock className="absolute top-3.5 left-3 text-gray-400" size={18} />
              <input
                type="password"
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="pl-10 w-full bg-gray-700 border border-gray-600 text-white rounded-md py-3 px-4 shadow-sm focus:outline-none focus:ring-2 focus:ring-main-red focus:border-main-red transition"
                required
              />
            </div>
          </div>

          {error && (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-red-400 text-sm"
            >
              {error}
            </motion.p>
          )}

          <motion.button
            type="submit"
            disabled={loading}
            whileHover={{ scale: loading ? 1 : 1.03 }}
            whileTap={{ scale: loading ? 1 : 0.97 }}
            className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-md text-white bg-main-red hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-main-red shadow-md transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <FiLogIn size={18} />
            {loading ? 'Entrando...' : 'Entrar'}
          </motion.button>
        </form>

        <div className="text-center mt-6 space-y-3">
          <Link
            to="/admin/forgot-password"
            className="block text-sm text-blue-400 hover:text-blue-300 transition-colors"
          >
            Esqueceu sua senha?
          </Link>
          <Link
            to="/"
            className="block text-sm text-gray-400 hover:text-white transition-colors"
          >
            &larr; Voltar para o site
          </Link>
        </div>
      </motion.div>
    </div>
  );
};

export default AdminLoginPage;
