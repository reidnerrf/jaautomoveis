import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FiSun, FiMoon } from "react-icons/fi";
import { useTheme } from "../contexts/ThemeContext";

const DarkModeToggle: React.FC = () => {
  const { isDarkMode, toggleDarkMode } = useTheme();

  return (
    <motion.button
      onClick={toggleDarkMode}
      className="relative flex items-center justify-center w-9 h-9 rounded-full 
                 bg-gradient-to-tr from-gray-200/90 to-gray-300/80 
                 dark:from-gray-800/90 dark:to-gray-700/80
                 border border-white/20 dark:border-black/30
                 shadow-md hover:shadow-lg 
                 backdrop-blur-sm transition-all duration-300"
      whileHover={{ scale: 1.08 }}
      whileTap={{ scale: 0.92 }}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
      aria-label="Alternar modo escuro"
      title={isDarkMode ? "Modo claro" : "Modo escuro"}
    >
      <AnimatePresence mode="wait" initial={false}>
        <motion.div
          key={isDarkMode ? "dark" : "light"}
          initial={{ rotate: -90, opacity: 0, y: -5 }}
          animate={{ rotate: 0, opacity: 1, y: 0 }}
          exit={{ rotate: 90, opacity: 0, y: 5 }}
          transition={{ duration: 0.35 }}
          className="flex items-center justify-center"
        >
          {isDarkMode ? (
            <FiMoon className="text-yellow-400 drop-shadow-[0_0_6px_rgba(250,204,21,0.6)]" size={22} />
          ) : (
            <FiSun className="text-orange-400 drop-shadow-[0_0_6px_rgba(251,191,36,0.6)]" size={22} />
          )}
        </motion.div>
      </AnimatePresence>
    </motion.button>
  );
};

export default DarkModeToggle;
