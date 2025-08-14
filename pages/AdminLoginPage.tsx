
import React, { useState } from 'react';
import { useAuth } from '../hooks/useAuth.tsx';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';

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
    if (success) {
      navigate('/admin');
    } else {
      setError('Usuário ou senha inválidos. Por favor, tente novamente.');
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 flex flex-col justify-center items-center p-4">
       <motion.div
        initial={{ opacity: 0, y: -50, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md bg-gray-800 p-8 rounded-2xl shadow-lg border border-gray-700"
       >
        <div className="text-center mb-8">
            <img src="/assets/logo.png" alt="JA Automóveis Logo" className="h-12 w-auto mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-300">Painel Administrativo</h2>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="username" className="block text-sm font-medium text-gray-300">Usuário</label>
            <input
              type="text"
              id="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="mt-1 block w-full bg-gray-700 border border-gray-600 text-white rounded-md shadow-sm py-3 px-4 focus:outline-none focus:ring-2 focus:ring-main-red"
              required
            />
          </div>
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-300">Senha</label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-1 block w-full bg-gray-700 border border-gray-600 text-white rounded-md shadow-sm py-3 px-4 focus:outline-none focus:ring-2 focus:ring-main-red"
              required
            />
          </div>

          {error && <p className="text-red-400 text-sm">{error}</p>}

          <div>
            <button
              type="submit"
              disabled={loading}
              className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-main-red hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-main-red disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Entrando...' : 'Entrar'}
            </button>
          </div>
        </form>
        <div className="text-center mt-6">
          <Link to="/" className="text-sm text-gray-400 hover:text-white transition-colors">
            &larr; Voltar para o site
          </Link>
        </div>
      </motion.div>
    </div>
  );
};

export default AdminLoginPage;
