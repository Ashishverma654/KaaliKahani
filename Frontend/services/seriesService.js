import api from '../utils/api';

const seriesService = {
  createSeries: async (payload) => {
    const response = await api.post('/series', payload);
    return response.data.data;
  },

  getMySeries: async () => {
    const response = await api.get('/series/me');
    return response.data.data;
  },

  getSeriesById: async (id) => {
    const response = await api.get(`/series/${id}`);
    return response.data.data;
  }
};

export default seriesService;
