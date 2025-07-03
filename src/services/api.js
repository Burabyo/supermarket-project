import axios from 'axios';

const API_BASE_URL = 'https://supermarket-project-production.up.railway.app/';

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle token expiration
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/';
    }
    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  login: (email, password) => api.post('/auth/login', { email, password }),
  register: (userData) => api.post('/auth/register', userData),
  logout: () => api.post('/auth/logout'),
};

// Users API
export const usersAPI = {
  getAll: () => api.get('/users'),
  getProfile: () => api.get('/users/profile'),
  updateStatus: (id, is_active) => api.patch(`/users/${id}/status`, { is_active }),
};

// Products API
export const productsAPI = {
  getAll: (params = {}) => api.get('/products', { params }),
  getById: (id) => api.get(`/products/${id}`),
  create: (productData) => api.post('/products', productData),
  update: (id, productData) => api.put(`/products/${id}`, productData),
  delete: (id) => api.delete(`/products/${id}`),
};

// Sales API
export const salesAPI = {
  getAll: (params = {}) => api.get('/sales', { params }),
  getById: (id) => api.get(`/sales/${id}`),
  create: (saleData) => api.post('/sales', saleData),
  getDailySummary: (date) => api.get('/sales/summary/daily', { params: { date } }),
};

// Dashboard API
export const dashboardAPI = {
  getStats: () => api.get('/dashboard/stats'),
  getRecentSales: (limit = 10) => api.get('/dashboard/recent-sales', { params: { limit } }),
  getLowStock: () => api.get('/dashboard/low-stock'),
  getExpiring: () => api.get('/dashboard/expiring'),
  getSalesByPayment: (period = '30') => api.get('/dashboard/sales-by-payment', { params: { period } }),
};

// Audit API
export const auditAPI = {
  getLogs: (params = {}) => api.get('/audit', { params }),
};

export default api;