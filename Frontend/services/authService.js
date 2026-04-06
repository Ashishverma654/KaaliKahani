import api from '../utils/api';

const authService = {
  login: async (credentials, endpoint = '/auth/login') => {
    const response = await api.post(endpoint, credentials);
    return response.data.data;
  },

  register: async (userData) => {
    const response = await api.post('/auth/register', userData);
    return response.data.data;
  },

  getMe: async () => {
    const response = await api.get('/auth/me');
    return response.data.data;
  },

  updateProfile: async (userData) => {
    const response = await api.put('/auth/profile', userData);
    return response.data.data;
  },

  changePassword: async (passwords) => {
    const response = await api.post('/auth/change-password', passwords);
    return response.data.data;
  },

  logout: async () => {
    const response = await api.post('/auth/logout');
    return response.data.data;
  }
};

export default authService;
