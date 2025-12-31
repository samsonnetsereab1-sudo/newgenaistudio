/**
 * Gemini to NewGen Adapter
 * Main adapter that orchestrates format detection and conversion
 */

import { detectFormat, validateFormat } from './format-detector.js';
import { parseJSX, extractComponentName } from './jsx-parser.js';
import { convertHTMLToAppSpec } from './html-converter.js';
import { convertClassNameToStyle } from './style-mapper.js';

/**
 * Custom component to NewGen component mapping
 */
const customComponentMapping = {
  'DatePicker': { type: 'form-field', props: { type: 'date' } },
  'TimePicker': { type: 'form-field', props: { type: 'time' } },
  'Select': { type: 'form-field', props: { type: 'select' } },
  'Dropdown': { type: 'form-field', props: { type: 'select' } },
  'DataGrid': { type: 'table', props: {} },
  'Table': { type: 'table', props: {} },
  'Chart': { type: 'widget', props: { widgetType: 'chart' } },
  'Graph': { type: 'widget', props: { widgetType: 'graph' } },
  'Card': { type: 'container', props: {} },
  'Panel': { type: 'section', props: {} },
  'Modal': { type: 'container', props: {} },
  'Dialog': { type: 'container', props: {} },
  'Form': { type: 'form', props: {} },
  'Input': { type: 'form-field', props: { type: 'text' } },
  'TextArea': { type: 'form-field', props: { type: 'textarea' } },
  'Button': { type: 'button', props: {} },
  'Calendar': { type: 'widget', props: { widgetType: 'calendar' } },
  'Scheduler': { type: 'widget', props: { widgetType: 'scheduler' } },
  'Gantt': { type: 'widget', props: { widgetType: 'gantt' } },
  'Kanban': { type: 'widget', props: { widgetType: 'kanban' } },
  'Timeline': { type: 'widget', props: { widgetType: 'timeline' } }
};

/**
 * Adapt any input format to NewGen AppSpec
 * @param {string} input - User input in any format
 * @param {object} options - Adaptation options
 * @returns {object} NewGen AppSpec-compatible object
 */
export async function adaptToNewGen(input, options = {}) {
  const { preserveMetadata = true } = options;

  try {
    // Detect input format
    const detection = detectFormat(input);
    console.log(`[Adapter] Detected format: ${detection.format} (confidence: ${detection.confidence})`);

    // Validate format
    const errors = validateFormat(input, detection.format);
    if (errors.length > 0 && detection.format !== 'natural-language') {
      console.warn('[Adapter] Format validation errors:', errors);
    }

    let appSpec;

    // Convert based on detected format
    switch (detection.format) {
      case 'json':
        appSpec = adaptJSON(input, detection.metadata);
        break;
      
      case 'jsx':
        appSpec = adaptJSX(input, detection.metadata);
        break;
      
      case 'html':
        appSpec = adaptHTML(input, detection.metadata);
        break;
      
      case 'component-list':
        appSpec = adaptComponentList(input, detection.metadata);
        break;
      
      case 'natural-language':
      default:
        // Return null to indicate natural language processing needed
        return {
          requiresAI: true,
          format: detection.format,
          input,
          message: 'Natural language input requires AI processing'
        };
    }

    // Add metadata if requested
    if (preserveMetadata) {
      appSpec.metadata = {
        ...appSpec.metadata,
        sourceFormat: detection.format,
        adaptedAt: new Date().toISOString(),
        confidence: detection.confidence,
        originalInput: input.substring(0, 500) // Store preview
      };
    }

    return {
      success: true,
      format: detection.format,
      appSpec,
      validationErrors: errors
    };

  } catch (error) {
    console.error('[Adapter] Adaptation failed:', error);
    return {
      success: false,
      error: error.message,
      format: 'unknown'
    };
  }
}

/**
 * Adapt JSON input to AppSpec
 * @param {string} input - JSON string
 * @param {object} metadata - Detection metadata
 * @returns {object} AppSpec
 */
function adaptJSON(input, metadata) {
  const parsed = metadata.parsed || JSON.parse(input);

  // If already an AppSpec, normalize and return
  if (parsed.layout && parsed.layout.nodes) {
    return normalizeAppSpec(parsed);
  }

  // If has nodes array at root
  if (Array.isArray(parsed.nodes)) {
    return {
      status: 'ok',
      version: '2.0',
      domain: parsed.domain || 'generic',
      layout: {
        id: parsed.id || `layout-${generateId()}`,
        name: parsed.name || 'Generated App',
        domain: parsed.domain || 'generic',
        nodes: parsed.nodes.map(node => normalizeNode(node))
      }
    };
  }

  // If has children array at root
  if (Array.isArray(parsed.children)) {
    return {
      status: 'ok',
      version: '2.0',
      domain: parsed.domain || 'generic',
      layout: {
        id: parsed.id || `layout-${generateId()}`,
        name: parsed.name || 'Generated App',
        domain: parsed.domain || 'generic',
        nodes: parsed.children.map(node => normalizeNode(node))
      }
    };
  }

  // Single object - wrap in page
  return {
    status: 'ok',
    version: '2.0',
    domain: 'generic',
    layout: {
      id: `layout-${generateId()}`,
      name: 'Generated App',
      domain: 'generic',
      nodes: [{
        id: `page-${generateId()}`,
        type: 'page',
        props: { title: 'Main' },
        children: [normalizeNode(parsed)]
      }]
    }
  };
}

/**
 * Adapt JSX input to AppSpec
 * @param {string} input - JSX string
 * @param {object} metadata - Detection metadata
 * @returns {object} AppSpec
 */
function adaptJSX(input, metadata) {
  const parsed = parseJSX(input);
  
  if (!parsed.success) {
    throw new Error(`JSX parsing failed: ${parsed.error}`);
  }

  // Convert JSX tree to AppSpec nodes
  const nodes = parsed.tree.map(element => convertJSXToNode(element));

  // Wrap in page structure
  const wrappedNodes = wrapInPage(nodes);

  return {
    status: 'ok',
    version: '2.0',
    domain: 'generic',
    layout: {
      id: `layout-${generateId()}`,
      name: extractComponentName(input) || 'Generated App',
      domain: 'generic',
      nodes: wrappedNodes
    },
    metadata: {
      source: 'jsx',
      hasState: parsed.metadata.hasState,
      hasEffects: parsed.metadata.hasEffects,
      imports: parsed.metadata.imports
    }
  };
}

/**
 * Convert JSX element to AppSpec node
 * @param {object} element - JSX element
 * @returns {object} AppSpec node
 */
function convertJSXToNode(element) {
  // Handle text nodes
  if (element.type === 'text') {
    return {
      id: generateId(),
      type: 'text',
      props: { content: element.content }
    };
  }

  // Check if it's a custom component
  const customMapping = customComponentMapping[element.type];
  const type = customMapping?.type || mapJSXTypeToNewGen(element.type);

  // Convert props
  const props = convertJSXProps(element.props, type);
  
  // Merge custom component props
  if (customMapping?.props) {
    Object.assign(props, customMapping.props);
  }

  // Convert children
  const children = element.children && element.children.length > 0
    ? element.children.map(child => convertJSXToNode(child))
    : undefined;

  const node = {
    id: element.props?.id || generateId(),
    type,
    props
  };

  if (children && children.length > 0) {
    node.children = children;
  }

  return node;
}

/**
 * Map JSX component type to NewGen type
 * @param {string} jsxType - JSX component type
 * @returns {string} NewGen component type
 */
function mapJSXTypeToNewGen(jsxType) {
  const mapping = {
    'div': 'container',
    'section': 'section',
    'form': 'form',
    'table': 'table',
    'input': 'form-field',
    'button': 'button',
    'p': 'text',
    'h1': 'text',
    'h2': 'text',
    'h3': 'text',
    'span': 'text',
    'ul': 'list',
    'ol': 'list'
  };

  return mapping[jsxType.toLowerCase()] || 'container';
}

/**
 * Convert JSX props to NewGen props
 * @param {object} jsxProps - JSX props
 * @param {string} type - NewGen component type
 * @returns {object} NewGen props
 */
function convertJSXProps(jsxProps, type) {
  const props = {};

  // Convert className to style
  const convertedProps = convertClassNameToStyle(jsxProps);

  // Extract common props
  Object.keys(convertedProps).forEach(key => {
    if (!['children', 'key', 'ref'].includes(key)) {
      props[key] = convertedProps[key];
    }
  });

  // Type-specific conversions
  if (type === 'button' && !props.label) {
    props.label = props.children || props.value || 'Button';
    delete props.children;
    delete props.value;
  }

  return props;
}

/**
 * Adapt HTML input to AppSpec
 * @param {string} input - HTML string
 * @param {object} metadata - Detection metadata
 * @returns {object} AppSpec
 */
function adaptHTML(input, metadata) {
  return convertHTMLToAppSpec(input);
}

/**
 * Adapt component list to AppSpec
 * @param {string} input - Component list
 * @param {object} metadata - Detection metadata
 * @returns {object} AppSpec
 */
function adaptComponentList(input, metadata) {
  const lines = input.split('\n').filter(l => l.trim());
  const components = [];

  for (const line of lines) {
    const trimmed = line.trim();
    
    // Try to find a known component
    for (const [customType, mapping] of Object.entries(customComponentMapping)) {
      if (trimmed.includes(customType)) {
        const node = {
          id: generateId(),
          type: mapping.type,
          props: { ...mapping.props }
        };
        
        // Try to extract a label or title
        const labelMatch = trimmed.match(/:\s*(.+)/);
        if (labelMatch) {
          if (node.type === 'button') {
            node.props.label = labelMatch[1].trim();
          } else {
            node.props.title = labelMatch[1].trim();
          }
        }
        
        components.push(node);
        break;
      }
    }
  }

  // If no components found, create a simple layout
  if (components.length === 0) {
    components.push({
      id: generateId(),
      type: 'text',
      props: { content: 'No recognizable components found' }
    });
  }

  return {
    status: 'ok',
    version: '2.0',
    domain: 'generic',
    layout: {
      id: `layout-${generateId()}`,
      name: 'Component List App',
      domain: 'generic',
      nodes: [{
        id: `page-${generateId()}`,
        type: 'page',
        props: { title: 'Components' },
        children: [{
          id: `section-${generateId()}`,
          type: 'section',
          props: { title: 'Main Section' },
          children: components
        }]
      }]
    }
  };
}

/**
 * Normalize AppSpec to standard format
 * @param {object} spec - AppSpec to normalize
 * @returns {object} Normalized AppSpec
 */
function normalizeAppSpec(spec) {
  return {
    status: spec.status || 'ok',
    version: spec.version || '2.0',
    domain: spec.domain || spec.layout?.domain || 'generic',
    layout: spec.layout || {
      id: spec.id || `layout-${generateId()}`,
      name: spec.name || 'Generated App',
      domain: spec.domain || 'generic',
      nodes: spec.nodes || spec.children || []
    }
  };
}

/**
 * Normalize a single node
 * @param {object} node - Node to normalize
 * @returns {object} Normalized node
 */
function normalizeNode(node) {
  const normalized = {
    id: node.id || generateId(),
    type: node.type || 'container',
    props: node.props || {}
  };

  if (node.children && Array.isArray(node.children)) {
    normalized.children = node.children.map(child => normalizeNode(child));
  }

  return normalized;
}

/**
 * Wrap nodes in page structure if needed
 * @param {array} nodes - Array of nodes
 * @returns {array} Wrapped nodes
 */
function wrapInPage(nodes) {
  const hasPage = nodes.some(n => n.type === 'page');
  
  if (hasPage) {
    return nodes;
  }

  return [{
    id: `page-${generateId()}`,
    type: 'page',
    props: { title: 'Main Page' },
    children: [{
      id: `section-${generateId()}`,
      type: 'section',
      props: { title: 'Content' },
      children: nodes
    }]
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
  adaptToNewGen,
  customComponentMapping
};
