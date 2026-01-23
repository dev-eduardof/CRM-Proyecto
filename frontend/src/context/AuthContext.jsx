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
      console.log('Intentando login con:', username);
      const response = await authAPI.login(username, password);
      console.log('Respuesta de login:', response);
      const { access_token } = response.data;
      console.log('Token recibido:', access_token);
      
      // Guardar token
      localStorage.setItem('token', access_token);
      setToken(access_token);
      
      // Cargar datos del usuario
      console.log('Cargando datos del usuario...');
      const userResponse = await authAPI.me();
      console.log('Datos del usuario:', userResponse.data);
      setUser(userResponse.data);
      
      return { success: true };
    } catch (error) {
      console.error('Error en login:', error);
      console.error('Error response:', error.response);
      return {
        success: false,
        message: error.response?.data?.detail || 'Error al iniciar sesión'
      };
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
