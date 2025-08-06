import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

export const homeService = {
  getHomePageData: async () => {
    const response = await axios.get(`${API_URL}/home`);
    return response.data;
  }
};
