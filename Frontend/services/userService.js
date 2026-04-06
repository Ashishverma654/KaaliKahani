// userService.js
import api from '../utils/api';

export const userService = {
  getUsers: async () => {
    const response = await api.get('/admin/users');
    return response.data.data;
  },

  toggleBlock: async (id) => {
    const response = await api.put(`/admin/users/${id}/toggle-block`);
    return response.data.data;
  }
};

// commentService.js
export const commentService = {
  getComments: async () => {
    const response = await api.get('/admin/comments');
    return response.data.data;
  },

  approveComment: async (id) => {
    const response = await api.put(`/admin/comments/${id}/approve`);
    return response.data.data;
  },

  rejectComment: async (id) => {
    const response = await api.put(`/admin/comments/${id}/reject`);
    return response.data.data;
  },

  bulkApprove: async (ids = []) => {
    const response = await api.post('/admin/comments/approve-bulk', { ids });
    return response.data.data;
  },

  deleteComment: async (id) => {
    const response = await api.delete(`/admin/comments/${id}`);
    return response.data.data;
  }
};
