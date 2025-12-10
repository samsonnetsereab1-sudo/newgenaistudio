// src/hooks/useTemplates.js
import { useState, useEffect } from 'react';
import { templatesApi } from '../lib/api';

export function useTemplates() {
  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchTemplates = async () => {
    try {
      setLoading(true);
      const response = await templatesApi.list();
      setTemplates(response.data.templates || []);
      setError(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTemplates();
  }, []);

  const getTemplate = async (id) => {
    try {
      const response = await templatesApi.get(id);
      return response.data.template;
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  return { templates, loading, error, getTemplate, refetch: fetchTemplates };
}
