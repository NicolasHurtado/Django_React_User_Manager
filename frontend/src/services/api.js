import axios from 'axios';
import { authHeader, getToken, getRefreshToken, removeToken } from './auth';

const API_URL = process.env.REACT_APP_API_URL || '/api';

// Variable para controlar si estamos en medio de un refresh token
let isRefreshing = false;
// Cola de peticiones pendientes para reintentarlas después del refresh
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach(prom => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  
  failedQueue = [];
};

// Crear un interceptor para manejar los errores de autenticación
axios.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    
    // Si no hay respuesta del servidor, no intentamos refresh
    if (!error.response) {
      return Promise.reject(error);
    }
    
    // Si el error es 401 y no hemos intentado refrescar el token
    if (error.response.status === 401 && !originalRequest._retry) {
      // Si no hay token o ya estamos refrescando, rechazamos
      if (!getToken() || !getRefreshToken()) {
        removeToken();
        return Promise.reject(error);
      }
      
      if (isRefreshing) {
        // Si ya estamos refrescando, añadimos esta petición a la cola
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then(token => {
            originalRequest.headers.Authorization = `Bearer ${token}`;
            return axios(originalRequest);
          })
          .catch(err => {
            return Promise.reject(err);
          });
      }
      
      originalRequest._retry = true;
      isRefreshing = true;
      
      try {
        // Intentamos refrescar el token
        const refreshToken = getRefreshToken();
        
        const response = await axios.post(`${API_URL}/token/refresh/`, {
          refresh: refreshToken,
        });
        
        // Si obtenemos un nuevo token, lo guardamos y reintentamos la petición
        if (response.data.access) {
          const userToken = JSON.parse(localStorage.getItem('user_token'));
          userToken.access = response.data.access;
          localStorage.setItem('user_token', JSON.stringify(userToken));
          
          // Reintentamos todas las peticiones en cola
          processQueue(null, response.data.access);
          
          // Reintentamos la petición original con el nuevo token
          originalRequest.headers.Authorization = `Bearer ${response.data.access}`;
          isRefreshing = false;
          return axios(originalRequest);
        }
      } catch (refreshError) {
        // Si no podemos refrescar el token, procesamos la cola con error
        processQueue(refreshError, null);
        removeToken();
        isRefreshing = false;
        return Promise.reject(refreshError);
      }
    }
    
    return Promise.reject(error);
  }
);

// Función auxiliar para verificar autenticación
const checkAuth = () => {
  const token = getToken();
  if (!token) {
    throw new Error('No autenticado');
  }
  return token;
};

// Servicios para Clientes
export const clientService = {
  getAll: async () => {
    try {
      checkAuth();
      const response = await axios.get(`${API_URL}/clients/`, { headers: authHeader() });
      return response.data;
    } catch (error) {
      console.error('Error fetching clients:', error);
      throw error;
    }
  },
  
  get: async (id) => {
    try {
      checkAuth();
      const response = await axios.get(`${API_URL}/clients/${id}/`, { headers: authHeader() });
      return response.data;
    } catch (error) {
      console.error(`Error fetching client ${id}:`, error);
      throw error;
    }
  },
  
  create: async (data) => {
    try {
      checkAuth();
      const response = await axios.post(`${API_URL}/clients/`, data, { headers: authHeader() });
      return response.data;
    } catch (error) {
      console.error('Error creating client:', error);
      throw error;
    }
  },
  
  update: async (id, data) => {
    try {
      checkAuth();
      const response = await axios.put(`${API_URL}/clients/${id}/`, data, { headers: authHeader() });
      return response.data;
    } catch (error) {
      console.error(`Error updating client ${id}:`, error);
      throw error;
    }
  },
  
  delete: async (id) => {
    try {
      checkAuth();
      const response = await axios.delete(`${API_URL}/clients/${id}/`, { headers: authHeader() });
      return response.data;
    } catch (error) {
      console.error(`Error deleting client ${id}:`, error);
      throw error;
    }
  },
};

// Servicios para Proyectos
export const projectService = {
  getAll: async () => {
    try {
      checkAuth();
      const response = await axios.get(`${API_URL}/projects/`, { headers: authHeader() });
      return response.data;
    } catch (error) {
      console.error('Error fetching projects:', error);
      throw error;
    }
  },
  
  get: async (id) => {
    try {
      checkAuth();
      const response = await axios.get(`${API_URL}/projects/${id}/`, { headers: authHeader() });
      return response.data;
    } catch (error) {
      console.error(`Error fetching project ${id}:`, error);
      throw error;
    }
  },
  
  create: async (data) => {
    try {
      checkAuth();
      const response = await axios.post(`${API_URL}/projects/`, data, { headers: authHeader() });
      return response.data;
    } catch (error) {
      console.error('Error creating project:', error);
      throw error;
    }
  },
  
  update: async (id, data) => {
    try {
      checkAuth();
      const response = await axios.put(`${API_URL}/projects/${id}/`, data, { headers: authHeader() });
      return response.data;
    } catch (error) {
      console.error(`Error updating project ${id}:`, error);
      throw error;
    }
  },
  
  delete: async (id) => {
    try {
      checkAuth();
      const response = await axios.delete(`${API_URL}/projects/${id}/`, { headers: authHeader() });
      return response.data;
    } catch (error) {
      console.error(`Error deleting project ${id}:`, error);
      throw error;
    }
  },
  
  getByStatus: async (status) => {
    try {
      checkAuth();
      const response = await axios.get(`${API_URL}/projects/by_status/?status=${status}`, { headers: authHeader() });
      return response.data;
    } catch (error) {
      console.error(`Error fetching projects by status ${status}:`, error);
      throw error;
    }
  },
}; 