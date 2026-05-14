import api from '../utils/api';

const adminService = {
  getAllStories: async () => {
    const response = await api.get('/admin/stories');
    return response.data.data;
  },

  updateStoryStatus: async (id, status) => {
    const response = await api.patch(`/admin/stories/${id}/status`, { status });
    return response.data.data;
  },

  getStats: async (range = '30') => {
    const response = await api.get(`/admin/stats?range=${range}`);
    return response.data.data;
  },

  deleteStory: async (id) => {
    const response = await api.delete(`/stories/${id}`);
    return response.data.data;
  }
};

export default adminService;
