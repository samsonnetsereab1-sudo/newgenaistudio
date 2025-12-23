/**
 * Generate App Controller v2
 * With strict schema validation, retry-and-repair, and template fallback
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { generateAppSpecWithGemini, repairAppSpecWithGemini } from '../services/llm/geminiClient.js';
import { validateAndCheckViability, validateAppSpecStrict, formatProblems, isRepairableSpec } from '../validators/appspec.validator.js';
import { normalizeAndFixAppSpec } from '../services/appspec.normalizer.js';
import { pickTemplate, getTemplate } from '../services/templates.service.js';
import copilotOrchestrator from '../services/copilot-orchestrator.js';
import { appSpecToFrontend } from '../schemas/appspec.schema.js';
import { recordGeneration, getSummary } from '../services/metrics.service.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const INVALID_SPEC_DIR = path.join(__dirname, '..', 'invalid-specs');

const MAX_RETRIES = 1;  // 1 retry = 2 attempts total
const BACKEND_TIMEOUT_MS = 85000;  // 85s total backend timeout to stay under frontend 90s cap
const AI_TIMEOUT_MS = 75000;  // 75s max for AI call (allow full domain-rich generation)
const TEMPLATE_ONLY = process.env.TEMPLATE_ONLY === 'true';  // Skip AI entirely if true
const SOFT_VALIDATION = process.env.NODE_ENV !== 'production';  // Dev mode: soften validation errors

/**
 * Check if prompt should use OpenAI instead of Gemini
 * Domain-heavy prompts (agents, workflows, states) perform better with OpenAI
 */
function shouldUseOpenAI(prompt) {
  if (!process.env.OPENAI_API_KEY) return false;
  const lowerPrompt = prompt.toLowerCase();
  const domainKeywords = ['agents', 'workflows', 'states', 'modal'];
  return domainKeywords.some(kw => lowerPrompt.includes(kw));
}

/**
 * Main generation endpoint with deterministic fallback
 */
export const generateApp = async (req, res, next) => {
  const startTime = Date.now();
  
  try {
    console.log('\n========== NEW GENERATION REQUEST ==========');
    const { prompt, currentApp } = req.body;
    console.log(`[Gen] Prompt: "${prompt?.substring(0, 80)}..."`);
    const stageTimings = {};
    let stageStart = Date.now();
    
    if (!prompt || typeof prompt !== 'string') {
      console.error('[Gen] ❌ Invalid prompt');
      return sendErrorResponse(res, 'prompt is required', []);
    }

    // Step 1: ORCHESTRATE (determine domain/intent)
    console.log('[Gen] 🤖 Orchestrating...');
    let orchestration;
    /**
     * Minimal viability fix: ensure each page has at least one interactive child
     * Injects a small table and button into empty pages or when no interactive components exist.
     */
    function minimalViabilityFix(spec) {
      const clone = JSON.parse(JSON.stringify(spec || {}));
      // Ensure required top-level fields
      if (!clone.status) clone.status = 'ok';
      if (!clone.version) clone.version = '2.0';
      if (!clone.domain) clone.domain = (clone.layout && clone.layout.domain) || 'generic';
      // Normalize: some AI outputs use top-level `nodes`; convert to layout.nodes
      if (Array.isArray(clone?.nodes) && (!clone?.layout || !Array.isArray(clone.layout.nodes))) {
        clone.layout = clone.layout || { id: clone.id || `layout-${Math.random().toString(36).slice(2,8)}`, name: clone.name || 'Generated App', domain: clone.domain || 'generic' };
        clone.layout.nodes = clone.nodes;
      }
      const nodes = clone?.layout?.nodes || clone?.children;
      if (!Array.isArray(nodes) || nodes.length === 0) {
        // Create a minimal page with interactive children
        const pageId = `page-${Math.random().toString(36).slice(2,8)}`;
        const sectionId = `sec-${Math.random().toString(36).slice(2,8)}`;
        const tblId = `tbl-${Math.random().toString(36).slice(2,8)}`;
        const btnId = `btn-${Math.random().toString(36).slice(2,8)}`;
        const minimalPage = {
          id: pageId,
          type: 'page',
          props: { title: 'Dashboard' },
          children: [
            {
              id: sectionId,
              type: 'section',
              props: { title: 'Overview' },
              children: [
                { id: tblId, type: 'table', props: { title: 'Records', columns: ['ID', 'Name'] } },
                { id: btnId, type: 'button', props: { label: 'Add', variant: 'primary' } }
              ]
            }
          ]
        };
        if (clone.layout) {
          clone.layout.nodes = [minimalPage];
        } else {
          clone.layout = { id: clone.id || `layout-${Math.random().toString(36).slice(2,8)}`, name: clone.name || 'Generated App', domain: clone.domain || 'generic', nodes: [minimalPage] };
        }
        return clone;
      }

      const ensureInteractiveChildren = (list) => {
        if (!Array.isArray(list)) return;
        let hasInteractive = false;
        for (const n of list) {
          if (n && ['table', 'form', 'button', 'input', 'chart', 'list'].includes(n.type)) {
            hasInteractive = true;
            break;
          }
        }
        if (!hasInteractive) {
          // Inject a minimal table and a primary button
          list.push({ id: `tbl-${Math.random().toString(36).slice(2, 8)}`, type: 'table', props: { title: 'Records', columns: ['ID', 'Name'] } });
          list.push({ id: `btn-${Math.random().toString(36).slice(2, 8)}`, type: 'button', props: { label: 'Add', variant: 'primary' } });
        }
      };

      const walk = (list) => {
        if (!Array.isArray(list)) return;
        for (const node of list) {
          if (!node) continue;
          if (node.type === 'page') {
            if (!Array.isArray(node.children)) node.children = [];
            // If page has no children, insert a section wrapper first
            if (node.children.length === 0) {
              node.children.push({ id: `sec-${Math.random().toString(36).slice(2, 8)}`, type: 'section', props: { title: 'Overview' }, children: [] });
            }
            // Ensure interactive children exist under the first container
            const target = Array.isArray(node.children) && node.children[0]?.type !== 'section' ? node.children : node.children[0].children || (node.children[0].children = []);
            ensureInteractiveChildren(target);
          }
          if (Array.isArray(node.children) && node.children.length > 0) {
            walk(node.children);
          }
        }
      };

      walk(nodes);
      return clone;
    }
    try {
      orchestration = await copilotOrchestrator.orchestrate(prompt, {
        userId: req.user?.id,
        isRefinement: !!currentApp
      });
      console.log(`[Gen] Domain: ${orchestration.domain}, Intent: ${orchestration.intent.type}`);
    } catch (err) {
      console.warn('[Gen] Orchestration failed, falling back to basic routing:', err.message);
      orchestration = {
        enhancedPrompt: prompt,
        routing: { primary: process.env.UI_PROVIDER || 'gemini' },
        domain: 'generic',
        intent: { type: 'generate' }
      };
    }
    stageTimings.orchestrate = Date.now() - stageStart;
    console.log(`[Gen] ⏱️  Orchestration: ${stageTimings.orchestrate}ms`);

    // Determine planned provider for metrics
    const providerPlanned = TEMPLATE_ONLY
      ? 'template'
      : ((process.env.OPENAI_API_KEY && shouldUseOpenAI(prompt)) ? 'openai' : (process.env.UI_PROVIDER || 'gemini'));
    const providerUsed = providerPlanned === 'openai'
      ? (process.env.OPENAI_API_KEY ? 'openai' : 'none')
      : (providerPlanned === 'gemini' ? (process.env.GEMINI_API_KEY ? 'gemini' : 'none') : 'template');

    // Step 2: CALL AI WITH RETRY LOOP (skip if TEMPLATE_ONLY)
    stageStart = Date.now();
    let spec;  // Declare here before conditional
    if (TEMPLATE_ONLY) {
      console.log('[Gen] 📋 TEMPLATE_ONLY mode - skipping AI, using template immediately');
      spec = getTemplate(pickTemplate(prompt));
      spec.problems = [{
        severity: 'info',
        message: 'Template mode (development). AI generation skipped.'
      }];
      stageTimings.aiCall = Date.now() - stageStart;
    } else {
      console.log(`[Gen] 🚀 Calling ${orchestration.routing.primary} (retry=${MAX_RETRIES}, timeout=${AI_TIMEOUT_MS}ms)...`);
      try {
        spec = await callAIWithRetry(prompt, currentApp, orchestration, MAX_RETRIES);
        console.log('[Gen] AI call complete, validating...');
      } catch (err) {
        console.error('[Gen] AI call failed:', err.message);
        // Fall back to template immediately
        spec = getTemplate(pickTemplate(prompt));
        spec.problems = [{
          severity: 'error',
          message: `AI call failed: ${err.message}. Using template instead.`
        }];
      }
      stageTimings.aiCall = Date.now() - stageStart;
    }
    console.log(`[Gen] ⏱️  AI call: ${stageTimings.aiCall}ms`);

    // Step 3: NORMALIZE AI OUTPUT (before validation)
    stageStart = Date.now();
    try {
      console.log('[Gen] Normalizing AI output...');
      spec = normalizeAndFixAppSpec(spec);
      console.log('[Gen] ✓ Normalization complete');
    } catch (err) {
      console.error('[Gen] ❌ Normalization error:', err.message);
      // On normalization error, immediately use template
      spec = getTemplate(pickTemplate(prompt));
      spec.problems = [{ severity: 'error', message: 'Normalization failed. Using template.' }];
      stageTimings.normalize = Date.now() - stageStart;
      console.log(`[Gen] ⏱️  Normalization: ${stageTimings.normalize}ms (failed, using template)`);
      // Jump to response, skip validation
    }
    
    // Step 3.5: ENFORCE DOMAIN CONSTRUCTS (if missing or empty in AI response)
    if (spec) {
      try {
        const lower = prompt.toLowerCase();
        const wantsAgents = lower.includes('agents');
        const wantsWorkflows = lower.includes('workflow') || lower.includes('workflows');
        const hasAgents = Array.isArray(spec.agents) && spec.agents.length > 0;
        const hasWorkflows = Array.isArray(spec.workflows) && spec.workflows.length > 0;

        // Parse constructs once and use in checks
        const constructs = parseDomainConstructs(prompt);
        const wantsStates = Array.isArray(constructs.states) && constructs.states.length > 0;

        if (wantsAgents || wantsWorkflows || wantsStates) {
          let injected = false;

          if (wantsAgents && !hasAgents && constructs.agents && constructs.agents.length > 0) {
            spec.agents = constructs.agents;
            injected = true;
          }
          if (wantsWorkflows && !hasWorkflows && constructs.workflows && constructs.workflows.length > 0) {
            spec.workflows = constructs.workflows;
            injected = true;
          }
          // If workflows exist but no modal and prompt specifies modal, enrich the first workflow
          if (Array.isArray(spec.workflows) && spec.workflows.length > 0 && constructs.hasModal) {
            const wf0 = spec.workflows[0];
            if (!wf0.modal) {
              const count = constructs.modalQuestions || 1;
              wf0.modal = {
                title: wf0.name || 'Workflow',
                questions: Array.from({ length: count }, (_, i) => ({ id: `q${i+1}`, type: 'text', text: `Question ${i+1}`, required: true })),
                capturePhoto: true,
                buttons: [
                  { label: 'Submit', action: 'submit', variant: 'primary' },
                  { label: 'Cancel', action: 'cancel', variant: 'secondary' }
                ]
              };
              injected = true;
            }
          }

          // Inject states into schema entities when present in prompt
          if (Array.isArray(constructs.states) && constructs.states.length > 0) {
            if (!spec.schema) spec.schema = {};
            if (!Array.isArray(spec.schema.entities)) spec.schema.entities = [];

            // find an entity that likely represents samples or use the first, else create one
            let target = spec.schema.entities.find(e => typeof e?.name === 'string' && /sample/i.test(e.name));
            if (!target && spec.schema.entities.length > 0) target = spec.schema.entities[0];
            if (!target) {
              target = { name: 'Sample', states: {} };
              spec.schema.entities.push(target);
            }

            // Ensure states object exists and merge in parsed states
            if (Array.isArray(target.states)) {
              // convert array to object if any old format
              const obj = {};
              for (const s of target.states) {
                if (typeof s === 'string') obj[s] = {};
                else if (s && typeof s.name === 'string') obj[s.name] = {};
              }
              target.states = obj;
            }
            if (!target.states || typeof target.states !== 'object') target.states = {};
            for (const s of constructs.states) {
              if (s && !target.states[s]) target.states[s] = {};
            }
            injected = true;
          }

          if (injected) {
            const agentCount = Array.isArray(spec.agents) ? spec.agents.length : 0;
            const wfCount = Array.isArray(spec.workflows) ? spec.workflows.length : 0;
            const entityCount = Array.isArray(spec.schema?.entities) ? spec.schema.entities.length : 0;
            console.log(`[Gen] 🔧 Enforced domain constructs: agents=${agentCount}, workflows=${wfCount}, entities=${entityCount}`);
          }
        }
      } catch (e) {
        console.warn('[Gen] Domain enforcement skipped due to error:', e.message);
      }
    }
    
    // Only validate if we haven't already decided to use template
    let viabilityReason = null;
    if (!spec.problems || spec.problems.length === 0) {
      stageTimings.normalize = Date.now() - stageStart;
      console.log(`[Gen] ⏱️  Normalization: ${stageTimings.normalize}ms`);

      // Step 4: VALIDATE + VIABILITY (normalized first)
      stageStart = Date.now();
      console.log('[Gen] Validating spec + checking viability...');
      let check = validateAndCheckViability(spec);
      stageTimings.validation = Date.now() - stageStart;
      stageTimings.viability = 0; // included in combined check
      console.log(`[Gen] ⏱️  Validation+Viability: ${stageTimings.validation}ms (problems=${check.validation.problems.length}, viable=${check.viability.viable})`);

      spec = check.spec;
      let validationProblemsCount = check.validation.problems.length;
      viabilityReason = check.viability.viable ? null : check.viability.reason;

      if (!check.validation.valid) {
        console.warn(`[Gen] ⚠️  Validation failed: ${check.validation.problems.length} errors`);
        if (process.env.NODE_ENV !== 'production') {
          try {
            const clipped = JSON.stringify(spec, null, 2);
            console.error('[Gen] Invalid AppSpec payload (dev-only log):');
            console.error(clipped.length > 4000 ? `${clipped.substring(0, 4000)}... [truncated]` : clipped);
            console.error('[Gen] Validation problems:', check.validation.problems);
          } catch (logErr) {
            console.warn('[Gen] Unable to log invalid spec:', logErr.message);
          }
        }
        persistInvalidSpec({ spec, problems: check.validation.problems, prompt, stage: 'validation', orchestration });

        const repairOutcome = await attemptRepair({
          prompt,
          spec,
          problems: check.validation.problems,
          stage: 'validation',
          orchestration
        });

        if (repairOutcome.success) {
          spec = repairOutcome.spec;
          validationProblemsCount = repairOutcome.validation?.problems?.length || 0;
          viabilityReason = repairOutcome.viability?.viable ? null : repairOutcome.viability?.reason || null;
        } else if (SOFT_VALIDATION) {
          console.warn('[Gen] 🔧 SOFT_VALIDATION enabled - passing AI spec despite errors');
          // In dev mode, pass it through anyway so we can debug
        } else {
          console.warn('[Gen] Falling back to template...');
          spec = getTemplate(pickTemplate(prompt));
          spec.problems = [{
            severity: 'info',
            message: 'AI generation failed validation. Using pre-built template instead.'
          }];
        }
      }

      // If validation passed but viability failed, try repair/minimal fix
      if (check.validation.valid && !check.viability.viable && (!spec.problems || spec.problems.length === 0)) {
        console.warn(`[Gen] ⚠️  Not viable: ${check.viability.reason}`);
        viabilityReason = check.viability.reason;
        persistInvalidSpec({
          spec,
          problems: [{ severity: 'error', message: check.viability.reason }],
          prompt,
          stage: 'viability',
          orchestration
        });

        const repairOutcome = await attemptRepair({
          prompt,
          spec,
          problems: [{ severity: 'error', message: check.viability.reason }],
          stage: 'viability',
          orchestration
        });

        if (repairOutcome.success) {
          spec = repairOutcome.spec;
          viabilityReason = null;
          console.log('[Gen] ✅ Repair produced viable spec');
        } else {
          // Last-chance minimal viability fix: if pages exist but lack interactive children, inject a minimal table/button
          try {
            const fixed = minimalViabilityFix(spec);
            const postCheck = validateAndCheckViability(fixed);
            if (postCheck.validation.valid && postCheck.viability.viable) {
              console.log('[Gen] 🔧 Applied minimal viability fix');
              spec = postCheck.spec;
              viabilityReason = null;
              spec.mode = 'ai_repaired_min';
              spec.problems = [];
            } else {
              spec = getTemplate(pickTemplate(prompt));
              spec.problems = [
                {
                  severity: 'warning',
                  message: `AI generated spec that was not viable (${check.viability.reason}). Using template instead.`
                }
              ];
            }
          } catch (fixErr) {
            console.warn('[Gen] Minimal viability fix failed:', fixErr.message);
            spec = getTemplate(pickTemplate(prompt));
            spec.problems = [
              {
                severity: 'warning',
                message: `AI generated spec that was not viable (${check.viability.reason}). Using template instead.`
              }
            ];
          }
        }
      }

      // Persist validation count for metrics even if later overwritten
      spec._validationProblemsCount = spec._validationProblemsCount ?? validationProblemsCount;
    }

    // Step 5: CONVERT TO FRONTEND FORMAT
    stageStart = Date.now();
    console.log('[Gen] Converting to frontend format...');
    const frontendResp = appSpecToFrontend(spec);
    stageTimings.conversion = Date.now() - stageStart;
    console.log(`[Gen] ⏱️  Conversion: ${stageTimings.conversion}ms`);
    
    frontendResp.problems = spec.problems || [];
    frontendResp.mode = spec.mode || 'generated';
    frontendResp.elapsed = Date.now() - startTime;

    console.log(`[Gen] 📊 Stage breakdown: Orchestrate=${stageTimings.orchestrate}ms, AI=${stageTimings.aiCall}ms, Validate=${stageTimings.validation}ms, Viability=${stageTimings.viability}ms, Convert=${stageTimings.conversion}ms`);


    // Record metrics
    try {
      recordGeneration({
        mode: frontendResp.mode,
        provider: providerUsed,
        stageTimings,
        validationProblems: spec._validationProblemsCount || 0,
        viabilityReason,
        elapsed: frontendResp.elapsed,
        problems: frontendResp.problems
      });
      // Expose summary in dev for quick inspection (optional, non-breaking)
      if (process.env.NODE_ENV !== 'production') {
        frontendResp.meta.metrics = getSummary();
      }
    } catch (mErr) {
      console.warn('[Gen] Metrics recording failed:', mErr.message);
    }

    console.log(`[Gen] ✅ Success (${frontendResp.elapsed}ms, mode=${frontendResp.mode})`);
    res.json(frontendResp);


  } catch (err) {
    console.error('[Gen] 💥 Unhandled error:', err.message);
    const problems = [{
      severity: 'error',
      message: `Generation failed: ${err.message}`
    }];
    sendErrorResponse(res, err.message, problems);
  }
};

/**
 * Call AI with automatic retry on validation failure
 * @param {string} prompt - User prompt
 * @param {object} currentApp - Current app for refinement
 * @param {object} orchestration - Orchestration result
 * @param {number} retriesLeft - Retries remaining
 * @returns {Promise<object>} AppSpec
 */
async function callAIWithRetry(prompt, currentApp, orchestration, retriesLeft) {
  let lastError = null;

  for (let attempt = 1; attempt <= retriesLeft + 1; attempt++) {
    try {
      console.log(`[Gen] Attempt ${attempt}/${retriesLeft + 1}...`);

      // Build context prompt
      let contextPrompt = orchestration.enhancedPrompt || prompt;
      if (currentApp) {
        contextPrompt = `REFINEMENT: User wants to: ${prompt}\n\nCurrent app: ${JSON.stringify(currentApp).substring(0, 300)}...\n\n${contextPrompt}`;
      }

      // Call AI with timeout
      const spec = await callAIWithTimeout(contextPrompt, attempt, retriesLeft);

      // Validate
      const validation = validateAppSpecStrict(spec);
      if (validation.valid) {
        console.log(`[Gen] ✅ Attempt ${attempt} is valid!`);
        return spec;
      }

      // If not valid but repairable, retry with feedback
      if (attempt < retriesLeft + 1 && isRepairableSpec(spec)) {
        console.warn(`[Gen] ⚠️  Attempt ${attempt} invalid, retrying with feedback...`);
        lastError = {
          spec,
          problems: validation.problems,
          attempt
        };
        
        // Ask AI to repair: send it the invalid JSON and errors
        const repairPrompt = buildRepairPrompt(spec, validation.problems);
        const repairedSpec = await callAIWithTimeout(repairPrompt, attempt, retriesLeft);
        const repairValidation = validateAppSpecStrict(repairedSpec);
        
        if (repairValidation.valid) {
          console.log(`[Gen] ✅ Repair on attempt ${attempt} succeeded!`);
          return repairedSpec;
        }
        console.warn(`[Gen] Repair on attempt ${attempt} failed`);
      } else {
        console.warn(`[Gen] ⚠️  Attempt ${attempt} not repairable or last attempt`);
        return spec;
      }

    } catch (err) {
      console.error(`[Gen] ❌ Attempt ${attempt} error:`, err.message);
      lastError = err;
      
      // On timeout, skip retries and go straight to fallback
      if (err.message.includes('timeout')) {
        console.warn(`[Gen] Timeout on attempt ${attempt} — skipping retries, using fallback`);
        const fallback = getTemplate(pickTemplate(prompt));
        fallback.problems = [
          {
            severity: 'warning',
            message: `Generation timed out after ${attempt} attempt(s). Using fallback template. The AI service may be slow or unavailable.`
          }
        ];
        return fallback;
      }
      
      if (attempt < retriesLeft + 1) {
        console.log(`[Gen] Retrying (${retriesLeft + 1 - attempt} retries left)...`);
      }
    }
  }

  // All retries failed; return fallback template
  console.error('[Gen] All retries exhausted');
  const fallback = getTemplate(pickTemplate(prompt));
  fallback.problems = [
    {
      severity: 'error',
      message: `Generation failed after ${retriesLeft + 1} attempts. Using template. Last error: ${lastError?.message || 'Unknown'}`
    }
  ];
  return fallback;
}

/**
 * Call Gemini/OpenAI with strict timeout
 * @param {string} prompt - Prompt to send
 * @param {number} attempt - Current attempt number
 * @param {number} maxRetries - Max retries (for user info)
 * @returns {Promise<object>} AppSpec
 */
async function callAIWithTimeout(prompt, attempt, maxRetries) {
  // Check if this prompt should use OpenAI (domain-heavy prompts)
  const useOpenAI = shouldUseOpenAI(prompt);
  const provider = useOpenAI ? 'openai' : (process.env.UI_PROVIDER || 'gemini');
  
  if (useOpenAI) {
    console.log(`[Gen] 🧠 Domain prompt detected - routing to OpenAI`);
  }

  try {
    if (provider === 'openai' && process.env.OPENAI_API_KEY) {
      // Use OpenAI for domain-heavy prompts
      const { generateWithOpenAI } = await import('../services/ai.service.enhanced.js');
      const timeout = new Promise((_, reject) =>
        setTimeout(() => reject(new Error(`OpenAI timeout (${AI_TIMEOUT_MS}ms)`)), AI_TIMEOUT_MS)
      );
      const call = generateWithOpenAI(prompt);
      const result = await Promise.race([call, timeout]);
      
      if (!result || typeof result !== 'object') {
        throw new Error(`OpenAI returned invalid response type: ${typeof result}`);
      }
      
      return result;
    } else if (provider === 'gemini' && process.env.GEMINI_API_KEY) {
      // Use Gemini for normal UI prompts
      const timeout = new Promise((_, reject) =>
        setTimeout(() => reject(new Error(`Gemini timeout (${AI_TIMEOUT_MS}ms)`)), AI_TIMEOUT_MS)
      );
      const call = generateAppSpecWithGemini(prompt);
      const result = await Promise.race([call, timeout]);
      
      // Validate result is an object
      if (!result || typeof result !== 'object') {
        throw new Error(`Gemini returned invalid response type: ${typeof result}`);
      }
      
      return result;
    } else {
      // Fallback to template immediately if no API key
      console.warn('[Gen] No API key available - using template');
      return getTemplate(pickTemplate(prompt));
    }
  } catch (err) {
    console.error(`[Gen] ❌ ${provider.toUpperCase()} call failed (attempt ${attempt}/${maxRetries + 1}):`, err.message);
    throw err; // Re-throw to let retry logic handle it
  }
}

/**
 * Build a repair prompt instructing the AI to fix invalid JSON
 * @param {object} spec - Invalid spec
 * @param {array} problems - Validation problems
 * @returns {string} Repair prompt
 */
function buildRepairPrompt(spec, problems) {
  const errorSummary = problems
    .map(p => `  - ${p.message}`)
    .join('\n');

  return `Your previous AppSpec JSON had validation errors:

${errorSummary}

Your invalid JSON was:
\`\`\`json
${JSON.stringify(spec, null, 2).substring(0, 1000)}
\`\`\`

Please fix these errors and return a corrected AppSpec JSON that is valid.
Ensure:
- status: "ok"
- version: "2.0"
- layout.nodes is an array with at least 1 node
- every page node has a non-empty children array with at least one interactive child (table | form | button | input | chart | list)
- Each node has id, type, props, and optional children
- No extra fields outside the schema`;
}

async function attemptRepair({ prompt, spec, problems, stage, orchestration }) {
  if (!process.env.GEMINI_API_KEY) {
    console.warn('[Gen] Repair skipped: GEMINI_API_KEY not configured');
    return { success: false, reason: 'repair-unavailable' };
  }

  try {
    console.log(`[Gen] 🛠️  Repairing spec after ${stage || 'unknown'} failure...`);
    const timeout = new Promise((_, reject) =>
      setTimeout(() => reject(new Error(`Repair timeout (${AI_TIMEOUT_MS}ms)`)), AI_TIMEOUT_MS)
    );

    const call = repairAppSpecWithGemini({ prompt, invalidAppSpec: spec, problems });
    const repaired = await Promise.race([call, timeout]);

    let normalized = repaired;
    try {
      normalized = normalizeAndFixAppSpec(repaired);
    } catch (normErr) {
      console.warn('[Gen] Repair normalization failed:', normErr.message);
    }

    const check = validateAndCheckViability(normalized);
    const { validation, viability } = check;
    normalized = check.spec;

    if (validation.valid && viability.viable) {
      console.log('[Gen] ✅ Repair succeeded');
      normalized.mode = 'ai_repaired';
      normalized.problems = [];
      return { success: true, spec: normalized, validation, viability };
    }

    console.warn('[Gen] Repair returned invalid/ non-viable spec');
    persistInvalidSpec({
      spec: normalized,
      problems: validation.valid ? [{ severity: 'error', message: viability.reason }] : validation.problems,
      prompt,
      stage: `repair-${stage || 'unknown'}`,
      orchestration
    });
    return { success: false, validation, viability };
  } catch (err) {
    console.warn('[Gen] Repair attempt failed:', err.message);
    persistInvalidSpec({ spec, problems, prompt, stage: `repair-${stage || 'unknown'}`, orchestration });
    return { success: false, reason: err.message };
  }
}

/**
 * Persist invalid specs to disk for later analysis (dev-only)
 */
function persistInvalidSpec({ spec, problems, prompt, stage, orchestration }) {
  if (process.env.NODE_ENV === 'production') return;
  try {
    fs.mkdirSync(INVALID_SPEC_DIR, { recursive: true });
    const fileName = `invalid-${stage || 'unknown'}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}.json`;
    const filePath = path.join(INVALID_SPEC_DIR, fileName);
    const payload = {
      stage,
      prompt: prompt?.substring(0, 400),
      domain: orchestration?.domain,
      intent: orchestration?.intent?.type,
      problems,
      spec
    };
    fs.writeFileSync(filePath, JSON.stringify(payload, null, 2), 'utf-8');
    console.warn(`[Gen] 💾 Saved invalid spec (${stage}) to ${filePath}`);
  } catch (err) {
    console.warn('[Gen] Failed to persist invalid spec:', err.message);
  }
}

/**
 * Send error response to frontend
 * @param {object} res - Express response
 * @param {string} message - Error message
 * @param {array} problems - Detailed problems
 */
function sendErrorResponse(res, message, problems) {
  return res.json({
    status: 'error',
    mode: 'error',
    children: [],
    meta: {
      version: '1.0',
      domain: 'generic',
      files: {},
      messages: [message],
      schema: null
    },
    problems: problems || [{
      severity: 'error',
      message
    }]
  });
}

/**
 * Parse domain constructs from prompt
 * Extracts agents, workflows, states, and modal descriptions
 */
function parseDomainConstructs(prompt) {
  console.log('[Parse] Starting domain construct parsing...');
  console.log(`[Parse] Prompt length: ${prompt.length} chars`);
  console.log(`[Parse] Prompt preview: ${prompt.substring(0, 200)}...`);
  
  const constructs = {
    agents: [],
    workflows: [],
    states: [],
    hasModal: false,
    modalQuestions: 0
  };

  // Extract agent names (e.g., "agents (CustodyBot, QualityBot)")
  const agentMatch = prompt.match(/agents?\s*\(([^)]+)\)/i);
  console.log(`[Parse] Agent regex match:`, agentMatch);
  if (agentMatch) {
    const agentNames = agentMatch[1].split(',').map(n => n.trim());
    console.log(`[Parse] Found agent names:`, agentNames);
    constructs.agents = agentNames.map(name => ({
      name: name.replace(/\s+/g, ''),
      displayName: name,
      responsibilities: ['domain-task'],
      permissions: { canLock: false, canRelease: false }
    }));
  }

  // Extract state names (e.g., "states (RECEIVED, IN_LAB, OOS_LOCK)")
  const stateMatch = prompt.match(/states?\s*\(([^)]+)\)/i);
  console.log(`[Parse] State regex match:`, stateMatch);
  if (stateMatch) {
    constructs.states = stateMatch[1].split(',').map(s => s.trim());
    console.log(`[Parse] Found states:`, constructs.states);
  }

  // Extract workflow name and modal info
  const workflowMatch = prompt.match(/(\w+\s+\w+)\s+workflow/i);
  const modalMatch = prompt.match(/modal\s+with\s+(\d+)\s+questions?/i);
  const photoMatch = prompt.match(/photo\s+capture/i);
  console.log(`[Parse] Workflow match:`, workflowMatch);
  console.log(`[Parse] Modal match:`, modalMatch);
  console.log(`[Parse] Photo match:`, photoMatch);

  if (workflowMatch) {
    constructs.workflows.push({
      name: workflowMatch[1],
      trigger: constructs.states.length > 0 ? `state_change:${constructs.states[constructs.states.length - 1]}` : 'manual',
      states: [{ name: 'Start' }, { name: 'Complete' }],
      transitions: [{ from: 'Start', to: 'Complete', action: 'submit' }],
      modal: modalMatch ? {
        title: workflowMatch[1],
        questions: Array.from({ length: parseInt(modalMatch[1]) }, (_, i) => ({
          id: `q${i + 1}`,
          type: 'text',
          text: `Question ${i + 1}`,
          required: true
        })),
        capturePhoto: !!photoMatch,
        buttons: [
          { label: 'Submit', action: 'submit', variant: 'primary' },
          { label: 'Cancel', action: 'cancel', variant: 'secondary' }
        ]
      } : null
    });

    if (modalMatch) {
      constructs.hasModal = true;
      constructs.modalQuestions = parseInt(modalMatch[1]);
    }
  }

  console.log(`[Parse] ✓ Parsing complete: agents=${constructs.agents.length}, workflows=${constructs.workflows.length}, states=${constructs.states.length}`);
  return constructs;
}

export { parseDomainConstructs };
export default { generateApp };
