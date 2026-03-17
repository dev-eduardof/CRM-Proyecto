import axios from 'axios';

// Configuración de la URL del backend desde variables de entorno (fallback para desarrollo)
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

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
  loginTecnico: (codigo) =>
    api.post('/api/v1/auth/login/tecnico', { codigo }),
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

// API de sucursales
export const sucursalesAPI = {
  getAll: (params) => api.get('/api/v1/sucursales', { params }),
  getById: (id) => api.get(`/api/v1/sucursales/${id}`),
  getByCliente: (clienteId) => api.get('/api/v1/sucursales', { params: { cliente_id: clienteId } }),
  create: (sucursalData) => api.post('/api/v1/sucursales', sucursalData),
  update: (id, sucursalData) => api.put(`/api/v1/sucursales/${id}`, sucursalData),
  delete: (id) => api.delete(`/api/v1/sucursales/${id}`)
};

// API de órdenes de trabajo
export const ordenesAPI = {
  getAll: (params) => api.get('/api/v1/ordenes', { params }),
  getById: (id) => api.get(`/api/v1/ordenes/${id}`),
  getFotos: (id) => api.get(`/api/v1/ordenes/${id}/fotos`),
  create: (ordenData) => api.post('/api/v1/ordenes', ordenData),
  update: (id, ordenData) => api.put(`/api/v1/ordenes/${id}`, ordenData),
  cambiarEstado: (id, estadoData) => api.patch(`/api/v1/ordenes/${id}/estado`, estadoData),
  delete: (id) => api.delete(`/api/v1/ordenes/${id}`),
  getCategorias: () => api.get('/api/v1/categorias'),
  getSubcategorias: (categoriaId) => api.get(`/api/v1/categorias/${categoriaId}/subcategorias`),
  getSubOrdenes: (ordenId) => api.get(`/api/v1/ordenes/${ordenId}/sub-ordenes`),
  createSubOrden: (ordenId, data) => api.post(`/api/v1/ordenes/${ordenId}/sub-ordenes`, data),
  updateSubOrden: (ordenId, subId, data) => api.put(`/api/v1/ordenes/${ordenId}/sub-ordenes/${subId}`, data),
  deleteSubOrden: (ordenId, subId) => api.delete(`/api/v1/ordenes/${ordenId}/sub-ordenes/${subId}`),
  createSubtarea: (ordenId, data) => api.post(`/api/v1/ordenes/${ordenId}/subtareas`, data),
  updateSubtarea: (subtareaId, data) => api.put(`/api/v1/subtareas/${subtareaId}`, data),
  deleteSubtarea: (subtareaId) => api.delete(`/api/v1/subtareas/${subtareaId}`),
  getSubtareaFotos: (subtareaId) => api.get(`/api/v1/subtareas/${subtareaId}/fotos`),
  uploadSubtareaFoto: async (subtareaId, formData) => {
    const baseURL = import.meta.env.VITE_API_URL || 'http://localhost:8000';
    const token = localStorage.getItem('token');
    const res = await fetch(`${baseURL}/api/v1/subtareas/${subtareaId}/foto`, {
      method: 'POST',
      headers: token ? { 'Authorization': `Bearer ${token}` } : {},
      body: formData
    });
    if (!res.ok) {
      const err = new Error(res.statusText || 'Error al subir foto');
      err.response = { status: res.status, data: await res.json().catch(() => ({})) };
      throw err;
    }
    return { data: await res.json() };
  },
  uploadFoto: async (ordenId, tipo, formData) => {
    const baseURL = import.meta.env.VITE_API_URL || 'http://localhost:8000';
    const token = localStorage.getItem('token');
    const res = await fetch(`${baseURL}/api/v1/ordenes/${ordenId}/foto?tipo=${tipo}`, {
      method: 'POST',
      headers: token ? { 'Authorization': `Bearer ${token}` } : {},
      body: formData
    });
    if (!res.ok) {
      const err = new Error(res.statusText || 'Error al subir foto');
      err.response = { status: res.status, data: await res.json().catch(() => ({})) };
      throw err;
    }
    return { data: await res.json() };
  }
};

// API de gastos
export const gastosAPI = {
  getAll: (params) => api.get('/api/v1/gastos', { params }),
  getResumen: (params) => api.get('/api/v1/gastos/resumen', { params }),
  getById: (id) => api.get(`/api/v1/gastos/${id}`),
  create: (data) => api.post('/api/v1/gastos', data),
  update: (id, data) => api.put(`/api/v1/gastos/${id}`, data),
  delete: (id) => api.delete(`/api/v1/gastos/${id}`)
};

// API de piezas (bodega/almacén)
export const piezasAPI = {
  getAll: (params) => api.get('/api/v1/piezas', { params }),
  getById: (id) => api.get(`/api/v1/piezas/${id}`),
  create: (data) => api.post('/api/v1/piezas', data),
  update: (id, data) => api.put(`/api/v1/piezas/${id}`, data),
  delete: (id) => api.delete(`/api/v1/piezas/${id}`),
  getByOrden: (ordenId) => api.get(`/api/v1/ordenes/${ordenId}/piezas`),
  addToOrden: (ordenId, data) => api.post(`/api/v1/ordenes/${ordenId}/piezas`, data),
  removeFromOrden: (ordenId, usoId) => api.delete(`/api/v1/ordenes/${ordenId}/piezas/${usoId}`),
  updateUso: (ordenId, usoId, data) => api.patch(`/api/v1/ordenes/${ordenId}/piezas/${usoId}`, data),
  // Catálogos (mecánico)
  getCatalogos: (params) => api.get('/api/v1/catalogos-pieza', { params }),
  createCatalogo: (data) => api.post('/api/v1/catalogos-pieza', data),
  updateCatalogo: (id, data) => api.put(`/api/v1/catalogos-pieza/${id}`, data),
  deleteCatalogo: (id) => api.delete(`/api/v1/catalogos-pieza/${id}`),
  deleteAllCatalogos: () => api.delete('/api/v1/catalogos-pieza/eliminar-todos'),
  getSubcatalogos: (catalogoId, params) => api.get(`/api/v1/catalogos-pieza/${catalogoId}/subcatalogos`, { params }),
  createSubcatalogo: (data) => api.post('/api/v1/subcatalogos-pieza', data),
  updateSubcatalogo: (id, data) => api.put(`/api/v1/subcatalogos-pieza/${id}`, data),
  deleteSubcatalogo: (id) => api.delete(`/api/v1/subcatalogos-pieza/${id}`)
};

// API de caja (sistemas de caja)
export const cajaAPI = {
  getMovimientos: (params) => api.get('/api/v1/caja/movimientos', { params }),
  createMovimiento: (data) => api.post('/api/v1/caja/movimientos', data),
  getApertura: (fecha) => api.get('/api/v1/caja/apertura', { params: { fecha } }),
  createApertura: (data) => api.post('/api/v1/caja/apertura', data),
  getResumenDia: (fecha) => api.get('/api/v1/caja/resumen-dia', { params: { fecha } }),
  getCortes: (params) => api.get('/api/v1/caja/cortes', { params }),
  getCorte: (id) => api.get(`/api/v1/caja/cortes/${id}`),
  createCorte: (data) => api.post('/api/v1/caja/cortes', data),
  getAnalisisOrden: (ordenId) => api.get(`/api/v1/caja/analisis-orden/${ordenId}`)
};

export default api;
