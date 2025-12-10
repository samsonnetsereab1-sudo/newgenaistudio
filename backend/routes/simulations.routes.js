import express from 'express';
import simulationEngine from '../services/simulation.service.js';

const router = express.Router();

/**
 * POST /api/v1/simulations
 * Run a protocol simulation
 */
router.post('/', (req, res) => {
  try {
    const config = req.body;

    // Validate required fields
    if (!config.templateId || !config.protocolName) {
      return res
        .status(400)
        .json({
          error: 'Missing required fields: templateId, protocolName'
        });
    }

    // Defaults
    const numSamples = config.numSamples || 1;
    const numRuns = config.numRuns || 1;
    const randomSeed = config.randomSeed || Date.now();

    const result = simulationEngine.runProtocolSimulation({
      templateId: config.templateId,
      protocolName: config.protocolName,
      params: config.params || {},
      numSamples,
      numRuns,
      randomSeed
    });

    res.status(201).json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET /api/v1/simulations/:id
 * Get simulation results by ID
 */
router.get('/:id', (req, res) => {
  try {
    const result = simulationEngine.getSimulationResult(req.params.id);

    if (!result) {
      return res.status(404).json({ error: 'Simulation not found' });
    }

    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET /api/v1/simulations
 * List all simulations
 */
router.get('/', (req, res) => {
  try {
    const simulations = simulationEngine.listSimulations();
    res.json(simulations);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
