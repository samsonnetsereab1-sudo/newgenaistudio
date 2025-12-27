/**
 * Workflow Engine
 * Executes workflows with sequential and parallel step processing
 */

import { generateAppSpecWithGemini } from './llm/geminiClient.js';

/**
 * Workflow Engine Class
 */
export class WorkflowEngine {
  constructor() {
    this.executionHistory = [];
  }

  /**
   * Execute a workflow
   * @param {object} workflow - Workflow definition
   * @param {object} context - Execution context
   * @returns {Promise<object>} - Execution result
   */
  async execute(workflow, context = {}) {
    console.log(`[Workflow Engine] Executing workflow: ${workflow.name}`);
    
    const executionId = `exec-${Date.now()}`;
    const execution = {
      id: executionId,
      workflowId: workflow.id,
      workflowName: workflow.name,
      status: 'running',
      startTime: new Date(),
      steps: [],
      context: { ...context },
      results: {}
    };

    this.executionHistory.push(execution);

    try {
      // Execute each step sequentially
      for (const step of workflow.steps) {
        console.log(`[Workflow Engine] Executing step: ${step.name}`);
        
        const stepResult = await this.executeStep(step, execution.context);
        
        execution.steps.push({
          stepId: step.id,
          stepName: step.name,
          status: stepResult.status,
          result: stepResult.data,
          error: stepResult.error,
          timestamp: new Date()
        });

        // Update context with step results
        execution.context[step.id] = stepResult.data;
        execution.results[step.id] = stepResult.data;

        // If step failed, stop execution
        if (stepResult.status === 'error') {
          throw new Error(`Step ${step.name} failed: ${stepResult.error}`);
        }
      }

      execution.status = 'completed';
      execution.endTime = new Date();

      // Execute success handler
      if (workflow.onSuccess) {
        await this.executeEffect(workflow.onSuccess, execution.context);
      }

      console.log(`[Workflow Engine] Workflow completed: ${workflow.name}`);
      return execution;

    } catch (error) {
      execution.status = 'failed';
      execution.endTime = new Date();
      execution.error = error.message;

      // Execute error handler
      if (workflow.onError) {
        await this.executeEffect(workflow.onError, execution.context);
      }

      console.error(`[Workflow Engine] Workflow failed: ${workflow.name}`, error);
      throw error;
    }
  }

  /**
   * Execute a single workflow step
   * @param {object} step - Step definition
   * @param {object} context - Execution context
   * @returns {Promise<object>} - Step result
   */
  async executeStep(step, context) {
    try {
      let data;

      switch (step.type) {
        case 'validation':
          data = await this.executeValidation(step, context);
          break;

        case 'api-call':
          data = await this.executeApiCall(step, context);
          break;

        case 'llm-task':
          data = await this.executeLlmTask(step, context);
          break;

        case 'conditional':
          data = await this.executeConditional(step, context);
          break;

        case 'loop':
          data = await this.executeLoop(step, context);
          break;

        case 'parallel':
          data = await this.executeParallel(step, context);
          break;

        default:
          throw new Error(`Unknown step type: ${step.type}`);
      }

      return {
        status: 'success',
        data
      };

    } catch (error) {
      return {
        status: 'error',
        error: error.message
      };
    }
  }

  /**
   * Execute validation step
   */
  async executeValidation(step, context) {
    const { rules } = step;
    const errors = [];

    for (const [path, rule] of Object.entries(rules)) {
      const value = this.getValueByPath(context, path);

      if (rule.required && !value) {
        errors.push(`${path} is required`);
      }

      if (rule.pattern && value && !new RegExp(rule.pattern).test(value)) {
        errors.push(`${path} does not match pattern ${rule.pattern}`);
      }

      if (rule.min && value < rule.min) {
        errors.push(`${path} must be at least ${rule.min}`);
      }

      if (rule.max && value > rule.max) {
        errors.push(`${path} must be at most ${rule.max}`);
      }
    }

    if (errors.length > 0) {
      throw new Error(`Validation failed: ${errors.join(', ')}`);
    }

    return { valid: true };
  }

  /**
   * Execute API call step
   */
  async executeApiCall(step, context) {
    const { url, method = 'GET', body } = step;
    
    const resolvedUrl = this.interpolate(url, context);
    const resolvedBody = body ? this.interpolate(JSON.stringify(body), context) : null;

    const options = {
      method,
      headers: {
        'Content-Type': 'application/json'
      }
    };

    if (resolvedBody && ['POST', 'PUT', 'PATCH'].includes(method)) {
      options.body = resolvedBody;
    }

    const response = await fetch(resolvedUrl, options);
    
    if (!response.ok) {
      throw new Error(`API call failed: ${response.status} ${response.statusText}`);
    }

    return await response.json();
  }

  /**
   * Execute LLM task step
   */
  async executeLlmTask(step, context) {
    const { prompt } = step;
    const resolvedPrompt = this.interpolate(prompt, context);

    console.log(`[Workflow Engine] LLM Task: ${resolvedPrompt}`);
    
    // Use Gemini for LLM tasks
    try {
      const result = await generateAppSpecWithGemini(resolvedPrompt);
      return result;
    } catch (error) {
      console.error('[Workflow Engine] LLM task failed:', error);
      throw error;
    }
  }

  /**
   * Execute conditional step
   */
  async executeConditional(step, context) {
    const { condition, then: thenSteps, else: elseSteps } = step;
    
    const conditionResult = this.evaluateCondition(condition, context);
    const stepsToExecute = conditionResult ? thenSteps : elseSteps;

    if (!stepsToExecute || stepsToExecute.length === 0) {
      return { conditionResult, executed: 'none' };
    }

    const results = [];
    for (const substep of stepsToExecute) {
      const result = await this.executeStep(substep, context);
      results.push(result);
    }

    return { conditionResult, results };
  }

  /**
   * Execute loop step
   */
  async executeLoop(step, context) {
    const { items, itemVariable = 'item', steps } = step;
    
    const itemsArray = this.getValueByPath(context, items);
    if (!Array.isArray(itemsArray)) {
      throw new Error(`Loop items must be an array: ${items}`);
    }

    const results = [];
    for (const item of itemsArray) {
      const loopContext = { ...context, [itemVariable]: item };
      
      for (const substep of steps) {
        const result = await this.executeStep(substep, loopContext);
        results.push(result);
      }
    }

    return results;
  }

  /**
   * Execute parallel steps
   */
  async executeParallel(step, context) {
    const { steps } = step;
    
    const promises = steps.map(substep => this.executeStep(substep, context));
    const results = await Promise.all(promises);

    return results;
  }

  /**
   * Execute an effect (for success/error handlers)
   */
  async executeEffect(effect, context) {
    // This is a simplified version - could be expanded
    console.log(`[Workflow Engine] Executing effect: ${effect.type}`);
    
    if (effect.type === 'notify') {
      console.log(`[Workflow Engine] Notification: ${effect.message}`);
    }
    
    // Add more effect types as needed
  }

  /**
   * Evaluate a condition
   */
  evaluateCondition(condition, context) {
    // Simple condition evaluation
    // In production, use a safe expression evaluator
    try {
      const interpolated = this.interpolate(condition, context);
      // This is unsafe - in production, use a proper expression evaluator
      // For now, just check for basic comparisons
      return eval(interpolated);
    } catch (error) {
      console.error('[Workflow Engine] Condition evaluation error:', error);
      return false;
    }
  }

  /**
   * Interpolate template variables in a string
   */
  interpolate(template, context) {
    if (typeof template !== 'string') {
      return template;
    }

    return template.replace(/\{\{(.+?)\}\}/g, (match, path) => {
      const value = this.getValueByPath(context, path.trim());
      return value !== undefined ? value : match;
    });
  }

  /**
   * Get value by dot-notation path
   */
  getValueByPath(obj, path) {
    const keys = path.split('.');
    let value = obj;

    for (const key of keys) {
      if (value === null || value === undefined) {
        return undefined;
      }
      value = value[key];
    }

    return value;
  }

  /**
   * Get execution history
   */
  getHistory() {
    return this.executionHistory;
  }

  /**
   * Get execution by ID
   */
  getExecution(executionId) {
    return this.executionHistory.find(exec => exec.id === executionId);
  }
}

// Export singleton instance
export const workflowEngine = new WorkflowEngine();
