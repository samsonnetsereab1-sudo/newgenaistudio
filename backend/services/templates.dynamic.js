/**
 * Dynamic Templates Service
 * Parameterized template system that adapts to user context
 * Returns AppSpec v2.0 with state, dataSources, actions, and workflows
 */

/**
 * Dynamic template registry
 * Each template is a function that accepts context and returns AppSpec v2.0
 */
export const DYNAMIC_TEMPLATES = {
  'sample-tracker': generateSampleTracker,
  'dashboard': generateDashboard,
  'data-form': generateDataForm,
  'workflow-manager': generateWorkflowManager,
  'analytics': generateAnalytics
};

/**
 * Detect template from prompt keywords
 * @param {string} prompt - User prompt
 * @returns {string|null} - Template name or null
 */
export function detectTemplate(prompt) {
  const lower = prompt.toLowerCase();
  
  // Priority order: more specific patterns first
  const patterns = [
    { keywords: ['sample', 'track', 'specimen'], template: 'sample-tracker' },
    { keywords: ['workflow', 'process', 'step'], template: 'workflow-manager' },
    { keywords: ['dashboard', 'monitor', 'overview'], template: 'dashboard' },
    { keywords: ['analytics', 'chart', 'graph', 'metric'], template: 'analytics' },
    { keywords: ['form', 'input', 'entry', 'submit'], template: 'data-form' }
  ];
  
  for (const pattern of patterns) {
    if (pattern.keywords.some(kw => lower.includes(kw))) {
      return pattern.template;
    }
  }
  
  return null;
}

/**
 * Get dynamic template with context
 * @param {string} templateName - Template name
 * @param {object} context - Template context (domain, fields, apiUrl, etc.)
 * @returns {object} - AppSpec v2.0
 */
export function getDynamicTemplate(templateName, context = {}) {
  const template = DYNAMIC_TEMPLATES[templateName];
  if (!template) {
    throw new Error(`Template not found: ${templateName}`);
  }
  return template(context);
}

/**
 * Sample Tracker Template
 * Creates a CRUD interface for tracking samples
 */
function generateSampleTracker(context = {}) {
  const {
    domain = 'pharma',
    fields = ['Sample ID', 'Batch', 'Status'],
    apiUrl = '/api/samples',
    title = 'Sample Tracker'
  } = context;
  
  const id = `tracker-${domain}-${Date.now()}`;
  
  // Build field inputs dynamically
  const fieldInputs = fields.map((field, i) => ({
    id: `input-${field.toLowerCase().replace(/\s+/g, '-')}`,
    type: 'input',
    props: {
      label: field,
      placeholder: `Enter ${field}`,
      binding: `state.formData.${field.toLowerCase().replace(/\s+/g, '')}`
    }
  }));
  
  return {
    status: 'ok',
    version: '2.0',
    layout: {
      id,
      name: title,
      domain,
      nodes: [
        {
          id: 'page-main',
          type: 'page',
          props: { title },
          children: [
            {
              id: 'section-form',
              type: 'section',
              props: { title: 'Add New Sample' },
              children: [
                ...fieldInputs,
                {
                  id: 'button-submit',
                  type: 'button',
                  props: { 
                    label: 'Submit Sample',
                    variant: 'primary'
                  }
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
                    columns: fields,
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
        formData: fields.reduce((acc, field) => {
          acc[field.toLowerCase().replace(/\s+/g, '')] = '';
          return acc;
        }, {})
      }
    },
    dataSources: [
      {
        id: 'samples-api',
        type: 'rest',
        url: apiUrl,
        methods: ['GET', 'POST', 'PUT', 'DELETE']
      }
    ],
    actions: [
      {
        id: 'action-submit-sample',
        trigger: 'button-submit.onClick',
        effects: [
          {
            type: 'validate',
            rules: fields.reduce((acc, field, i) => {
              if (i === 0) {
                acc[`state.formData.${field.toLowerCase().replace(/\s+/g, '')}`] = { 
                  required: true 
                };
              }
              return acc;
            }, {})
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
            type: 'update-state',
            path: 'formData',
            operation: 'reset'
          },
          {
            type: 'notify',
            message: 'Sample added successfully!',
            variant: 'success'
          }
        ]
      }
    ],
    workflows: []
  };
}

/**
 * Dashboard Template
 * Creates a metrics dashboard with real-time data
 */
function generateDashboard(context = {}) {
  const {
    domain = 'generic',
    metrics = ['Total Records', 'Active Items', 'Pending Tasks'],
    apiUrl = '/api/metrics',
    title = 'Dashboard'
  } = context;
  
  const id = `dashboard-${domain}-${Date.now()}`;
  
  // Create metric cards
  const metricCards = metrics.map((metric, i) => ({
    id: `card-${metric.toLowerCase().replace(/\s+/g, '-')}`,
    type: 'card',
    props: {
      title: metric,
      dataBinding: `state.metrics.${metric.toLowerCase().replace(/\s+/g, '')}`
    },
    children: []
  }));
  
  return {
    status: 'ok',
    version: '2.0',
    layout: {
      id,
      name: title,
      domain,
      nodes: [
        {
          id: 'page-dashboard',
          type: 'page',
          props: { title },
          children: [
            {
              id: 'section-metrics',
              type: 'section',
              props: { title: 'Key Metrics' },
              children: metricCards
            },
            {
              id: 'section-chart',
              type: 'section',
              props: { title: 'Trends' },
              children: [
                {
                  id: 'chart-trends',
                  type: 'chart',
                  props: {
                    title: 'Activity Over Time',
                    chartType: 'line',
                    dataBinding: 'state.chartData'
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
        metrics: metrics.reduce((acc, metric) => {
          acc[metric.toLowerCase().replace(/\s+/g, '')] = 0;
          return acc;
        }, {}),
        chartData: []
      }
    },
    dataSources: [
      {
        id: 'metrics-api',
        type: 'rest',
        url: apiUrl,
        methods: ['GET'],
        polling: {
          interval: 5000,
          enabled: true
        }
      }
    ],
    actions: [
      {
        id: 'action-load-metrics',
        trigger: 'page-dashboard.onLoad',
        effects: [
          {
            type: 'api-call',
            dataSource: 'metrics-api',
            method: 'GET'
          },
          {
            type: 'update-state',
            path: 'metrics',
            operation: 'merge',
            value: '{{response.data}}'
          }
        ]
      }
    ],
    workflows: []
  };
}

/**
 * Data Form Template
 * Creates a dynamic form with validation
 */
function generateDataForm(context = {}) {
  const {
    domain = 'generic',
    fields = [
      { name: 'Name', type: 'text', required: true },
      { name: 'Email', type: 'email', required: true },
      { name: 'Description', type: 'textarea', required: false }
    ],
    apiUrl = '/api/submissions',
    title = 'Data Entry Form'
  } = context;
  
  const id = `form-${domain}-${Date.now()}`;
  
  // Build form inputs
  const formInputs = fields.map(field => ({
    id: `input-${field.name.toLowerCase().replace(/\s+/g, '-')}`,
    type: field.type === 'textarea' ? 'textarea' : 'input',
    props: {
      label: field.name,
      placeholder: `Enter ${field.name}`,
      binding: `state.formData.${field.name.toLowerCase().replace(/\s+/g, '')}`,
      required: field.required
    }
  }));
  
  return {
    status: 'ok',
    version: '2.0',
    layout: {
      id,
      name: title,
      domain,
      nodes: [
        {
          id: 'page-form',
          type: 'page',
          props: { title },
          children: [
            {
              id: 'section-form',
              type: 'section',
              props: { title: 'Please fill out the form' },
              children: [
                ...formInputs,
                {
                  id: 'button-submit',
                  type: 'button',
                  props: { label: 'Submit', variant: 'primary' }
                },
                {
                  id: 'button-reset',
                  type: 'button',
                  props: { label: 'Reset', variant: 'secondary' }
                }
              ]
            }
          ]
        }
      ]
    },
    state: {
      global: {
        formData: fields.reduce((acc, field) => {
          acc[field.name.toLowerCase().replace(/\s+/g, '')] = '';
          return acc;
        }, {}),
        submitted: false
      }
    },
    dataSources: [
      {
        id: 'form-api',
        type: 'rest',
        url: apiUrl,
        methods: ['POST']
      }
    ],
    actions: [
      {
        id: 'action-submit-form',
        trigger: 'button-submit.onClick',
        effects: [
          {
            type: 'validate',
            rules: fields.reduce((acc, field) => {
              if (field.required) {
                acc[`state.formData.${field.name.toLowerCase().replace(/\s+/g, '')}`] = { 
                  required: true 
                };
              }
              return acc;
            }, {})
          },
          {
            type: 'api-call',
            dataSource: 'form-api',
            method: 'POST',
            body: '{{state.formData}}'
          },
          {
            type: 'update-state',
            path: 'submitted',
            operation: 'set',
            value: true
          },
          {
            type: 'notify',
            message: 'Form submitted successfully!',
            variant: 'success'
          }
        ]
      },
      {
        id: 'action-reset-form',
        trigger: 'button-reset.onClick',
        effects: [
          {
            type: 'update-state',
            path: 'formData',
            operation: 'reset'
          },
          {
            type: 'update-state',
            path: 'submitted',
            operation: 'set',
            value: false
          }
        ]
      }
    ],
    workflows: []
  };
}

/**
 * Workflow Manager Template
 * Creates a multi-step workflow with state transitions
 */
function generateWorkflowManager(context = {}) {
  const {
    domain = 'generic',
    steps = ['Start', 'Review', 'Approve', 'Complete'],
    apiUrl = '/api/workflows',
    title = 'Workflow Manager'
  } = context;
  
  const id = `workflow-${domain}-${Date.now()}`;
  
  return {
    status: 'ok',
    version: '2.0',
    layout: {
      id,
      name: title,
      domain,
      nodes: [
        {
          id: 'page-workflow',
          type: 'page',
          props: { title },
          children: [
            {
              id: 'section-progress',
              type: 'section',
              props: { title: 'Current Progress' },
              children: [
                {
                  id: 'text-current-step',
                  type: 'text',
                  props: {
                    content: 'Current Step: {{state.currentStep}}',
                    variant: 'large'
                  }
                }
              ]
            },
            {
              id: 'section-actions',
              type: 'section',
              props: { title: 'Actions' },
              children: [
                {
                  id: 'button-next',
                  type: 'button',
                  props: { label: 'Next Step', variant: 'primary' }
                },
                {
                  id: 'button-back',
                  type: 'button',
                  props: { label: 'Previous Step', variant: 'secondary' }
                }
              ]
            }
          ]
        }
      ]
    },
    state: {
      global: {
        currentStep: steps[0],
        currentStepIndex: 0,
        steps: steps,
        completed: false
      }
    },
    dataSources: [
      {
        id: 'workflow-api',
        type: 'rest',
        url: apiUrl,
        methods: ['GET', 'POST', 'PUT']
      }
    ],
    actions: [
      {
        id: 'action-next-step',
        trigger: 'button-next.onClick',
        effects: [
          {
            type: 'conditional',
            condition: 'state.currentStepIndex < state.steps.length - 1',
            then: [
              {
                type: 'update-state',
                path: 'currentStepIndex',
                operation: 'increment',
                value: 1
              },
              {
                type: 'update-state',
                path: 'currentStep',
                operation: 'set',
                value: '{{state.steps[state.currentStepIndex]}}'
              },
              {
                type: 'api-call',
                dataSource: 'workflow-api',
                method: 'PUT',
                body: '{{state}}'
              }
            ],
            else: [
              {
                type: 'notify',
                message: 'Workflow already at final step',
                variant: 'warning'
              }
            ]
          }
        ]
      },
      {
        id: 'action-previous-step',
        trigger: 'button-back.onClick',
        effects: [
          {
            type: 'conditional',
            condition: 'state.currentStepIndex > 0',
            then: [
              {
                type: 'update-state',
                path: 'currentStepIndex',
                operation: 'decrement',
                value: 1
              },
              {
                type: 'update-state',
                path: 'currentStep',
                operation: 'set',
                value: '{{state.steps[state.currentStepIndex]}}'
              }
            ],
            else: [
              {
                type: 'notify',
                message: 'Already at first step',
                variant: 'warning'
              }
            ]
          }
        ]
      }
    ],
    workflows: [
      {
        id: 'workflow-main',
        name: title,
        trigger: 'manual',
        steps: steps.map((step, i) => ({
          id: `step-${i}`,
          name: step,
          type: 'validation',
          rules: {}
        })),
        onSuccess: {
          type: 'notify',
          message: 'Workflow completed successfully!',
          variant: 'success'
        },
        onError: {
          type: 'notify',
          message: 'Workflow failed',
          variant: 'error'
        }
      }
    ]
  };
}

/**
 * Analytics Template
 * Creates an analytics dashboard with charts
 */
function generateAnalytics(context = {}) {
  const {
    domain = 'generic',
    charts = ['line', 'bar', 'pie'],
    apiUrl = '/api/analytics',
    title = 'Analytics Dashboard'
  } = context;
  
  const id = `analytics-${domain}-${Date.now()}`;
  
  const chartComponents = charts.map((chartType, i) => ({
    id: `chart-${chartType}-${i}`,
    type: 'chart',
    props: {
      title: `${chartType.charAt(0).toUpperCase() + chartType.slice(1)} Chart`,
      chartType,
      dataBinding: `state.chartData.${chartType}`
    }
  }));
  
  return {
    status: 'ok',
    version: '2.0',
    layout: {
      id,
      name: title,
      domain,
      nodes: [
        {
          id: 'page-analytics',
          type: 'page',
          props: { title },
          children: [
            {
              id: 'section-charts',
              type: 'section',
              props: { title: 'Data Visualization' },
              children: chartComponents
            }
          ]
        }
      ]
    },
    state: {
      global: {
        chartData: charts.reduce((acc, chartType) => {
          acc[chartType] = [];
          return acc;
        }, {})
      }
    },
    dataSources: [
      {
        id: 'analytics-api',
        type: 'rest',
        url: apiUrl,
        methods: ['GET'],
        polling: {
          interval: 10000,
          enabled: true
        }
      }
    ],
    actions: [
      {
        id: 'action-load-analytics',
        trigger: 'page-analytics.onLoad',
        effects: [
          {
            type: 'api-call',
            dataSource: 'analytics-api',
            method: 'GET'
          },
          {
            type: 'update-state',
            path: 'chartData',
            operation: 'merge',
            value: '{{response.data}}'
          }
        ]
      }
    ],
    workflows: []
  };
}
