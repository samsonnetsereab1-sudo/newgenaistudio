/**
 * Pattern Storage
 * Main learning engine that stores and retrieves learned patterns
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const PATTERNS_FILE = path.join(__dirname, '..', 'learned_patterns', 'patterns.json');

/**
 * Initialize patterns storage
 */
function initializeStorage() {
  try {
    const dir = path.dirname(PATTERNS_FILE);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }

    if (!fs.existsSync(PATTERNS_FILE)) {
      const initialData = {
        components: {},
        layouts: {},
        metadata: {
          totalLearned: 0,
          lastUpdated: new Date().toISOString()
        }
      };
      fs.writeFileSync(PATTERNS_FILE, JSON.stringify(initialData, null, 2));
    }
  } catch (error) {
    console.error('[PatternStorage] Initialization failed:', error.message);
  }
}

/**
 * Load patterns from storage
 * @returns {object} Patterns data
 */
export function loadPatterns() {
  try {
    initializeStorage();
    const data = fs.readFileSync(PATTERNS_FILE, 'utf-8');
    return JSON.parse(data);
  } catch (error) {
    console.error('[PatternStorage] Load failed:', error.message);
    return {
      components: {},
      layouts: {},
      metadata: {
        totalLearned: 0,
        lastUpdated: new Date().toISOString()
      }
    };
  }
}

/**
 * Save patterns to storage
 * @param {object} patterns - Patterns data
 */
export function savePatterns(patterns) {
  try {
    initializeStorage();
    patterns.metadata.lastUpdated = new Date().toISOString();
    fs.writeFileSync(PATTERNS_FILE, JSON.stringify(patterns, null, 2));
  } catch (error) {
    console.error('[PatternStorage] Save failed:', error.message);
    throw error;
  }
}

/**
 * Learn from a successful generation
 * @param {object} data - Learning data
 * @returns {boolean} Success status
 */
export function learnFromGeneration(data) {
  try {
    const { input, appSpec, feedback = 'neutral' } = data;
    
    if (!appSpec || !appSpec.layout || !appSpec.layout.nodes) {
      console.warn('[PatternStorage] Invalid appSpec for learning');
      return false;
    }

    const patterns = loadPatterns();

    // Extract components from the generated spec
    const components = extractComponents(appSpec.layout.nodes);
    
    // Update component usage counts and contexts
    components.forEach(comp => {
      if (!patterns.components[comp.type]) {
        patterns.components[comp.type] = {
          name: comp.type,
          usageCount: 0,
          successRate: 100,
          contexts: [],
          totalPositive: 0,
          totalNegative: 0
        };
      }

      const component = patterns.components[comp.type];
      component.usageCount++;

      // Update feedback stats
      if (feedback === 'positive') {
        component.totalPositive++;
      } else if (feedback === 'negative') {
        component.totalNegative++;
      }

      // Recalculate success rate
      const total = component.totalPositive + component.totalNegative;
      if (total > 0) {
        component.successRate = Math.round((component.totalPositive / total) * 100);
      }

      // Store context (limit to last 10 for each component)
      if (input) {
        component.contexts.push({
          input: input.substring(0, 200),
          timestamp: new Date().toISOString(),
          feedback
        });

        if (component.contexts.length > 10) {
          component.contexts = component.contexts.slice(-10);
        }
      }
    });

    // Detect and learn layout pattern
    const layoutPattern = detectLayoutPattern(appSpec.layout.nodes);
    if (layoutPattern) {
      if (!patterns.layouts[layoutPattern.type]) {
        patterns.layouts[layoutPattern.type] = {
          type: layoutPattern.type,
          usageCount: 0,
          structure: layoutPattern.structure,
          examples: []
        };
      }

      patterns.layouts[layoutPattern.type].usageCount++;
      
      // Store example (limit to 5)
      patterns.layouts[layoutPattern.type].examples.push({
        input: input ? input.substring(0, 150) : '',
        timestamp: new Date().toISOString()
      });

      if (patterns.layouts[layoutPattern.type].examples.length > 5) {
        patterns.layouts[layoutPattern.type].examples = 
          patterns.layouts[layoutPattern.type].examples.slice(-5);
      }
    }

    // Update metadata
    patterns.metadata.totalLearned++;

    savePatterns(patterns);
    console.log(`[PatternStorage] Learned from generation. Total patterns: ${patterns.metadata.totalLearned}`);
    
    return true;
  } catch (error) {
    console.error('[PatternStorage] Learning failed:', error.message);
    return false;
  }
}

/**
 * Extract components from node tree
 * @param {array} nodes - Node array
 * @returns {array} Array of component info
 */
function extractComponents(nodes) {
  const components = [];

  function walk(nodeList) {
    if (!Array.isArray(nodeList)) return;

    for (const node of nodeList) {
      if (node && node.type) {
        components.push({
          type: node.type,
          props: node.props || {}
        });

        if (Array.isArray(node.children)) {
          walk(node.children);
        }
      }
    }
  }

  walk(nodes);
  return components;
}

/**
 * Detect layout pattern from nodes
 * @param {array} nodes - Node array
 * @returns {object|null} Layout pattern
 */
function detectLayoutPattern(nodes) {
  if (!Array.isArray(nodes) || nodes.length === 0) {
    return null;
  }

  const allComponents = extractComponents(nodes);
  const componentTypes = allComponents.map(c => c.type);
  
  const hasForm = componentTypes.includes('form') || 
                  componentTypes.some(t => t === 'form-field');
  const hasTable = componentTypes.includes('table');
  const hasChart = componentTypes.includes('chart') || 
                   componentTypes.includes('widget');
  const hasMultiplePages = nodes.filter(n => n.type === 'page').length > 1;

  // CRUD pattern
  if (hasForm && hasTable) {
    return {
      type: 'crud',
      structure: {
        hasForm: true,
        hasTable: true,
        hasChart: hasChart
      }
    };
  }

  // Dashboard pattern
  if (hasChart && hasMultiplePages) {
    return {
      type: 'dashboard',
      structure: {
        hasCharts: true,
        multiPage: true
      }
    };
  }

  // Form-focused pattern
  if (hasForm && !hasTable) {
    return {
      type: 'form-focused',
      structure: {
        hasForm: true,
        hasTable: false
      }
    };
  }

  // List/table pattern
  if (hasTable && !hasForm) {
    return {
      type: 'list-view',
      structure: {
        hasTable: true,
        hasForm: false
      }
    };
  }

  return {
    type: 'generic',
    structure: {
      componentCount: componentTypes.length
    }
  };
}

/**
 * Get learning insights
 * @returns {object} Insights data
 */
export function getInsights() {
  try {
    const patterns = loadPatterns();

    // Get top components by usage
    const topComponents = Object.values(patterns.components)
      .sort((a, b) => b.usageCount - a.usageCount)
      .slice(0, 10)
      .map(c => ({
        name: c.name,
        usageCount: c.usageCount,
        successRate: c.successRate
      }));

    // Get layout patterns
    const layoutPatterns = Object.values(patterns.layouts)
      .map(l => ({
        type: l.type,
        usageCount: l.usageCount
      }));

    return {
      totalPatterns: patterns.metadata.totalLearned,
      componentTypes: Object.keys(patterns.components).length,
      layoutTypes: Object.keys(patterns.layouts).length,
      topComponents,
      layoutPatterns,
      lastUpdated: patterns.metadata.lastUpdated
    };
  } catch (error) {
    console.error('[PatternStorage] Get insights failed:', error.message);
    return {
      totalPatterns: 0,
      componentTypes: 0,
      layoutTypes: 0,
      topComponents: [],
      layoutPatterns: [],
      lastUpdated: new Date().toISOString()
    };
  }
}

/**
 * Update feedback for a component
 * @param {string} appId - App ID
 * @param {number} rating - Rating (1-5)
 * @returns {boolean} Success status
 */
export function updateFeedback(appId, rating) {
  try {
    // For now, we'll just increment the counter
    // In a real system, you'd store app-specific data
    const patterns = loadPatterns();
    
    const feedback = rating >= 4 ? 'positive' : (rating <= 2 ? 'negative' : 'neutral');
    
    // Update success rates for all components (simplified approach)
    Object.values(patterns.components).forEach(comp => {
      if (feedback === 'positive') {
        comp.totalPositive = (comp.totalPositive || 0) + 1;
      } else if (feedback === 'negative') {
        comp.totalNegative = (comp.totalNegative || 0) + 1;
      }

      const total = comp.totalPositive + comp.totalNegative;
      if (total > 0) {
        comp.successRate = Math.round((comp.totalPositive / total) * 100);
      }
    });

    savePatterns(patterns);
    console.log(`[PatternStorage] Feedback updated for appId=${appId}, rating=${rating}`);
    
    return true;
  } catch (error) {
    console.error('[PatternStorage] Update feedback failed:', error.message);
    return false;
  }
}

export default {
  loadPatterns,
  savePatterns,
  learnFromGeneration,
  getInsights,
  updateFeedback
};
