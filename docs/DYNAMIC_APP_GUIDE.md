# Dynamic App Generation System - Complete Architecture Guide

## Table of Contents
1. [Overview](#overview)
2. [Architecture](#architecture)
3. [Template System](#template-system)
4. [State Management](#state-management)
5. [Data Binding](#data-binding)
6. [Workflow Execution](#workflow-execution)
7. [API Reference](#api-reference)

## Overview

The Dynamic App Generation System transforms NewGen Studio from static template fallbacks into a **live, dynamic app generation platform** with:

- **Parameterized Templates**: Contextual app generation based on domain and user needs
- **State Management**: Global and page-level state with two-way data binding
- **Live Data Integration**: REST and WebSocket connectors for real-time data
- **Workflow Execution**: Multi-step processes with validation, API calls, and AI tasks
- **Interactive UI**: Dynamic rendering with automatic action binding

## Architecture

### System Components

```
┌─────────────────────────────────────────────────────────────┐
│                     Frontend (React)                        │
├─────────────────────────────────────────────────────────────┤
│  AppSpecInterpreter  │  useAppState  │  useDataSource      │
│  WorkflowRunner      │  useWorkflow  │                     │
└────────────────────┬────────────────────────────────────────┘
                     │
                     │ HTTP/WebSocket
                     │
┌────────────────────┴────────────────────────────────────────┐
│                     Backend (Express)                       │
├─────────────────────────────────────────────────────────────┤
│  /api/generate-dynamic     Dynamic generation endpoint      │
│  /api/workflows/execute    Workflow execution               │
│  /api/apps/:appId/*        Dynamic app APIs                 │
├─────────────────────────────────────────────────────────────┤
│  templates.dynamic.js      Template functions               │
│  generation.enhanced.js    Template detection + AI fallback │
│  workflowEngine.js         Workflow execution engine        │
│  appRuntime.js             Dynamic API generation           │
│  dataSources/              REST + WebSocket connectors      │
└─────────────────────────────────────────────────────────────┘
```

### Data Flow

1. **User Request** → `/api/generate-dynamic` with prompt + context
2. **Template Detection** → Match keywords to template functions
3. **Context Application** → Inject user parameters (domain, fields, API URL)
4. **AppSpec v2.0 Generation** → Complete spec with state, dataSources, actions
5. **Frontend Rendering** → AppSpecInterpreter dynamically renders UI
6. **Action Execution** → User interactions trigger effect chains
7. **State Updates** → Two-way binding updates UI automatically

## Template System

### Available Templates

1. **sample-tracker**: CRUD interface for tracking samples (pharma/biotech)
2. **dashboard**: Metrics dashboard with live data polling
3. **data-form**: Dynamic form with validation
4. **workflow-manager**: Multi-step workflow with state transitions
5. **analytics**: Analytics dashboard with charts

### Using Templates

```javascript
// Backend: Detect and apply template
POST /api/generate-dynamic
{
  "prompt": "sample tracker",
  "context": {
    "domain": "pharma",
    "fields": ["Sample ID", "Batch", "Status"],
    "apiUrl": "/api/samples"
  }
}

// Response: AppSpec v2.0 with state management
{
  "status": "ok",
  "version": "2.0",
  "layout": { "nodes": [...] },
  "state": { "global": {...} },
  "dataSources": [...],
  "actions": [...],
  "workflows": []
}
```

### Creating Custom Templates

```javascript
// backend/services/templates.dynamic.js

function myCustomTemplate(context = {}) {
  const { domain, fields, apiUrl } = context;
  
  return {
    status: 'ok',
    version: '2.0',
    layout: {
      id: `custom-${Date.now()}`,
      name: 'My Custom App',
      domain,
      nodes: [
        // Your UI tree here
      ]
    },
    state: {
      global: {
        // Your app state
      }
    },
    dataSources: [
      {
        id: 'my-api',
        type: 'rest',
        url: apiUrl,
        methods: ['GET', 'POST']
      }
    ],
    actions: [
      // Your actions
    ]
  };
}

export const DYNAMIC_TEMPLATES = {
  'my-template': myCustomTemplate,
  // ... other templates
};
```

## State Management

### AppSpec v2.0 State Structure

```javascript
{
  state: {
    global: {
      // App-level state (accessible everywhere)
      samples: [],
      formData: { sampleId: '', batch: '' },
      metrics: { total: 0, active: 0 }
    },
    pages: {
      // Page-specific state (scoped to individual pages)
      'page-id': { localData: {} }
    }
  }
}
```

### Data Binding

Bind UI components to state using `binding` prop:

```javascript
{
  id: 'input-sample-id',
  type: 'input',
  props: {
    label: 'Sample ID',
    binding: 'state.formData.sampleId'  // ← Two-way binding
  }
}
```

When user types, `state.formData.sampleId` updates automatically.

### State Update Operations

```javascript
{
  type: 'update-state',
  path: 'samples',
  operation: 'append',  // set | merge | append | reset | increment | decrement
  value: '{{response.data}}'
}
```

## Data Binding

### Component Data Bindings

| Component | Binding Prop | Example |
|-----------|-------------|---------|
| `input` | `binding` | `'state.formData.name'` |
| `table` | `dataBinding` | `'state.samples'` |
| `card` | `dataBinding` | `'state.metrics.total'` |
| `chart` | `dataBinding` | `'state.chartData'` |
| `text` | `content` (with {{}}template) | `'Count: {{state.total}}'` |

### Template Interpolation

Use `{{path.to.value}}` syntax to inject state into strings:

```javascript
{
  type: 'text',
  props: {
    content: 'Current user: {{state.user.name}}'
  }
}
```

## Workflow Execution

### Workflow Structure

```javascript
{
  id: 'workflow-id',
  name: 'Batch Release Process',
  trigger: 'manual',  // manual | auto | cron | event
  steps: [
    {
      id: 'step-1',
      name: 'Validate Data',
      type: 'validation',
      rules: {
        'batchId': { required: true, pattern: '^BATCH-' }
      }
    },
    {
      id: 'step-2',
      name: 'Fetch Batch',
      type: 'api-call',
      url: '/api/batches/{{batchId}}',
      method: 'GET'
    },
    {
      id: 'step-3',
      name: 'AI Review',
      type: 'llm-task',
      prompt: 'Review batch {{batchId}} quality data'
    },
    {
      id: 'step-4',
      name: 'Decision',
      type: 'conditional',
      condition: 'step-3.approved === true',
      then: [
        { type: 'api-call', url: '/api/batches/{{batchId}}/release', method: 'POST' }
      ],
      else: [
        { type: 'api-call', url: '/api/batches/{{batchId}}/reject', method: 'POST' }
      ]
    }
  ],
  onSuccess: { type: 'notify', message: 'Workflow complete', variant: 'success' },
  onError: { type: 'notify', message: 'Workflow failed', variant: 'error' }
}
```

### Executing Workflows

```javascript
// Frontend
import { useWorkflow } from '../hooks/useWorkflow';

function MyComponent() {
  const { executeWorkflow, execution, loading, progress } = useWorkflow();

  const handleRun = async () => {
    await executeWorkflow(workflow, { batchId: 'BATCH-001' });
  };

  return (
    <div>
      <button onClick={handleRun}>Run Workflow</button>
      {loading && <div>Progress: {progress.percentage}%</div>}
      {execution && <div>Status: {execution.status}</div>}
    </div>
  );
}
```

## API Reference

### Backend Endpoints

#### POST /api/generate-dynamic
Generate app from prompt with context

**Request:**
```json
{
  "prompt": "sample tracker",
  "context": {
    "domain": "pharma",
    "fields": ["Sample ID", "Batch"],
    "apiUrl": "/api/samples"
  }
}
```

**Response:** AppSpec v2.0 object

#### POST /api/workflows/execute
Execute a workflow

**Request:**
```json
{
  "workflow": { /* workflow definition */ },
  "context": { "batchId": "BATCH-001" }
}
```

**Response:**
```json
{
  "status": "success",
  "execution": {
    "id": "exec-123",
    "status": "completed",
    "steps": [...]
  }
}
```

#### GET /api/workflows/history
Get workflow execution history

#### GET /api/workflows/examples
Get example workflows

### Frontend Hooks

#### useAppState(spec)
State management hook

**Returns:**
- `state`: Current app state
- `setState`: Update state function
- `handleAction`: Execute action function
- `notifications`: Array of notifications

#### useDataSource(dataSources)
Data fetching hook

**Returns:**
- `data`: Fetched data (keyed by dataSource ID)
- `loading`: Loading state
- `error`: Error message
- `fetchData(dataSourceId, options)`: Fetch function
- `subscribe(dataSourceId, callback)`: Subscribe function

#### useWorkflow()
Workflow execution hook

**Returns:**
- `executeWorkflow(workflow, context)`: Execute function
- `execution`: Current execution object
- `loading`: Loading state
- `error`: Error message
- `progress`: { current, total, percentage }

### Components

#### AppSpecInterpreter
Renders AppSpec v2.0 dynamically

```jsx
<AppSpecInterpreter spec={appSpec} />
```

#### WorkflowRunner
Visualizes workflow execution

```jsx
<WorkflowRunner
  workflow={workflow}
  context={{ batchId: 'BATCH-001' }}
  onComplete={(result) => console.log('Done', result)}
  onError={(error) => console.error('Failed', error)}
/>
```

## Best Practices

1. **Template Selection**: Choose the closest template, then customize via context
2. **State Design**: Keep global state minimal; use page state for local data
3. **Action Composition**: Chain effects in logical order (validate → api-call → update-state → notify)
4. **Error Handling**: Always include validation effects before API calls
5. **Performance**: Use polling sparingly; prefer WebSocket for real-time data
6. **Security**: Sanitize all user inputs; validate on both client and server

## Troubleshooting

### Template Not Detected
- Check prompt keywords match template patterns
- Use context parameter to force specific template
- Add custom template to registry

### State Not Updating
- Verify binding path matches state structure
- Check action trigger matches component ID
- Ensure setState is called after update

### API Calls Failing
- Verify dataSource configuration
- Check CORS settings for cross-origin requests
- Confirm API_BASE environment variable

### Workflow Stuck
- Check step dependencies (previous steps must succeed)
- Verify conditional expressions evaluate correctly
- Review workflow execution history for errors

## Next Steps

- See [QUICK_START_DYNAMIC.md](./QUICK_START_DYNAMIC.md) for a 5-minute tutorial
- Explore [examples/DynamicAppShowcase.jsx](../examples/DynamicAppShowcase.jsx) for working examples
- Review [appspec.state.schema.js](../backend/schemas/appspec.state.schema.js) for full schema
