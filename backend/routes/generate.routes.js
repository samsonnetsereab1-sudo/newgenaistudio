console.log('🔧 [Generate Routes] Loading generate routes...');
import express from 'express';
import { generateApp } from '../controllers/generate.controller.js';
import { generateDynamic } from '../services/generation.enhanced.js';
import { adaptToNewGen } from '../adapters/gemini-to-newgen.js';
import { determineRoute, getRouteDetails } from '../routing/intelligent-router.js';
import { learnFromGeneration, getInsights, updateFeedback } from '../learning/pattern-storage.js';

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

// Route confirmation endpoint (for medium complexity prompts)
router.post('/confirm-route', async (req, res) => {
  console.log('🎯 [Generate Routes] POST /confirm-route handler hit!');
  
  try {
    const { prompt, route, inputMode = 'no-code' } = req.body;
    
    if (!prompt || typeof prompt !== 'string') {
      return res.status(400).json({
        status: 'error',
        message: 'prompt is required'
      });
    }

    if (!route || !['DIRECT', 'TRIPLE_POWER_COMBO'].includes(route)) {
      return res.status(400).json({
        status: 'error',
        message: 'route must be either "DIRECT" or "TRIPLE_POWER_COMBO"'
      });
    }

    console.log(`[Generate Routes] User confirmed route: ${route}`);

    // Execute based on confirmed route
    if (route === 'TRIPLE_POWER_COMBO') {
      // TODO: Implement Triple Power Combo workflow
      // For now, fall back to standard generation
      console.log('[Generate Routes] Triple Power Combo selected - using standard generation for now');
    }

    // Call standard generation with routing metadata
    req.body.routingDecision = { route, confirmed: true };
    return generateApp(req, res);

  } catch (error) {
    console.error('[Generate Routes] Confirm route error:', error);
    res.status(500).json({
      status: 'error',
      message: error.message
    });
  }
});

// Feedback endpoint
router.post('/feedback', async (req, res) => {
  console.log('🎯 [Generate Routes] POST /feedback handler hit!');
  
  try {
    const { appId, rating, comments = '' } = req.body;
    
    if (!appId || typeof appId !== 'string') {
      return res.status(400).json({
        status: 'error',
        message: 'appId is required'
      });
    }

    if (typeof rating !== 'number' || rating < 1 || rating > 5) {
      return res.status(400).json({
        status: 'error',
        message: 'rating must be a number between 1 and 5'
      });
    }

    console.log(`[Generate Routes] Feedback: appId=${appId}, rating=${rating}`);

    // Update learning system with feedback
    const success = updateFeedback(appId, rating);

    if (success) {
      res.json({
        status: 'ok',
        message: '✅ Thank you! NewGen Studio just got smarter! 🧠'
      });
    } else {
      res.json({
        status: 'ok',
        message: 'Feedback recorded (learning system unavailable)'
      });
    }

  } catch (error) {
    console.error('[Generate Routes] Feedback error:', error);
    res.status(500).json({
      status: 'error',
      message: error.message
    });
  }
});

// Insights endpoint (learning metrics)
router.get('/insights', async (req, res) => {
  console.log('🎯 [Generate Routes] GET /insights handler hit!');
  
  try {
    const insights = getInsights();
    
    res.json({
      status: 'ok',
      insights
    });

  } catch (error) {
    console.error('[Generate Routes] Insights error:', error);
    res.status(500).json({
      status: 'error',
      message: error.message
    });
  }
});

// Analyze route endpoint (for testing routing logic)
router.post('/analyze-route', async (req, res) => {
  console.log('🎯 [Generate Routes] POST /analyze-route handler hit!');
  
  try {
    const { prompt } = req.body;
    
    if (!prompt || typeof prompt !== 'string') {
      return res.status(400).json({
        status: 'error',
        message: 'prompt is required'
      });
    }

    const routing = determineRoute(prompt);
    const details = getRouteDetails(routing.route, routing.confidence);

    res.json({
      status: 'ok',
      routing,
      details
    });

  } catch (error) {
    console.error('[Generate Routes] Analyze route error:', error);
    res.status(500).json({
      status: 'error',
      message: error.message
    });
  }
});

export default router;
