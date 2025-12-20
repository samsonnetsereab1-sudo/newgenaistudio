import express from 'express';
import { getSummary, resetMetrics } from '../services/metrics.service.js';

const router = express.Router();

// GET /api/v1/metrics — summary of in-memory metrics
router.get('/', (req, res) => {
  try {
    const summary = getSummary();
    res.json({ status: 'ok', metrics: summary });
  } catch (e) {
    res.status(500).json({ status: 'error', message: e.message });
  }
});

// POST /api/v1/metrics/reset — dev-only: reset counters
router.post('/reset', (req, res) => {
  try {
    resetMetrics();
    res.json({ status: 'ok' });
  } catch (e) {
    res.status(500).json({ status: 'error', message: e.message });
  }
});

export default router;
