import axios from 'axios';

// Configuración de la URL del backend desde variables de entorno
const API_BASE_URL = import.meta.env.VITE_API_URL;

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor para agregar token a las peticiones
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Interceptor para manejar respuestas
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expirado o inválido
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Servicios de autenticación
export const authAPI = {
  login: (username, password) => 
    api.post('/api/v1/auth/login/json', { username, password }),
  loginForm: (username, password) => {
    const formData = new FormData();
    formData.append('username', username);
    formData.append('password', password);
    return api.post('/api/v1/auth/login', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
  },
  register: (userData) => 
    api.post('/api/v1/auth/register', userData),
  me: () => 
    api.get('/api/v1/auth/me'),
  logout: () => 
    api.post('/api/v1/auth/logout')
};

// API de usuarios
export const usersAPI = {
  getAll: () => api.get('/api/v1/users/'),
  getById: (id) => api.get(`/api/v1/users/${id}`),
  getMe: () => api.get('/api/v1/auth/me'),
  create: (userData) => api.post('/api/v1/users/', userData),
  update: (id, userData) => api.put(`/api/v1/users/${id}`, userData),
  delete: (id) => api.delete(`/api/v1/users/${id}`),
  getRoles: () => api.get('/api/v1/users/roles/list')
};

// API de vacaciones
export const vacacionesAPI = {
  getMySolicitudes: () => api.get('/api/v1/vacaciones/mis-solicitudes'),
  getAllSolicitudes: () => api.get('/api/v1/vacaciones/'),
  getById: (id) => api.get(`/api/v1/vacaciones/${id}`),
  create: (solicitudData) => api.post('/api/v1/vacaciones/', solicitudData),
  aprobar: (id, data) => api.post(`/api/v1/vacaciones/${id}/aprobar`, data),
  rechazar: (id, motivo) => api.post(`/api/v1/vacaciones/${id}/rechazar`, { motivo_rechazo: motivo }),
  cancelar: (id) => api.post(`/api/v1/vacaciones/${id}/cancelar`),
  downloadPDF: (id) => api.get(`/api/v1/vacaciones/${id}/pdf`, { responseType: 'blob' })
};

// API de clientes
export const clientesAPI = {
  getAll: (params) => api.get('/api/v1/clientes', { params }),
  getById: (id) => api.get(`/api/v1/clientes/${id}`),
  create: (clienteData) => api.post('/api/v1/clientes', clienteData),
  update: (id, clienteData) => api.put(`/api/v1/clientes/${id}`, clienteData),
  delete: (id) => api.delete(`/api/v1/clientes/${id}`)
};

// API de órdenes de trabajo
export const ordenesAPI = {
  getAll: (params) => api.get('/api/v1/ordenes', { params }),
  getById: (id) => api.get(`/api/v1/ordenes/${id}`),
  create: (ordenData) => api.post('/api/v1/ordenes', ordenData),
  update: (id, ordenData) => api.put(`/api/v1/ordenes/${id}`, ordenData),
  cambiarEstado: (id, estadoData) => api.patch(`/api/v1/ordenes/${id}/estado`, estadoData),
  delete: (id) => api.delete(`/api/v1/ordenes/${id}`),
  getCategorias: () => api.get('/api/v1/categorias'),
  getSubcategorias: (categoriaId) => api.get(`/api/v1/categorias/${categoriaId}/subcategorias`),
  uploadFoto: (ordenId, tipo, formData) => api.post(`/api/v1/ordenes/${ordenId}/foto?tipo=${tipo}`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  })
};

export default api;
