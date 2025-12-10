import { useState, useCallback } from 'react';

/**
 * useAgents hook
 * Provides interface to agent orchestrator for goal-driven automation
 */
export function useAgents() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [orchestrationResults, setOrchestrationResults] = useState(null);
  const [agents, setAgents] = useState([]);
  const [history, setHistory] = useState([]);

  const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

  /**
   * Orchestrate a goal with full agent flow
   */
  const orchestrate = useCallback(async (goal, context = {}) => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`${API_BASE}/v1/agents/orchestrate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ goal, context })
      });

      if (!response.ok) {
        throw new Error(`Orchestration failed: ${response.statusText}`);
      }

      const data = await response.json();
      setOrchestrationResults(data.orchestration);
      return data.orchestration;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Retrieve knowledge from knowledge base
   */
  const retrieve = useCallback(async (query, domain = 'general', maxResults = 5) => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`${API_BASE}/v1/agents/retrieve`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query, domain, maxResults })
      });

      if (!response.ok) {
        throw new Error(`Retrieval failed: ${response.statusText}`);
      }

      const data = await response.json();
      return data.retrieval;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Create a plan from a goal
   */
  const plan = useCallback(async (goal, domain = 'general', constraints = []) => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`${API_BASE}/v1/agents/plan`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ goal, domain, constraints })
      });

      if (!response.ok) {
        throw new Error(`Planning failed: ${response.statusText}`);
      }

      const data = await response.json();
      return data.plan;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Run a simulation
   */
  const simulate = useCallback(
    async (protocol = 'plasmid-prep', numRuns = 3, params = {}, metrics = ['cost', 'duration', 'yield']) => {
      setLoading(true);
      setError(null);
      try {
        const response = await fetch(`${API_BASE}/v1/agents/simulate`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            protocol,
            numRuns,
            params,
            metrics
          })
        });

        if (!response.ok) {
          throw new Error(`Simulation failed: ${response.statusText}`);
        }

        const data = await response.json();
        return data.simulation;
      } catch (err) {
        setError(err.message);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  /**
   * Review plan and results for safety/compliance
   */
  const review = useCallback(
    async (plan, protocol = 'plasmid-prep', context = {}, simulationResults = null) => {
      setLoading(true);
      setError(null);
      try {
        const response = await fetch(`${API_BASE}/v1/agents/review`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            plan,
            protocol,
            context,
            simulationResults
          })
        });

        if (!response.ok) {
          throw new Error(`Review failed: ${response.statusText}`);
        }

        const data = await response.json();
        return data.review;
      } catch (err) {
        setError(err.message);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  /**
   * Invoke a specific tool
   */
  const invokeTool = useCallback(async (toolName, args) => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`${API_BASE}/v1/agents/tool/${toolName}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(args)
      });

      if (!response.ok) {
        throw new Error(`Tool invocation failed: ${response.statusText}`);
      }

      const data = await response.json();
      return data.result;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Fetch available tools
   */
  const fetchTools = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`${API_BASE}/v1/agents/tools`);

      if (!response.ok) {
        throw new Error(`Failed to fetch tools: ${response.statusText}`);
      }

      const data = await response.json();
      return data.tools;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Fetch execution history
   */
  const fetchHistory = useCallback(async (status = null, limit = 10) => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams();
      if (status) params.append('status', status);
      params.append('limit', limit);

      const response = await fetch(`${API_BASE}/v1/agents/history?${params.toString()}`);

      if (!response.ok) {
        throw new Error(`Failed to fetch history: ${response.statusText}`);
      }

      const data = await response.json();
      setHistory(data.history);
      return data.history;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Fetch orchestrator status
   */
  const fetchStatus = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`${API_BASE}/v1/agents/orchestrator-info`);

      if (!response.ok) {
        throw new Error(`Failed to fetch status: ${response.statusText}`);
      }

      const data = await response.json();
      setAgents(Object.values(data.agents));
      return data;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Fetch audit log
   */
  const fetchAuditLog = useCallback(async (limit = 50, agentType = null) => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams();
      if (agentType) params.append('agentType', agentType);
      params.append('limit', limit);

      const response = await fetch(`${API_BASE}/v1/agents/audit-log?${params.toString()}`);

      if (!response.ok) {
        throw new Error(`Failed to fetch audit log: ${response.statusText}`);
      }

      const data = await response.json();
      return data.logs;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Reset all agents
   */
  const resetAgents = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`${API_BASE}/v1/agents/reset`, {
        method: 'POST'
      });

      if (!response.ok) {
        throw new Error(`Reset failed: ${response.statusText}`);
      }

      const data = await response.json();
      return data;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    loading,
    error,
    orchestrationResults,
    agents,
    history,
    orchestrate,
    retrieve,
    plan,
    simulate,
    review,
    invokeTool,
    fetchTools,
    fetchHistory,
    fetchStatus,
    fetchAuditLog,
    resetAgents
  };
}
