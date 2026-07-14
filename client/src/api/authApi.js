import api from './axiosInstance.js';

export const authApi = {
  signup: (data) => api.post('/auth/signup', data),
  login: (data) => api.post('/auth/login', data),
  logout: () => api.post('/auth/logout'),
  logoutAll: () => api.post('/auth/logout-all'),
  getMe: () => api.get('/auth/me'),

  verifyEmailCode: (userId, code) => api.post('/auth/verify-email/code', { userId, code }),
  resendVerification: (email) => api.post('/auth/resend-verification', { email }),

  forgotPassword: (email) => api.post('/auth/forgot-password', { email }),
  resetPassword: (token, password, confirmPassword) =>
    api.post('/auth/reset-password', { token, password, confirmPassword }),
};

export const userApi = {
  updateProfile: (data) => api.patch('/users/profile', data),
  uploadAvatar: (formData) =>
    api.post('/users/profile/avatar', formData, { headers: { 'Content-Type': 'multipart/form-data' } }),
  removeAvatar: () => api.delete('/users/profile/avatar'),

  changePassword: (data) => api.post('/users/change-password', data),

  requestEmailChange: (newEmail, password) => api.post('/users/change-email', { newEmail, password }),
  confirmEmailChangeCode: (code) => api.post('/users/change-email/confirm/code', { code }),

  changeUsername: (newUsername) => api.post('/users/change-username', { newUsername }),
  checkUsernameAvailability: (username) => api.get(`/users/username-available/${username}`),

  deleteAccount: (password) => api.delete('/users/account', { data: { password } }),

  getSecurityOverview: () => api.get('/users/security'),
  revokeSession: (sessionId) => api.delete(`/users/sessions/${sessionId}`),
  revokeAllSessions: () => api.post('/users/sessions/revoke-all'),
};
