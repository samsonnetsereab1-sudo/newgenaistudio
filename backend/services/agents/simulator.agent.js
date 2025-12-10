/**
 * Simulator Agent
 * Executes simulation runs with parameters and aggregates results
 */
import Agent from './agent.base.js';

class SimulatorAgent extends Agent {
  constructor(config = {}) {
    super('Simulator', 'simulator', config);
    this.simulationService = config.simulationService;
    this.maxRunsPerSession = config.maxRunsPerSession || 10;
  }

  /**
   * Execute a simulation scenario
   */
  async execute(input) {
    this.status = 'running';
    this.lastAction = 'simulate';

    try {
      const {
        protocol = 'plasmid-prep',
        template = 'default',
        numRuns = 3,
        params = {},
        metrics = ['cost', 'duration', 'yield']
      } = input;

      this.log('Starting simulation', { protocol, numRuns, template, metricsCount: metrics.length });

      if (numRuns > this.maxRunsPerSession) {
        throw new Error(
          `Requested runs (${numRuns}) exceed limit (${this.maxRunsPerSession})`
        );
      }

      // Mock simulation results (in production, call actual simulation service)
      const results = {
        simulationId: `sim-${Date.now()}`,
        protocol,
        template,
        numRuns,
        params,
        requestedMetrics: metrics,
        runs: this._generateMockRuns(numRuns, protocol),
        aggregated: this._aggregateResults(numRuns, protocol, metrics),
        status: 'completed',
        executedAt: new Date().toISOString(),
        durationMs: Math.random() * 5000 + 1000
      };

      this.lastOutput = results;

      this.log('Simulation completed', {
        runCount: numRuns,
        protocolType: protocol,
        metricsCount: metrics.length
      });

      this.status = 'succeeded';
      return results;
    } catch (err) {
      this.log('Simulation failed', { error: err.message });
      this.status = 'failed';
      throw err;
    }
  }

  /**
   * Generate mock simulation runs
   */
  _generateMockRuns(numRuns, protocol) {
    const runs = [];
    const baseValues = {
      'plasmid-prep': { cost: 50, duration: 240, yield: 0.85 },
      'protein-expr': { cost: 120, duration: 72, yield: 0.78 },
      'lc-ms-prep': { cost: 200, duration: 300, yield: 0.92 }
    };

    const base = baseValues[protocol] || baseValues['plasmid-prep'];

    for (let i = 0; i < numRuns; i++) {
      runs.push({
        runId: `run-${i + 1}`,
        cost: base.cost + (Math.random() - 0.5) * 20,
        duration: base.duration + (Math.random() - 0.5) * 50,
        yield: Math.max(0.5, base.yield + (Math.random() - 0.5) * 0.2),
        successRate: Math.random() * 0.3 + 0.7,
        bottlenecks: Math.random() > 0.5 ? ['step-3'] : [],
        timestamp: new Date().toISOString()
      });
    }

    return runs;
  }

  /**
   * Aggregate simulation results
   */
  _aggregateResults(numRuns, protocol, metrics) {
    const mockRuns = this._generateMockRuns(numRuns, protocol);
    const agg = {};

    const metricsData = {
      cost: mockRuns.map((r) => r.cost),
      duration: mockRuns.map((r) => r.duration),
      yield: mockRuns.map((r) => r.yield),
      successRate: mockRuns.map((r) => r.successRate)
    };

    for (const metric of metrics) {
      if (metricsData[metric]) {
        const values = metricsData[metric];
        agg[metric] = {
          mean: values.reduce((a, b) => a + b, 0) / values.length,
          median: values.sort((a, b) => a - b)[Math.floor(values.length / 2)],
          min: Math.min(...values),
          max: Math.max(...values),
          stdDev: this._stdDev(values)
        };
      }
    }

    return agg;
  }

  /**
   * Calculate standard deviation
   */
  _stdDev(values) {
    const mean = values.reduce((a, b) => a + b, 0) / values.length;
    const squareDiffs = values.map((val) => Math.pow(val - mean, 2));
    return Math.sqrt(squareDiffs.reduce((a, b) => a + b, 0) / values.length);
  }

  /**
   * Compare two simulation results
   */
  async compareSimulations(simId1, simId2) {
    this.log('Comparing simulations', { sim1: simId1, sim2: simId2 });

    // Mock comparison result
    return {
      comparison: {
        sim1: simId1,
        sim2: simId2,
        costDifference: Math.random() * 50 - 25,
        durationDifference: Math.random() * 100 - 50,
        yieldDifference: Math.random() * 0.1 - 0.05,
        winner: Math.random() > 0.5 ? simId1 : simId2,
        recommendation: 'Sim 1 is more cost-effective'
      },
      timestamp: new Date().toISOString()
    };
  }

  /**
   * Scan for bottlenecks in simulation
   */
  identifyBottlenecks(simulationResult) {
    const bottlenecks = [];

    if (simulationResult.aggregated) {
      const agg = simulationResult.aggregated;

      // Flag high variance
      if (agg.yield && agg.yield.stdDev > 0.15) {
        bottlenecks.push({
          type: 'high-variance',
          metric: 'yield',
          value: agg.yield.stdDev,
          severity: 'medium',
          recommendation: 'Investigate consistency of yield step'
        });
      }

      if (agg.duration && agg.duration.stdDev > 50) {
        bottlenecks.push({
          type: 'high-variance',
          metric: 'duration',
          value: agg.duration.stdDev,
          severity: 'medium',
          recommendation: 'Standardize timing controls'
        });
      }

      // Flag low yield
      if (agg.yield && agg.yield.mean < 0.7) {
        bottlenecks.push({
          type: 'low-yield',
          metric: 'yield',
          value: agg.yield.mean,
          severity: 'high',
          recommendation: 'Review protocol steps for yield loss'
        });
      }
    }

    return bottlenecks;
  }
}

export default SimulatorAgent;
