import api from '../config/apiConfig';

export const homeService = {
  getHomePageData: async () => {
    const response = await api.get('/home');
    return response.data;
  }
};
