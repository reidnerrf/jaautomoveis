
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiMail, FiArrowLeft, FiCheck } from 'react-icons/fi';

const ForgotPasswordPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      if (response.ok) {
        setSent(true);
      } else {
        setError('Erro ao enviar email de recuperação');
      }
    } catch (error) {
      setError('Erro de conexão');
    } finally {
      setLoading(false);
    }
  };

  if (sent) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex flex-col justify-center items-center p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className="w-full max-w-md bg-gray-800/90 backdrop-blur-md p-8 rounded-2xl shadow-xl border border-gray-700 text-center"
        >
          <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-6">
            <FiCheck className="text-white text-2xl" />
          </div>
          
          <h2 className="text-2xl font-bold text-white mb-4">
            Email Enviado!
          </h2>
          <p className="text-gray-300 mb-8">
            Se o email {email} estiver cadastrado, você receberá instruções para redefinir sua senha.
          </p>
          
          <Link
            to="/admin/login"
            className="inline-flex items-center gap-2 text-blue-400 hover:text-blue-300 transition-colors"
          >
            <FiArrowLeft />
            Voltar para o login
          </Link>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex flex-col justify-center items-center p-4">
      <motion.div
        initial={{ opacity: 0, y: -40 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md bg-gray-800/90 backdrop-blur-md p-8 rounded-2xl shadow-xl border border-gray-700"
      >
        <div className="text-center mb-8">
          <img
            src="/assets/logo.png"
            alt="JA Automóveis Logo"
            className="h-14 w-auto mx-auto mb-3"
          />
          <h2 className="text-2xl font-bold text-white">
            Esqueceu a Senha?
          </h2>
          <p className="text-gray-400 text-sm mt-2">
            Digite seu email para receber instruções de recuperação
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-2">
              Email
            </label>
            <div className="relative">
              <FiMail className="absolute top-3.5 left-3 text-gray-400" size={18} />
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="pl-10 w-full bg-gray-700 border border-gray-600 text-white rounded-md py-3 px-4 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 transition"
                required
                placeholder="admin@jaautomóveis.com"
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

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 px-4 rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-red-500 disabled:opacity-50 transition-all duration-300"
          >
            {loading ? 'Enviando...' : 'Enviar Email de Recuperação'}
          </button>
        </form>

        <div className="text-center mt-6">
          <Link
            to="/admin/login"
            className="inline-flex items-center gap-2 text-sm text-gray-400 hover:text-white transition-colors"
          >
            <FiArrowLeft />
            Voltar para o login
          </Link>
        </div>
      </motion.div>
    </div>
  );
};

export default ForgotPasswordPage;
