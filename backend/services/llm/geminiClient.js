/**
 * Gemini Client for UI Generation
 * Generates strict AppSpec JSON for NewGen Studio frontend
 */

import { GoogleGenerativeAI } from '@google/generative-ai';

if (!process.env.GEMINI_API_KEY) {
  console.warn('[Gemini] GEMINI_API_KEY not configured');
}

const genAI = process.env.GEMINI_API_KEY 
  ? new GoogleGenerativeAI(process.env.GEMINI_API_KEY)
  : null;

const APPSPEC_REPAIR_INSTRUCTION = `You are a JSON repair agent for NewGen Studio AppSpec.

Goal: Fix the provided invalid AppSpec so it passes schema validation and viability checks.

Rules:
- Output ONLY valid JSON (no prose, markdown, or code fences).
- Preserve existing IDs when possible; do not drop user-specified names.
- Every page must have a children array with at least one interactive component (table, form, button, input, chart, list).
- Do not emit empty children arrays anywhere.
- Keep top-level shape: version, mode, metadata, layout.nodes (or children) populated with pages.
- If something is missing, add sensible defaults instead of leaving arrays empty.
- Return the complete repaired AppSpec.

Input fields:
- prompt: user prompt string
- invalidAppSpec: previous AppSpec JSON
- problems: array of validation issues to fix
`;

/**
 * System instruction for strict AppSpec generation
 */
const APPSPEC_SYSTEM_INSTRUCTION = `You are a UI specification generator for NewGen Studio.

OUTPUT RULES (STRICT):
1) Return ONLY valid JSON (no prose, no markdown, no code fences).
2) Use the EXACT AppSpec root shape: { "status", "version", "mode", "metadata", "layout":{...}, "agents":[], "workflows":[], "schema":{...}, "files":{} }.
3) Use layout.nodes ONLY. NEVER emit top-level "nodes". The root must have layout.nodes with at least one page.
4) Every page must contain a section with at least one interactive child (table | form | button | input | chart | list). No empty children arrays anywhere.
5) Provide descriptive titles/labels (e.g., "Sample Table", "Create Sample").
6) Keep agents/workflows/states exactly as provided in the prompt when present.

MINIMAL VALID EXAMPLE (imitate structure):
{
  "status": "ok",
  "version": "2.0",
  "mode": "generated",
  "metadata": {
    "name": "App Name",
    "description": "Brief description",
    "domain": "biologics|pharma|clinical|generic",
    "intentSummary": "What this app does"
  },
  "layout": {
    "id": "layout-1",
    "name": "App Name",
    "domain": "generic",
    "nodes": [
      {
        "id": "page-1",
        "type": "page",
        "props": { "title": "Dashboard" },
        "children": [
          {
            "id": "section-1",
            "type": "section",
            "props": { "title": "Overview" },
            "children": [
              { "id": "table-1", "type": "table", "props": { "title": "Records", "columns": ["ID", "Name", "Status"] }, "children": [] },
              { "id": "button-1", "type": "button", "props": { "label": "Add Record", "variant": "primary", "action": "create" }, "children": [] }
            ]
          }
        ]
      }
    ]
  },
  "agents": [
    { "name": "AgentName", "displayName": "Agent Name", "responsibilities": ["task-a","task-b"], "permissions": { "canLock": false, "canRelease": false } }
  ],
  "workflows": [
    {
      "name": "WorkflowName",
      "trigger": "event_or_state_change",
      "states": [{"name":"Start"},{"name":"Complete"}],
      "transitions": [{"from":"Start","to":"Complete","action":"submit"}],
      "modal": {
        "title": "Workflow Modal",
        "questions": [{"id":"q1","type":"text","text":"Describe","required":true}],
        "capturePhoto": false,
        "buttons": [{"label":"Submit","action":"submit","variant":"primary"}]
      }
    }
  ],
  "schema": {
    "entities": [
      {
        "name": "EntityName",
        "states": { "RECEIVED": {}, "IN_LAB": {}, "OOS_LOCK": {}, "RELEASED": {} },
        "agents": ["AgentName"]
      }
    ]
  },
  "files": {}
}

SAMPLE MANAGEMENT REQUIREMENTS (when prompt mentions samples):
- Entity "Sample" with fields: sampleId (string, required), batchLotId (string), sampleType (enum: ["Blood","Tissue","Serum","Plasma","Other"]), dateReceived (date, required), quantity (number), unit (enum: ["mL","mg","units"]), storageTemp (enum: ["-80C","-20C","4C","RT"]), storageLocation (string), status (enum: ["Received","In Storage","In Analysis","Consumed"]).
- Pages: Dashboard (table with all fields + Add Sample button), Create Sample form (all fields), Sample Detail (read-only card + status/actions).

AGENTS/WORKFLOWS/STATES (when present in prompt):
- agents[] must include the exact names and responsibilities; permissions must be booleans.
- workflows[] must include exact workflow/state names, transitions, and modal when requested; modal must include questions[] and buttons[].
- schema.entities[].states must include the state names from the prompt.

STRICTNESS:
- No top-level "nodes" key. Only layout.nodes.
- No empty children arrays. If unsure, add a section with a table and a primary button.
- Must include at least one interactive component per page.

Return ONLY the JSON described.`;

/**
 * Generate AppSpec using Gemini
 */
export async function generateAppSpecWithGemini(prompt) {
  if (!genAI) {
    throw new Error('Gemini not configured. Set GEMINI_API_KEY in .env');
  }

  try {
    console.log('[Gemini] Generating AppSpec for prompt:', prompt.substring(0, 100));

    const model = genAI.getGenerativeModel({
      model: 'gemini-2.0-flash-exp',
      generationConfig: {
        temperature: 0.3,
        maxOutputTokens: 8192,
        responseMimeType: 'application/json'
      },
      systemInstruction: APPSPEC_SYSTEM_INSTRUCTION
    });

    // Note: Controller-level timeout is enforced at callAIWithTimeout()
    // Do NOT enforce timeout here - let the controller manage it
    const generatePromise = model.generateContent(`Generate a complete AppSpec for: ${prompt}

  REQUIREMENTS:
  - Include top-level agents[] and workflows[] when the prompt mentions agents/workflows/states.
  - Ensure schema.entities[0] defines states with allowedActions and references involved agents.
  - Use the exact agent names, state names, and workflow names provided in the prompt.`);
    const result = await generatePromise;
    const response = result.response;
    const text = response.text();

    console.log('[Gemini] Raw response length:', text.length);

    // Parse and validate JSON
    let appSpec;
    try {
      appSpec = JSON.parse(text);
    } catch (parseError) {
      console.error('[Gemini] JSON parse error:', parseError.message);
      console.error('[Gemini] Raw text:', text.substring(0, 500));
      throw new Error('Gemini returned invalid JSON');
    }

    // Ensure required top-level fields
    if (!appSpec.metadata) {
      appSpec.metadata = {
        name: 'Generated App',
        description: 'Generated by Gemini',
        domain: 'generic'
      };
    }

    if (!appSpec.version) {
      appSpec.version = '2.0';
    }

    if (!appSpec.mode) {
      appSpec.mode = 'generated';
    }

    // Ensure arrays exist
    appSpec.entities = appSpec.entities || [];
    appSpec.pages = appSpec.pages || [];
    appSpec.components = appSpec.components || [];
    appSpec.actions = appSpec.actions || [];
    appSpec.dataSources = appSpec.dataSources || [];
    appSpec.workflows = appSpec.workflows || [];

    console.log('[Gemini] Generated AppSpec with:');
    console.log(`  - ${appSpec.entities.length} entities`);
    console.log(`  - ${appSpec.pages.length} pages`);
    console.log(`  - ${appSpec.components.length} components`);
    console.log(`  - ${appSpec.actions.length} actions`);

    // Transform Gemini format (entities/pages/components) to AppSpec format (layout.nodes)
    const transformedSpec = transformGeminiToAppSpec(appSpec);
    return transformedSpec;

  } catch (error) {
    console.error('[Gemini] Generation error:', error.message);
    throw new Error(`Gemini generation failed: ${error.message}`);
  }
}

/**
 * Repair an invalid AppSpec using Gemini
 * @param {object} repairInput { prompt, invalidAppSpec, problems }
 */
export async function repairAppSpecWithGemini(repairInput) {
  if (!genAI) {
    throw new Error('Gemini not configured. Set GEMINI_API_KEY in .env');
  }

  try {
    const model = genAI.getGenerativeModel({
      model: 'gemini-2.0-flash-exp',
      generationConfig: {
        temperature: 0.2,
        maxOutputTokens: 4096,
        responseMimeType: 'application/json'
      },
      systemInstruction: APPSPEC_REPAIR_INSTRUCTION
    });

    const payload = {
      prompt: repairInput.prompt,
      invalidAppSpec: repairInput.invalidAppSpec,
      problems: repairInput.problems
    };

    const repairPromise = model.generateContent({
      contents: [
        {
          role: 'user',
          parts: [{ text: JSON.stringify(payload) }]
        }
      ]
    });

    const result = await repairPromise;
    const response = result.response;
    const text = response.text();

    let repairedSpec;
    try {
      repairedSpec = JSON.parse(text);
    } catch (parseError) {
      console.error('[Gemini] Repair JSON parse error:', parseError.message);
      console.error('[Gemini] Raw repair text:', text.substring(0, 500));
      throw new Error('Gemini returned invalid JSON during repair');
    }

    if (!repairedSpec.version) repairedSpec.version = '2.0';
    if (!repairedSpec.mode) repairedSpec.mode = 'generated';

    return transformGeminiToAppSpec(repairedSpec);
  } catch (error) {
    console.error('[Gemini] Repair error:', error.message);
    throw new Error(`Gemini repair failed: ${error.message}`);
  }
}

/**
 * Refine existing AppSpec using Gemini
 */
export async function refineAppSpecWithGemini(currentSpec, instructions) {
  if (!genAI) {
    throw new Error('Gemini not configured. Set GEMINI_API_KEY in .env');
  }

  try {
    console.log('[Gemini] Refining AppSpec with instructions:', instructions.substring(0, 100));

    const model = genAI.getGenerativeModel({
      model: 'gemini-2.0-flash-exp',
      generationConfig: {
        temperature: 0.3,
        maxOutputTokens: 8192,
        responseMimeType: 'application/json'
      },
      systemInstruction: `You are refining an existing AppSpec. Apply the user's changes surgically.

Output ONLY the complete updated AppSpec JSON.
Preserve all existing IDs and structure unless explicitly changing them.
Only modify what the user requests.`
    });

    const prompt = `Current AppSpec:
${JSON.stringify(currentSpec, null, 2)}

User wants to: ${instructions}

Return the complete updated AppSpec JSON.`;

    // Note: Controller-level timeout is enforced at callAIWithTimeout()
    // Do NOT enforce timeout here - let the controller manage it
    const refinePromise = model.generateContent(prompt);
    const result = await refinePromise;
    const response = result.response;
    const text = response.text();

    const refinedSpec = JSON.parse(text);
    refinedSpec.mode = 'refined';

    console.log('[Gemini] Refinement complete');
    return refinedSpec;

  } catch (error) {
    console.error('[Gemini] Refinement error:', error.message);
    throw new Error(`Gemini refinement failed: ${error.message}`);
  }
}

/**
 * Transform Gemini's format (entities/pages/components) to AppSpec format (layout.nodes)
 */
function transformGeminiToAppSpec(geminiSpec) {
  const nodes = [];
  
  // Create a page node for each page, with its components as children
  if (geminiSpec.pages && geminiSpec.pages.length > 0) {
    geminiSpec.pages.forEach((page, pageIdx) => {
      const pageNode = {
        id: page.id || `page-${pageIdx}`,
        type: 'page',
        props: {
          title: page.title || 'Page'
        },
        children: []
      };
      
      // Map components to this page
      if (page.components && page.components.length > 0) {
        page.components.forEach((componentId) => {
          const component = geminiSpec.components?.find(c => c.id === componentId);
          if (component) {
            pageNode.children.push(componentToNode(component));
          }
        });
      }
      
      nodes.push(pageNode);
    });
  }
  
  // Fallback: if no pages, create nodes from components directly
  if (nodes.length === 0 && geminiSpec.components) {
    geminiSpec.components.forEach((component) => {
      nodes.push(componentToNode(component));
    });
  }
  
  // Ensure at least one page
  if (nodes.length === 0) {
    nodes.push({
      id: 'page-default',
      type: 'page',
      props: { title: geminiSpec.metadata?.name || 'App' },
      children: [
        {
          id: 'card-welcome',
          type: 'card',
          props: { title: 'Welcome' }
        }
      ]
    });
  }
  
  return {
    status: 'ok',
    version: '1.0',
    domain: geminiSpec.domain || geminiSpec.metadata?.domain || 'generic',
    layout: {
      id: `layout-${Date.now()}`,
      name: geminiSpec.metadata?.name || 'Generated App',
      domain: geminiSpec.metadata?.domain || 'generic',
      nodes: nodes
    },
    schema: {
      entities: geminiSpec.entities || [],
      pages: geminiSpec.pages || [],
      components: geminiSpec.components || [],
      actions: geminiSpec.actions || []
    },
    files: {},
    messages: []
  };
}

/**
 * Convert a Gemini component to an AppSpec UINode
 */
function componentToNode(component) {
  return {
    id: component.id || `comp-${Date.now()}`,
    type: component.type || 'card',
    props: {
      title: component.props?.title,
      label: component.props?.label,
      placeholder: component.props?.placeholder,
      variant: component.props?.variant,
      columns: component.props?.columns,
      fields: component.props?.fields,
      ...component.props
    },
    children: component.children?.map(child => 
      typeof child === 'string' ? { id: child, type: 'text', props: {} } : componentToNode(child)
    ) || []
  };
}
