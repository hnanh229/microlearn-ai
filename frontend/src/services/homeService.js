import axios from 'axios';
import { API_BASE_URL } from '../config/apiConfig';

export const homeService = {
  getHomePageData: async () => {
    const response = await axios.get(`${API_BASE_URL}/home`);
    return response.data;
  }
};
