/**
 * Enhanced Generation Service
 * Detects templates from prompts and generates dynamic AppSpec with state management
 * Falls back to AI (Gemini/OpenAI) if no template match
 */

import { detectTemplate, getDynamicTemplate } from './templates.dynamic.js';
import { generateAppSpecWithGemini } from './llm/geminiClient.js';
import { generateStaged } from './ai.service.staged.js';
import { validateAppSpecWithState } from '../schemas/appspec.state.schema.js';

const USE_OPENAI = process.env.UI_PROVIDER === 'openai' && process.env.OPENAI_API_KEY;
const USE_GEMINI = process.env.GEMINI_API_KEY;
const DEMO_MODE = process.env.DEMO_MODE === 'true';

/**
 * Generate dynamic app from prompt with context
 * @param {string} prompt - User prompt
 * @param {object} context - Generation context (domain, fields, apiUrl, etc.)
 * @returns {Promise<object>} - AppSpec v2.0 with state management
 */
export async function generateDynamic(prompt, context = {}) {
  console.log('[Generation Enhanced] Generating dynamic app...');
  console.log('[Generation Enhanced] Prompt:', prompt);
  console.log('[Generation Enhanced] Context:', context);
  
  try {
    // Step 1: Detect template from prompt
    const templateName = detectTemplate(prompt);
    console.log('[Generation Enhanced] Detected template:', templateName);
    
    // Step 2: If template detected, use it
    if (templateName) {
      console.log(`[Generation Enhanced] Using template: ${templateName}`);
      const spec = getDynamicTemplate(templateName, {
        domain: context.domain || 'generic',
        ...context
      });
      
      // Validate the generated spec
      const validation = validateAppSpecWithState(spec);
      if (!validation.valid) {
        console.warn('[Generation Enhanced] Template validation failed:', validation.errors);
        spec.problems = validation.errors.map(err => ({
          severity: 'warning',
          message: err
        }));
      }
      
      console.log('[Generation Enhanced] Template generation complete');
      return spec;
    }
    
    // Step 3: No template match - fall back to AI
    console.log('[Generation Enhanced] No template match, using AI fallback');
    
    if (DEMO_MODE) {
      console.log('[Generation Enhanced] DEMO_MODE active, returning placeholder');
      return createPlaceholderSpec(prompt, context);
    }
    
    // Try OpenAI first if configured
    if (USE_OPENAI) {
      try {
        console.log('[Generation Enhanced] Calling OpenAI...');
        const result = await generateStaged(prompt);
        
        // Convert OpenAI result to v2.0 format if needed
        return ensureV2Format(result);
      } catch (err) {
        console.error('[Generation Enhanced] OpenAI failed:', err.message);
        // Fall through to Gemini
      }
    }
    
    // Try Gemini as fallback
    if (USE_GEMINI) {
      try {
        console.log('[Generation Enhanced] Calling Gemini...');
        const result = await generateAppSpecWithGemini(prompt, {
          currentApp: context.currentApp,
          enhancedPrompt: enrichPromptForState(prompt)
        });
        
        // Convert Gemini result to v2.0 format
        return ensureV2Format(result);
      } catch (err) {
        console.error('[Generation Enhanced] Gemini failed:', err.message);
        throw err;
      }
    }
    
    // No AI available
    throw new Error('No AI provider available and no template match');
    
  } catch (error) {
    console.error('[Generation Enhanced] Error:', error);
    throw error;
  }
}

/**
 * Enrich prompt to encourage state/action generation
 */
function enrichPromptForState(prompt) {
  return `${prompt}

Include:
- State management with global and page-level state
- Data sources for API integration
- Actions with effects (validate, api-call, update-state, notify)
- Interactive components with data bindings

Format as AppSpec v2.0 with state, dataSources, actions arrays.`;
}

/**
 * Ensure result is in AppSpec v2.0 format
 */
function ensureV2Format(result) {
  // If already v2.0, return as-is
  if (result.version === '2.0' && result.state && result.dataSources && result.actions) {
    return result;
  }
  
  // Convert v1.0 to v2.0
  const v2Spec = {
    status: result.status || 'ok',
    version: '2.0',
    layout: result.layout || {
      id: result.id || `layout-${Date.now()}`,
      name: result.name || 'Generated App',
      domain: result.domain || 'generic',
      nodes: result.children || result.layout?.nodes || []
    },
    state: result.state || {
      global: {}
    },
    dataSources: result.dataSources || [],
    actions: result.actions || [],
    workflows: result.workflows || [],
    files: result.files || {},
    messages: result.messages || []
  };
  
  return v2Spec;
}

/**
 * Create placeholder spec for demo mode
 */
function createPlaceholderSpec(prompt, context) {
  return {
    status: 'ok',
    version: '2.0',
    layout: {
      id: `demo-${Date.now()}`,
      name: 'Demo App',
      domain: context.domain || 'generic',
      nodes: [
        {
          id: 'page-demo',
          type: 'page',
          props: { title: 'Demo Page' },
          children: [
            {
              id: 'section-demo',
              type: 'section',
              props: { title: 'Demo Section' },
              children: [
                {
                  id: 'text-demo',
                  type: 'text',
                  props: {
                    content: `Demo mode active. Prompt: "${prompt}"`,
                    variant: 'body'
                  }
                }
              ]
            }
          ]
        }
      ]
    },
    state: {
      global: {
        demoMode: true
      }
    },
    dataSources: [],
    actions: [],
    workflows: [],
    files: {},
    messages: [
      {
        role: 'assistant',
        content: 'Demo mode - no AI generation performed'
      }
    ]
  };
}
