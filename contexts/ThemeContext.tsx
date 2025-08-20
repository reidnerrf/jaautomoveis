import React, { createContext, useContext, useState, useEffect } from "react";

interface ThemeContextType {
  isDarkMode: boolean;
  toggleDarkMode: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isDarkMode, setIsDarkMode] = useState<boolean>(() => {
    try {
      const saved = localStorage.getItem("darkMode");
      if (saved === null) return false;
      if (saved === "true" || saved === "false") return saved === "true";
      // Fallback para valores antigos/inesperados
      const parsed = JSON.parse(saved);
      return typeof parsed === "boolean" ? parsed : false;
    } catch {
      // Valor corrompido ou storage indisponível
      try {
        localStorage.removeItem("darkMode");
      } catch {
        // Ignore errors
      }
      return false;
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem("darkMode", JSON.stringify(isDarkMode));
    } catch {
      // Ignore errors
    }
    try {
      document.documentElement.classList.toggle("dark", isDarkMode);
    } catch {
      // Ignore errors
    }
  }, [isDarkMode]);

  const toggleDarkMode = () => setIsDarkMode(!isDarkMode);

  return (
    <ThemeContext.Provider value={{ isDarkMode, toggleDarkMode }}>{children}</ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme must be used within ThemeProvider");
  }
  return context;
};
