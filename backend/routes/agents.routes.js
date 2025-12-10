/**
 * Agent Orchestrator Routes
 * API endpoints for goal-driven agent orchestration, chat, and management
 */
import express from 'express';
import AgentOrchestrator from '../services/orchestrator.service.js';

const router = express.Router();

// Global orchestrator instance
let orchestrator = new AgentOrchestrator({
  agents: {
    retriever: { maxResults: 5 },
    planner: { maxSteps: 10 },
    simulator: { maxRunsPerSession: 10 },
    executor: { sandboxed: true },
    safety: { requiredApprovals: ['human'] }
  }
});

/**
 * POST /api/v1/agents/orchestrate
 * Submit a goal and get a complete orchestration (retrieve → plan → simulate → execute → review)
 */
router.post('/orchestrate', async (req, res) => {
  try {
    const { goal, context = {} } = req.body;

    if (!goal) {
      return res.status(400).json({
        error: 'Goal is required',
        example: {
          goal: 'Optimize yield in CRISPR plasmid prep',
          context: {
            protocol: 'plasmid-prep',
            domain: 'biologics',
            numRuns: 5,
            constraints: []
          }
        }
      });
    }

    const result = await orchestrator.orchestrate(goal, context);

    res.json({
      success: true,
      orchestration: result
    });
  } catch (err) {
    console.error('Orchestration error:', err);
    res.status(500).json({
      error: 'Orchestration failed',
      message: err.message
    });
  }
});

/**
 * GET /api/v1/agents/history
 * Retrieve execution history with optional filtering
 */
router.get('/history', (req, res) => {
  try {
    const { status, goalPattern, limit = 10 } = req.query;

    const history = orchestrator.getExecutionHistory({
      status,
      goalPattern,
      limit: parseInt(limit)
    });

    res.json({
      success: true,
      count: history.length,
      history
    });
  } catch (err) {
    console.error('History retrieval error:', err);
    res.status(500).json({
      error: 'Failed to retrieve history',
      message: err.message
    });
  }
});

/**
 * GET /api/v1/agents/status
 * Get real-time status of all agents
 */
router.get('/status', (req, res) => {
  try {
    const status = orchestrator.getStatus();
    const agents = orchestrator.getAgentStatuses();

    res.json({
      success: true,
      orchestrator: status,
      agents
    });
  } catch (err) {
    console.error('Status retrieval error:', err);
    res.status(500).json({
      error: 'Failed to retrieve status',
      message: err.message
    });
  }
});

/**
 * GET /api/v1/agents/tools
 * List all available tools that agents can invoke
 */
router.get('/tools', (req, res) => {
  try {
    const tools = orchestrator.getTools();

    res.json({
      success: true,
      toolCount: tools.length,
      tools
    });
  } catch (err) {
    console.error('Tools retrieval error:', err);
    res.status(500).json({
      error: 'Failed to retrieve tools',
      message: err.message
    });
  }
});

/**
 * GET /api/v1/agents/audit-log
 * Retrieve comprehensive audit trail of all agent actions
 */
router.get('/audit-log', (req, res) => {
  try {
    const { limit = 50, agentType = null } = req.query;

    const logs = orchestrator.getAuditLog();

    let filtered = logs;
    if (agentType) {
      filtered = logs.filter((log) => log.agentName.toLowerCase().includes(agentType));
    }

    const result = filtered.slice(-parseInt(limit));

    res.json({
      success: true,
      count: result.length,
      totalCount: logs.length,
      logs: result
    });
  } catch (err) {
    console.error('Audit log retrieval error:', err);
    res.status(500).json({
      error: 'Failed to retrieve audit log',
      message: err.message
    });
  }
});

/**
 * POST /api/v1/agents/retrieve
 * Use Retriever Agent to search knowledge base
 */
router.post('/retrieve', async (req, res) => {
  try {
    const { query, domain = 'general', maxResults = 5 } = req.body;

    if (!query) {
      return res.status(400).json({
        error: 'Query is required'
      });
    }

    const retriever = orchestrator.getAgent('retriever');
    const result = await retriever.execute({
      query,
      domain,
      maxResults
    });

    res.json({
      success: true,
      retrieval: result
    });
  } catch (err) {
    console.error('Retrieval error:', err);
    res.status(500).json({
      error: 'Retrieval failed',
      message: err.message
    });
  }
});

/**
 * POST /api/v1/agents/plan
 * Use Planner Agent to decompose a goal into steps
 */
router.post('/plan', async (req, res) => {
  try {
    const { goal, domain = 'general', constraints = [] } = req.body;

    if (!goal) {
      return res.status(400).json({
        error: 'Goal is required'
      });
    }

    const planner = orchestrator.getAgent('planner');
    const result = await planner.execute({
      goal,
      domain,
      constraints
    });

    res.json({
      success: true,
      plan: result
    });
  } catch (err) {
    console.error('Planning error:', err);
    res.status(500).json({
      error: 'Planning failed',
      message: err.message
    });
  }
});

/**
 * POST /api/v1/agents/simulate
 * Use Simulator Agent to run protocol simulations
 */
router.post('/simulate', async (req, res) => {
  try {
    const {
      protocol = 'plasmid-prep',
      template = 'default',
      numRuns = 3,
      params = {},
      metrics = ['cost', 'duration', 'yield']
    } = req.body;

    const simulator = orchestrator.getAgent('simulator');
    const result = await simulator.execute({
      protocol,
      template,
      numRuns,
      params,
      metrics
    });

    res.json({
      success: true,
      simulation: result
    });
  } catch (err) {
    console.error('Simulation error:', err);
    res.status(500).json({
      error: 'Simulation failed',
      message: err.message
    });
  }
});

/**
 * POST /api/v1/agents/review
 * Use Safety Agent to review plan and simulation results
 */
router.post('/review', async (req, res) => {
  try {
    const { plan, protocol = 'plasmid-prep', context = {}, simulationResults = null } = req.body;

    if (!plan) {
      return res.status(400).json({
        error: 'Plan is required for review'
      });
    }

    const safety = orchestrator.getAgent('safety');
    const result = await safety.execute({
      plan,
      protocol,
      context,
      simulationResults
    });

    res.json({
      success: true,
      review: result
    });
  } catch (err) {
    console.error('Review error:', err);
    res.status(500).json({
      error: 'Review failed',
      message: err.message
    });
  }
});

/**
 * POST /api/v1/agents/reset
 * Reset all agents and clear state
 */
router.post('/reset', (req, res) => {
  try {
    orchestrator.resetAllAgents();

    res.json({
      success: true,
      message: 'All agents reset successfully'
    });
  } catch (err) {
    console.error('Reset error:', err);
    res.status(500).json({
      error: 'Reset failed',
      message: err.message
    });
  }
});

/**
 * POST /api/v1/agents/tool/:toolName
 * Invoke a specific tool
 */
router.post('/tool/:toolName', async (req, res) => {
  try {
    const { toolName } = req.params;
    const args = req.body;

    const tools = orchestrator.getTools();
    const tool = tools.find((t) => t.name === toolName);

    if (!tool) {
      return res.status(404).json({
        error: 'Tool not found',
        toolName,
        availableTools: tools.map((t) => t.name)
      });
    }

    // Get the actual tool with invoke function
    const toolRegistry = orchestrator.toolRegistry.get(toolName);
    const result = await toolRegistry.invoke(args);

    res.json({
      success: true,
      tool: toolName,
      result
    });
  } catch (err) {
    console.error('Tool invocation error:', err);
    res.status(500).json({
      error: 'Tool invocation failed',
      message: err.message
    });
  }
});

/**
 * GET /api/v1/agents/orchestrator-info
 * Get comprehensive orchestrator information
 */
router.get('/orchestrator-info', (req, res) => {
  try {
    const orchestratorStatus = orchestrator.getStatus();
    const agentStatuses = orchestrator.getAgentStatuses();
    const tools = orchestrator.getTools();
    const recentHistory = orchestrator.getExecutionHistory({ limit: 5 });

    res.json({
      success: true,
      orchestrator: orchestratorStatus,
      agents: agentStatuses,
      tools,
      recentExecutions: recentHistory
    });
  } catch (err) {
    console.error('Info retrieval error:', err);
    res.status(500).json({
      error: 'Failed to retrieve orchestrator info',
      message: err.message
    });
  }
});

export default router;
