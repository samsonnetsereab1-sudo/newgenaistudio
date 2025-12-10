import { useState, useEffect } from 'react';
import { apiClient } from '../lib/apiClient';

export const usePresets = () => {
  const [presets, setPresets] = useState([]);
  const [categories, setCategories] = useState([]);
  const [tags, setTags] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  /**
   * Fetch all presets
   */
  const fetchPresets = async (filters = {}) => {
    try {
      setLoading(true);
      setError(null);

      const response = await apiClient.get('/api/v1/presets', {
        params: filters
      });

      setPresets(response.data);
      return response.data;
    } catch (err) {
      const errorMsg = err.response?.data?.error || err.message;
      setError(errorMsg);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  /**
   * Get recommended presets
   */
  const getRecommended = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await apiClient.get('/api/v1/presets/recommended');
      return response.data;
    } catch (err) {
      const errorMsg = err.response?.data?.error || err.message;
      setError(errorMsg);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  /**
   * Get preset by ID
   */
  const getPreset = async (presetId) => {
    try {
      setLoading(true);
      setError(null);

      const response = await apiClient.get(`/api/v1/presets/${presetId}`);
      return response.data;
    } catch (err) {
      const errorMsg = err.response?.data?.error || err.message;
      setError(errorMsg);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  /**
   * Get presets compatible with a template
   */
  const getCompatible = async (templateId) => {
    try {
      setLoading(true);
      setError(null);

      const response = await apiClient.get('/api/v1/presets', {
        params: { templateId }
      });

      return response.data;
    } catch (err) {
      const errorMsg = err.response?.data?.error || err.message;
      setError(errorMsg);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  /**
   * Get presets by category
   */
  const getByCategory = async (category) => {
    try {
      setLoading(true);
      setError(null);

      const response = await apiClient.get('/api/v1/presets', {
        params: { category }
      });

      return response.data;
    } catch (err) {
      const errorMsg = err.response?.data?.error || err.message;
      setError(errorMsg);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  /**
   * Search presets
   */
  const search = async (query) => {
    try {
      setLoading(true);
      setError(null);

      const response = await apiClient.get('/api/v1/presets', {
        params: { search: query }
      });

      return response.data;
    } catch (err) {
      const errorMsg = err.response?.data?.error || err.message;
      setError(errorMsg);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  /**
   * Create a custom preset
   */
  const createPreset = async (preset) => {
    try {
      setLoading(true);
      setError(null);

      const response = await apiClient.post('/api/v1/presets', preset);
      const created = response.data;

      setPresets((prev) => [created, ...prev]);
      return created;
    } catch (err) {
      const errorMsg = err.response?.data?.error || err.message;
      setError(errorMsg);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  /**
   * Update a custom preset
   */
  const updatePreset = async (presetId, updates) => {
    try {
      setLoading(true);
      setError(null);

      const response = await apiClient.put(`/api/v1/presets/${presetId}`, updates);
      const updated = response.data;

      setPresets((prev) =>
        prev.map((p) => (p.id === presetId ? updated : p))
      );

      return updated;
    } catch (err) {
      const errorMsg = err.response?.data?.error || err.message;
      setError(errorMsg);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  /**
   * Delete a custom preset
   */
  const deletePreset = async (presetId) => {
    try {
      setLoading(true);
      setError(null);

      await apiClient.delete(`/api/v1/presets/${presetId}`);

      setPresets((prev) => prev.filter((p) => p.id !== presetId));
      return true;
    } catch (err) {
      const errorMsg = err.response?.data?.error || err.message;
      setError(errorMsg);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  /**
   * Fetch categories
   */
  const fetchCategories = async () => {
    try {
      const response = await apiClient.get('/api/v1/presets/categories');
      setCategories(response.data);
      return response.data;
    } catch (err) {
      console.error('Failed to fetch categories:', err);
    }
  };

  /**
   * Fetch tags
   */
  const fetchTags = async () => {
    try {
      const response = await apiClient.get('/api/v1/presets/tags');
      setTags(response.data);
      return response.data;
    } catch (err) {
      console.error('Failed to fetch tags:', err);
    }
  };

  // Load initial data
  useEffect(() => {
    fetchPresets();
    fetchCategories();
    fetchTags();
  }, []);

  return {
    presets,
    categories,
    tags,
    loading,
    error,
    fetchPresets,
    getRecommended,
    getPreset,
    getCompatible,
    getByCategory,
    search,
    createPreset,
    updatePreset,
    deletePreset
  };
};
