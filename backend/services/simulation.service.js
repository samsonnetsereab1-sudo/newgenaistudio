/**
 * Simulation Engine Service
 * Rule-based + stochastic simulator for lab protocols
 * Supports: step durations, success probabilities, reagent usage, cost modeling
 */

export class SimulationEngine {
  constructor() {
    this.simulations = new Map(); // id -> simulation result
  }

  /**
   * Run a protocol simulation
   * @param {Object} config - Simulation configuration
   * @returns {Object} Simulation results with metrics
   */
  async runProtocolSimulation(config) {
    const {
      templateId,
      protocolName,
      params = {},
      numSamples = 1,
      numRuns = 1,
      randomSeed = Date.now()
    } = config;

    const results = {
      id: `sim-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      templateId,
      protocolName,
      timestamp: new Date().toISOString(),
      config,
      runs: [],
      aggregatedMetrics: {}
    };

    // Run multiple simulation iterations
    for (let run = 0; run < numRuns; run++) {
      const rng = new SeededRandom(randomSeed + run);
      const runResult = this._simulateSingleRun(
        templateId,
        protocolName,
        params,
        numSamples,
        rng
      );
      results.runs.push(runResult);
    }

    // Aggregate metrics across runs
    results.aggregatedMetrics = this._aggregateMetrics(results.runs);

    // Store result
    this.simulations.set(results.id, results);

    return results;
  }

  /**
   * Simulate a single run of a protocol
   */
  _simulateSingleRun(templateId, protocolName, params, numSamples, rng) {
    const steps = this._generateProtocolSteps(templateId, protocolName, params);
    const samples = this._initializeSamples(numSamples, params);

    const runResult = {
      startTime: 0,
      endTime: 0,
      steps: [],
      samples: [],
      totalCost: 0,
      successCount: 0,
      failureCount: 0,
      bottlenecks: []
    };

    let currentTime = 0;

    // Execute each step
    for (const step of steps) {
      const stepResult = this._executeStep(
        step,
        samples,
        currentTime,
        rng,
        params
      );

      runResult.steps.push(stepResult);
      currentTime = stepResult.endTime;
      runResult.totalCost += stepResult.cost || 0;
      runResult.successCount += stepResult.successCount || 0;
      runResult.failureCount += stepResult.failureCount || 0;
    }

    runResult.endTime = currentTime;
    runResult.samples = samples;

    // Identify bottlenecks
    const stepDurations = runResult.steps.map((s) => ({
      name: s.name,
      duration: s.duration,
      cost: s.cost || 0
    }));
    runResult.bottlenecks = this._identifyBottlenecks(stepDurations);

    return runResult;
  }

  /**
   * Generate protocol steps from template
   */
  _generateProtocolSteps(templateId, protocolName, params) {
    // Protocol-specific step definitions
    const protocols = {
      'template-crispr-plasmid-prep-v1': [
        {
          name: 'DNA Extraction',
          baseDuration: 30,
          durationVariance: 5,
          successRate: 0.98,
          costPerSample: 5.0,
          reagentUsage: { ethanol: 10, buffers: 5 }
        },
        {
          name: 'Plasmid Amplification',
          baseDuration: 120,
          durationVariance: 15,
          successRate: 0.95,
          costPerSample: 8.0,
          reagentUsage: { pcr_mix: 50, primers: 2 }
        },
        {
          name: 'Restriction Digest',
          baseDuration: 60,
          durationVariance: 10,
          successRate: 0.96,
          costPerSample: 6.0,
          reagentUsage: { restriction_enzyme: 5, buffer: 10 }
        },
        {
          name: 'Ligation',
          baseDuration: 45,
          durationVariance: 8,
          successRate: 0.92,
          costPerSample: 12.0,
          reagentUsage: { ligase: 2, atp: 1 }
        },
        {
          name: 'Transformation',
          baseDuration: 30,
          durationVariance: 5,
          successRate: 0.88,
          costPerSample: 3.0,
          reagentUsage: { competent_cells: 1, recovery_media: 2 }
        },
        {
          name: 'Colony Selection & Verification',
          baseDuration: 240,
          durationVariance: 30,
          successRate: 0.85,
          costPerSample: 10.0,
          reagentUsage: { antibiotics: 20, growth_media: 100 }
        }
      ],
      'template-protein-expression-purification-v1': [
        {
          name: 'Culture Growth',
          baseDuration: 480,
          durationVariance: 60,
          successRate: 0.95,
          costPerSample: 15.0,
          reagentUsage: { growth_media: 500, induction_reagent: 10 }
        },
        {
          name: 'Cell Lysis',
          baseDuration: 60,
          durationVariance: 10,
          successRate: 0.96,
          costPerSample: 8.0,
          reagentUsage: { lysis_buffer: 50, protease_inhibitor: 5 }
        },
        {
          name: 'Clarification',
          baseDuration: 30,
          durationVariance: 5,
          successRate: 0.99,
          costPerSample: 5.0,
          reagentUsage: { centrifuge_time: 30 }
        },
        {
          name: 'Protein Purification',
          baseDuration: 120,
          durationVariance: 20,
          successRate: 0.90,
          costPerSample: 25.0,
          reagentUsage: { resin: 10, elution_buffer: 50 }
        },
        {
          name: 'Concentration & Buffer Exchange',
          baseDuration: 90,
          durationVariance: 15,
          successRate: 0.93,
          costPerSample: 12.0,
          reagentUsage: { dialysis_buffer: 200 }
        },
        {
          name: 'QC Analysis',
          baseDuration: 120,
          durationVariance: 20,
          successRate: 0.98,
          costPerSample: 20.0,
          reagentUsage: { sds_page_reagents: 50 }
        }
      ],
      'template-lc-ms-prep-v1': [
        {
          name: 'Sample Preparation',
          baseDuration: 45,
          durationVariance: 8,
          successRate: 0.97,
          costPerSample: 10.0,
          reagentUsage: { organic_solvent: 50, buffer: 20 }
        },
        {
          name: 'Protein Extraction',
          baseDuration: 30,
          durationVariance: 5,
          successRate: 0.94,
          costPerSample: 8.0,
          reagentUsage: { protease: 2, buffer: 50 }
        },
        {
          name: 'Desalting',
          baseDuration: 60,
          durationVariance: 10,
          successRate: 0.96,
          costPerSample: 12.0,
          reagentUsage: { desalt_column: 1, buffer: 100 }
        },
        {
          name: 'LC-MS Analysis',
          baseDuration: 45,
          durationVariance: 10,
          successRate: 0.95,
          costPerSample: 30.0,
          reagentUsage: { mobile_phase_a: 50, mobile_phase_b: 50 }
        },
        {
          name: 'Data Processing',
          baseDuration: 30,
          durationVariance: 5,
          successRate: 0.99,
          costPerSample: 5.0,
          reagentUsage: {}
        }
      ]
    };

    return protocols[templateId] || protocols['template-crispr-plasmid-prep-v1'];
  }

  /**
   * Initialize sample tracking
   */
  _initializeSamples(numSamples, params) {
    return Array.from({ length: numSamples }, (_, i) => ({
      id: `sample-${i + 1}`,
      status: 'active',
      yieldMg: params.initialYield || 100,
      volumeMl: params.initialVolume || 50,
      quality: 1.0 // Quality degradation factor
    }));
  }

  /**
   * Execute a single protocol step
   */
  _executeStep(step, samples, startTime, rng, params) {
    const duration = rng.normal(step.baseDuration, step.baseDuration * 0.1);
    const successRate = step.successRate;

    // Track step metrics
    let successCount = 0;
    let failureCount = 0;
    let totalYieldLoss = 0;

    samples.forEach((sample) => {
      if (sample.status !== 'active') return;

      const isSuccess = rng.random() < successRate;

      if (isSuccess) {
        successCount++;
        // Simulate reagent usage and yield loss
        const yieldLoss = params.yieldLossPerStep || 0.05;
        const yieldFactor = 1 - yieldLoss;
        sample.yieldMg *= yieldFactor;
        totalYieldLoss += sample.yieldMg * yieldLoss;
      } else {
        failureCount++;
        sample.status = 'failed';
      }

      // Quality degradation
      sample.quality *= 0.98;
    });

    // Calculate cost
    const activeSamples = samples.filter((s) => s.status === 'active').length;
    const stepCost = (step.costPerSample || 0) * activeSamples;

    return {
      name: step.name,
      startTime,
      endTime: startTime + duration,
      duration: Math.round(duration),
      successRate,
      successCount,
      failureCount,
      cost: stepCost,
      reagentUsage: step.reagentUsage,
      yieldLoss: totalYieldLoss
    };
  }

  /**
   * Identify bottleneck steps
   */
  _identifyBottlenecks(stepDurations) {
    const avgDuration =
      stepDurations.reduce((sum, s) => sum + s.duration, 0) /
      stepDurations.length;

    return stepDurations
      .filter((s) => s.duration > avgDuration * 1.5)
      .map((s) => ({
        step: s.name,
        duration: s.duration,
        deviation: Math.round(((s.duration - avgDuration) / avgDuration) * 100)
      }))
      .sort((a, b) => b.duration - a.duration);
  }

  /**
   * Aggregate metrics across multiple runs
   */
  _aggregateMetrics(runs) {
    if (runs.length === 0) return {};

    const durations = runs.map((r) => r.endTime);
    const costs = runs.map((r) => r.totalCost);
    const successRates = runs.map(
      (r) =>
        (r.successCount /
          (r.successCount + r.failureCount)) *
        100
    );

    return {
      avgDurationMinutes: Math.round(
        durations.reduce((a, b) => a + b, 0) / runs.length
      ),
      minDurationMinutes: Math.min(...durations),
      maxDurationMinutes: Math.max(...durations),
      stdDevDuration: this._standardDeviation(durations),
      avgCostPerRun: Math.round(
        (costs.reduce((a, b) => a + b, 0) / runs.length) * 100
      ) / 100,
      minCostPerRun: Math.min(...costs),
      maxCostPerRun: Math.max(...costs),
      avgSuccessRate: Math.round(
        successRates.reduce((a, b) => a + b, 0) / runs.length
      ),
      totalRunsCompleted: runs.length,
      overallSuccessCount: runs.reduce((sum, r) => sum + r.successCount, 0),
      overallFailureCount: runs.reduce((sum, r) => sum + r.failureCount, 0)
    };
  }

  /**
   * Calculate standard deviation
   */
  _standardDeviation(values) {
    const mean = values.reduce((a, b) => a + b, 0) / values.length;
    const squaredDiffs = values.map((v) => Math.pow(v - mean, 2));
    const variance =
      squaredDiffs.reduce((a, b) => a + b, 0) / values.length;
    return Math.round(Math.sqrt(variance));
  }

  /**
   * Get simulation results by ID
   */
  getSimulationResult(simulationId) {
    return this.simulations.get(simulationId) || null;
  }

  /**
   * List all simulations
   */
  listSimulations() {
    return Array.from(this.simulations.values());
  }

  /**
   * Clear all simulations
   */
  clearSimulations() {
    this.simulations.clear();
  }
}

/**
 * Seeded random number generator for reproducible simulations
 */
class SeededRandom {
  constructor(seed) {
    this.seed = seed;
  }

  /**
   * Generate next random number [0, 1)
   */
  random() {
    this.seed = (this.seed * 9301 + 49297) % 233280;
    return this.seed / 233280;
  }

  /**
   * Normal distribution using Box-Muller transform
   */
  normal(mean = 0, stdDev = 1) {
    const u1 = this.random();
    const u2 = this.random();
    const z0 =
      Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2);
    return mean + z0 * stdDev;
  }

  /**
   * Bernoulli trial (success/failure)
   */
  bernoulli(probability) {
    return this.random() < probability;
  }
}

export default new SimulationEngine();
