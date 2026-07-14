import api from './axiosInstance.js';

export const postsApi = {
  listPublished: (params) => api.get('/posts', { params }),
  get: (id) => api.get(`/posts/${id}`),
  create: (data) => api.post('/posts', data),
  update: (id, data) => api.patch(`/posts/${id}`, data),
  remove: (id) => api.delete(`/posts/${id}`),
  mine: () => api.get('/posts/mine/list'),
  allForEditing: () => api.get('/posts/all/list'),

  comments: (id) => api.get(`/posts/${id}/comments`),
  addComment: (id, body) => api.post(`/posts/${id}/comments`, { body }),

  moderationList: (params) => api.get('/moderation/posts', { params }),
  moderate: (id, action, note) => api.post(`/moderation/posts/${id}`, { action, note }),
  moderateDelete: (id) => api.delete(`/moderation/posts/${id}`),

  moderationComments: (params) => api.get('/moderation/comments', { params }),
  moderateComment: (commentId, action) => api.post(`/moderation/comments/${commentId}`, { action }),
  moderateDeleteComment: (commentId) => api.delete(`/moderation/comments/${commentId}`),
};

export const traderApi = {
  apply: (message) => api.post('/trader-applications', { message }),
  mine: () => api.get('/trader-applications/mine'),
  list: (params) => api.get('/trader-applications', { params }),
  review: (id, decision, note) => api.post(`/trader-applications/${id}/review`, { decision, note }),
};

export const supportApi = {
  submit: (data) => api.post('/support-tickets', data),
  list: (params) => api.get('/support-tickets', { params }),
  update: (id, data) => api.patch(`/support-tickets/${id}`, data),
};

export const adminApi = {
  analytics: (range) => api.get('/admin/analytics', { params: { range } }),
  listUsers: () => api.get('/admin/users'),
  assignRole: (id, role) => api.patch(`/admin/users/${id}/role`, { role }),
  billing: () => api.get('/admin/billing'),
  security: () => api.get('/admin/security'),
};
