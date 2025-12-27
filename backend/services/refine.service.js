/**
 * Refine Service - Apply patches to existing AppSpecs
 * Uses JSON Patch-like operations to modify existing specs
 */

import OpenAI from 'openai';

// Lazy initialization of OpenAI client
let openaiClient = null;
function getOpenAIClient() {
  if (!openaiClient && process.env.OPENAI_API_KEY) {
    openaiClient = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  }
  return openaiClient;
}

/**
 * Generate a patch to apply user's refinement instructions
 */
export async function generateRefinePatch(currentSpec, instructions) {
  const openai = getOpenAIClient();
  if (!openai) {
    throw new Error('OpenAI API key not configured');
  }
  
  const systemPrompt = `You are an expert at refining application specifications.

Given the current AppSpec and user's refinement instructions, generate a JSON patch that describes the changes.

Return ONLY valid JSON in this format:
{
  "patch": {
    "operation": "add|remove|modify",
    "changes": [
      {
        "path": "/pages/0/components",
        "op": "add",
        "value": {"id": "new-component", "type": "button", "props": {...}}
      },
      {
        "path": "/components/3/props/label",
        "op": "replace",
        "value": "New Label"
      }
    ]
  },
  "summary": "Brief description of changes made"
}

RULES:
- For "add search bar", add a component to the appropriate page
- For "make more modern", update styling props
- For "add validation", add validation rules to fields
- Be specific and surgical - only change what's needed
- Preserve existing IDs and structure`;

  const response = await openai.chat.completions.create({
    model: 'gpt-4o',
    messages: [
      { role: 'system', content: systemPrompt },
      { 
        role: 'user', 
        content: `Current AppSpec:\n${JSON.stringify(currentSpec, null, 2)}\n\nRefinement instructions: ${instructions}` 
      }
    ],
    temperature: 0.3,
    max_tokens: 2000,
    response_format: { type: 'json_object' }
  });

  return JSON.parse(response.choices[0].message.content);
}

/**
 * Apply a patch to an AppSpec
 */
export function applyPatch(spec, patch) {
  const newSpec = JSON.parse(JSON.stringify(spec)); // Deep clone
  
  if (!patch.changes || !Array.isArray(patch.changes)) {
    return newSpec;
  }
  
  patch.changes.forEach(change => {
    const pathParts = change.path.split('/').filter(p => p);
    
    try {
      if (change.op === 'add') {
        applyAdd(newSpec, pathParts, change.value);
      } else if (change.op === 'replace') {
        applyReplace(newSpec, pathParts, change.value);
      } else if (change.op === 'remove') {
        applyRemove(newSpec, pathParts);
      }
    } catch (error) {
      console.warn(`[Patch] Failed to apply change to ${change.path}:`, error.message);
    }
  });
  
  return newSpec;
}

function applyAdd(obj, pathParts, value) {
  const lastKey = pathParts.pop();
  let current = obj;
  
  // Navigate to parent
  for (const part of pathParts) {
    if (Array.isArray(current)) {
      current = current[parseInt(part)];
    } else {
      current = current[part];
    }
  }
  
  // Add value
  if (Array.isArray(current)) {
    current.push(value);
  } else {
    current[lastKey] = value;
  }
}

function applyReplace(obj, pathParts, value) {
  const lastKey = pathParts.pop();
  let current = obj;
  
  // Navigate to parent
  for (const part of pathParts) {
    if (Array.isArray(current)) {
      current = current[parseInt(part)];
    } else {
      current = current[part];
    }
  }
  
  // Replace value
  if (Array.isArray(current)) {
    current[parseInt(lastKey)] = value;
  } else {
    current[lastKey] = value;
  }
}

function applyRemove(obj, pathParts) {
  const lastKey = pathParts.pop();
  let current = obj;
  
  // Navigate to parent
  for (const part of pathParts) {
    if (Array.isArray(current)) {
      current = current[parseInt(part)];
    } else {
      current = current[part];
    }
  }
  
  // Remove value
  if (Array.isArray(current)) {
    current.splice(parseInt(lastKey), 1);
  } else {
    delete current[lastKey];
  }
}

/**
 * Full refine workflow
 */
export async function refineApp(currentSpec, instructions) {
  console.log('[Refine] Generating patch for instructions:', instructions.substring(0, 100));
  
  // Generate patch
  const patchResult = await generateRefinePatch(currentSpec, instructions);
  console.log('[Refine] Generated patch with', patchResult.patch.changes?.length || 0, 'changes');
  
  // Apply patch
  const newSpec = applyPatch(currentSpec, patchResult.patch);
  console.log('[Refine] Applied patch successfully');
  
  return {
    spec: newSpec,
    patch: patchResult.patch,
    summary: patchResult.summary
  };
}
