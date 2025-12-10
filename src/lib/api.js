// src/lib/api.js
import apiClient from './apiClient';

// Projects API
export const projectsApi = {
  list: () => apiClient.get('/api/v1/projects'),
  get: (id) => apiClient.get(`/api/v1/projects/${id}`),
  create: (data) => apiClient.post('/api/v1/projects', data),
  delete: (id) => apiClient.delete(`/api/v1/projects/${id}`)
};

// Templates API
export const templatesApi = {
  list: () => apiClient.get('/api/v1/templates'),
  get: (id) => apiClient.get(`/api/v1/templates/${id}`)
};
