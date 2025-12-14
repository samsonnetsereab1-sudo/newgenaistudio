/**
 * AppSpec Schema - The contract between generator and renderer
 * 
 * This is THE source of truth for what an app specification looks like.
 * All generators MUST produce this format.
 * All renderers MUST consume this format.
 */

export const AppSpecSchema = {
  // Top-level metadata
  status: 'string', // 'ok' | 'error'
  version: 'string', // '1.0'
  domain: 'string', // 'biologics' | 'pharma' | 'clinical' | 'generic'
  
  // The actual app structure
  layout: {
    id: 'string',
    name: 'string',
    domain: 'string',
    nodes: [] // Array of UINode (see below)
  },
  
  // Structured data model (optional, for complex apps)
  schema: {
    entities: [], // { name, fields[], relationships[] }
    workflows: [], // { id, name, steps[], transitions[] }
    roles: [], // { name, permissions[] }
    validations: [] // { field, rules[] }
  },
  
  // Generated code files
  files: {
    'App.jsx': 'string', // React component code
    'schema.json': 'string', // Data model
    'README.md': 'string' // Documentation
  },
  
  // AI assistant messages
  messages: [
    { role: 'string', content: 'string' }
  ]
};

/**
 * UINode - Individual UI element in the layout tree
 */
export const UINodeSchema = {
  id: 'string', // Unique identifier
  type: 'string', // 'page' | 'section' | 'card' | 'form' | 'table' | 'chart' | 'input' | 'button'
  props: {
    // Common props
    title: 'string',
    label: 'string',
    placeholder: 'string',
    style: {},
    
    // Table props
    columns: ['string'],
    rows: [['string']],
    
    // Form props
    fields: [],
    onSubmit: 'string',
    
    // Button props
    onClick: 'string',
    variant: 'string' // 'primary' | 'secondary' | 'ghost'
  },
  children: [] // Array of UINode (recursive)
};

/**
 * Validate an AppSpec against the schema
 */
export function validateAppSpec(spec) {
  const errors = [];
  
  if (!spec || typeof spec !== 'object') {
    return { valid: false, errors: ['AppSpec must be an object'] };
  }
  
  // Required fields
  if (!spec.status) errors.push('Missing required field: status');
  if (!spec.layout) errors.push('Missing required field: layout');
  if (!spec.layout?.nodes) errors.push('layout must have nodes array');
  
  // Validate nodes have required fields
  if (spec.layout?.nodes) {
    spec.layout.nodes.forEach((node, i) => {
      if (!node.id) errors.push(`Node ${i}: missing id`);
      if (!node.type) errors.push(`Node ${i}: missing type`);
    });
  }
  
  return {
    valid: errors.length === 0,
    errors
  };
}

/**
 * Transform any generator output to valid AppSpec
 * Use this as a safety layer
 */
export function normalizeToAppSpec(rawOutput) {
  // If already valid, return as-is
  const validation = validateAppSpec(rawOutput);
  if (validation.valid) {
    return rawOutput;
  }
  
  // Try to salvage what we can
  return {
    status: rawOutput.status || 'ok',
    version: '1.0',
    domain: rawOutput.domain || 'generic',
    layout: {
      id: rawOutput.layout?.id || `layout-${Date.now()}`,
      name: rawOutput.layout?.name || 'Generated App',
      domain: rawOutput.layout?.domain || 'generic',
      nodes: rawOutput.layout?.nodes || rawOutput.schema?.nodes || []
    },
    schema: rawOutput.schema || null,
    files: rawOutput.files || {},
    messages: rawOutput.messages || []
  };
}

/**
 * Convert AppSpec to frontend-compatible format
 * This is the bridge between backend AppSpec and frontend expectations
 */
export function appSpecToFrontend(spec) {
  const validation = validateAppSpec(spec);
  
  if (!validation.valid) {
    throw new Error(`Invalid AppSpec: ${validation.errors.join(', ')}`);
  }
  
  return {
    status: spec.status,
    children: spec.layout.nodes, // Frontend expects 'children' not 'nodes'
    meta: {
      version: spec.version,
      domain: spec.domain,
      files: spec.files,
      messages: spec.messages,
      schema: spec.schema
    }
  };
}

/**
 * Example valid AppSpec
 */
export const ExampleAppSpec = {
  status: 'ok',
  version: '1.0',
  domain: 'biologics',
  layout: {
    id: 'sample-mgmt-app',
    name: 'Sample Management',
    domain: 'biologics',
    nodes: [
      {
        id: 'page-1',
        type: 'page',
        props: { title: 'Sample Management' },
        children: [
          {
            id: 'section-1',
            type: 'section',
            props: { title: 'Overview' },
            children: [
              {
                id: 'card-1',
                type: 'card',
                props: {},
                children: [
                  {
                    id: 'header-1',
                    type: 'header',
                    props: { title: 'Sample Entry Form' },
                    children: []
                  }
                ]
              }
            ]
          }
        ]
      }
    ]
  },
  schema: {
    entities: [
      {
        name: 'Sample',
        fields: [
          { name: 'id', type: 'string', required: true },
          { name: 'batchLot', type: 'string', required: true },
          { name: 'materialType', type: 'string', required: true },
          { name: 'status', type: 'enum', options: ['Received', 'Quarantined', 'In Testing', 'Released', 'Rejected'] }
        ]
      }
    ],
    workflows: [
      {
        id: 'sample-lifecycle',
        name: 'Sample Lifecycle',
        steps: ['Received', 'Quarantined', 'In Testing', 'Released/Rejected']
      }
    ],
    roles: [
      { name: 'QC Analyst', permissions: ['test_sample', 'view_results'] },
      { name: 'QA Manager', permissions: ['release_sample', 'reject_sample', 'view_audit'] }
    ]
  },
  files: {
    'App.jsx': '// Generated React component code',
    'schema.json': '{ "version": "1.0" }'
  },
  messages: [
    {
      role: 'assistant',
      content: 'Generated GMP-compliant sample management app with chain of custody tracking'
    }
  ]
};
