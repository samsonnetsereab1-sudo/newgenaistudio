/**
 * useDataSource Hook
 * Manages data fetching for dynamic apps
 */

import { useState, useCallback, useEffect } from 'react';

const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:4000';

/**
 * Custom hook for data source management
 * @param {array} dataSources - Array of data source definitions
 * @returns {object} - { data, loading, error, fetchData, subscribe }
 */
export function useDataSource(dataSources = []) {
  const [data, setData] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [subscriptions, setSubscriptions] = useState({});

  /**
   * Fetch data from a data source
   * @param {string} dataSourceId - Data source ID
   * @param {object} options - Fetch options
   */
  const fetchData = useCallback(async (dataSourceId, options = {}) => {
    const dataSource = dataSources.find(ds => ds.id === dataSourceId);
    
    if (!dataSource) {
      console.error(`[useDataSource] Data source not found: ${dataSourceId}`);
      return null;
    }

    setLoading(true);
    setError(null);

    try {
      const result = await fetchFromDataSource(dataSource, options);
      
      // Store result
      setData(prev => ({
        ...prev,
        [dataSourceId]: result
      }));

      return result;
    } catch (err) {
      console.error(`[useDataSource] Fetch error for ${dataSourceId}:`, err);
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [dataSources]);

  /**
   * Subscribe to data source updates (for polling/WebSocket)
   * @param {string} dataSourceId - Data source ID
   * @param {function} callback - Callback function for updates
   */
  const subscribe = useCallback((dataSourceId, callback) => {
    const dataSource = dataSources.find(ds => ds.id === dataSourceId);
    
    if (!dataSource) {
      console.error(`[useDataSource] Data source not found: ${dataSourceId}`);
      return () => {};
    }

    // For REST with polling
    if (dataSource.type === 'rest' && dataSource.polling?.enabled) {
      const interval = dataSource.polling.interval || 5000;
      
      const intervalId = setInterval(async () => {
        try {
          const result = await fetchFromDataSource(dataSource, { method: 'GET' });
          callback(result);
          
          setData(prev => ({
            ...prev,
            [dataSourceId]: result
          }));
        } catch (err) {
          console.error(`[useDataSource] Polling error for ${dataSourceId}:`, err);
        }
      }, interval);

      setSubscriptions(prev => ({
        ...prev,
        [dataSourceId]: intervalId
      }));

      return () => clearInterval(intervalId);
    }

    // For WebSocket
    if (dataSource.type === 'websocket') {
      const ws = new WebSocket(dataSource.url);

      ws.onmessage = (event) => {
        try {
          const result = JSON.parse(event.data);
          callback(result);
          
          setData(prev => ({
            ...prev,
            [dataSourceId]: result
          }));
        } catch (err) {
          console.error(`[useDataSource] WebSocket message error:`, err);
        }
      };

      ws.onerror = (err) => {
        console.error(`[useDataSource] WebSocket error:`, err);
      };

      setSubscriptions(prev => ({
        ...prev,
        [dataSourceId]: ws
      }));

      return () => ws.close();
    }

    return () => {};
  }, [dataSources]);

  // Cleanup subscriptions on unmount
  useEffect(() => {
    return () => {
      Object.values(subscriptions).forEach(subscription => {
        if (typeof subscription === 'number') {
          clearInterval(subscription);
        } else if (subscription instanceof WebSocket) {
          subscription.close();
        }
      });
    };
  }, [subscriptions]);

  return {
    data,
    loading,
    error,
    fetchData,
    subscribe
  };
}

/**
 * Fetch data from a data source
 */
async function fetchFromDataSource(dataSource, options = {}) {
  const { method = 'GET', body = null, params = {} } = options;

  if (dataSource.type === 'rest') {
    // Build URL
    let url = dataSource.url;
    
    // If URL is relative, prepend API_BASE
    if (!url.startsWith('http')) {
      url = `${API_BASE}${url}`;
    }

    // Add query parameters
    if (params && Object.keys(params).length > 0) {
      const searchParams = new URLSearchParams(params);
      url += `?${searchParams.toString()}`;
    }

    const fetchOptions = {
      method,
      headers: {
        'Content-Type': 'application/json',
        ...dataSource.config?.headers
      }
    };

    if (body && ['POST', 'PUT', 'PATCH'].includes(method)) {
      fetchOptions.body = JSON.stringify(body);
    }

    const response = await fetch(url, fetchOptions);

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    return await response.json();
  }

  if (dataSource.type === 'websocket') {
    // WebSocket fetching is handled by subscribe
    throw new Error('WebSocket data sources should use subscribe, not fetchData');
  }

  throw new Error(`Unsupported data source type: ${dataSource.type}`);
}
