import api from '../utils/api';

const storyService = {
  getStoryBySlug: async (slug, lang = 'en') => {
    const response = await api.get(`/stories/${slug}?lang=${lang}`);
    return response.data.data;
  },

  getMyStories: async () => {
    const response = await api.get('/stories/me');
    return response.data.data;
  },

  getMyDrafts: async () => {
    try {
      const response = await api.get('/stories/drafts');
      return response.data.data;
    } catch (error) {
      return [];
    }
  },

  getDraftById: async (id) => {
    const response = await api.get(`/stories/draft/${id}`);
    return response.data.data;
  },

  saveDraft: async (data) => {
    const response = await api.post('/stories/draft', data);
    return response.data.data;
  },

  updateDraft: async (id, data) => {
    const response = await api.put(`/stories/draft/${id}`, data);
    return response.data.data;
  },

  searchStories: async (query, lang = 'en') => {
    const response = await api.get(`/stories/search?query=${encodeURIComponent(query)}&lang=${lang}`);
    return response.data.data;
  },

  getFeaturedStory: async () => {
    const response = await api.get('/stories/featured');
    return response.data.data;
  },

  getProgress: async (id) => {
    const response = await api.get(`/progress/${id}`);
    return response.data.data;
  },

  updateProgress: async (id, progress) => {
    const response = await api.put(`/progress/${id}`, { progress });
    return response.data.data;
  },

  likeStory: async (id) => {
    const response = await api.post(`/stories/${id}/like`);
    return response.data.data;
  },

  addComment: async (id, content) => {
    const response = await api.post(`/stories/${id}/comment`, { content });
    return response.data.data;
  }
};

export default storyService;
