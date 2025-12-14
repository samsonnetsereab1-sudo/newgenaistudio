/**
 * Staged App Generation Service
 * Generates apps in discrete stages: Intent → Model → Workflow → Screens → Wiring
 */

import OpenAI from 'openai';

// Lazy initialization - only create client when actually needed
let openai = null;
function getOpenAIClient() {
  if (!openai) {
    if (!process.env.OPENAI_API_KEY) {
      throw new Error('OPENAI_API_KEY not configured');
    }
    openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  }
  return openai;
}

/**
 * Stage 1: Parse Intent
 * Extract domain, goals, and entities from user prompt
 */
async function parseIntent(prompt) {
  const systemPrompt = `You are an expert at analyzing user requirements for app generation.
Parse the user's prompt and extract structured intent.

Return ONLY valid JSON:
{
  "domain": "biologics|pharma|clinical|generic",
  "appName": "Short descriptive name",
  "description": "One sentence summary",
  "mainEntities": ["Entity1", "Entity2"],
  "goals": ["Goal 1", "Goal 2"],
  "hasWorkflow": true|false
}`;

  const response = await getOpenAIClient().chat.completions.create({
    model: 'gpt-4o',
    messages: [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: prompt }
    ],
    temperature: 0.3,
    max_tokens: 500,
    response_format: { type: 'json_object' }
  });

  return JSON.parse(response.choices[0].message.content);
}

/**
 * Stage 2: Derive Data Model
 * Generate entities, fields, and relationships
 */
async function deriveModel(intent, prompt) {
  const systemPrompt = `You are an expert data modeler for ${intent.domain} applications.
Generate a complete data model with entities and fields.

For sample management, you MUST include these fields:
- sampleId (string, required)
- batchLotId (string)
- sampleType (enum: ["Blood", "Tissue", "Serum", "Plasma", "Other"])
- dateReceived (date, required)
- quantity (number)
- unit (enum: ["mL", "mg", "units"])
- storageTemp (enum: ["-80°C", "-20°C", "4°C", "RT"])
- storageLocation (string)
- status (enum: ["Received", "In Storage", "In Analysis", "Consumed"])

Return ONLY valid JSON:
{
  "entities": [
    {
      "name": "EntityName",
      "pluralName": "EntityNames",
      "fields": [
        {
          "name": "fieldName",
          "type": "string|number|date|enum|reference",
          "required": true|false,
          "enumValues": ["val1", "val2"],
          "reference": "OtherEntity"
        }
      ],
      "relationships": [
        {
          "type": "oneToMany|manyToOne",
          "target": "OtherEntity",
          "field": "fieldName"
        }
      ]
    }
  ]
}`;

  const response = await getOpenAIClient().chat.completions.create({
    model: 'gpt-4o',
    messages: [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: `Intent: ${JSON.stringify(intent)}\n\nOriginal request: ${prompt}` }
    ],
    temperature: 0.3,
    max_tokens: 2000,
    response_format: { type: 'json_object' }
  });

  return JSON.parse(response.choices[0].message.content);
}

/**
 * Stage 3: Derive Workflow (optional)
 * Generate status transitions if workflow needed
 */
async function deriveWorkflow(intent, model) {
  if (!intent.hasWorkflow) {
    return { workflows: [] };
  }

  const systemPrompt = `Generate workflow states and transitions for ${intent.domain} entities.

Return ONLY valid JSON:
{
  "workflows": [
    {
      "id": "workflow-id",
      "name": "Workflow Name",
      "entity": "EntityName",
      "statuses": ["Status1", "Status2", "Status3"],
      "transitions": [
        {
          "from": "Status1",
          "to": "Status2",
          "action": "actionName"
        }
      ]
    }
  ]
}`;

  const response = await getOpenAIClient().chat.completions.create({
    model: 'gpt-4o',
    messages: [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: `Intent: ${JSON.stringify(intent)}\n\nModel: ${JSON.stringify(model)}` }
    ],
    temperature: 0.3,
    max_tokens: 1000,
    response_format: { type: 'json_object' }
  });

  return JSON.parse(response.choices[0].message.content);
}

/**
 * Stage 4: Generate Screens
 * Create pages and components
 */
async function generateScreens(intent, model, workflow) {
  const systemPrompt = `Generate UI pages and components for a ${intent.domain} application.

You MUST generate these pages:
1. Dashboard page with a data table
2. Create form page
3. Detail view page

For tables, use actual field names from the model as columns.
For buttons, use descriptive labels like "Create Sample", not generic "Button".

Return ONLY valid JSON:
{
  "pages": [
    {
      "id": "page-id",
      "type": "dashboard|create|detail",
      "title": "Page Title",
      "entity": "EntityName",
      "components": ["component-id-1", "component-id-2"]
    }
  ],
  "components": [
    {
      "id": "component-id",
      "type": "table|form|card|button",
      "props": {
        "title": "Component Title",
        "columns": ["field1", "field2"],
        "fields": [{"name": "field1", "label": "Field 1", "type": "string", "required": true}],
        "label": "Button Label",
        "variant": "primary|secondary"
      }
    }
  ]
}`;

  const response = await getOpenAIClient().chat.completions.create({
    model: 'gpt-4o',
    messages: [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: `Intent: ${JSON.stringify(intent)}\n\nModel: ${JSON.stringify(model)}\n\nWorkflow: ${JSON.stringify(workflow)}` }
    ],
    temperature: 0.3,
    max_tokens: 3000,
    response_format: { type: 'json_object' }
  });

  return JSON.parse(response.choices[0].message.content);
}

/**
 * Stage 5: Wire Actions
 * Connect buttons to navigation, forms to submissions, etc.
 */
async function wireActions(intent, model, screens) {
  const systemPrompt = `Generate actions and navigation wiring for the UI.

Create actions that:
- Navigate from dashboard to create/detail pages
- Handle form submissions
- Handle table row clicks
- Handle button clicks

Return ONLY valid JSON:
{
  "actions": [
    {
      "id": "action-id",
      "type": "navigate|create|update|delete",
      "trigger": "onClick|onSubmit|onRowClick",
      "target": "page-id",
      "params": {}
    }
  ],
  "dataSources": [
    {
      "id": "datasource-id",
      "entity": "EntityName",
      "query": "list|get|create|update",
      "filters": []
    }
  ]
}`;

  const response = await getOpenAIClient().chat.completions.create({
    model: 'gpt-4o',
    messages: [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: `Intent: ${JSON.stringify(intent)}\n\nModel: ${JSON.stringify(model)}\n\nScreens: ${JSON.stringify(screens)}` }
    ],
    temperature: 0.3,
    max_tokens: 2000,
    response_format: { type: 'json_object' }
  });

  return JSON.parse(response.choices[0].message.content);
}

/**
 * Run the full staged pipeline
 */
export async function generateStaged(prompt) {
  const stageResults = [];
  let currentStage = '';

  try {
    // Stage 1: Intent
    currentStage = 'intent';
    console.log('[Staged] Stage 1: Parsing intent...');
    const intent = await parseIntent(prompt);
    stageResults.push({ stage: 'intent', status: 'completed', summary: `Domain: ${intent.domain}, Entities: ${intent.mainEntities.join(', ')}` });

    // Stage 2: Model
    currentStage = 'model';
    console.log('[Staged] Stage 2: Deriving data model...');
    const model = await deriveModel(intent, prompt);
    stageResults.push({ stage: 'model', status: 'completed', summary: `Generated ${model.entities.length} entities` });

    // Stage 3: Workflow
    currentStage = 'workflow';
    console.log('[Staged] Stage 3: Deriving workflow...');
    const workflow = await deriveWorkflow(intent, model);
    stageResults.push({ stage: 'workflow', status: 'completed', summary: workflow.workflows.length > 0 ? 'Workflow defined' : 'No workflow needed' });

    // Stage 4: Screens
    currentStage = 'screens';
    console.log('[Staged] Stage 4: Generating screens...');
    const screens = await generateScreens(intent, model, workflow);
    stageResults.push({ stage: 'screens', status: 'completed', summary: `Generated ${screens.pages.length} pages, ${screens.components.length} components` });

    // Stage 5: Wiring
    currentStage = 'wiring';
    console.log('[Staged] Stage 5: Wiring actions...');
    const wiring = await wireActions(intent, model, screens);
    stageResults.push({ stage: 'wiring', status: 'completed', summary: `Wired ${wiring.actions.length} actions` });

    // Assemble full AppSpec
    const appSpec = {
      version: '2.0',
      mode: 'generated',
      metadata: {
        name: intent.appName,
        description: intent.description,
        domain: intent.domain,
        intentSummary: JSON.stringify(intent)
      },
      entities: model.entities,
      workflows: workflow.workflows || [],
      pages: screens.pages,
      components: screens.components,
      actions: wiring.actions,
      dataSources: wiring.dataSources,
      complianceFlags: {}
    };

    console.log('[Staged] All stages completed successfully');
    return {
      spec: appSpec,
      stageResults,
      mode: 'generated'
    };

  } catch (error) {
    console.error(`[Staged] Error in stage '${currentStage}':`, error.message);
    stageResults.push({ stage: currentStage, status: 'failed', summary: error.message });
    throw new Error(`Staged generation failed at stage '${currentStage}': ${error.message}`);
  }
}

/**
 * Generate in single-shot mode (backwards compatible)
 */
export async function generateSingleShot(prompt) {
  console.log('[SingleShot] Generating app in single-shot mode');
  
  const systemPrompt = `You are an expert React application generator for NewGen Studio.

Generate a complete, production-ready React application based on the user's description.

Return ONLY valid JSON in this EXACT format:
{
  "status": "ok",
  "mode": "generated",
  "files": {
    "App.jsx": "...complete React component code...",
    "styles.css": "...complete CSS code..."
  },
  "layout": {
    "id": "layout-xxx",
    "name": "App Name",
    "domain": "generic",
    "nodes": [
      {
        "id": "xxx",
        "type": "page",
        "props": {"title": "Page Title"},
        "children": [...]
      }
    ]
  },
  "schema": {...same as layout...},
  "messages": [
    {"role": "assistant", "content": "Brief description of what was generated"}
  ]
}

REQUIREMENTS:
- App.jsx must be a complete, working React component
- Use modern React (hooks, functional components)
- Use Tailwind CSS for styling
- Include lucide-react icons where appropriate
- Make it beautiful and professional
- Ensure all imports are correct
- Code must be production-ready`;

  const response = await getOpenAIClient().chat.completions.create({
    model: 'gpt-4o',
    messages: [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: prompt }
    ],
    temperature: 0.7,
    max_tokens: 4096,
    response_format: { type: 'json_object' }
  });

  return JSON.parse(response.choices[0].message.content);
}

