import api from './api';

export const analyticsService = {
  getDashboard: async () => {
    const response = await api.get('/analytics/dashboard');
    return response.data;
  },

  getClickTrends: async (params = {}) => {
    const response = await api.get('/analytics/clicks', { params });
    return response.data;
  },

  getDeviceStats: async (params = {}) => {
    const response = await api.get('/analytics/devices', { params });
    return response.data;
  },

  getGeoStats: async (params = {}) => {
    const response = await api.get('/analytics/geo', { params });
    return response.data;
  },

  getTopUrls: async (params = {}) => {
    const response = await api.get('/analytics/top-urls', { params });
    return response.data;
  },

  getUrlAnalytics: async (id, params = {}) => {
    const response = await api.get(`/analytics/urls/${id}`, { params });
    return response.data;
  },
};
