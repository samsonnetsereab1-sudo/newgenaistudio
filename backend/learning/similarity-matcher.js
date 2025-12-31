/**
 * Similarity Matcher
 * Finds similar past inputs using text similarity algorithms
 */

import { loadPatterns } from './pattern-storage.js';

/**
 * Calculate similarity between two strings using Levenshtein distance
 * @param {string} str1 - First string
 * @param {string} str2 - Second string
 * @returns {number} Similarity score (0-1)
 */
function calculateSimilarity(str1, str2) {
  if (!str1 || !str2) return 0;
  
  const s1 = str1.toLowerCase();
  const s2 = str2.toLowerCase();
  
  // Quick exact match check
  if (s1 === s2) return 1;
  
  // Calculate Levenshtein distance
  const distance = levenshteinDistance(s1, s2);
  const maxLength = Math.max(s1.length, s2.length);
  
  if (maxLength === 0) return 1;
  
  return 1 - (distance / maxLength);
}

/**
 * Levenshtein distance implementation
 * @param {string} str1 - First string
 * @param {string} str2 - Second string
 * @returns {number} Edit distance
 */
function levenshteinDistance(str1, str2) {
  const matrix = [];

  for (let i = 0; i <= str2.length; i++) {
    matrix[i] = [i];
  }

  for (let j = 0; j <= str1.length; j++) {
    matrix[0][j] = j;
  }

  for (let i = 1; i <= str2.length; i++) {
    for (let j = 1; j <= str1.length; j++) {
      if (str2.charAt(i - 1) === str1.charAt(j - 1)) {
        matrix[i][j] = matrix[i - 1][j - 1];
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j - 1] + 1, // substitution
          matrix[i][j - 1] + 1,     // insertion
          matrix[i - 1][j] + 1      // deletion
        );
      }
    }
  }

  return matrix[str2.length][str1.length];
}

/**
 * Calculate keyword-based similarity
 * @param {string} input1 - First input
 * @param {string} input2 - Second input
 * @returns {number} Keyword similarity score (0-1)
 */
function calculateKeywordSimilarity(input1, input2) {
  const keywords1 = extractKeywords(input1);
  const keywords2 = extractKeywords(input2);
  
  if (keywords1.size === 0 && keywords2.size === 0) return 0;
  
  const intersection = new Set([...keywords1].filter(k => keywords2.has(k)));
  const union = new Set([...keywords1, ...keywords2]);
  
  return union.size > 0 ? intersection.size / union.size : 0;
}

/**
 * Extract keywords from input
 * @param {string} input - Input string
 * @returns {Set} Set of keywords
 */
function extractKeywords(input) {
  if (!input) return new Set();
  
  const stopWords = new Set([
    'the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for',
    'of', 'with', 'by', 'from', 'is', 'are', 'was', 'were', 'be', 'been',
    'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would', 'should',
    'could', 'may', 'might', 'can', 'create', 'build', 'make', 'generate'
  ]);
  
  const words = input.toLowerCase()
    .replace(/[^\w\s]/g, ' ')
    .split(/\s+/)
    .filter(w => w.length > 2 && !stopWords.has(w));
  
  return new Set(words);
}

/**
 * Find similar past inputs
 * @param {string} input - Current input
 * @param {object} options - Matching options
 * @returns {array} Array of similar contexts
 */
export function findSimilarInputs(input, options = {}) {
  const {
    threshold = 0.3,
    maxResults = 5,
    componentType = null
  } = options;

  try {
    const patterns = loadPatterns();
    const matches = [];

    // Search through all component contexts
    for (const [compType, component] of Object.entries(patterns.components)) {
      // Filter by component type if specified
      if (componentType && compType !== componentType) {
        continue;
      }

      if (!Array.isArray(component.contexts)) {
        continue;
      }

      for (const context of component.contexts) {
        if (!context.input) continue;

        // Calculate both text similarity and keyword similarity
        const textSim = calculateSimilarity(input, context.input);
        const keywordSim = calculateKeywordSimilarity(input, context.input);
        
        // Weighted average (60% text, 40% keywords)
        const score = textSim * 0.6 + keywordSim * 0.4;

        if (score >= threshold) {
          matches.push({
            componentType: compType,
            context,
            similarity: score,
            usageCount: component.usageCount,
            successRate: component.successRate
          });
        }
      }
    }

    // Sort by similarity score (descending)
    matches.sort((a, b) => b.similarity - a.similarity);

    return matches.slice(0, maxResults);
  } catch (error) {
    console.error('[SimilarityMatcher] Find similar inputs failed:', error.message);
    return [];
  }
}

/**
 * Find components relevant to input
 * @param {string} input - User input
 * @returns {array} Array of relevant components
 */
export function findRelevantComponents(input) {
  try {
    const patterns = loadPatterns();
    const keywords = extractKeywords(input);
    const relevant = [];

    for (const [compType, component] of Object.entries(patterns.components)) {
      // Check if component name matches keywords
      const compKeywords = extractKeywords(compType);
      const intersection = new Set([...keywords].filter(k => compKeywords.has(k)));
      
      if (intersection.size > 0) {
        relevant.push({
          type: compType,
          usageCount: component.usageCount,
          successRate: component.successRate,
          relevance: intersection.size / keywords.size
        });
      }

      // Check contexts
      if (Array.isArray(component.contexts)) {
        for (const context of component.contexts) {
          if (!context.input) continue;
          
          const contextKeywords = extractKeywords(context.input);
          const contextIntersection = new Set([...keywords].filter(k => contextKeywords.has(k)));
          
          if (contextIntersection.size > 0) {
            const existing = relevant.find(r => r.type === compType);
            if (!existing) {
              relevant.push({
                type: compType,
                usageCount: component.usageCount,
                successRate: component.successRate,
                relevance: contextIntersection.size / keywords.size
              });
            }
          }
        }
      }
    }

    // Sort by relevance and success rate
    relevant.sort((a, b) => {
      const scoreA = a.relevance * 0.6 + (a.successRate / 100) * 0.4;
      const scoreB = b.relevance * 0.6 + (b.successRate / 100) * 0.4;
      return scoreB - scoreA;
    });

    return relevant.slice(0, 10);
  } catch (error) {
    console.error('[SimilarityMatcher] Find relevant components failed:', error.message);
    return [];
  }
}

export default {
  findSimilarInputs,
  findRelevantComponents,
  calculateSimilarity
};
