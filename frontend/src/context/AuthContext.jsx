import { createContext, useState, useContext, useEffect } from 'react';
import { authAPI } from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [loading, setLoading] = useState(true);

  // Cargar usuario al iniciar
  useEffect(() => {
    if (token) {
      loadUser();
    } else {
      setLoading(false);
    }
  }, [token]);

  const loadUser = async () => {
    try {
      const response = await authAPI.me();
      setUser(response.data);
    } catch (error) {
      console.error('Error al cargar usuario:', error);
      logout();
    } finally {
      setLoading(false);
    }
  };

  const login = async (username, password) => {
    try {
      const response = await authAPI.login(username, password);
      const { access_token } = response.data;
      localStorage.setItem('token', access_token);
      setToken(access_token);
      const userResponse = await authAPI.me();
      setUser(userResponse.data);
      return { success: true };
    } catch (error) {
      const msg = !error.response
        ? 'No se pudo conectar al servidor. Comprueba que el backend esté en marcha y la URL en .env (VITE_API_URL).'
        : (typeof error.response?.data?.detail === 'string'
          ? error.response.data.detail
          : Array.isArray(error.response?.data?.detail)
            ? error.response.data.detail.map((e) => e.msg || e).join(', ')
            : 'Error al iniciar sesión');
      return { success: false, message: msg };
    }
  };

  const loginTecnico = async (codigo) => {
    try {
      const response = await authAPI.loginTecnico(codigo);
      const { access_token } = response.data;
      localStorage.setItem('token', access_token);
      setToken(access_token);
      const userResponse = await authAPI.me();
      setUser(userResponse.data);
      return { success: true };
    } catch (error) {
      const msg = !error.response
        ? 'No se pudo conectar al servidor. Comprueba que el backend esté en marcha.'
        : (typeof error.response?.data?.detail === 'string'
          ? error.response.data.detail
          : 'Código incorrecto o no corresponde a un técnico activo');
      return { success: false, message: msg };
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    setToken(null);
    setUser(null);
  };

  const register = async (userData) => {
    try {
      await authAPI.register(userData);
      return { success: true };
    } catch (error) {
      console.error('Error en registro:', error);
      return {
        success: false,
        message: error.response?.data?.detail || 'Error al registrar usuario'
      };
    }
  };

  const value = {
    user,
    token,
    loading,
    login,
    loginTecnico,
    logout,
    register,
    isAuthenticated: !!token && !!user
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth debe ser usado dentro de AuthProvider');
  }
  return context;
};
