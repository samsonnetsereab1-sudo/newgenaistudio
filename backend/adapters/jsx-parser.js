/**
 * JSX Parser
 * Parses React JSX code and extracts component hierarchy
 */

/**
 * Parse JSX string into component tree
 * @param {string} jsxCode - JSX code string
 * @returns {object} Parsed component tree
 */
export function parseJSX(jsxCode) {
  if (!jsxCode || typeof jsxCode !== 'string') {
    throw new Error('Invalid JSX code');
  }

  try {
    // Extract the main return statement or component body
    const componentBody = extractComponentBody(jsxCode);
    
    // Parse JSX elements into tree structure
    const tree = parseJSXElements(componentBody);
    
    // Extract props from JSX
    const props = extractPropsFromJSX(componentBody);
    
    return {
      success: true,
      tree,
      props,
      metadata: {
        hasState: /useState|useReducer/.test(jsxCode),
        hasEffects: /useEffect|useLayoutEffect/.test(jsxCode),
        hasRefs: /useRef|createRef/.test(jsxCode),
        imports: extractImports(jsxCode)
      }
    };
  } catch (error) {
    return {
      success: false,
      error: error.message,
      tree: null
    };
  }
}

/**
 * Extract component body from JSX code
 * @param {string} code - JSX code
 * @returns {string} Component body
 */
function extractComponentBody(code) {
  // Try to find return statement
  const returnMatch = code.match(/return\s*\(([\s\S]*?)\);?\s*}/);
  if (returnMatch) {
    return returnMatch[1].trim();
  }

  // Try to find arrow function body
  const arrowMatch = code.match(/=>\s*\(([\s\S]*?)\)/);
  if (arrowMatch) {
    return arrowMatch[1].trim();
  }

  // Try to find direct JSX (for simple components)
  const jsxMatch = code.match(/<[\s\S]*>/);
  if (jsxMatch) {
    return jsxMatch[0];
  }

  return code;
}

/**
 * Parse JSX elements into a tree structure
 * @param {string} jsx - JSX string
 * @returns {array} Array of element nodes
 */
function parseJSXElements(jsx) {
  const elements = [];
  const stack = [];
  let currentPos = 0;

  // Simple regex-based parsing (not perfect but works for most cases)
  const tagRegex = /<(\/)?([\w.]+)([^>]*?)(\/)?>|([^<]+)/g;
  let match;

  while ((match = tagRegex.exec(jsx)) !== null) {
    const [full, isClosing, tagName, attrs, selfClosing, textContent] = match;

    if (textContent && textContent.trim()) {
      // Text content
      if (stack.length > 0) {
        const parent = stack[stack.length - 1];
        if (!parent.children) parent.children = [];
        parent.children.push({
          type: 'text',
          content: textContent.trim()
        });
      }
    } else if (tagName) {
      if (isClosing) {
        // Closing tag
        if (stack.length > 0) {
          const element = stack.pop();
          if (stack.length === 0) {
            elements.push(element);
          } else {
            const parent = stack[stack.length - 1];
            if (!parent.children) parent.children = [];
            parent.children.push(element);
          }
        }
      } else {
        // Opening tag
        const element = {
          type: tagName,
          props: parseAttributes(attrs),
          children: []
        };

        if (selfClosing) {
          // Self-closing tag
          if (stack.length === 0) {
            elements.push(element);
          } else {
            const parent = stack[stack.length - 1];
            if (!parent.children) parent.children = [];
            parent.children.push(element);
          }
        } else {
          stack.push(element);
        }
      }
    }
  }

  // Handle any remaining elements in stack
  while (stack.length > 0) {
    elements.push(stack.pop());
  }

  return elements;
}

/**
 * Parse HTML/JSX attributes into props object
 * @param {string} attrString - Attribute string
 * @returns {object} Props object
 */
function parseAttributes(attrString) {
  const props = {};
  if (!attrString) return props;

  // Match attributes: name="value" or name={value}
  const attrRegex = /(\w+)(?:=(?:"([^"]*)"|'([^']*)'|{([^}]*)}|(\w+)))?/g;
  let match;

  while ((match = attrRegex.exec(attrString)) !== null) {
    const [, name, doubleQuoted, singleQuoted, braced, unquoted] = match;
    const value = doubleQuoted || singleQuoted || braced || unquoted || true;
    
    if (name && !['className', 'style'].includes(name)) {
      props[name] = value;
    } else if (name === 'className') {
      props.className = value;
    } else if (name === 'style') {
      props.style = value;
    }
  }

  return props;
}

/**
 * Extract all props from JSX code
 * @param {string} jsx - JSX code
 * @returns {object} Props object
 */
function extractPropsFromJSX(jsx) {
  const allProps = {};
  const propRegex = /(\w+)=(?:{([^}]+)}|"([^"]+)"|'([^']+)')/g;
  let match;

  while ((match = propRegex.exec(jsx)) !== null) {
    const [, name, braced, doubleQuoted, singleQuoted] = match;
    const value = braced || doubleQuoted || singleQuoted;
    if (name) {
      allProps[name] = value;
    }
  }

  return allProps;
}

/**
 * Extract imports from JSX code
 * @param {string} code - JSX code
 * @returns {array} Array of import statements
 */
function extractImports(code) {
  const imports = [];
  const importRegex = /import\s+(?:{([^}]+)}|(\w+))\s+from\s+['"]([^'"]+)['"]/g;
  let match;

  while ((match = importRegex.exec(code)) !== null) {
    const [, named, defaultImport, source] = match;
    imports.push({
      named: named ? named.split(',').map(n => n.trim()) : [],
      default: defaultImport || null,
      source
    });
  }

  return imports;
}

/**
 * Extract component name from JSX code
 * @param {string} code - JSX code
 * @returns {string|null} Component name
 */
export function extractComponentName(code) {
  // Try function declaration
  const funcMatch = code.match(/function\s+(\w+)/);
  if (funcMatch) return funcMatch[1];

  // Try const/let declaration
  const constMatch = code.match(/(?:const|let)\s+(\w+)\s*=/);
  if (constMatch) return constMatch[1];

  // Try export default function
  const exportMatch = code.match(/export\s+default\s+function\s+(\w+)/);
  if (exportMatch) return exportMatch[1];

  return null;
}

export default {
  parseJSX,
  extractComponentName,
  extractImports
};
