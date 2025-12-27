/**
 * useWorkflow Hook
 * Manages workflow execution for dynamic apps
 */

import { useState, useCallback } from 'react';

const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:4000';

/**
 * Custom hook for workflow management
 * @returns {object} - { executeWorkflow, execution, loading, error, progress }
 */
export function useWorkflow() {
  const [execution, setExecution] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [progress, setProgress] = useState({ current: 0, total: 0, percentage: 0 });

  /**
   * Execute a workflow
   * @param {object} workflow - Workflow definition
   * @param {object} context - Execution context
   */
  const executeWorkflow = useCallback(async (workflow, context = {}) => {
    console.log('[useWorkflow] Executing workflow:', workflow.name);
    
    setLoading(true);
    setError(null);
    setProgress({ current: 0, total: workflow.steps?.length || 0, percentage: 0 });

    try {
      const response = await fetch(`${API_BASE}/api/workflows/execute`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          workflow,
          context
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Workflow execution failed');
      }

      const result = await response.json();
      
      setExecution(result.execution);
      
      // Update progress
      const completed = result.execution.steps?.filter(s => s.status === 'success').length || 0;
      const total = result.execution.steps?.length || 0;
      setProgress({
        current: completed,
        total,
        percentage: total > 0 ? Math.round((completed / total) * 100) : 0
      });

      console.log('[useWorkflow] Workflow completed:', result.execution.status);
      return result.execution;

    } catch (err) {
      console.error('[useWorkflow] Execution error:', err);
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Get workflow execution history
   */
  const getHistory = useCallback(async () => {
    try {
      const response = await fetch(`${API_BASE}/api/workflows/history`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch workflow history');
      }

      const result = await response.json();
      return result.executions;
    } catch (err) {
      console.error('[useWorkflow] History error:', err);
      throw err;
    }
  }, []);

  /**
   * Get specific execution by ID
   */
  const getExecution = useCallback(async (executionId) => {
    try {
      const response = await fetch(`${API_BASE}/api/workflows/executions/${executionId}`);
      
      if (!response.ok) {
        throw new Error('Execution not found');
      }

      const result = await response.json();
      return result.execution;
    } catch (err) {
      console.error('[useWorkflow] Get execution error:', err);
      throw err;
    }
  }, []);

  return {
    executeWorkflow,
    execution,
    loading,
    error,
    progress,
    getHistory,
    getExecution
  };
}
