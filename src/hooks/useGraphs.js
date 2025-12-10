import { useState } from 'react';
import { apiClient } from '../lib/apiClient';

export const useGraphs = () => {
  const [graphs, setGraphs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  /**
   * Create a protocol DAG
   */
  const createProtocolDAG = async (protocolName, steps) => {
    try {
      setLoading(true);
      setError(null);

      const response = await apiClient.post('/api/v1/graphs/protocol-dag', {
        protocolName,
        steps
      });

      const graph = response.data;
      setGraphs((prev) => [graph, ...prev]);

      return graph;
    } catch (err) {
      const errorMsg = err.response?.data?.error || err.message;
      setError(errorMsg);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  /**
   * Create instrument network graph
   */
  const createInstrumentNetwork = async (instruments) => {
    try {
      setLoading(true);
      setError(null);

      const response = await apiClient.post(
        '/api/v1/graphs/instrument-network',
        { instruments }
      );

      const graph = response.data;
      setGraphs((prev) => [graph, ...prev]);

      return graph;
    } catch (err) {
      const errorMsg = err.response?.data?.error || err.message;
      setError(errorMsg);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  /**
   * Create sample lineage graph
   */
  const createSampleLineageGraph = async (samples) => {
    try {
      setLoading(true);
      setError(null);

      const response = await apiClient.post('/api/v1/graphs/sample-lineage', {
        samples
      });

      const graph = response.data;
      setGraphs((prev) => [graph, ...prev]);

      return graph;
    } catch (err) {
      const errorMsg = err.response?.data?.error || err.message;
      setError(errorMsg);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  /**
   * Get graph by ID
   */
  const getGraph = async (graphId) => {
    try {
      setLoading(true);
      setError(null);

      const response = await apiClient.get(`/api/v1/graphs/${graphId}`);

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
   * Calculate centrality measures
   */
  const calculateCentrality = async (graphId) => {
    try {
      setLoading(true);
      setError(null);

      const response = await apiClient.get(
        `/api/v1/graphs/${graphId}/centrality`
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
   * Find paths between nodes
   */
  const findPaths = async (graphId, source, target) => {
    try {
      setLoading(true);
      setError(null);

      const response = await apiClient.get(
        `/api/v1/graphs/${graphId}/paths`,
        { params: { source, target } }
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
   * Fetch all graphs
   */
  const fetchGraphs = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await apiClient.get('/api/v1/graphs');
      setGraphs(response.data);

      return response.data;
    } catch (err) {
      const errorMsg = err.response?.data?.error || err.message;
      setError(errorMsg);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return {
    graphs,
    loading,
    error,
    createProtocolDAG,
    createInstrumentNetwork,
    createSampleLineageGraph,
    getGraph,
    calculateCentrality,
    findPaths,
    fetchGraphs
  };
};
