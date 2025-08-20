import React, { useState, useMemo } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../hooks/useAuth.tsx";
import { motion, useMotionValue, useTransform } from "framer-motion";
import { Lock, User, ArrowLeft, Loader2 } from "lucide-react";
import logo from "../assets/logo.png";

const phrases = [
  "Bem-vindo de volta 👋",
  "Pronto para mais um dia de conquistas 🚀",
  "Sua jornada começa aqui ✨",
  "Acesso restrito, mas cheio de possibilidades 🔐",
  "Um ótimo dia para gerenciar tudo! ☀️",
  "Vamos fazer acontecer! 💪",
  "Sua administração, sua maneira! 🛠️",
];

const AdminLoginPage: React.FC = () => {
  const { login, loading } = useAuth();
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);

  // frase aleatória a cada refresh
  const welcomeMessage = useMemo(() => phrases[Math.floor(Math.random() * phrases.length)], []);

  // valores para tilt 3D
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const rotateX = useTransform(y, [-100, 100], [10, -10]);
  const rotateY = useTransform(x, [-100, 100], [-10, 10]);

  const handleMouseMove = (e: React.MouseEvent) => {
    const rect = (e.target as HTMLElement).getBoundingClientRect();
    const offsetX = e.clientX - rect.left - rect.width / 2;
    const offsetY = e.clientY - rect.top - rect.height / 2;
    x.set(offsetX);
    y.set(offsetY);
  };

  const handleMouseLeave = () => {
    x.set(0);
    y.set(0);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    const ok = await login(username, password);
    if (ok) {
      navigate("/admin");
    } else {
      setError("Usuário ou senha inválidos.");
    }
  };

  return (
    <div
      className="relative min-h-screen flex items-center justify-center 
      bg-gradient-to-br from-blue-100 via-white to-blue-200 
      dark:from-gray-900 dark:via-gray-950 dark:to-gray-900 p-6 transition-colors overflow-hidden"
    >
      {/* Card de login com tilt 3D */}
      <motion.div
        style={{ rotateX, rotateY }}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="relative w-full max-w-md bg-white/80 dark:bg-gray-900/80 
          backdrop-blur-lg rounded-2xl shadow-2xl p-8 
          border border-gray-100 dark:border-gray-800 z-10 transform-gpu"
      >
        {/* Logo */}
        <div className="flex justify-center mb-6">
          <img src={logo} alt="Logo" className="h-14 w-auto" />
        </div>

        {/* Título */}
        <h1 className="text-3xl font-extrabold text-gray-900 dark:text-gray-100 text-center mb-2">
          Área Administrativa
        </h1>
        <p className="text-center text-gray-500 dark:text-gray-400 mb-6 italic">{welcomeMessage}</p>

        {/* Mensagem de erro */}
        {error ? (
          <div
            className="mb-4 rounded-md bg-red-100 dark:bg-red-900/50 
            p-3 text-sm text-red-700 dark:text-red-300 border border-red-200 dark:border-red-800"
          >
            {error}
          </div>
        ) : null}

        {/* Formulário */}
        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="relative">
            <User className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
            <input
              id="username"
              type="text"
              placeholder="Usuário"
              className="w-full pl-10 pr-4 py-2 rounded-xl 
                border border-gray-300 dark:border-gray-700 
                bg-white dark:bg-gray-800 
                text-gray-900 dark:text-gray-100
                focus:ring-2 focus:ring-blue-500 focus:outline-none transition-all"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              autoComplete="username"
              required
            />
          </div>

          <div className="relative">
            <Lock className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
            <input
              id="password"
              type="password"
              placeholder="Senha"
              className="w-full pl-10 pr-4 py-2 rounded-xl 
                border border-gray-300 dark:border-gray-700 
                bg-white dark:bg-gray-800 
                text-gray-900 dark:text-gray-100
                focus:ring-2 focus:ring-blue-500 focus:outline-none transition-all"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="current-password"
              required
            />
          </div>

          <motion.button
            type="submit"
            whileTap={{ scale: 0.97 }}
            className="w-full flex items-center justify-center gap-2 rounded-xl 
              bg-blue-600 hover:bg-blue-700 
              dark:bg-blue-500 dark:hover:bg-blue-600
              text-white font-semibold py-2.5 shadow-lg transition-all disabled:opacity-60"
            disabled={loading}
          >
            {loading ? (
              <>
                <Loader2 className="h-5 w-5 animate-spin" />
                Entrando...
              </>
            ) : (
              "Entrar"
            )}
          </motion.button>
        </form>

        {/* Links extras */}
        <div className="mt-8 flex flex-col items-center gap-4 text-center">
          {/* Esqueci senha */}
          <Link
            to="/admin/forgot-password"
            className="text-sm px-4 py-2 rounded-lg 
              text-blue-600 dark:text-blue-400 
              hover:bg-blue-50 dark:hover:bg-gray-800 
              transition-colors"
          >
            Esqueci minha senha
          </Link>

          {/* Botão voltar */}
          <Link
            to="/"
            className="inline-flex items-center justify-center gap-2 px-6 py-2.5 
              rounded-xl bg-gradient-to-r from-blue-600 to-blue-700 
              dark:from-blue-500 dark:to-blue-600
              text-white font-semibold shadow-md hover:shadow-lg
              hover:from-blue-700 hover:to-blue-800
              dark:hover:from-blue-600 dark:hover:to-blue-700
              transition-all"
          >
            <ArrowLeft className="h-5 w-5" />
            Voltar para o site
          </Link>
        </div>
      </motion.div>
    </div>
  );
};

export default AdminLoginPage;
