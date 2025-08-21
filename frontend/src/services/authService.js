import axios from 'axios';
import { API_BASE_URL } from '../config/apiConfig';

const API_URL = `${API_BASE_URL}/auth`;

// Helper function to get the auth token from localStorage
const getAuthHeader = () => {
  const token = localStorage.getItem('token');
  return { headers: { Authorization: `Bearer ${token}` } };
};

const authService = {
  signup: (firstName, lastName, email, password) =>
    axios.post(`${API_URL}/signup`, { firstName, lastName, email, password }),

  login: (email, password) =>
    axios.post(`${API_URL}/login`, { email, password }),

  verifyEmail: (token) =>
    axios.post(`${API_URL}/verify-email`, { token }),

  resendVerification: (email) =>
    axios.post(`${API_URL}/resend-verification`, { email }),

  getUserProfile: async () => {
    try {
      const response = await axios.get(`${API_URL}/profile`, getAuthHeader());
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  updateUserProfile: async (userData) => {
    try {
      const response = await axios.put(`${API_URL}/profile`, userData, getAuthHeader());
      return response.data;
    } catch (error) {
      throw error;
    }
  }
};

export default authService;
