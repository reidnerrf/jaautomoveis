import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';

interface AuthContextType {
  isAuthenticated: boolean;
  token: string | null;
  loading: boolean;
  login: (username: string, password: string) => Promise<boolean>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

/**
 * Provides authentication state management for components.
 * @example
 * AuthProvider({children})
 * Returns a React component that provides authentication context.
 * @param {Object} children - React component(s) to be rendered.
 * @returns {JSX.Element} React Provider component for authentication context.
 */
export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const storedToken = sessionStorage.getItem('authToken');
    if (storedToken) {
      setToken(storedToken);
    }
    setLoading(false);
  }, []);

  const isAuthenticated = !!token;

  /**
  * Attempts to log in a user with the provided username and password.
  * @example
  * sync('sampleUser', 'samplePass')
  * true
  * @param {string} username - The username of the user attempting to log in.
  * @param {string} password - The password of the user attempting to log in.
  * @returns {Promise<boolean>} A promise that resolves to true if login is successful, otherwise false.
  **/
  const login = async (username: string, password: string): Promise<boolean> => {
    setLoading(true);
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        return false; // erro de login
      }

      sessionStorage.setItem('authToken', data.token);
      setToken(data.token);
      return true; // sucesso
    } catch (error) {
      console.error('Erro no login:', error);
      return false;
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    sessionStorage.removeItem('authToken');
    setToken(null);
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, token, loading, login, logout }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
