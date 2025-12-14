/**
 * Complete AppSpec Schema for Staged Generation
 * This is the single source of truth for app specifications
 */

export const FullAppSpecSchema = {
  // Metadata
  appId: 'string',
  version: 'string',
  createdAt: 'date',
  updatedAt: 'date',
  mode: 'generated|refined|demo',
  
  // Domain and intent
  metadata: {
    name: 'string',
    description: 'string',
    domain: 'string', // 'biologics' | 'pharma' | 'clinical' | 'generic'
    intentSummary: 'string'
  },
  
  // Data model
  entities: [
    {
      name: 'string',
      pluralName: 'string',
      fields: [
        {
          name: 'string',
          type: 'string', // 'string' | 'number' | 'date' | 'enum' | 'reference'
          required: 'boolean',
          enumValues: ['string'],
          reference: 'string' // entity name if type is 'reference'
        }
      ],
      relationships: [
        {
          type: 'oneToMany|manyToOne|manyToMany',
          target: 'string',
          field: 'string'
        }
      ]
    }
  ],
  
  // Workflow states (optional)
  workflows: [
    {
      id: 'string',
      name: 'string',
      entity: 'string',
      statuses: ['string'],
      transitions: [
        {
          from: 'string',
          to: 'string',
          action: 'string'
        }
      ]
    }
  ],
  
  // UI Pages
  pages: [
    {
      id: 'string',
      type: 'dashboard|list|create|detail|edit',
      title: 'string',
      entity: 'string',
      components: ['string'] // component IDs
    }
  ],
  
  // UI Components
  components: [
    {
      id: 'string',
      type: 'table|form|card|chart|button|text|input',
      props: {
        title: 'string',
        columns: ['string'],
        fields: [
          {
            name: 'string',
            label: 'string',
            type: 'string',
            required: 'boolean'
          }
        ],
        label: 'string',
        variant: 'string'
      },
      actions: ['string'] // action IDs
    }
  ],
  
  // Actions and navigation
  actions: [
    {
      id: 'string',
      type: 'navigate|create|update|delete|custom',
      trigger: 'onClick|onSubmit|onRowClick',
      target: 'string', // page ID or URL
      params: {}
    }
  ],
  
  // Data sources
  dataSources: [
    {
      id: 'string',
      entity: 'string',
      query: 'string',
      filters: []
    }
  ],
  
  // Compliance flags (optional)
  complianceFlags: {
    gxp: 'boolean',
    audit: 'boolean',
    encryption: 'boolean'
  }
};

/**
 * Validate full AppSpec
 */
export function validateFullAppSpec(spec) {
  const errors = [];
  
  if (!spec || typeof spec !== 'object') {
    return { valid: false, errors: ['AppSpec must be an object'] };
  }
  
  // Required top-level fields
  if (!spec.metadata) errors.push('Missing required field: metadata');
  if (!spec.metadata?.name) errors.push('metadata.name is required');
  if (!spec.entities || !Array.isArray(spec.entities)) {
    errors.push('entities array is required');
  }
  if (!spec.pages || !Array.isArray(spec.pages)) {
    errors.push('pages array is required');
  }
  if (!spec.components || !Array.isArray(spec.components)) {
    errors.push('components array is required');
  }
  
  // Validate entities
  spec.entities?.forEach((entity, i) => {
    if (!entity.name) errors.push(`Entity ${i}: name is required`);
    if (!entity.fields || !Array.isArray(entity.fields)) {
      errors.push(`Entity ${i}: fields array is required`);
    }
    entity.fields?.forEach((field, j) => {
      if (!field.name) errors.push(`Entity ${i}, field ${j}: name is required`);
      if (!field.type) errors.push(`Entity ${i}, field ${j}: type is required`);
    });
  });
  
  // Validate pages
  spec.pages?.forEach((page, i) => {
    if (!page.id) errors.push(`Page ${i}: id is required`);
    if (!page.type) errors.push(`Page ${i}: type is required`);
    if (!page.title) errors.push(`Page ${i}: title is required`);
  });
  
  // Validate components
  spec.components?.forEach((component, i) => {
    if (!component.id) errors.push(`Component ${i}: id is required`);
    if (!component.type) errors.push(`Component ${i}: type is required`);
  });
  
  return {
    valid: errors.length === 0,
    errors
  };
}

/**
 * Convert full AppSpec to legacy format for frontend compatibility
 */
export function fullAppSpecToLegacy(fullSpec) {
  // Build a layout tree from pages and components
  const nodes = fullSpec.pages.map(page => {
    const pageNode = {
      id: page.id,
      type: 'page',
      props: { title: page.title },
      children: []
    };
    
    // Add components to page
    page.components?.forEach(componentId => {
      const component = fullSpec.components.find(c => c.id === componentId);
      if (component) {
        pageNode.children.push({
          id: component.id,
          type: component.type,
          props: component.props || {},
          children: []
        });
      }
    });
    
    return pageNode;
  });
  
  return {
    status: 'ok',
    version: fullSpec.version || '2.0',
    domain: fullSpec.metadata.domain || 'generic',
    layout: {
      id: fullSpec.appId || `layout-${Date.now()}`,
      name: fullSpec.metadata.name,
      domain: fullSpec.metadata.domain || 'generic',
      nodes
    },
    schema: {
      entities: fullSpec.entities || [],
      workflows: fullSpec.workflows || []
    },
    files: {}, // TODO: Generate files from spec
    messages: []
  };
}
