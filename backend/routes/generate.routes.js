console.log('🔧 [Generate Routes] Loading generate routes...');
import express from 'express';
import { generateApp } from '../controllers/generate.controller.js';
import { generateDynamic } from '../services/generation.enhanced.js';

const router = express.Router();
console.log('🔧 [Generate Routes] Router created');

// Test endpoint
router.get('/test', (req, res) => {
  console.log('🎯 [Generate Routes] /test endpoint hit!');
  console.log('✅ TEST ENDPOINT HIT!');
  res.json({ message: 'Test endpoint works!' });
});

// Helpful message for GET on main endpoint
router.get('/', (req, res) => {
  res.status(405).json({ 
    error: 'Method Not Allowed',
    message: 'This endpoint requires POST with a JSON body containing "prompt"',
    example: { prompt: 'Build a simple task tracker' }
  });
});

console.log('🔧 [Generate Routes] Registering POST / handler...');
router.post('/', (req, res, next) => {
  console.log('🎯 [Generate Routes] POST / handler hit!');
  console.log('🎯 [Generate Routes] Body:', req.body);
  next();
}, generateApp);
console.log('🔧 [Generate Routes] ✅ POST handler registered');

// Dynamic generation endpoint with state management
router.post('/dynamic', async (req, res) => {
  console.log('🎯 [Generate Routes] POST /dynamic handler hit!');
  console.log('🎯 [Generate Routes] Body:', req.body);
  
  try {
    const { prompt, context = {} } = req.body;
    
    if (!prompt || typeof prompt !== 'string') {
      return res.status(400).json({
        status: 'error',
        message: 'prompt is required and must be a string',
        example: {
          prompt: 'sample tracker',
          context: {
            domain: 'pharma',
            fields: ['Sample ID', 'Batch', 'Status'],
            apiUrl: '/api/samples'
          }
        }
      });
    }
    
    const spec = await generateDynamic(prompt, context);
    res.json(spec);
  } catch (error) {
    console.error('[Generate Routes] Dynamic generation error:', error);
    res.status(500).json({
      status: 'error',
      message: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
});

export default router;
