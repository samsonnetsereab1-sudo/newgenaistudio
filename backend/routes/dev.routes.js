/**
 * Development/Testing Routes
 * Isolated endpoints for debugging specific features
 */

import express from 'express';

const router = express.Router();

/**
 * Test domain construct parsing in isolation (no AI call)
 * POST /api/dev/test-domain
 * Body: { prompt: "..." }
 */
router.post('/test-domain', async (req, res) => {
  try {
    const { prompt } = req.body;
    
    if (!prompt) {
      return res.status(400).json({ error: 'prompt is required' });
    }

    console.log('[DevTest] Testing domain parsing for prompt:', prompt.substring(0, 100));

    // Import and call parser directly
    const { parseDomainConstructs } = await import('../controllers/generate.controller.js');
    const constructs = parseDomainConstructs(prompt);

    console.log('[DevTest] ✓ Parsing complete');
    
    res.json({
      status: 'ok',
      prompt: prompt.substring(0, 100) + '...',
      parsed: {
        agents: constructs.agents,
        workflows: constructs.workflows,
        states: constructs.states,
        hasModal: constructs.hasModal,
        modalQuestions: constructs.modalQuestions
      },
      summary: {
        agentCount: constructs.agents.length,
        workflowCount: constructs.workflows.length,
        stateCount: constructs.states.length
      }
    });

  } catch (err) {
    console.error('[DevTest] ❌ Domain parsing failed:', err);
    res.status(500).json({
      status: 'error',
      error: err.message,
      stack: err.stack
    });
  }
});

/**
 * Health check for dev routes
 */
router.get('/health', (req, res) => {
  res.json({ status: 'ok', message: 'Dev routes active' });
});

export default router;
