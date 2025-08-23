import api from '../config/apiConfig';
import axios from 'axios';
import { API_BASE_URL } from '../config/apiConfig';

export const homeService = {
  getHomePageData: async () => {
    try {
      // First try using the api instance with proper prefixing
      const response = await api.get('/home');
      return response.data;
    } catch (error) {
      console.error('Error fetching with api instance, trying direct URL:', error);
      // Fallback to direct URL without /api prefix for compatibility
      const fallbackResponse = await axios.get(`${API_BASE_URL}/home`);
      return fallbackResponse.data;
    }
  }
};
