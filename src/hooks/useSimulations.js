import { useState } from 'react';
import { apiClient } from '../lib/apiClient';

export const useSimulations = () => {
  const [simulations, setSimulations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  /**
   * Run a protocol simulation
   */
  const runSimulation = async (config) => {
    try {
      setLoading(true);
      setError(null);

      const response = await apiClient.post('/api/v1/simulations', config);
      const result = response.data;

      // Add to list
      setSimulations((prev) => [result, ...prev]);

      return result;
    } catch (err) {
      const errorMsg = err.response?.data?.error || err.message;
      setError(errorMsg);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  /**
   * Fetch all simulations
   */
  const fetchSimulations = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await apiClient.get('/api/v1/simulations');
      setSimulations(response.data);

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
   * Get simulation result by ID
   */
  const getSimulation = async (simulationId) => {
    try {
      setLoading(true);
      setError(null);

      const response = await apiClient.get(
        `/api/v1/simulations/${simulationId}`
      );

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
   * Clear simulations list
   */
  const clearSimulations = () => {
    setSimulations([]);
    setError(null);
  };

  return {
    simulations,
    loading,
    error,
    runSimulation,
    fetchSimulations,
    getSimulation,
    clearSimulations
  };
};
