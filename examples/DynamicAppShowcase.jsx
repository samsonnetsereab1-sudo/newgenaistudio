/**
 * Dynamic App Showcase
 * 5 Complete Working Examples demonstrating the dynamic app generation system
 */

import { useState } from 'react';
import { AppSpecInterpreter } from '../src/lib/AppSpecInterpreter';
import { WorkflowRunner } from '../src/lib/WorkflowRunner';

export function DynamicAppShowcase() {
  const [selectedExample, setSelectedExample] = useState(0);

  const examples = [
    {
      name: '1. Sample Tracker (Pharma)',
      spec: sampleTrackerSpec
    },
    {
      name: '2. Analytics Dashboard',
      spec: analyticsSpec
    },
    {
      name: '3. Dynamic Form Builder',
      spec: formBuilderSpec
    },
    {
      name: '4. Workflow Manager',
      spec: workflowManagerSpec
    },
    {
      name: '5. Real-time Monitor',
      spec: realtimeMonitorSpec
    }
  ];

  return (
    <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif' }}>
      <h1>🚀 Dynamic App Showcase</h1>
      <p>Interactive examples demonstrating the dynamic app generation system</p>

      <div style={{ display: 'flex', gap: '10px', marginBottom: '20px', flexWrap: 'wrap' }}>
        {examples.map((example, index) => (
          <button
            key={index}
            onClick={() => setSelectedExample(index)}
            style={{
              padding: '10px 15px',
              backgroundColor: selectedExample === index ? '#007bff' : '#f8f9fa',
              color: selectedExample === index ? 'white' : '#212529',
              border: '1px solid #dee2e6',
              borderRadius: '4px',
              cursor: 'pointer'
            }}
          >
            {example.name}
          </button>
        ))}
      </div>

      <div style={{ border: '2px solid #007bff', borderRadius: '8px', padding: '20px', backgroundColor: '#fff' }}>
        <h2>{examples[selectedExample].name}</h2>
        <AppSpecInterpreter spec={examples[selectedExample].spec} />
      </div>

      <div style={{ marginTop: '30px', padding: '15px', backgroundColor: '#f8f9fa', borderRadius: '8px' }}>
        <h3>📋 About This Example</h3>
        <pre style={{ backgroundColor: '#e9ecef', padding: '10px', borderRadius: '4px', overflow: 'auto' }}>
          {JSON.stringify(examples[selectedExample].spec, null, 2)}
        </pre>
      </div>
    </div>
  );
}

/**
 * Example 1: Sample Tracker (Pharma Domain)
 */
const sampleTrackerSpec = {
  status: 'ok',
  version: '2.0',
  layout: {
    id: 'sample-tracker-pharma',
    name: 'Pharma Sample Tracker',
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
            props: { title: 'Add New Sample' },
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
                id: 'input-batch',
                type: 'input',
                props: {
                  label: 'Batch Number',
                  placeholder: 'BATCH-001',
                  binding: 'state.formData.batch'
                }
              },
              {
                id: 'input-status',
                type: 'input',
                props: {
                  label: 'Status',
                  placeholder: 'Received',
                  binding: 'state.formData.status'
                }
              },
              {
                id: 'button-submit',
                type: 'button',
                props: { label: 'Add Sample', variant: 'primary' }
              },
              {
                id: 'button-clear',
                type: 'button',
                props: { label: 'Clear Form', variant: 'secondary' }
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
      samples: [
        { 'Sample ID': 'SMP-001', 'Batch': 'BATCH-001', 'Status': 'Received' },
        { 'Sample ID': 'SMP-002', 'Batch': 'BATCH-001', 'Status': 'In Testing' }
      ],
      formData: {
        sampleId: '',
        batch: '',
        status: ''
      }
    }
  },
  dataSources: [],
  actions: [
    {
      id: 'action-submit-sample',
      trigger: 'button-submit.onClick',
      effects: [
        {
          type: 'update-state',
          path: 'samples',
          operation: 'append',
          value: {
            'Sample ID': '{{state.formData.sampleId}}',
            'Batch': '{{state.formData.batch}}',
            'Status': '{{state.formData.status}}'
          }
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
    },
    {
      id: 'action-clear-form',
      trigger: 'button-clear.onClick',
      effects: [
        {
          type: 'update-state',
          path: 'formData',
          operation: 'reset'
        }
      ]
    }
  ],
  workflows: []
};

/**
 * Example 2: Analytics Dashboard
 */
const analyticsSpec = {
  status: 'ok',
  version: '2.0',
  layout: {
    id: 'analytics-dashboard',
    name: 'Analytics Dashboard',
    domain: 'generic',
    nodes: [
      {
        id: 'page-dashboard',
        type: 'page',
        props: { title: 'Analytics Dashboard' },
        children: [
          {
            id: 'section-metrics',
            type: 'section',
            props: { title: 'Key Metrics' },
            children: [
              {
                id: 'card-total',
                type: 'card',
                props: {
                  title: 'Total Records',
                  dataBinding: 'state.metrics.totalRecords'
                }
              },
              {
                id: 'card-active',
                type: 'card',
                props: {
                  title: 'Active Items',
                  dataBinding: 'state.metrics.activeItems'
                }
              },
              {
                id: 'card-pending',
                type: 'card',
                props: {
                  title: 'Pending Tasks',
                  dataBinding: 'state.metrics.pendingTasks'
                }
              }
            ]
          },
          {
            id: 'section-chart',
            type: 'section',
            props: { title: 'Trends' },
            children: [
              {
                id: 'chart-line',
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
      metrics: {
        totalRecords: 150,
        activeItems: 42,
        pendingTasks: 8
      },
      chartData: []
    }
  },
  dataSources: [],
  actions: [],
  workflows: []
};

/**
 * Example 3: Dynamic Form Builder
 */
const formBuilderSpec = {
  status: 'ok',
  version: '2.0',
  layout: {
    id: 'form-builder',
    name: 'Dynamic Form',
    domain: 'generic',
    nodes: [
      {
        id: 'page-form',
        type: 'page',
        props: { title: 'Contact Form' },
        children: [
          {
            id: 'section-form',
            type: 'section',
            props: { title: 'Please fill out your information' },
            children: [
              {
                id: 'input-name',
                type: 'input',
                props: {
                  label: 'Full Name',
                  placeholder: 'John Doe',
                  binding: 'state.formData.name',
                  required: true
                }
              },
              {
                id: 'input-email',
                type: 'input',
                props: {
                  label: 'Email Address',
                  placeholder: 'john@example.com',
                  binding: 'state.formData.email',
                  required: true
                }
              },
              {
                id: 'input-message',
                type: 'textarea',
                props: {
                  label: 'Message',
                  placeholder: 'Enter your message...',
                  binding: 'state.formData.message',
                  required: false
                }
              },
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
          },
          {
            id: 'section-status',
            type: 'section',
            props: { title: 'Submission Status' },
            children: [
              {
                id: 'text-status',
                type: 'text',
                props: {
                  content: 'Submitted: {{state.submitted}}',
                  variant: 'body'
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
      formData: {
        name: '',
        email: '',
        message: ''
      },
      submitted: false
    }
  },
  dataSources: [],
  actions: [
    {
      id: 'action-submit',
      trigger: 'button-submit.onClick',
      effects: [
        {
          type: 'validate',
          rules: {
            'state.formData.name': { required: true },
            'state.formData.email': { required: true }
          }
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
      id: 'action-reset',
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

/**
 * Example 4: Workflow Manager
 */
const workflowManagerSpec = {
  status: 'ok',
  version: '2.0',
  layout: {
    id: 'workflow-manager',
    name: 'Workflow Manager',
    domain: 'generic',
    nodes: [
      {
        id: 'page-workflow',
        type: 'page',
        props: { title: 'Workflow Manager' },
        children: [
          {
            id: 'section-progress',
            type: 'section',
            props: { title: 'Current Progress' },
            children: [
              {
                id: 'text-step',
                type: 'text',
                props: {
                  content: 'Current Step: {{state.currentStep}} ({{state.currentStepIndex}}/{{state.steps.length}})',
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
      currentStep: 'Start',
      currentStepIndex: 0,
      steps: ['Start', 'Review', 'Approve', 'Complete'],
      completed: false
    }
  },
  dataSources: [],
  actions: [
    {
      id: 'action-next',
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
              type: 'notify',
              message: 'Moving to next step',
              variant: 'info'
            }
          ],
          else: [
            {
              type: 'notify',
              message: 'Already at final step',
              variant: 'warning'
            }
          ]
        }
      ]
    },
    {
      id: 'action-back',
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
              type: 'notify',
              message: 'Moving to previous step',
              variant: 'info'
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
  workflows: []
};

/**
 * Example 5: Real-time Monitor
 */
const realtimeMonitorSpec = {
  status: 'ok',
  version: '2.0',
  layout: {
    id: 'realtime-monitor',
    name: 'Real-time Monitor',
    domain: 'generic',
    nodes: [
      {
        id: 'page-monitor',
        type: 'page',
        props: { title: 'Real-time System Monitor' },
        children: [
          {
            id: 'section-status',
            type: 'section',
            props: { title: 'System Status' },
            children: [
              {
                id: 'card-cpu',
                type: 'card',
                props: {
                  title: 'CPU Usage',
                  dataBinding: 'state.system.cpu'
                }
              },
              {
                id: 'card-memory',
                type: 'card',
                props: {
                  title: 'Memory',
                  dataBinding: 'state.system.memory'
                }
              },
              {
                id: 'card-connections',
                type: 'card',
                props: {
                  title: 'Active Connections',
                  dataBinding: 'state.system.connections'
                }
              }
            ]
          },
          {
            id: 'section-logs',
            type: 'section',
            props: { title: 'Recent Events' },
            children: [
              {
                id: 'table-events',
                type: 'table',
                props: {
                  title: 'System Events',
                  columns: ['Time', 'Event', 'Status'],
                  dataBinding: 'state.events'
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
      system: {
        cpu: '45%',
        memory: '2.1 GB',
        connections: 12
      },
      events: [
        { 'Time': '10:30:45', 'Event': 'User login', 'Status': 'Success' },
        { 'Time': '10:31:12', 'Event': 'Data sync', 'Status': 'Success' },
        { 'Time': '10:32:00', 'Event': 'API call', 'Status': 'Success' }
      ]
    }
  },
  dataSources: [],
  actions: [],
  workflows: []
};

export default DynamicAppShowcase;
