/**
 * HTML Converter
 * Converts HTML structure to NewGen AppSpec format
 */

import { convertClassNameToStyle, parseCSSString } from './style-mapper.js';

/**
 * HTML tag to NewGen component type mapping
 */
const typeMapping = {
  'div': 'container',
  'section': 'section',
  'article': 'section',
  'main': 'section',
  'aside': 'section',
  'header': 'section',
  'footer': 'section',
  'nav': 'section',
  'form': 'form',
  'table': 'table',
  'tbody': 'container',
  'thead': 'container',
  'tr': 'container',
  'th': 'text',
  'td': 'text',
  'input': 'form-field',
  'textarea': 'form-field',
  'select': 'form-field',
  'button': 'button',
  'a': 'button',
  'p': 'text',
  'h1': 'text',
  'h2': 'text',
  'h3': 'text',
  'h4': 'text',
  'h5': 'text',
  'h6': 'text',
  'span': 'text',
  'label': 'text',
  'ul': 'list',
  'ol': 'list',
  'li': 'text'
};

/**
 * Convert HTML string to NewGen AppSpec
 * @param {string} html - HTML string
 * @returns {object} AppSpec-compatible object
 */
export function convertHTMLToAppSpec(html) {
  if (!html || typeof html !== 'string') {
    throw new Error('Invalid HTML input');
  }

  try {
    // Parse HTML into DOM-like structure
    const elements = parseHTML(html);
    
    // Convert to AppSpec nodes
    const nodes = elements.map(el => convertElementToNode(el));
    
    // Wrap in a page if not already structured
    const wrappedNodes = wrapInPage(nodes);
    
    return {
      status: 'ok',
      version: '2.0',
      domain: 'generic',
      layout: {
        id: `layout-${generateId()}`,
        name: 'Converted from HTML',
        domain: 'generic',
        nodes: wrappedNodes
      },
      metadata: {
        source: 'html',
        convertedAt: new Date().toISOString()
      }
    };
  } catch (error) {
    throw new Error(`HTML conversion failed: ${error.message}`);
  }
}

/**
 * Parse HTML string into element tree
 * @param {string} html - HTML string
 * @returns {array} Array of element objects
 */
function parseHTML(html) {
  const elements = [];
  const stack = [];
  
  // Simple regex-based HTML parsing
  const tagRegex = /<(\/)?([\w-]+)([^>]*?)(\/)?>|([^<]+)/g;
  let match;

  while ((match = tagRegex.exec(html)) !== null) {
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
      } else {
        elements.push({
          type: 'text',
          content: textContent.trim()
        });
      }
    } else if (tagName) {
      // Skip script, style, and meta tags
      if (['script', 'style', 'meta', 'link'].includes(tagName.toLowerCase())) {
        continue;
      }

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
          tag: tagName.toLowerCase(),
          attrs: parseHTMLAttributes(attrs),
          children: []
        };

        if (selfClosing || ['input', 'img', 'br', 'hr'].includes(element.tag)) {
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
 * Parse HTML attributes
 * @param {string} attrString - Attribute string
 * @returns {object} Attributes object
 */
function parseHTMLAttributes(attrString) {
  const attrs = {};
  if (!attrString) return attrs;

  const attrRegex = /(\w+)(?:=(?:"([^"]*)"|'([^']*)'|(\w+)))?/g;
  let match;

  while ((match = attrRegex.exec(attrString)) !== null) {
    const [, name, doubleQuoted, singleQuoted, unquoted] = match;
    const value = doubleQuoted || singleQuoted || unquoted || true;
    attrs[name] = value;
  }

  return attrs;
}

/**
 * Convert HTML element to AppSpec node
 * @param {object} element - Parsed HTML element
 * @returns {object} AppSpec node
 */
function convertElementToNode(element) {
  // Handle text nodes
  if (element.type === 'text') {
    return {
      id: generateId(),
      type: 'text',
      props: {
        content: element.content
      }
    };
  }

  // Determine NewGen component type
  const type = typeMapping[element.tag] || 'container';
  
  // Extract and convert props
  const props = extractProps(element, type);
  
  // Convert children recursively
  const children = element.children && element.children.length > 0
    ? element.children.map(child => convertElementToNode(child))
    : undefined;

  const node = {
    id: element.attrs?.id || generateId(),
    type,
    props
  };

  if (children && children.length > 0) {
    node.children = children;
  }

  return node;
}

/**
 * Extract props from HTML element
 * @param {object} element - HTML element
 * @param {string} type - NewGen component type
 * @returns {object} Props object
 */
function extractProps(element, type) {
  const props = {};
  const attrs = element.attrs || {};

  // Convert className and style
  const styledProps = convertClassNameToStyle(attrs);
  
  // Extract common attributes
  if (attrs.title) props.title = attrs.title;
  if (attrs.placeholder) props.placeholder = attrs.placeholder;
  if (attrs.value) props.value = attrs.value;
  if (attrs.name) props.name = attrs.name;
  
  // Type-specific props
  if (type === 'form-field') {
    props.type = attrs.type || 'text';
    props.label = attrs.label || attrs.placeholder || attrs.name || '';
    if (attrs.required) props.required = true;
  }
  
  if (type === 'button') {
    props.label = element.children?.[0]?.content || attrs.value || 'Button';
    props.variant = 'primary';
  }
  
  if (type === 'text') {
    // Extract text content from first text child
    const textChild = element.children?.find(c => c.type === 'text');
    if (textChild) {
      props.content = textChild.content;
    }
    
    // Determine text variant based on tag
    if (['h1', 'h2', 'h3'].includes(element.tag)) {
      props.variant = 'heading';
    }
  }
  
  if (type === 'table') {
    // Extract columns from table headers if present
    const thead = element.children?.find(c => c.tag === 'thead');
    if (thead) {
      const headerRow = thead.children?.find(c => c.tag === 'tr');
      if (headerRow) {
        props.columns = headerRow.children
          ?.filter(c => c.tag === 'th')
          .map(th => {
            const textChild = th.children?.find(c => c.type === 'text');
            return textChild?.content || 'Column';
          }) || [];
      }
    }
    
    if (!props.columns || props.columns.length === 0) {
      props.columns = ['Column 1', 'Column 2', 'Column 3'];
    }
  }

  // Merge converted styles
  if (styledProps.style) {
    props.style = styledProps.style;
  }

  return props;
}

/**
 * Wrap nodes in a page structure if needed
 * @param {array} nodes - Array of nodes
 * @returns {array} Wrapped nodes
 */
function wrapInPage(nodes) {
  // Check if already has page structure
  const hasPage = nodes.some(n => n.type === 'page');
  
  if (hasPage) {
    return nodes;
  }

  // Wrap in a page
  return [{
    id: `page-${generateId()}`,
    type: 'page',
    props: { title: 'Main Page' },
    children: nodes.length > 0 ? [{
      id: `section-${generateId()}`,
      type: 'section',
      props: { title: 'Content' },
      children: nodes
    }] : []
  }];
}

/**
 * Generate unique ID
 * @returns {string} Unique ID
 */
function generateId() {
  return Math.random().toString(36).substring(2, 10);
}

export default {
  convertHTMLToAppSpec
};
