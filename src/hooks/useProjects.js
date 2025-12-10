// src/hooks/useProjects.js
import { useState, useEffect } from 'react';
import { projectsApi } from '../lib/api';

export function useProjects() {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchProjects = async () => {
    try {
      setLoading(true);
      const response = await projectsApi.list();
      setProjects(response.data.projects || []);
      setError(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  const createProject = async (data) => {
    try {
      const response = await projectsApi.create(data);
      setProjects(prev => [...prev, response.data.project]);
      return response.data.project;
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  const deleteProject = async (id) => {
    try {
      await projectsApi.delete(id);
      setProjects(prev => prev.filter(p => p.id !== id));
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  return { projects, loading, error, createProject, deleteProject, refetch: fetchProjects };
}
