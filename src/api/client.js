/**
 * API Client for NewGen Studio Backend
 * Centralized HTTP client with environment-based configuration
 */

// Resolve API base from env and normalize by stripping trailing slashes
const defaultBase = typeof window !== 'undefined' ? window.location.origin : '';
const RAW_API_BASE =
  import.meta.env.VITE_API_BASE ||
  import.meta.env.VITE_API_BASE_URL ||
  defaultBase;
const API_BASE = String(RAW_API_BASE || '').replace(/\/+$/, '');

export const getApiBase = () => API_BASE;

/**
 * Generic fetch wrapper with error handling
 */
async function fetchAPI(endpoint, options = {}) {
  const url = `${API_BASE}${endpoint}`;
  
  try {
    const res = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
    });

    if (!res.ok) {
      const error = await res.json().catch(() => ({ error: res.statusText }));
      throw new Error(error.error || `HTTP ${res.status}: ${res.statusText}`);
    }

    return res.json();
  } catch (error) {
    console.error(`API Error [${endpoint}]:`, error);
    throw error;
  }
}

/**
 * Health Check
 * GET /api/health
 */
export async function fetchBackendHealth() {
  return fetchAPI('/api/health');
}

/**
 * Biologics Summary
 * GET /api/v1/biologics/summary
 */
export async function fetchBiologicsSummary() {
  return fetchAPI('/api/v1/biologics/summary');
}

/**
 * Biologics Pipelines
 * GET /api/v1/biologics/pipelines
 */
export async function fetchBiologicsPipelines() {
  return fetchAPI('/api/v1/biologics/pipelines');
}

/**
 * Projects
 * GET /api/v1/projects
 */
export async function fetchProjects() {
  return fetchAPI('/api/v1/projects');
}

/**
 * Templates
 * GET /api/v1/templates
 */
export async function fetchTemplates() {
  return fetchAPI('/api/v1/templates');
}

/**
 * Agent Orchestration
 * POST /api/v1/agents/orchestrate
 */
export async function orchestrateAgents(goal, context = {}) {
  return fetchAPI('/api/v1/agents/orchestrate', {
    method: 'POST',
    body: JSON.stringify({ goal, context }),
  });
}

/**
 * Generate Code/Config
 * POST /api/generate
 */
export async function generateCode(prompt, context = {}) {
  return fetchAPI('/api/generate', {
    method: 'POST',
    body: JSON.stringify({ prompt, context }),
  });
}

/**
 * Metrics summary
 * GET /api/v1/metrics
 */
export async function fetchMetrics() {
  return fetchAPI('/api/v1/metrics');
}

/**
 * Simulations
 * POST /api/v1/simulations/run
 */
export async function runSimulation(simulationConfig) {
  return fetchAPI('/api/v1/simulations/run', {
    method: 'POST',
    body: JSON.stringify(simulationConfig),
  });
}

/**
 * Export to BASE44
 * POST /api/platform/export
 */
export async function exportToPlatform(appSpec, options = {}, target = 'base44') {
  return fetchAPI('/api/platform/export', {
    method: 'POST',
    body: JSON.stringify({ appSpec, target, options }),
  });
}

/**
 * Import BASE44 manifest
 * POST /api/platform/import
 */
export async function importFromPlatform(payload) {
  return fetchAPI('/api/platform/import', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export default {
  fetchBackendHealth,
  fetchBiologicsSummary,
  fetchBiologicsPipelines,
  fetchProjects,
  fetchTemplates,
  orchestrateAgents,
  generateCode,
  fetchMetrics,
  runSimulation,
  exportToPlatform,
  importFromPlatform,
};
