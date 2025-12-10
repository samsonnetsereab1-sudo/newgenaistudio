/**
 * Planner Agent
 * Decomposes goals into actionable steps using LLM + symbolic planning
 */
import Agent from './agent.base.js';

class PlannerAgent extends Agent {
  constructor(config = {}) {
    super('Planner', 'planner', config);
    this.maxSteps = config.maxSteps || 10;
    this.constraints = config.constraints || [];
  }

  /**
   * Create a plan from a goal statement
   * Uses LLM (mock) to decompose goal into steps
   */
  async execute(input) {
    this.status = 'running';
    this.lastAction = 'plan';

    try {
      const { goal, domain = 'general', constraints = [] } = input;

      this.log('Starting plan generation', { goal, domain, constraintCount: constraints.length });

      // Mock LLM plan generation
      const plans = {
        'optimize-yield': [
          {
            step: 1,
            action: 'retrieve',
            description: 'Fetch protocol optimization best practices',
            inputs: { query: 'yield optimization', domain }
          },
          {
            step: 2,
            action: 'simulate',
            description: 'Run baseline simulation to establish metrics',
            inputs: { protocol: domain, numRuns: 5 }
          },
          {
            step: 3,
            action: 'simulate',
            description: 'Run modified simulation with increased reagent concentration',
            inputs: { protocol: domain, params: { reagentConcentration: 1.2 } }
          },
          {
            step: 4,
            action: 'compare',
            description: 'Compare simulation results',
            inputs: { metrics: ['yield', 'cost', 'duration'] }
          },
          {
            step: 5,
            action: 'recommend',
            description: 'Generate optimization recommendations',
            inputs: { topN: 3 }
          }
        ],
        'reduce-cost': [
          {
            step: 1,
            action: 'retrieve',
            description: 'Fetch cost-reduction strategies',
            inputs: { query: 'cost optimization', domain }
          },
          {
            step: 2,
            action: 'simulate',
            description: 'Run cost baseline simulation',
            inputs: { protocol: domain, metrics: ['cost', 'yield'] }
          },
          {
            step: 3,
            action: 'simulate',
            description: 'Run cost-reduced simulation (fewer reagents)',
            inputs: { protocol: domain, params: { reagentVolume: 0.8 } }
          },
          {
            step: 4,
            action: 'evaluate',
            description: 'Evaluate yield impact of cost reduction',
            inputs: { threshold: 'yield > 80%' }
          },
          {
            step: 5,
            action: 'recommend',
            description: 'Return cost-saving modifications',
            inputs: { constraint: 'maintain yield > 80%' }
          }
        ],
        'improve-speed': [
          {
            step: 1,
            action: 'retrieve',
            description: 'Fetch speed optimization protocols',
            inputs: { query: 'throughput improvement', domain }
          },
          {
            step: 2,
            action: 'simulate',
            description: 'Baseline speed profile',
            inputs: { protocol: domain, metrics: ['duration', 'throughput'] }
          },
          {
            step: 3,
            action: 'simulate',
            description: 'Parallel step simulation',
            inputs: { protocol: domain, config: { parallelizable: true } }
          },
          {
            step: 4,
            action: 'recommend',
            description: 'Speed improvement options',
            inputs: { maxSteps: this.maxSteps }
          }
        ],
        'ensure-compliance': [
          {
            step: 1,
            action: 'retrieve',
            description: 'Fetch compliance and safety policies',
            inputs: { query: 'compliance', domain: 'compliance' }
          },
          {
            step: 2,
            action: 'evaluate',
            description: 'Check protocol against regulatory rules',
            inputs: { protocol: domain }
          },
          {
            step: 3,
            action: 'flag',
            description: 'Flag any non-compliance issues',
            inputs: { severity: 'high' }
          },
          {
            step: 4,
            action: 'recommend',
            description: 'Suggest compliant modifications',
            inputs: {}
          }
        ]
      };

      // Determine plan type from goal
      let planType = 'optimize-yield'; // default
      if (goal.toLowerCase().includes('cost')) planType = 'reduce-cost';
      else if (goal.toLowerCase().includes('speed') || goal.toLowerCase().includes('fast'))
        planType = 'improve-speed';
      else if (goal.toLowerCase().includes('compli') || goal.toLowerCase().includes('safe'))
        planType = 'ensure-compliance';

      const planSteps = plans[planType] || plans['optimize-yield'];

      // Apply constraints if provided
      const constrainedPlan = planSteps.filter((step) => {
        // Simple constraint checking: don't filter if constraints is empty
        if (constraints.length === 0) return true;
        // In real implementation, check step against constraints
        return true;
      });

      this.lastOutput = {
        goalId: `goal-${Date.now()}`,
        goal,
        domain,
        planType,
        steps: constrainedPlan,
        stepCount: constrainedPlan.length,
        estimatedDuration: 'variable',
        created: new Date().toISOString(),
        status: 'ready',
        constraints: constraints
      };

      this.log('Plan generated', {
        planType,
        stepCount: constrainedPlan.length,
        constraints: constraints.length
      });
      this.status = 'succeeded';

      return this.lastOutput;
    } catch (err) {
      this.log('Plan generation failed', { error: err.message });
      this.status = 'failed';
      throw err;
    }
  }

  /**
   * Validate a plan against constraints
   */
  validatePlan(plan, constraints = []) {
    const issues = [];

    if (!plan.steps || plan.steps.length === 0) {
      issues.push('Plan has no steps');
    }

    if (plan.steps.length > this.maxSteps) {
      issues.push(`Plan exceeds maximum steps (${this.maxSteps})`);
    }

    for (const constraint of constraints) {
      // Check constraint logic
      if (constraint.type === 'max-cost' && plan.estimatedCost > constraint.value) {
        issues.push(`Plan exceeds cost constraint: $${plan.estimatedCost} > $${constraint.value}`);
      }
      if (constraint.type === 'max-duration' && plan.estimatedDuration > constraint.value) {
        issues.push(`Plan exceeds duration constraint: ${plan.estimatedDuration} > ${constraint.value}`);
      }
    }

    return {
      valid: issues.length === 0,
      issues,
      timestamp: new Date().toISOString()
    };
  }

  /**
   * Refine a plan based on feedback
   */
  async refinePlan(plan, feedback) {
    this.log('Refining plan', { planId: plan.goalId, feedbackLength: feedback.length });

    // Add new steps or modify existing steps based on feedback
    const refinedPlan = { ...plan };

    if (feedback.includes('add-safety-check')) {
      refinedPlan.steps.splice(1, 0, {
        step: 1.5,
        action: 'safety-review',
        description: 'Conduct safety review',
        inputs: { protocol: plan.domain }
      });
    }

    if (feedback.includes('reduce-steps')) {
      refinedPlan.steps = refinedPlan.steps.slice(0, Math.ceil(refinedPlan.steps.length / 2));
    }

    return refinedPlan;
  }
}

export default PlannerAgent;
