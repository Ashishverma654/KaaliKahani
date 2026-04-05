import api from '../utils/api';

const storyService = {
  getStories: async (status = '') => {
    const response = await api.get(`/admin/stories${status ? `?status=${status.toLowerCase()}` : ''}`);
    return response.data.data;
  },

  getStoryBySlug: async (slug, lang = 'en') => {
    const response = await api.get(`/stories/${slug}?lang=${lang}`);
    return response.data.data;
  },

  approveStory: async (id) => {
    const response = await api.put(`/admin/stories/${id}/approve`);
    return response.data.data;
  },

  rejectStory: async (id) => {
    const response = await api.put(`/admin/stories/${id}/reject`);
    return response.data.data;
  },

  deleteStory: async (id) => {
    const response = await api.delete(`/admin/stories/${id}`);
    return response.data.data;
  },
  
  getMyStories: async () => {
    const response = await api.get('/stories/me');
    return response.data.data;
  }
};

export default storyService;
