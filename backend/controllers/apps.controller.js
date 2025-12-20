/**
 * Apps Controller - Handle staged generation, refine, and persistence
 */

import { generateStaged, generateSingleShot } from '../services/ai.service.staged.js';
import { generateAppSpecWithGemini, refineAppSpecWithGemini } from '../services/llm/geminiClient.js';
import { refineApp } from '../services/refine.service.js';
import { saveApp, getApp, listApps, updateAppSpec } from '../services/app.store.js';
import { validateFullAppSpec, fullAppSpecToLegacy } from '../schemas/appspec.full.schema.js';
import copilotOrchestrator from '../services/copilot-orchestrator.js';

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
    
    // 🤖 COPILOT ORCHESTRATION: Analyze and enhance request
    console.log('🤖 [Copilot] Orchestrating request...');
    const orchestration = await copilotOrchestrator.orchestrate(prompt, {
      userId: req.user?.id,
      sessionId: req.sessionId
    });
    
    console.log('🤖 [Copilot] Analysis complete:');
    console.log(`   Domain: ${orchestration.domain || 'general'}`);
    console.log(`   Intent: ${orchestration.intent.type}`);
    console.log(`   Components: ${orchestration.components.join(', ')}`);
    console.log(`   Complexity: ${orchestration.metadata.complexity}`);
    console.log(`   Provider: ${orchestration.routing.primary}`);
    
    // Check if in demo mode
    if (process.env.DEMO_MODE === 'true') {
      return res.status(400).json({
        error: 'DEMO_MODE_ACTIVE',
        message: 'Staged generation requires real AI. Set DEMO_MODE=false and configure OPENAI_API_KEY'
      });
    }
    
    let result;
    // Use orchestrator's recommended provider
    const uiProvider = orchestration.routing.primary;
    
    // DEMO MODE: Return proper layout.nodes structure
    console.log('[Apps] 🧪 DEMO MODE: Returning complete sample tracker with layout.nodes');
    const testSpec = {
      status: "ok",
      layout: {
        id: "sample-tracker-001",
        name: "cGMP Sample Tracker",
        domain: "biologics",
        nodes: [
          {
            id: "page-main",
            type: "page",
            props: { title: "Sample Management Dashboard" },
            children: [
              {
                id: "section-form",
                type: "section",
                props: { title: "Sample Registration" },
                children: [
                  { id: "input-id", type: "input", props: { label: "Sample ID", placeholder: "SMP-2512-XXX", value: "" } },
                  { id: "input-batch", type: "input", props: { label: "Batch Number", placeholder: "B-2025-001", value: "" } },
                  { id: "select-material", type: "select", props: { label: "Material Type", options: ["Raw Material", "In-Process", "Bulk Drug", "Finished Product"], value: "" } },
                  { id: "select-status", type: "select", props: { label: "Status", options: ["Pending", "Received", "Testing", "Released"], value: "Pending" } },
                  { id: "input-location", type: "input", props: { label: "Storage Location", placeholder: "e.g., Freezer-A", value: "" } },
                  { id: "input-operator", type: "input", props: { label: "Operator Name", placeholder: "Your name", value: "" } },
                  { id: "btn-submit", type: "button", props: { label: "Register Sample", variant: "primary" } }
                ]
              },
              {
                id: "section-table",
                type: "section",
                props: { title: "Sample List" },
                children: [
                  {
                    id: "table-samples",
                    type: "table",
                    props: {
                      columns: ["Sample ID", "Batch Number", "Material", "Status", "Location", "Created At"],
                      data: [
                        ["SMP-2512-001", "B-2025-001", "Raw Material", "Received", "Freezer-A", "2025-12-14"],
                        ["SMP-2512-002", "B-2025-002", "In-Process", "Testing", "Lab-B", "2025-12-14"],
                        ["SMP-2512-003", "B-2025-003", "Finished Product", "Released", "Storage-C", "2025-12-13"]
                      ]
                    }
                  }
                ]
              },
              {
                id: "section-actions",
                type: "section",
                props: { title: "Actions" },
                children: [
                  { id: "btn-export", type: "button", props: { label: "Export to Excel", variant: "ghost" } },
                  { id: "btn-audit", type: "button", props: { label: "View Audit Log", variant: "ghost" } }
                ]
              }
            ]
          }
        ]
      }
    };
    
    // Use enhanced prompt from orchestrator
    if (uiProvider === 'gemini') {
      console.log('[Apps] 🚀 Using Gemini with enhanced prompt...');
      let geminiSpec, validation;
      try {
        geminiSpec = await generateAppSpecWithGemini(orchestration.enhancedPrompt);
        // Validate output
        validation = await copilotOrchestrator.validateOutput(geminiSpec, orchestration);
        if (!validation.valid) {
          console.error('[Apps] ❌ Validation failed:', validation.errors);
        }
        if (validation.warnings.length > 0) {
          console.warn('[Apps] ⚠️ Warnings:', validation.warnings);
        }
        result = {
          spec: geminiSpec,
          stageResults: [{ 
            stage: 'copilot-gemini', 
            status: 'completed', 
            summary: `Generated ${orchestration.domain || 'general'} app with ${orchestration.components.length} components`,
            orchestration: {
              domain: orchestration.domain,
              intent: orchestration.intent.type,
              components: orchestration.components,
              complexity: orchestration.metadata.complexity
            },
            validation
          }],
          mode: 'generated'
        };
      } catch (geminiError) {
        // Log full Gemini error for debugging
        console.error('[Apps] Gemini error (full):', JSON.stringify(geminiError, Object.getOwnPropertyNames(geminiError)));
        // Fallback to OpenAI if Gemini quota/rate limit error (robust check)
        const isGeminiQuota = (
          (geminiError.response && geminiError.response.status === 429) ||
          (geminiError.code && geminiError.code.toString().includes('429')) ||
          (geminiError.message && (geminiError.message.includes('429') || geminiError.message.toLowerCase().includes('quota')))
        );
        if (isGeminiQuota) {
          console.warn('[Apps] Gemini quota/rate limit hit. Falling back to OpenAI...');
          // Use staged OpenAI pipeline
          result = await generateStaged(orchestration.enhancedPrompt);
          result.stageResults = result.stageResults || [];
          result.stageResults.unshift({
            stage: 'copilot-gemini',
            status: 'failed',
            summary: 'Gemini quota/rate limit hit. Fallback to OpenAI.',
            error: geminiError.message
          });
        } else {
          throw geminiError;
        }
      }
    } else if (mode === 'staged') {
      console.log('[Apps] 🚀 Running staged generation with enhanced prompt...');
      result = await generateStaged(orchestration.enhancedPrompt);
      
      // Add orchestration metadata
      result.orchestration = {
        domain: orchestration.domain,
        intent: orchestration.intent.type,
        components: orchestration.components,
        complexity: orchestration.metadata.complexity
      };
      
    } else {
      console.log('[Apps] 🚀 Running single-shot with enhanced prompt...');
      const singleShotResult = await generateSingleShot(orchestration.enhancedPrompt);
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
    
    // Explicit validation for required fields
    if (!savedApp.appId || !legacySpec || !result.spec || !Array.isArray(result.stageResults) || !result.mode) {
      return res.status(500).json({
        error: 'INVALID_RESPONSE',
        message: 'Backend failed to generate all required fields. Please check backend logs and data pipeline.',
        details: {
          appId: savedApp.appId,
          spec: legacySpec,
          fullSpec: result.spec,
          stageResults: result.stageResults,
          mode: result.mode
        }
      });
    }
    res.json({
      appId: savedApp.appId,
      spec: legacySpec,
      fullSpec: result.spec,
      stageResults: result.stageResults,
      mode: result.mode
    });
    
  } catch (error) {
    // Log full error object for better visibility in all environments
    try {
      console.error('[Apps] Generation error (full object):', JSON.stringify(error, Object.getOwnPropertyNames(error)));
    } catch (e) {
      console.error('[Apps] Generation error (raw):', error);
    }
    if (error.stack) {
      console.error('[Apps] Stack trace:', error.stack);
    }
    
    // Handle specific errors
    if (error.message.includes('429')) {
      return res.status(429).json({
        error: 'AI_RATE_LIMITED',
        message: 'Gemini API rate limit exceeded. You have sent too many requests or exceeded your quota. Please try again later or check your Google Cloud Console for quota details.',
        retryAfterSeconds: 60
      });
    }

    if (error.message.toLowerCase().includes('quota')) {
      return res.status(402).json({
        error: 'AI_QUOTA_EXCEEDED',
        message: 'Gemini API quota exceeded. Please check your Google Cloud Console billing and quota.'
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
