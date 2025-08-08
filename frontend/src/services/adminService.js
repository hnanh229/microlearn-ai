import axios from 'axios';

const API_URL = '/api/admin';

// Create axios instance with admin token
const adminApi = axios.create({
  baseURL: API_URL,
});

// Add token to requests
adminApi.interceptors.request.use((config) => {
  const token = localStorage.getItem('adminToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle token expiration
adminApi.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('adminToken');
      localStorage.removeItem('adminData');
      window.location.href = '/admin/login';
    }
    return Promise.reject(error);
  }
);

// Admin Authentication
export const adminLogin = (username, password) =>
  axios.post(`${API_URL}/login`, { username, password });

// Dashboard
export const getDashboardStats = () =>
  adminApi.get('/dashboard/stats');

// User Management
export const getUsers = (params = {}) =>
  adminApi.get('/users', { params });

export const getUser = (id) =>
  adminApi.get(`/users/${id}`);

export const updateUser = (id, userData) =>
  adminApi.put(`/users/${id}`, userData);

export const deleteUser = (id) =>
  adminApi.delete(`/users/${id}`);

export const toggleUserVerification = (id) =>
  adminApi.patch(`/users/${id}/toggle-verification`);
