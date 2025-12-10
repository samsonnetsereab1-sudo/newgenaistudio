import express from 'express';
import graphService from '../services/graph.service.js';

const router = express.Router();

/**
 * POST /api/v1/graphs/protocol-dag
 * Create a protocol dependency graph
 */
router.post('/protocol-dag', (req, res) => {
  try {
    const { protocolName, steps } = req.body;

    if (!protocolName || !steps || steps.length === 0) {
      return res
        .status(400)
        .json({
          error: 'Missing required fields: protocolName, steps array'
        });
    }

    const graph = graphService.createProtocolDAG(protocolName, steps);
    res.status(201).json(graph);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * POST /api/v1/graphs/instrument-network
 * Create an instrument network graph
 */
router.post('/instrument-network', (req, res) => {
  try {
    const { instruments } = req.body;

    if (!instruments || instruments.length === 0) {
      return res
        .status(400)
        .json({ error: 'Missing required field: instruments array' });
    }

    const graph = graphService.createInstrumentNetwork(instruments);
    res.status(201).json(graph);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * POST /api/v1/graphs/sample-lineage
 * Create a sample lineage graph
 */
router.post('/sample-lineage', (req, res) => {
  try {
    const { samples } = req.body;

    if (!samples || samples.length === 0) {
      return res
        .status(400)
        .json({ error: 'Missing required field: samples array' });
    }

    const graph = graphService.createSampleLineageGraph(samples);
    res.status(201).json(graph);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET /api/v1/graphs/:id
 * Get graph by ID
 */
router.get('/:id', (req, res) => {
  try {
    const graph = graphService.getGraph(req.params.id);

    if (!graph) {
      return res.status(404).json({ error: 'Graph not found' });
    }

    res.json(graph);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET /api/v1/graphs/:id/centrality
 * Calculate centrality measures for a graph
 */
router.get('/:id/centrality', (req, res) => {
  try {
    const centrality = graphService.calculateCentrality(req.params.id);

    if (!centrality) {
      return res.status(404).json({ error: 'Graph not found' });
    }

    res.json(centrality);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET /api/v1/graphs/:id/paths?source=xxx&target=yyy
 * Find paths between two nodes
 */
router.get('/:id/paths', (req, res) => {
  try {
    const { source, target } = req.query;

    if (!source || !target) {
      return res
        .status(400)
        .json({
          error: 'Missing required query params: source, target'
        });
    }

    const paths = graphService.findPaths(req.params.id, source, target);
    res.json({ graphId: req.params.id, source, target, paths });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET /api/v1/graphs
 * List all graphs
 */
router.get('/', (req, res) => {
  try {
    const graphs = graphService.listGraphs();
    res.json(graphs);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
