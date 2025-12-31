/**
 * Suggestion Engine
 * Generates suggestions based on learned patterns
 */

import { loadPatterns } from './pattern-storage.js';
import { findSimilarInputs, findRelevantComponents } from './similarity-matcher.js';

/**
 * Generate suggestions for user input
 * @param {string} input - User input
 * @param {object} options - Suggestion options
 * @returns {object} Suggestions
 */
export function generateSuggestions(input, options = {}) {
  const { includeComponents = true, includeLayouts = true } = options;

  try {
    const suggestions = {
      components: [],
      layouts: [],
      similar: [],
      confidence: 0
    };

    // Find similar past inputs
    const similar = findSimilarInputs(input, { threshold: 0.3, maxResults: 3 });
    suggestions.similar = similar.map(s => ({
      input: s.context.input,
      componentType: s.componentType,
      similarity: Math.round(s.similarity * 100),
      feedback: s.context.feedback
    }));

    // Find relevant components
    if (includeComponents) {
      const relevant = findRelevantComponents(input);
      suggestions.components = relevant.map(r => ({
        type: r.type,
        usageCount: r.usageCount,
        successRate: r.successRate,
        relevance: Math.round(r.relevance * 100)
      }));
    }

    // Suggest layout patterns
    if (includeLayouts) {
      const layouts = suggestLayoutPatterns(input);
      suggestions.layouts = layouts;
    }

    // Calculate overall confidence
    if (similar.length > 0) {
      const avgSimilarity = similar.reduce((sum, s) => sum + s.similarity, 0) / similar.length;
      suggestions.confidence = Math.round(avgSimilarity * 100);
    }

    return suggestions;
  } catch (error) {
    console.error('[SuggestionEngine] Generate suggestions failed:', error.message);
    return {
      components: [],
      layouts: [],
      similar: [],
      confidence: 0
    };
  }
}

/**
 * Suggest layout patterns based on input
 * @param {string} input - User input
 * @returns {array} Layout suggestions
 */
function suggestLayoutPatterns(input) {
  try {
    const patterns = loadPatterns();
    const layouts = [];
    const lowerInput = input.toLowerCase();

    // Keyword-based layout suggestions
    const layoutKeywords = {
      'crud': ['create', 'edit', 'delete', 'manage', 'crud', 'form', 'table'],
      'dashboard': ['dashboard', 'overview', 'summary', 'metrics', 'analytics', 'chart'],
      'form-focused': ['form', 'input', 'submit', 'entry', 'registration', 'survey'],
      'list-view': ['list', 'table', 'records', 'view', 'browse', 'search']
    };

    for (const [layoutType, keywords] of Object.entries(layoutKeywords)) {
      const matches = keywords.filter(kw => lowerInput.includes(kw)).length;
      
      if (matches > 0) {
        const layoutData = patterns.layouts[layoutType];
        layouts.push({
          type: layoutType,
          usageCount: layoutData?.usageCount || 0,
          relevance: Math.min(100, matches * 33),
          structure: layoutData?.structure || {}
        });
      }
    }

    // Sort by relevance and usage
    layouts.sort((a, b) => {
      const scoreA = a.relevance * 0.7 + (a.usageCount / 10) * 0.3;
      const scoreB = b.relevance * 0.7 + (b.usageCount / 10) * 0.3;
      return scoreB - scoreA;
    });

    return layouts.slice(0, 3);
  } catch (error) {
    console.error('[SuggestionEngine] Suggest layout patterns failed:', error.message);
    return [];
  }
}

/**
 * Pre-populate fields based on past successes
 * @param {string} componentType - Component type
 * @returns {object} Pre-populated field suggestions
 */
export function suggestFieldValues(componentType) {
  try {
    const patterns = loadPatterns();
    const component = patterns.components[componentType];

    if (!component || !Array.isArray(component.contexts)) {
      return {};
    }

    const suggestions = {};
    const positiveContexts = component.contexts.filter(c => c.feedback === 'positive');

    if (positiveContexts.length > 0) {
      // Analyze successful patterns
      // For now, return basic suggestions
      suggestions.confidence = component.successRate;
      suggestions.examples = positiveContexts.slice(0, 3).map(c => c.input);
    }

    return suggestions;
  } catch (error) {
    console.error('[SuggestionEngine] Suggest field values failed:', error.message);
    return {};
  }
}

/**
 * Recommend components for a domain
 * @param {string} domain - Domain (pharma, biotech, clinical, generic)
 * @returns {array} Recommended components
 */
export function recommendComponentsForDomain(domain) {
  try {
    const patterns = loadPatterns();
    const recommendations = [];

    // Domain-specific component recommendations
    const domainComponents = {
      'pharma': ['table', 'form', 'form-field', 'button', 'section'],
      'biotech': ['chart', 'widget', 'table', 'section'],
      'clinical': ['form', 'form-field', 'table', 'button'],
      'generic': ['container', 'text', 'button', 'form-field']
    };

    const relevantTypes = domainComponents[domain] || domainComponents['generic'];

    for (const type of relevantTypes) {
      const component = patterns.components[type];
      if (component) {
        recommendations.push({
          type,
          usageCount: component.usageCount,
          successRate: component.successRate,
          recommended: true
        });
      } else {
        recommendations.push({
          type,
          usageCount: 0,
          successRate: 100,
          recommended: true
        });
      }
    }

    return recommendations;
  } catch (error) {
    console.error('[SuggestionEngine] Recommend components failed:', error.message);
    return [];
  }
}

/**
 * Get learning-enhanced prompt
 * @param {string} input - User input
 * @returns {string} Enhanced prompt with learned context
 */
export function enhancePromptWithLearning(input) {
  try {
    const suggestions = generateSuggestions(input);
    
    if (suggestions.components.length === 0 && suggestions.similar.length === 0) {
      return input; // No learning available, return original
    }

    let enhanced = input;

    // Add component suggestions to context
    if (suggestions.components.length > 0) {
      const topComponents = suggestions.components.slice(0, 3).map(c => c.type);
      enhanced += `\n\n[Context: Based on similar requests, consider using: ${topComponents.join(', ')}]`;
    }

    // Add layout suggestion
    if (suggestions.layouts.length > 0) {
      const topLayout = suggestions.layouts[0];
      enhanced += `\n[Suggested layout pattern: ${topLayout.type}]`;
    }

    return enhanced;
  } catch (error) {
    console.error('[SuggestionEngine] Enhance prompt failed:', error.message);
    return input;
  }
}

export default {
  generateSuggestions,
  suggestFieldValues,
  recommendComponentsForDomain,
  enhancePromptWithLearning
};
