// src/hooks/useStagedGeneration.js
import { useState } from 'react';
import apiClient from '../lib/apiClient';

export function useStagedGeneration() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [appId, setAppId] = useState(null);
  const [stageResults, setStageResults] = useState([]);
  const [mode, setMode] = useState(null);

  const generateStaged = async (prompt, generationMode = 'staged') => {
    try {
      setLoading(true);
      setError(null);
      setStageResults([]);

      const response = await apiClient.post("/api/apps/generate-staged", { 
        prompt, 
        mode: generationMode 
      });

      setAppId(response.data.appId);
      setStageResults(response.data.stageResults || []);
      setMode(response.data.mode);

      return {
        success: true,
        appId: response.data.appId,
        spec: response.data.spec,
        fullSpec: response.data.fullSpec,
        stageResults: response.data.stageResults,
        mode: response.data.mode
      };
    } catch (err) {
      console.error("Staged generation error:", err);
      
      const errorData = err.response?.data;
      const errorMessage = errorData?.message || err.message;
      const errorCode = errorData?.error || 'UNKNOWN_ERROR';
      
      setError({ code: errorCode, message: errorMessage });
      setMode('error');

      return {
        success: false,
        error: errorCode,
        message: errorMessage,
        retryAfterSeconds: errorData?.retryAfterSeconds
      };
    } finally {
      setLoading(false);
    }
  };

  const refineApp = async (instructions) => {
    if (!appId) {
      setError({ code: 'NO_APP', message: 'No app loaded to refine' });
      return { success: false, error: 'NO_APP', message: 'No app loaded' };
    }

    try {
      setLoading(true);
      setError(null);

      const response = await apiClient.post(`/api/apps/${appId}/refine`, { 
        instructions 
      });

      setMode('refined');

      return {
        success: true,
        spec: response.data.spec,
        fullSpec: response.data.fullSpec,
        patch: response.data.patch,
        summary: response.data.summary,
        mode: response.data.mode
      };
    } catch (err) {
      console.error("Refine error:", err);
      
      const errorData = err.response?.data;
      const errorMessage = errorData?.message || err.message;
      const errorCode = errorData?.error || 'UNKNOWN_ERROR';
      
      setError({ code: errorCode, message: errorMessage });

      return {
        success: false,
        error: errorCode,
        message: errorMessage
      };
    } finally {
      setLoading(false);
    }
  };

  const loadApp = async (loadAppId) => {
    try {
      setLoading(true);
      setError(null);

      const response = await apiClient.get(`/api/apps/${loadAppId}`);

      setAppId(response.data.appId);
      setStageResults(response.data.stageResults || []);
      setMode(response.data.mode);

      return {
        success: true,
        appId: response.data.appId,
        spec: response.data.spec,
        fullSpec: response.data.fullSpec,
        mode: response.data.mode
      };
    } catch (err) {
      console.error("Load app error:", err);
      
      const errorData = err.response?.data;
      const errorMessage = errorData?.message || err.message;
      
      setError({ code: 'LOAD_FAILED', message: errorMessage });

      return {
        success: false,
        error: 'LOAD_FAILED',
        message: errorMessage
      };
    } finally {
      setLoading(false);
    }
  };

  const reset = () => {
    setAppId(null);
    setStageResults([]);
    setMode(null);
    setError(null);
  };

  return {
    generateStaged,
    refineApp,
    loadApp,
    reset,
    loading,
    error,
    appId,
    stageResults,
    mode,
    canRefine: !!appId && mode !== 'error'
  };
}
