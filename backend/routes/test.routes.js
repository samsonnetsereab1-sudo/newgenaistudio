/**
 * Test Routes - Simple endpoints to verify AI providers
 */

import express from 'express';

const router = express.Router();

/**
 * GET /api/test/ping
 * Simple ping to verify routing works
 */
router.get('/ping', (req, res) => {
  console.log('🏓 PING received');
  res.json({ message: 'pong', timestamp: new Date().toISOString() });
});

/**
 * GET /api/test/gemini
 * Simple test to verify Gemini is working
 */
router.get('/gemini', async (req, res) => {
  console.log('🧪 Gemini test endpoint hit');
  try {
    console.log('🧪 About to import GoogleGenerativeAI...');
    const { GoogleGenerativeAI } = await import('@google/generative-ai');
    console.log('🧪 Import successful');
    
    if (!process.env.GEMINI_API_KEY) {
      console.log('🧪 GEMINI_API_KEY not found');
      return res.status(500).json({
        error: 'GEMINI_NOT_CONFIGURED',
        message: 'GEMINI_API_KEY not set in environment'
      });
    }

    console.log('🧪 Creating Gemini client...');
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({
      model: 'gemini-2.0-flash-exp',
      generationConfig: {
        temperature: 0.3,
        maxOutputTokens: 500,
        responseMimeType: 'application/json'
      }
    });

    const prompt = 'Generate a simple JSON object with fields: name (string), description (string), count (number). Make it about a biological sample.';
    
    console.log('🧪 Calling Gemini API...');
    const result = await model.generateContent(prompt);
    const response = result.response;
    const text = response.text();
    
    console.log('🧪 Gemini responded:', text.substring(0, 200));
    
    const parsed = JSON.parse(text);
    
    res.json({
      success: true,
      message: 'Gemini is working!',
      model: 'gemini-2.0-flash-exp',
      response: parsed,
      rawLength: text.length
    });

  } catch (error) {
    console.error('🧪 Gemini test failed:', error.message);
    console.error('🧪 Stack:', error.stack);
    res.status(500).json({
      error: 'GEMINI_TEST_FAILED',
      message: error.message,
      stack: error.stack
    });
  }
});

/**
 * POST /api/test/gemini
 * Test Gemini with custom prompt
 */
router.post('/gemini', async (req, res) => {
  console.log('🧪 Gemini POST endpoint hit');
  try {
    const { prompt } = req.body;
    
    if (!prompt) {
      return res.status(400).json({
        error: 'MISSING_PROMPT',
        message: 'Please provide a prompt in request body'
      });
    }

    console.log('🧪 Testing Gemini with custom prompt...');
    
    if (!process.env.GEMINI_API_KEY) {
      return res.status(500).json({
        error: 'GEMINI_NOT_CONFIGURED',
        message: 'GEMINI_API_KEY not set in environment'
      });
    }

    console.log('🧪 About to import GoogleGenerativeAI...');
    const { GoogleGenerativeAI } = await import('@google/generative-ai');
    console.log('🧪 Import successful');

    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({
      model: 'gemini-2.0-flash-exp',
      generationConfig: {
        temperature: 0.3,
        maxOutputTokens: 2000,
        responseMimeType: 'application/json'
      }
    });

    console.log('🧪 Calling Gemini API with prompt:', prompt.substring(0, 100));
    const result = await model.generateContent(prompt);
    const response = result.response;
    const text = response.text();
    
    console.log('🧪 Gemini responded with', text.length, 'characters');
    
    let parsed;
    try {
      parsed = JSON.parse(text);
    } catch (parseError) {
      return res.json({
        success: false,
        message: 'Gemini responded but output was not valid JSON',
        rawResponse: text.substring(0, 500),
        parseError: parseError.message
      });
    }
    
    res.json({
      success: true,
      message: 'Gemini generated valid JSON!',
      model: 'gemini-2.0-flash-exp',
      response: parsed,
      rawLength: text.length
    });

  } catch (error) {
    console.error('🧪 Gemini test failed:', error.message);
    res.status(500).json({
      error: 'GEMINI_TEST_FAILED',
      message: error.message,
      stack: error.stack
    });
  }
});

export default router;
