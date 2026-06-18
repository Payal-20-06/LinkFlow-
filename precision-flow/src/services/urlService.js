import api from './api';

export const urlService = {
  /**
   * Fetch paginated list of the authenticated user's URLs.
   * FIXED: was calling /urls which was unauthenticated and returned ALL urls.
   * Now calls GET /urls with auth header — returns only user's own URLs.
   */
  getUrls: async (params = {}) => {
    const response = await api.get('/urls', { params });
    return response.data;
  },

  /**
   * Create a new short URL.
   * FIXED: was calling POST /urls/create — backend now uses POST /urls.
   * Payload uses backend field names: original_url, custom_slug.
   */
  createUrl: async (data) => {
    // Normalize field names: frontend form uses "destination" and "slug"
    // but the backend schema expects "original_url" and "custom_slug"
    const payload = {
      original_url: data.original_url || data.destination,
      custom_slug: data.custom_slug || data.slug || undefined,
      title: data.title || undefined,
    };
    const response = await api.post('/urls', payload);
    return response.data;
  },

  /**
   * Update an existing URL.
   * FIXED: unchanged path — PUT /urls/:id already matches backend.
   * Payload uses backend field names.
   */
  updateUrl: async (id, data) => {
    const payload = {
      original_url: data.original_url || data.destination || undefined,
      title: data.title || undefined,
      is_active: data.is_active,
    };
    const response = await api.put(`/urls/${id}`, payload);
    return response.data;
  },

  /**
   * Delete a URL permanently.
   * FIXED: unchanged path — DELETE /urls/:id already matches backend.
   */
  deleteUrl: async (id) => {
    const response = await api.delete(`/urls/${id}`);
    return response.data;
  },

  /**
   * Fetch a single URL by ID.
   * FIXED: unchanged path — GET /urls/:id already matches backend.
   */
  getUrl: async (id) => {
    const response = await api.get(`/urls/${id}`);
    return response.data;
  },

  /**
   * Delete multiple URLs at once.
   * FIXED: unchanged path — POST /urls/bulk-delete matches backend.
   */
  bulkDelete: async (ids) => {
    const response = await api.post('/urls/bulk-delete', { ids });
    return response.data;
  },

  /**
   * Get QR code for a URL (v2 — endpoint not yet implemented in backend).
   */
  getQrCode: async (id) => {
    const response = await api.get(`/urls/${id}/qr`);
    return response.data;
  },
};
