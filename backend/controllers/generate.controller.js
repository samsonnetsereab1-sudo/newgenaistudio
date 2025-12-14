// Switch to enhanced AI service with biologics support
// import { runAI } from '../services/ai.service.js';
import { runAI } from '../services/ai.service.enhanced.js';
import { validateAppSpec, normalizeToAppSpec, appSpecToFrontend } from '../schemas/appspec.schema.js';

export const generateApp = async (req, res, next) => {
  try {
    console.log('[Generate] Request received');
    const { prompt, currentApp } = req.body;
    console.log('[Generate] Prompt:', prompt?.substring(0, 100));
    console.log('[Generate] Has currentApp (refine mode):', !!currentApp);
    console.log('[Generate] DEMO_MODE:', process.env.DEMO_MODE);
    
    if (!prompt || typeof prompt !== 'string') {
      console.log('[Generate] Invalid prompt');
      return res.status(400).json({ 
        status: 'error', 
        message: 'prompt is required',
        mode: 'error'
      });
    }
    
    // If currentApp exists, this is a refinement request
    // REFINEMENT REQUIRES EXISTING SPEC - no silent fallback
    if (currentApp) {
      if (!currentApp.children || currentApp.children.length === 0) {
        console.warn('[Generate] Refinement requested but currentApp is empty');
        return res.status(400).json({
          status: 'error',
          message: 'Cannot refine: no existing app structure provided',
          mode: 'error'
        });
      }
      console.log('[Generate] Refinement mode: updating existing spec');
    }
    
    // Build context-aware prompt
    let contextPrompt = prompt;
    if (currentApp) {
      contextPrompt = `REFINEMENT REQUEST:\nCurrent app structure: ${JSON.stringify(currentApp.children || []).substring(0, 500)}...\n\nUser wants to: ${prompt}\n\nGenerate an updated version incorporating these changes.`;
    }
    
    console.log('[Generate] Calling AI service...');
    // NO SILENT FALLBACK - if runAI fails, we let it throw
    const rawResult = await runAI(contextPrompt);
    console.log('[Generate] AI service returned with mode:', rawResult.mode);
    
    // ENFORCE APPSPEC CONTRACT
    console.log('[Generate] Validating AppSpec...');
    const validation = validateAppSpec(rawResult);
    
    if (!validation.valid) {
      console.warn('[Generate] Invalid AppSpec, normalizing:', validation.errors);
      const normalized = normalizeToAppSpec(rawResult);
      normalized.mode = rawResult.mode || 'generated'; // Preserve mode
      console.log('[Generate] Normalized AppSpec');
      
      // Convert to frontend format with mode
      const frontendResult = appSpecToFrontend(normalized);
      frontendResult.mode = normalized.mode; // Add mode to response
      console.log('[Generate] Transformed result with', frontendResult.children.length, 'nodes');
      return res.json(frontendResult);
    }
    
    console.log('[Generate] AppSpec valid ✓');
    
    // Convert valid AppSpec to frontend format
    const frontendResult = appSpecToFrontend(rawResult);
    frontendResult.mode = rawResult.mode || (currentApp ? 'refined' : 'generated'); // Add mode indicator
    console.log('[Generate] Sending response with mode:', frontendResult.mode);
    res.json(frontendResult);
    console.log('[Generate] Response sent successfully');
  } catch (err) {
    console.error('[Generate] Error:', err.message, err.stack);
    next(err);
  }
};
