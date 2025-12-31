/**
 * Format Detector
 * Automatically detects the format of user input (JSX, HTML, JSON, component list, natural language)
 */

/**
 * Detect the format of the input string
 * @param {string} input - User input
 * @returns {object} Detection result with format, confidence, and metadata
 */
export function detectFormat(input) {
  if (!input || typeof input !== 'string') {
    return { format: 'unknown', confidence: 0, metadata: {} };
  }

  const trimmed = input.trim();
  
  // Check for JSON format
  if (trimmed.startsWith('{') || trimmed.startsWith('[')) {
    try {
      const parsed = JSON.parse(trimmed);
      const isAppSpec = parsed && typeof parsed === 'object' && 
        (parsed.layout || parsed.nodes || parsed.children || parsed.type);
      
      return {
        format: 'json',
        confidence: 0.95,
        metadata: {
          isAppSpec,
          hasLayout: !!parsed.layout,
          hasNodes: !!(parsed.nodes || parsed.children),
          parsed
        }
      };
    } catch (e) {
      // Invalid JSON, continue checking other formats
    }
  }

  // Check for React JSX
  const jsxPatterns = [
    /import\s+.*from\s+['"]react['"]/i,
    /export\s+(default\s+)?function/i,
    /const\s+\w+\s*=\s*\(\s*\)\s*=>/,
    /<\w+[^>]*>/,
    /return\s*\(/,
    /<\/\w+>/
  ];
  
  const jsxMatches = jsxPatterns.filter(pattern => pattern.test(trimmed)).length;
  if (jsxMatches >= 2) {
    return {
      format: 'jsx',
      confidence: Math.min(0.9, 0.5 + (jsxMatches * 0.1)),
      metadata: {
        hasImports: /import\s+/.test(trimmed),
        hasExport: /export\s+(default\s+)?/.test(trimmed),
        hasComponents: /<\w+/.test(trimmed),
        componentCount: (trimmed.match(/<\w+/g) || []).length
      }
    };
  }

  // Check for HTML
  const htmlPatterns = [
    /<!DOCTYPE\s+html>/i,
    /<html[^>]*>/i,
    /<head[^>]*>/i,
    /<body[^>]*>/i,
    /<div[^>]*>/i,
    /<form[^>]*>/i,
    /<table[^>]*>/i
  ];
  
  const htmlMatches = htmlPatterns.filter(pattern => pattern.test(trimmed)).length;
  if (htmlMatches >= 2 || (htmlMatches === 1 && trimmed.includes('</div>'))) {
    return {
      format: 'html',
      confidence: Math.min(0.85, 0.5 + (htmlMatches * 0.1)),
      metadata: {
        hasDoctype: /<!DOCTYPE/i.test(trimmed),
        hasTags: /<\w+/.test(trimmed),
        tagCount: (trimmed.match(/<\w+/g) || []).length
      }
    };
  }

  // Check for component list (simple list of component names)
  const componentKeywords = [
    'DatePicker', 'Select', 'DataGrid', 'Chart', 'Card', 'Table', 'Form',
    'Input', 'Button', 'Dropdown', 'Calendar', 'Modal', 'Sidebar'
  ];
  
  const lines = trimmed.split('\n').filter(l => l.trim());
  const componentMatches = lines.filter(line => 
    componentKeywords.some(kw => line.includes(kw))
  );
  
  if (componentMatches.length >= 2 && lines.length <= 20) {
    return {
      format: 'component-list',
      confidence: Math.min(0.8, 0.4 + (componentMatches.length * 0.1)),
      metadata: {
        componentCount: componentMatches.length,
        components: componentMatches.map(l => l.trim())
      }
    };
  }

  // Default to natural language
  return {
    format: 'natural-language',
    confidence: 0.7,
    metadata: {
      wordCount: trimmed.split(/\s+/).length,
      charCount: trimmed.length,
      hasComponentKeywords: componentKeywords.some(kw => 
        trimmed.toLowerCase().includes(kw.toLowerCase())
      )
    }
  };
}

/**
 * Validate if input is in a technical format (not natural language)
 * @param {string} input - User input
 * @returns {boolean} True if technical format detected
 */
export function isTechnicalFormat(input) {
  const detection = detectFormat(input);
  return ['json', 'jsx', 'html', 'component-list'].includes(detection.format);
}

/**
 * Get format-specific validation errors
 * @param {string} input - User input
 * @param {string} format - Detected format
 * @returns {array} Array of validation errors
 */
export function validateFormat(input, format) {
  const errors = [];

  if (format === 'json') {
    try {
      JSON.parse(input);
    } catch (e) {
      errors.push({
        type: 'syntax',
        message: `Invalid JSON: ${e.message}`,
        line: extractLineNumber(e.message)
      });
    }
  }

  if (format === 'jsx') {
    // Basic JSX validation
    const openTags = (input.match(/<\w+[^/>]*>/g) || []).length;
    const closeTags = (input.match(/<\/\w+>/g) || []).length;
    const selfClosing = (input.match(/<\w+[^>]*\/>/g) || []).length;
    
    if (openTags !== closeTags + selfClosing) {
      errors.push({
        type: 'structure',
        message: 'Mismatched JSX tags detected'
      });
    }
  }

  if (format === 'html') {
    // Basic HTML validation
    const openTags = (input.match(/<\w+[^/>]*>/g) || []).length;
    const closeTags = (input.match(/<\/\w+>/g) || []).length;
    const selfClosing = (input.match(/<\w+[^>]*\/>/g) || []).length;
    
    if (openTags !== closeTags + selfClosing) {
      errors.push({
        type: 'structure',
        message: 'Mismatched HTML tags detected'
      });
    }
  }

  return errors;
}

/**
 * Extract line number from error message
 * @param {string} message - Error message
 * @returns {number|null} Line number or null
 */
function extractLineNumber(message) {
  const match = message.match(/line (\d+)/i);
  return match ? parseInt(match[1]) : null;
}

export default {
  detectFormat,
  isTechnicalFormat,
  validateFormat
};
