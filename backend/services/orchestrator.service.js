/**
 * Agent Orchestrator
 * Manages agent lifecycle, tool registry, goal formulation, and execution logging
 */
import RetrieverAgent from './agents/retriever.agent.js';
import PlannerAgent from './agents/planner.agent.js';
import SimulatorAgent from './agents/simulator.agent.js';
import ExecutorAgent from './agents/executor.agent.js';
import SafetyAgent from './agents/safety.agent.js';

class AgentOrchestrator {
  constructor(config = {}) {
    this.id = `orchestrator-${Date.now()}`;
    this.agents = new Map();
    this.toolRegistry = new Map();
    this.executionHistory = [];
    this.config = config;

    // Initialize standard agents
    this._initializeAgents(config);

    // Register built-in tools
    this._registerBuiltInTools();
  }

  /**
   * Initialize all standard agents
   */
  _initializeAgents(config) {
    const agentConfigs = config.agents || {};

    // Create agents
    const retriever = new RetrieverAgent(agentConfigs.retriever || {});
    const planner = new PlannerAgent(agentConfigs.planner || {});
    const simulator = new SimulatorAgent(agentConfigs.simulator || {});
    const executor = new ExecutorAgent(agentConfigs.executor || {});
    const safety = new SafetyAgent(agentConfigs.safety || {});

    this.agents.set('retriever', retriever);
    this.agents.set('planner', planner);
    this.agents.set('simulator', simulator);
    this.agents.set('executor', executor);
    this.agents.set('safety', safety);

    console.log(`[Orchestrator] Initialized ${this.agents.size} agents`);
  }

  /**
   * Register built-in tools that agents can invoke
   */
  _registerBuiltInTools() {
    // Knowledge retrieval tool
    this.registerTool({
      name: 'search-knowledge-base',
      description: 'Search internal knowledge base for relevant information',
      schema: {
        query: { type: 'string' },
        domain: { type: 'string', optional: true },
        maxResults: { type: 'number', optional: true }
      },
      invoke: async (args) => {
        const retriever = this.agents.get('retriever');
        return await retriever.search(args.query, args.domain);
      }
    });

    // Simulation execution tool
    this.registerTool({
      name: 'run-simulation',
      description: 'Execute a simulation with specified parameters',
      schema: {
        protocol: { type: 'string' },
        numRuns: { type: 'number' },
        params: { type: 'object', optional: true },
        metrics: { type: 'array', optional: true }
      },
      invoke: async (args) => {
        const simulator = this.agents.get('simulator');
        return await simulator.execute(args);
      }
    });

    // Protocol modification tool
    this.registerTool({
      name: 'generate-modified-protocol',
      description: 'Generate a modified version of a protocol',
      schema: {
        baseProtocol: { type: 'string' },
        modifications: { type: 'object' }
      },
      invoke: async (args) => {
        return {
          success: true,
          modifiedProtocol: `${args.baseProtocol}-modified`,
          changes: Object.keys(args.modifications).length
        };
      }
    });

    // Compliance check tool
    this.registerTool({
      name: 'check-compliance',
      description: 'Check protocol against compliance requirements',
      schema: {
        protocol: { type: 'string' },
        standards: { type: 'array', optional: true }
      },
      invoke: async (args) => {
        const safety = this.agents.get('safety');
        return await safety.execute({
          protocol: args.protocol,
          plan: { steps: [] }
        });
      }
    });

    // Cost estimation tool
    this.registerTool({
      name: 'estimate-cost',
      description: 'Estimate cost for a protocol',
      schema: {
        protocol: { type: 'string' },
        samples: { type: 'number' },
        runs: { type: 'number', optional: true }
      },
      invoke: async (args) => {
        return {
          estimatedCost: Math.random() * 500 + 50,
          currency: 'USD',
          confidence: 0.8,
          breakdown: {
            reagents: Math.random() * 300,
            labor: 100,
            equipment: Math.random() * 150
          }
        };
      }
    });

    console.log('[Orchestrator] Registered 5 built-in tools');
  }

  /**
   * Register a custom tool
   */
  registerTool(tool) {
    if (!tool.name || !tool.invoke) {
      throw new Error('Tool must have name and invoke function');
    }
    this.toolRegistry.set(tool.name, tool);
  }

  /**
   * Get all available tools
   */
  getTools() {
    return Array.from(this.toolRegistry.values()).map((t) => ({
      name: t.name,
      description: t.description,
      schema: t.schema
    }));
  }

  /**
   * Get a specific agent
   */
  getAgent(agentType) {
    return this.agents.get(agentType);
  }

  /**
   * Execute a goal-driven orchestration flow
   * Goal → Plan → Simulate → Execute → Review
   */
  async orchestrate(goal, context = {}) {
    const orchestrationId = `orch-${Date.now()}`;
    const startTime = Date.now();

    console.log(`\n[Orchestrator] Starting orchestration: "${goal}"`);
    console.log(`[Orchestrator] Orchestration ID: ${orchestrationId}\n`);

    try {
      // Step 1: Retriever Agent - Get knowledge
      console.log('=== STEP 1: RETRIEVER AGENT ===');
      const retriever = this.agents.get('retriever');
      const knowledge = await retriever.execute({
        query: goal,
        domain: context.domain || 'general',
        maxResults: 3
      });
      console.log(`Retrieved ${knowledge.resultCount} relevant documents\n`);

      // Step 2: Planner Agent - Create plan
      console.log('=== STEP 2: PLANNER AGENT ===');
      const planner = this.agents.get('planner');
      const plan = await planner.execute({
        goal,
        domain: context.domain || 'general',
        constraints: context.constraints || []
      });
      console.log(`Generated plan with ${plan.stepCount} steps\n`);

      // Step 3: Simulator Agent - Test plan
      console.log('=== STEP 3: SIMULATOR AGENT ===');
      const simulator = this.agents.get('simulator');
      const simulationResults = await simulator.execute({
        protocol: context.protocol || 'plasmid-prep',
        numRuns: context.numRuns || 3,
        params: context.params || {}
      });
      console.log(
        `Completed ${simulationResults.numRuns} simulation runs\n`
      );

      // Step 4: Safety Agent - Review for safety/compliance
      console.log('=== STEP 4: SAFETY AGENT ===');
      const safety = this.agents.get('safety');
      const safetyReview = await safety.execute({
        plan,
        protocol: context.protocol || 'plasmid-prep',
        simulationResults
      });
      console.log(`Safety review: ${safetyReview.safetyLevel}\n`);

      // Step 5: Executor Agent - Generate artifacts (conditional on safety approval)
      let executionResult = null;
      if (safetyReview.compliant) {
        console.log('=== STEP 5: EXECUTOR AGENT ===');
        const executor = this.agents.get('executor');
        executionResult = await executor.execute({
          plan,
          context,
          dryRun: context.dryRun !== false
        });
        console.log(`Generated ${executionResult.artifacts.length} artifacts\n`);
      } else {
        console.log(
          '=== STEP 5: EXECUTOR AGENT (SKIPPED) ===\nSkipped due to safety concerns\n'
        );
      }

      // Compile final orchestration result
      const durationMs = Date.now() - startTime;

      const orchestrationResult = {
        orchestrationId,
        goal,
        status: safetyReview.compliant ? 'succeeded' : 'requires-approval',
        phases: {
          retrieval: {
            status: 'completed',
            documentsFound: knowledge.resultCount,
            confidence: knowledge.confidence
          },
          planning: {
            status: 'completed',
            planId: plan.goalId,
            stepCount: plan.stepCount
          },
          simulation: {
            status: 'completed',
            simulationId: simulationResults.simulationId,
            runsCompleted: simulationResults.numRuns
          },
          safety: {
            status: 'completed',
            safetyLevel: safetyReview.safetyLevel,
            compliant: safetyReview.compliant,
            issueCount: safetyReview.issueCount,
            warningCount: safetyReview.warningCount
          },
          execution: executionResult
            ? {
                status: 'completed',
                executionId: executionResult.executionId,
                artifactCount: executionResult.artifacts.length,
                successCount: executionResult.completedSteps
              }
            : {
                status: 'skipped',
                reason: 'Safety approval required'
              }
        },
        recommendations: safetyReview.recommendations,
        artifacts:
          executionResult?.artifacts.map((a) => ({
            type: a.type,
            filename: a.filename
          })) || [],
        durationMs,
        completedAt: new Date().toISOString()
      };

      // Log orchestration
      this.executionHistory.push(orchestrationResult);

      console.log('[Orchestrator] Orchestration completed');
      return orchestrationResult;
    } catch (err) {
      console.error('[Orchestrator] Orchestration failed:', err.message);
      const result = {
        orchestrationId,
        goal,
        status: 'failed',
        error: err.message,
        durationMs: Date.now() - startTime,
        completedAt: new Date().toISOString()
      };
      this.executionHistory.push(result);
      throw err;
    }
  }

  /**
   * Get execution history with optional filtering
   */
  getExecutionHistory(filter = {}) {
    let history = this.executionHistory;

    if (filter.status) {
      history = history.filter((h) => h.status === filter.status);
    }

    if (filter.goalPattern) {
      const pattern = new RegExp(filter.goalPattern, 'i');
      history = history.filter((h) => pattern.test(h.goal));
    }

    if (filter.limit) {
      history = history.slice(-filter.limit);
    }

    return history;
  }

  /**
   * Get agent status for all agents
   */
  getAgentStatuses() {
    const statuses = {};
    for (const [type, agent] of this.agents) {
      statuses[type] = agent.getStatus();
    }
    return statuses;
  }

  /**
   * Get consolidated audit log
   */
  getAuditLog() {
    const logs = [];
    for (const [type, agent] of this.agents) {
      logs.push(...agent.getLogs());
    }
    return logs.sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
  }

  /**
   * Reset all agents
   */
  resetAllAgents() {
    for (const agent of this.agents.values()) {
      agent.reset();
    }
    console.log('[Orchestrator] All agents reset');
  }

  /**
   * Get orchestrator status
   */
  getStatus() {
    return {
      orchestratorId: this.id,
      agentCount: this.agents.size,
      toolCount: this.toolRegistry.size,
      executionCount: this.executionHistory.length,
      successCount: this.executionHistory.filter((h) => h.status === 'succeeded').length,
      failureCount: this.executionHistory.filter((h) => h.status === 'failed').length,
      createdAt: new Date().toISOString()
    };
  }
}

export default AgentOrchestrator;
