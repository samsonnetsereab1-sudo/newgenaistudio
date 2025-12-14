/**
 * Multi-Provider AI Router
 * Routes requests to appropriate AI provider based on task type
 * - Gemini: UI building, design, visual aspects
 * - OpenAI: Fast answers, quick responses
 * - Azure: Deep machine learning, complex analysis
 */

import OpenAI from 'openai';
import { GoogleGenerativeAI } from '@google/generative-ai';

// Initialize providers
const openai = process.env.OPENAI_API_KEY 
  ? new OpenAI({ apiKey: process.env.OPENAI_API_KEY })
  : null;

const gemini = process.env.GEMINI_API_KEY
  ? new GoogleGenerativeAI(process.env.GEMINI_API_KEY)
  : null;

// Azure initialization (when configured)
const azureOpenai = (process.env.AZURE_OPENAI_ENDPOINT && process.env.AZURE_OPENAI_KEY)
  ? new OpenAI({
      apiKey: process.env.AZURE_OPENAI_KEY,
      baseURL: `${process.env.AZURE_OPENAI_ENDPOINT}/openai/deployments/${process.env.AZURE_OPENAI_DEPLOYMENT_NAME}`,
      defaultQuery: { 'api-version': '2024-08-01-preview' },
      defaultHeaders: { 'api-key': process.env.AZURE_OPENAI_KEY }
    })
  : null;

/**
 * Task types and their preferred providers
 */
const TASK_ROUTING = {
  // Gemini tasks - UI and design
  'ui-generation': 'gemini',
  'ui-design': 'gemini',
  'component-generation': 'gemini',
  'layout-design': 'gemini',
  'styling': 'gemini',
  'visual-refinement': 'gemini',
  
  // OpenAI tasks - Fast and general
  'intent-parsing': 'openai',
  'quick-answer': 'openai',
  'text-generation': 'openai',
  
  // Azure tasks - Deep analysis
  'data-modeling': 'azure',
  'workflow-analysis': 'azure',
  'complex-reasoning': 'azure',
  'ml-prediction': 'azure'
};

/**
 * Call Gemini API
 */
async function callGemini(prompt, options = {}) {
  if (!gemini) {
    throw new Error('GEMINI_API_KEY not configured');
  }

  const model = gemini.getGenerativeModel({ 
    model: options.model || 'gemini-2.0-flash-exp',
    generationConfig: {
      temperature: options.temperature || 0.7,
      maxOutputTokens: options.maxTokens || 8192,
      ...(options.responseFormat === 'json' ? { responseMimeType: 'application/json' } : {})
    }
  });

  const result = await model.generateContent(prompt);
  const response = result.response;
  const text = response.text();
  
  return options.responseFormat === 'json' ? JSON.parse(text) : text;
}

/**
 * Call OpenAI API
 */
async function callOpenAI(messages, options = {}) {
  if (!openai) {
    throw new Error('OPENAI_API_KEY not configured');
  }

  const response = await openai.chat.completions.create({
    model: options.model || 'gpt-4o',
    messages,
    temperature: options.temperature || 0.7,
    max_tokens: options.maxTokens || 4096,
    ...(options.responseFormat === 'json' ? { response_format: { type: 'json_object' } } : {})
  });

  const content = response.choices[0].message.content;
  return options.responseFormat === 'json' ? JSON.parse(content) : content;
}

/**
 * Call Azure OpenAI API
 */
async function callAzure(messages, options = {}) {
  if (!azureOpenai) {
    throw new Error('Azure OpenAI not configured. Set AZURE_OPENAI_ENDPOINT, AZURE_OPENAI_KEY, and AZURE_OPENAI_DEPLOYMENT_NAME');
  }

  const response = await azureOpenai.chat.completions.create({
    model: process.env.AZURE_OPENAI_DEPLOYMENT_NAME,
    messages,
    temperature: options.temperature || 0.3,
    max_tokens: options.maxTokens || 4096,
    ...(options.responseFormat === 'json' ? { response_format: { type: 'json_object' } } : {})
  });

  const content = response.choices[0].message.content;
  return options.responseFormat === 'json' ? JSON.parse(content) : content;
}

/**
 * Route request to appropriate provider
 */
export async function routeAIRequest(taskType, prompt, options = {}) {
  const preferredProvider = TASK_ROUTING[taskType] || 'openai';
  
  console.log(`[AI Router] Task: ${taskType} → Provider: ${preferredProvider}`);
  
  try {
    if (preferredProvider === 'gemini' && gemini) {
      return await callGemini(prompt, options);
    } else if (preferredProvider === 'azure' && azureOpenai) {
      const messages = typeof prompt === 'string' 
        ? [{ role: 'user', content: prompt }]
        : prompt;
      return await callAzure(messages, options);
    } else {
      // Fallback to OpenAI or convert prompt format
      const messages = typeof prompt === 'string'
        ? [{ role: 'user', content: prompt }]
        : prompt;
      return await callOpenAI(messages, options);
    }
  } catch (error) {
    console.error(`[AI Router] Error with ${preferredProvider}:`, error.message);
    
    // Fallback strategy: try OpenAI if primary fails
    if (preferredProvider !== 'openai' && openai) {
      console.log(`[AI Router] Falling back to OpenAI`);
      const messages = typeof prompt === 'string'
        ? [{ role: 'user', content: prompt }]
        : prompt;
      return await callOpenAI(messages, options);
    }
    
    throw error;
  }
}

/**
 * Get available providers
 */
export function getAvailableProviders() {
  return {
    openai: !!openai,
    gemini: !!gemini,
    azure: !!azureOpenai
  };
}

/**
 * Export individual provider functions for direct access
 */
export { callGemini, callOpenAI, callAzure };
