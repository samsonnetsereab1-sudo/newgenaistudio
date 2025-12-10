/**
 * Base Agent class
 * All agents inherit from this base and implement specialized behaviors
 */
class Agent {
  constructor(name, type, config = {}) {
    this.id = `${type}-${Date.now()}`;
    this.name = name;
    this.type = type; // 'retriever', 'planner', 'simulator', 'executor', 'safety', 'operator'
    this.config = config;
    this.tools = [];
    this.logs = [];
    this.createdAt = new Date();
    this.status = 'initialized'; // initialized, running, succeeded, failed
    this.lastAction = null;
    this.lastOutput = null;
  }

  /**
   * Register a tool that this agent can invoke
   */
  registerTool(tool) {
    this.tools.push({
      name: tool.name,
      description: tool.description,
      schema: tool.schema,
      invoke: tool.invoke
    });
  }

  /**
   * Get all available tools
   */
  getTools() {
    return this.tools.map((t) => ({
      name: t.name,
      description: t.description,
      schema: t.schema
    }));
  }

  /**
   * Find and invoke a tool by name
   */
  async invokeTool(toolName, args) {
    const tool = this.tools.find((t) => t.name === toolName);
    if (!tool) {
      throw new Error(`Tool "${toolName}" not found in agent ${this.name}`);
    }
    this.log(`Invoking tool: ${toolName}`, { args });
    try {
      const result = await tool.invoke(args);
      this.log(`Tool succeeded: ${toolName}`, { result });
      return result;
    } catch (err) {
      this.log(`Tool failed: ${toolName}`, { error: err.message });
      throw err;
    }
  }

  /**
   * Log an agent action with provenance
   */
  log(message, data = {}) {
    const entry = {
      timestamp: new Date().toISOString(),
      agentId: this.id,
      agentName: this.name,
      message,
      data,
      modelVersion: process.env.MODEL_VERSION || 'v1.0'
    };
    this.logs.push(entry);
    console.log(`[${this.name}] ${message}`, data);
  }

  /**
   * Get all logs for this agent
   */
  getLogs() {
    return this.logs;
  }

  /**
   * Execute agent logic - must be overridden by subclasses
   */
  async execute(input) {
    throw new Error(`execute() must be implemented by ${this.type} agent`);
  }

  /**
   * Reset agent state
   */
  reset() {
    this.logs = [];
    this.status = 'initialized';
    this.lastAction = null;
    this.lastOutput = null;
  }

  /**
   * Get agent status
   */
  getStatus() {
    return {
      id: this.id,
      name: this.name,
      type: this.type,
      status: this.status,
      createdAt: this.createdAt,
      lastAction: this.lastAction,
      logsCount: this.logs.length,
      toolsCount: this.tools.length
    };
  }
}

export default Agent;
