import api from './api';

export const authService = {
  login: async (credentials) => {
    const response = await api.post('/auth/login', credentials);
    return response.data;
  },

  register: async (userData) => {
    const response = await api.post('/auth/register', userData);
    return response.data;
  },

  logout: async () => {
    try {
      await api.post('/auth/logout');
    } catch (_) {
      // Silently fail — we always clear local state
    }
  },

  googleLogin: async (idToken) => {
    const response = await api.post('/auth/google', { id_token: idToken });
    return response.data;
  },

  getProfile: async () => {
    const response = await api.get('/user/profile');
    return response.data;
  },

  updateProfile: async (data) => {
    const response = await api.put('/user/profile', data);
    return response.data;
  },

  forgotPassword: async (email) => {
    const response = await api.post('/auth/forgot-password', { email });
    return response.data;
  },

  resetPassword: async (token, password) => {
    const response = await api.post('/auth/reset-password', { token, password });
    return response.data;
  },

  changePassword: async (data) => {
    const response = await api.post('/auth/change-password', data);
    return response.data;
  },

  setup2FA: async () => {
    const response = await api.post('/auth/2fa/setup');
    return response.data;
  },

  verify2FA: async (code) => {
    const response = await api.post('/auth/2fa/verify', { code });
    return response.data;
  },

  disable2FA: async () => {
    const response = await api.post('/auth/2fa/disable');
    return response.data;
  },

  login2FA: async (temp_token, code) => {
    const response = await api.post('/auth/login/2fa', { temp_token, code });
    return response.data;
  },

  deleteAccount: async () => {
    const response = await api.delete('/user/account');
    return response.data;
  },
};
