/**
 * Workflow Execution Routes
 */

import express from 'express';
import { workflowEngine } from '../services/workflowEngine.js';
import { validateWorkflow, ExampleBatchReleaseWorkflow } from '../schemas/appspec.workflow.schema.js';

const router = express.Router();

/**
 * Execute a workflow
 * POST /api/workflows/execute
 */
router.post('/execute', async (req, res) => {
  try {
    const { workflow, context = {} } = req.body;
    
    if (!workflow) {
      return res.status(400).json({
        error: 'Workflow definition is required',
        example: {
          workflow: ExampleBatchReleaseWorkflow,
          context: { batchId: 'BATCH-001' }
        }
      });
    }
    
    // Validate workflow
    const validation = validateWorkflow(workflow);
    if (!validation.valid) {
      return res.status(400).json({
        error: 'Invalid workflow',
        errors: validation.errors
      });
    }
    
    // Execute workflow
    const execution = await workflowEngine.execute(workflow, context);
    
    res.json({
      status: 'success',
      execution
    });
    
  } catch (error) {
    console.error('[Workflows] Execution error:', error);
    res.status(500).json({
      status: 'error',
      message: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
});

/**
 * Get workflow execution history
 * GET /api/workflows/history
 */
router.get('/history', (req, res) => {
  try {
    const history = workflowEngine.getHistory();
    res.json({
      status: 'success',
      count: history.length,
      executions: history
    });
  } catch (error) {
    console.error('[Workflows] History error:', error);
    res.status(500).json({
      status: 'error',
      message: error.message
    });
  }
});

/**
 * Get specific execution
 * GET /api/workflows/executions/:id
 */
router.get('/executions/:id', (req, res) => {
  try {
    const execution = workflowEngine.getExecution(req.params.id);
    
    if (!execution) {
      return res.status(404).json({
        status: 'error',
        message: 'Execution not found'
      });
    }
    
    res.json({
      status: 'success',
      execution
    });
  } catch (error) {
    console.error('[Workflows] Get execution error:', error);
    res.status(500).json({
      status: 'error',
      message: error.message
    });
  }
});

/**
 * Get example workflows
 * GET /api/workflows/examples
 */
router.get('/examples', (req, res) => {
  res.json({
    status: 'success',
    examples: [
      {
        name: 'Batch Release Process',
        workflow: ExampleBatchReleaseWorkflow
      }
    ]
  });
});

export default router;
