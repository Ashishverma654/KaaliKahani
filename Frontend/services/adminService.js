import api from '../utils/api';

const adminService = {
  getStats: async () => {
    const response = await api.get('/admin/dashboard');
    return response.data.data;
  },

  getStories: async (status = '') => {
    const response = await api.get(`/admin/stories${status ? `?status=${status.toLowerCase()}` : ''}`);
    return response.data.data;
  },

  getUsers: async () => {
    const response = await api.get('/admin/users');
    return response.data.data;
  },

  getLogs: async () => {
    const response = await api.get('/admin/logs');
    return response.data.data;
  },

  getAnalytics: async () => {
    // Current backend doesn't have deep analytics yet, so we return a hybrid or mock for now
    // But we'll try the real endpoint once established
    try {
        const response = await api.get('/admin/dashboard');
        return {
          dailyTraffic: [
            { day: 'Mon', views: 4500 },
            { day: 'Tue', views: 5200 },
            { day: 'Wed', views: 4800 },
            { day: 'Thu', views: 6100 },
            { day: 'Fri', views: 8200 },
            { day: 'Sat', views: 9500 },
            { day: 'Sun', views: 9100 },
          ]
        };
    } catch (e) {
        return { dailyTraffic: [] };
    }
  }
};

export default adminService;
