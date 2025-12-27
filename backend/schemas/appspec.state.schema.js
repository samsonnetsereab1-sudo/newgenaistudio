/**
 * AppSpec v2.0 State Schema
 * Complete JSON Schema for AppSpec with state management, data sources, and actions
 */

import Ajv from 'ajv';

/**
 * AppSpec v2.0 JSON Schema
 */
export const AppSpecStateSchema = {
  type: 'object',
  required: ['status', 'version', 'layout'],
  properties: {
    status: {
      type: 'string',
      enum: ['ok', 'error']
    },
    version: {
      type: 'string',
      const: '2.0'
    },
    layout: {
      type: 'object',
      required: ['id', 'name', 'domain', 'nodes'],
      properties: {
        id: { type: 'string' },
        name: { type: 'string' },
        domain: { type: 'string' },
        nodes: {
          type: 'array',
          items: { $ref: '#/$defs/UINode' }
        }
      }
    },
    state: {
      type: 'object',
      properties: {
        global: { type: 'object' },
        pages: {
          type: 'object',
          patternProperties: {
            '.*': { type: 'object' }
          }
        }
      }
    },
    dataSources: {
      type: 'array',
      items: { $ref: '#/$defs/DataSource' }
    },
    actions: {
      type: 'array',
      items: { $ref: '#/$defs/Action' }
    },
    workflows: {
      type: 'array',
      items: { $ref: '#/$defs/Workflow' }
    },
    files: {
      type: 'object',
      patternProperties: {
        '.*': { type: 'string' }
      }
    },
    messages: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          role: { type: 'string' },
          content: { type: 'string' }
        }
      }
    },
    problems: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          severity: { type: 'string', enum: ['error', 'warning', 'info'] },
          message: { type: 'string' }
        }
      }
    }
  },
  $defs: {
    UINode: {
      type: 'object',
      required: ['id', 'type'],
      properties: {
        id: { type: 'string' },
        type: {
          type: 'string',
          enum: [
            'page', 'section', 'card', 'form', 'table', 'chart',
            'input', 'textarea', 'button', 'text', 'header',
            'select', 'checkbox', 'radio', 'list'
          ]
        },
        props: { type: 'object' },
        children: {
          type: 'array',
          items: { $ref: '#/$defs/UINode' }
        }
      }
    },
    DataSource: {
      type: 'object',
      required: ['id', 'type', 'url'],
      properties: {
        id: { type: 'string' },
        type: {
          type: 'string',
          enum: ['rest', 'websocket', 'graphql', 'postgres']
        },
        url: { type: 'string' },
        methods: {
          type: 'array',
          items: {
            type: 'string',
            enum: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH']
          }
        },
        config: { type: 'object' },
        polling: {
          type: 'object',
          properties: {
            interval: { type: 'number' },
            enabled: { type: 'boolean' }
          }
        }
      }
    },
    Action: {
      type: 'object',
      required: ['id', 'trigger', 'effects'],
      properties: {
        id: { type: 'string' },
        trigger: { type: 'string' },
        effects: {
          type: 'array',
          items: { $ref: '#/$defs/Effect' }
        }
      }
    },
    Effect: {
      type: 'object',
      required: ['type'],
      properties: {
        type: {
          type: 'string',
          enum: [
            'validate', 'api-call', 'update-state', 'notify',
            'navigate', 'conditional', 'loop', 'parallel'
          ]
        },
        // Validate effect
        rules: { type: 'object' },
        // API call effect
        dataSource: { type: 'string' },
        method: { type: 'string' },
        body: {},
        // Update state effect
        path: { type: 'string' },
        operation: {
          type: 'string',
          enum: ['set', 'merge', 'append', 'reset', 'increment', 'decrement']
        },
        value: {},
        // Notify effect
        message: { type: 'string' },
        variant: {
          type: 'string',
          enum: ['success', 'error', 'warning', 'info']
        },
        // Navigate effect
        route: { type: 'string' },
        // Conditional effect
        condition: { type: 'string' },
        then: {
          type: 'array',
          items: { $ref: '#/$defs/Effect' }
        },
        else: {
          type: 'array',
          items: { $ref: '#/$defs/Effect' }
        }
      }
    },
    Workflow: {
      type: 'object',
      required: ['id', 'name', 'steps'],
      properties: {
        id: { type: 'string' },
        name: { type: 'string' },
        trigger: {
          type: 'string',
          enum: ['manual', 'auto', 'cron', 'event']
        },
        steps: {
          type: 'array',
          items: {
            type: 'object',
            required: ['id', 'name', 'type'],
            properties: {
              id: { type: 'string' },
              name: { type: 'string' },
              type: {
                type: 'string',
                enum: [
                  'validation', 'api-call', 'llm-task',
                  'conditional', 'loop', 'parallel'
                ]
              },
              rules: { type: 'object' },
              url: { type: 'string' },
              method: { type: 'string' },
              body: {},
              prompt: { type: 'string' },
              condition: { type: 'string' }
            }
          }
        },
        onSuccess: { $ref: '#/$defs/Effect' },
        onError: { $ref: '#/$defs/Effect' }
      }
    }
  }
};

/**
 * Validate AppSpec with state against schema
 * @param {object} spec - AppSpec to validate
 * @returns {object} { valid: boolean, errors: array }
 */
export function validateAppSpecWithState(spec) {
  const ajv = new Ajv({ allErrors: true, strict: false });
  const validate = ajv.compile(AppSpecStateSchema);
  
  const valid = validate(spec);
  
  if (valid) {
    return { valid: true, errors: [] };
  }
  
  const errors = (validate.errors || []).map(err => {
    const path = err.instancePath || 'root';
    return `${path}: ${err.message}`;
  });
  
  console.error('[AppSpec State Validator] Validation failed:');
  errors.forEach(err => console.error(`  - ${err}`));
  
  return { valid: false, errors };
}

/**
 * Validate minimal requirements for AppSpec v2.0
 * Less strict than full schema validation
 */
export function validateMinimalV2(spec) {
  const errors = [];
  
  if (!spec || typeof spec !== 'object') {
    errors.push('Spec must be an object');
    return { valid: false, errors };
  }
  
  if (spec.version !== '2.0') {
    errors.push('Version must be "2.0"');
  }
  
  if (!spec.layout || !spec.layout.nodes || !Array.isArray(spec.layout.nodes)) {
    errors.push('Layout must have nodes array');
  }
  
  if (spec.state && typeof spec.state !== 'object') {
    errors.push('State must be an object');
  }
  
  if (spec.dataSources && !Array.isArray(spec.dataSources)) {
    errors.push('dataSources must be an array');
  }
  
  if (spec.actions && !Array.isArray(spec.actions)) {
    errors.push('actions must be an array');
  }
  
  return {
    valid: errors.length === 0,
    errors
  };
}

/**
 * Convert v1.0 AppSpec to v2.0 with state
 */
export function upgradeToV2(v1Spec) {
  if (!v1Spec) {
    throw new Error('Cannot upgrade null spec');
  }
  
  // If already v2.0, return as-is
  if (v1Spec.version === '2.0') {
    return v1Spec;
  }
  
  return {
    status: v1Spec.status || 'ok',
    version: '2.0',
    layout: v1Spec.layout || {
      id: v1Spec.id || `layout-${Date.now()}`,
      name: v1Spec.name || 'Generated App',
      domain: v1Spec.domain || 'generic',
      nodes: v1Spec.children || v1Spec.layout?.nodes || []
    },
    state: {
      global: {}
    },
    dataSources: [],
    actions: [],
    workflows: [],
    files: v1Spec.files || {},
    messages: v1Spec.messages || []
  };
}

/**
 * Example valid AppSpec v2.0
 */
export const ExampleAppSpecV2 = {
  status: 'ok',
  version: '2.0',
  layout: {
    id: 'sample-tracker-001',
    name: 'Sample Management System',
    domain: 'pharma',
    nodes: [
      {
        id: 'page-main',
        type: 'page',
        props: { title: 'Sample Management' },
        children: [
          {
            id: 'section-form',
            type: 'section',
            props: { title: 'Add Sample' },
            children: [
              {
                id: 'input-sample-id',
                type: 'input',
                props: {
                  label: 'Sample ID',
                  placeholder: 'SMP-XXX',
                  binding: 'state.formData.sampleId'
                }
              },
              {
                id: 'button-submit',
                type: 'button',
                props: { label: 'Submit', variant: 'primary' }
              }
            ]
          },
          {
            id: 'section-table',
            type: 'section',
            props: { title: 'All Samples' },
            children: [
              {
                id: 'table-samples',
                type: 'table',
                props: {
                  title: 'Sample Records',
                  columns: ['Sample ID', 'Batch', 'Status'],
                  dataBinding: 'state.samples'
                }
              }
            ]
          }
        ]
      }
    ]
  },
  state: {
    global: {
      samples: [],
      formData: {
        sampleId: '',
        batch: ''
      }
    }
  },
  dataSources: [
    {
      id: 'samples-api',
      type: 'rest',
      url: '/api/samples',
      methods: ['GET', 'POST', 'PUT']
    }
  ],
  actions: [
    {
      id: 'action-submit-sample',
      trigger: 'button-submit.onClick',
      effects: [
        {
          type: 'validate',
          rules: {
            'state.formData.sampleId': { required: true, pattern: '^SMP-' }
          }
        },
        {
          type: 'api-call',
          dataSource: 'samples-api',
          method: 'POST',
          body: '{{state.formData}}'
        },
        {
          type: 'update-state',
          path: 'samples',
          operation: 'append',
          value: '{{response.data}}'
        },
        {
          type: 'notify',
          message: 'Sample added successfully!',
          variant: 'success'
        }
      ]
    }
  ],
  workflows: [],
  files: {},
  messages: []
};
