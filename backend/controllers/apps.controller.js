/**
 * Apps Controller - Handle staged generation, refine, and persistence
 */

import { generateStaged, generateSingleShot } from '../services/ai.service.staged.js';
import { generateAppSpecWithGemini, refineAppSpecWithGemini } from '../services/llm/geminiClient.js';
import { refineApp } from '../services/refine.service.js';
import { saveApp, getApp, listApps, updateAppSpec } from '../services/app.store.js';
import { validateFullAppSpec, fullAppSpecToLegacy } from '../schemas/appspec.full.schema.js';

/**
 * POST /api/apps/generate-staged
 * Generate app using staged pipeline
 */
export const generateAppStaged = async (req, res, next) => {
  console.log('🎯 generateAppStaged HANDLER CALLED');
  console.log('🎯 req.body:', req.body);
  
  try {
    console.log('[Apps] Staged generation request received');
    console.log('[Apps] Request body:', JSON.stringify(req.body));
    const { prompt, mode = 'staged' } = req.body;
    
    console.log('[Apps] Extracted prompt:', prompt);
    console.log('[Apps] Mode:', mode);
    
    if (!prompt || typeof prompt !== 'string') {
      return res.status(400).json({
        error: 'INVALID_REQUEST',
        message: 'prompt is required and must be a string'
      });
    }
    
    // Check if in demo mode
    if (process.env.DEMO_MODE === 'true') {
      return res.status(400).json({
        error: 'DEMO_MODE_ACTIVE',
        message: 'Staged generation requires real AI. Set DEMO_MODE=false and configure OPENAI_API_KEY'
      });
    }
    
    let result;
    const uiProvider = process.env.UI_PROVIDER || 'openai';
    
    if (uiProvider === 'gemini') {
      console.log('[Apps] Using Gemini for UI generation...');
      const geminiSpec = await generateAppSpecWithGemini(prompt);
      result = {
        spec: geminiSpec,
        stageResults: [{ stage: 'gemini-generation', status: 'completed', summary: 'Generated UI with Gemini' }],
        mode: 'generated'
      };
    } else if (mode === 'staged') {
      console.log('[Apps] Running staged generation pipeline...');
      result = await generateStaged(prompt);
    } else {
      console.log('[Apps] Running single-shot generation...');
      const singleShotResult = await generateSingleShot(prompt);
      result = {
        spec: singleShotResult,
        stageResults: [{ stage: 'single-shot', status: 'completed', summary: 'Generated in one step' }],
        mode: 'generated'
      };
    }
    
    // Validate spec
    if (mode === 'staged') {
      const validation = validateFullAppSpec(result.spec);
      if (!validation.valid) {
        console.error('[Apps] Invalid AppSpec:', validation.errors);
        return res.status(500).json({
          error: 'INVALID_SPEC',
          message: 'Generated AppSpec failed validation',
          errors: validation.errors
        });
      }
    }
    
    // Save app
    const savedApp = await saveApp({
      spec: result.spec,
      stageResults: result.stageResults,
      mode: result.mode,
      prompt
    });
    
    console.log('[Apps] App generated and saved with ID:', savedApp.appId);
    
    // Convert to frontend format
    const legacySpec = mode === 'staged' 
      ? fullAppSpecToLegacy(result.spec)
      : result.spec;
    
    res.json({
      appId: savedApp.appId,
      spec: legacySpec,
      fullSpec: result.spec,
      stageResults: result.stageResults,
      mode: result.mode
    });
    
  } catch (error) {
    console.error('[Apps] Generation error:', error.message);
    console.error('[Apps] Stack trace:', error.stack);
    
    // Handle specific errors
    if (error.message.includes('429')) {
      return res.status(429).json({
        error: 'AI_RATE_LIMITED',
        message: 'OpenAI API rate limit exceeded. Please try again later.',
        retryAfterSeconds: 60
      });
    }
    
    if (error.message.includes('quota')) {
      return res.status(402).json({
        error: 'AI_QUOTA_EXCEEDED',
        message: 'OpenAI API quota exceeded. Please check your billing.'
      });
    }
    
    res.status(500).json({
      error: 'GENERATION_FAILED',
      message: error.message
    });
  }
};

/**
 * POST /api/apps/:appId/refine
 * Refine existing app with instructions
 */
export const refineExistingApp = async (req, res, next) => {
  try {
    const { appId } = req.params;
    const { instructions } = req.body;
    
    console.log('[Apps] Refine request for app:', appId);
    
    if (!instructions || typeof instructions !== 'string') {
      return res.status(400).json({
        error: 'INVALID_REQUEST',
        message: 'instructions is required and must be a string'
      });
    }
    
    // Check demo mode
    if (process.env.DEMO_MODE === 'true') {
      return res.status(400).json({
        error: 'DEMO_MODE_ACTIVE',
        message: 'Refine requires real AI. Set DEMO_MODE=false'
      });
    }
    
    // Load existing app
    const app = await getApp(appId);
    console.log('[Apps] Loaded app for refinement');
    
    // Use Gemini or default refine service based on UI_PROVIDER
    const uiProvider = process.env.UI_PROVIDER || 'openai';
    let refineResult;
    
    if (uiProvider === 'gemini') {
      console.log('[Apps] Using Gemini for refinement...');
      const refinedSpec = await refineAppSpecWithGemini(app.spec, instructions);
      refineResult = {
        spec: refinedSpec,
        patch: { operation: 'gemini-refine', changes: [] },
        summary: 'Refined with Gemini'
      };
    } else {
      // Generate and apply patch
      refineResult = await refineApp(app.spec, instructions);
    }
    
    console.log('[Apps] Refine complete:', refineResult.summary);
    
    // Save updated app
    const updatedApp = await updateAppSpec(appId, refineResult.spec, refineResult.patch);
    
    // Convert to frontend format
    const legacySpec = fullAppSpecToLegacy(refineResult.spec);
    
    res.json({
      appId: updatedApp.appId,
      spec: legacySpec,
      fullSpec: refineResult.spec,
      patch: refineResult.patch,
      summary: refineResult.summary,
      mode: 'refined'
    });
    
  } catch (error) {
    console.error('[Apps] Refine error:', error.message);
    
    if (error.message.includes('not found')) {
      return res.status(404).json({
        error: 'APP_NOT_FOUND',
        message: `App ${req.params.appId} not found`
      });
    }
    
    res.status(500).json({
      error: 'REFINE_FAILED',
      message: error.message
    });
  }
};

/**
 * GET /api/apps/:appId
 * Get app by ID
 */
export const getAppById = async (req, res, next) => {
  try {
    const { appId } = req.params;
    const app = await getApp(appId);
    
    // Convert to frontend format
    const legacySpec = fullAppSpecToLegacy(app.spec);
    
    res.json({
      appId: app.appId,
      spec: legacySpec,
      fullSpec: app.spec,
      stageResults: app.stageResults,
      mode: app.mode,
      createdAt: app.createdAt,
      updatedAt: app.updatedAt
    });
    
  } catch (error) {
    if (error.message.includes('not found')) {
      return res.status(404).json({
        error: 'APP_NOT_FOUND',
        message: `App ${req.params.appId} not found`
      });
    }
    
    res.status(500).json({
      error: 'FETCH_FAILED',
      message: error.message
    });
  }
};

/**
 * GET /api/apps
 * List all apps
 */
export const listAllApps = async (req, res, next) => {
  try {
    const apps = await listApps();
    
    res.json({
      apps: apps.map(app => ({
        appId: app.appId,
        name: app.spec?.metadata?.name || 'Unnamed App',
        domain: app.spec?.metadata?.domain || 'generic',
        mode: app.mode,
        createdAt: app.createdAt,
        updatedAt: app.updatedAt
      }))
    });
    
  } catch (error) {
    res.status(500).json({
      error: 'LIST_FAILED',
      message: error.message
    });
  }
};
