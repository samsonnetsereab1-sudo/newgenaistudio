# Quick Start Guide - Dynamic App Generation

Get started with the Dynamic App Generation System in 5 minutes!

## Prerequisites

- Node.js 20+ installed
- Backend running on `http://localhost:4000`
- Frontend running on `http://localhost:5175`

## Step 1: Start the Backend (30 seconds)

```bash
cd backend
npm install
node server.js
```

Verify backend is running:
```bash
curl http://localhost:4000/api/health
# Should return: {"status":"ok"}
```

## Step 2: Generate Your First Dynamic App (1 minute)

### Sample Tracker App

```bash
curl -X POST http://localhost:4000/api/generate-dynamic \
  -H "Content-Type: application/json" \
  -d '{
    "prompt": "sample tracker",
    "context": {
      "domain": "pharma",
      "fields": ["Sample ID", "Batch", "Status"],
      "apiUrl": "/api/samples"
    }
  }'
```

**Expected Response:** AppSpec v2.0 with state, dataSources, and actions

### Dashboard App

```bash
curl -X POST http://localhost:4000/api/generate-dynamic \
  -H "Content-Type: application/json" \
  -d '{
    "prompt": "dashboard",
    "context": {
      "metrics": ["Total Samples", "Active Batches", "Pending Reviews"]
    }
  }'
```

## Step 3: Run Interactive Examples (2 minutes)

### Option A: Import Component

```jsx
// src/pages/DemoPage.jsx
import { DynamicAppShowcase } from '../../examples/DynamicAppShowcase';

export function DemoPage() {
  return <DynamicAppShowcase />;
}
```

### Option B: Use AppSpecInterpreter Directly

```jsx
import { AppSpecInterpreter } from '../lib/AppSpecInterpreter';
import { useState, useEffect } from 'react';

export function MyDynamicApp() {
  const [spec, setSpec] = useState(null);

  useEffect(() => {
    fetch('http://localhost:4000/api/generate-dynamic', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        prompt: 'sample tracker',
        context: { domain: 'pharma' }
      })
    })
    .then(res => res.json())
    .then(data => setSpec(data));
  }, []);

  if (!spec) return <div>Loading...</div>;

  return <AppSpecInterpreter spec={spec} />;
}
```

## Step 4: Test Workflow Execution (1 minute)

```bash
curl -X POST http://localhost:4000/api/workflows/execute \
  -H "Content-Type: application/json" \
  -d '{
    "workflow": {
      "id": "test-workflow",
      "name": "Test Workflow",
      "steps": [
        {
          "id": "step-1",
          "name": "Validate Input",
          "type": "validation",
          "rules": {
            "batchId": { "required": true }
          }
        }
      ],
      "onSuccess": {
        "type": "notify",
        "message": "Workflow completed successfully!",
        "variant": "success"
      }
    },
    "context": { "batchId": "BATCH-001" }
  }'
```

## Step 5: Explore Examples (30 seconds)

View all 5 working examples:

```jsx
import DynamicAppShowcase from './examples/DynamicAppShowcase';

function App() {
  return <DynamicAppShowcase />;
}
```

Examples include:
1. **Sample Tracker** - Pharma sample management with CRUD
2. **Analytics Dashboard** - Real-time metrics and charts
3. **Dynamic Form** - Form builder with validation
4. **Workflow Manager** - Multi-step process management
5. **Real-time Monitor** - System monitoring with live updates

## Common Use Cases

### Use Case 1: Pharma Sample Tracking

```javascript
POST /api/generate-dynamic
{
  "prompt": "sample tracker for GMP pharma",
  "context": {
    "domain": "pharma",
    "fields": ["Sample ID", "Batch Lot", "Material Type", "Status", "Test Results"],
    "apiUrl": "/api/samples"
  }
}
```

### Use Case 2: Biotech Fermentor Dashboard

```javascript
POST /api/generate-dynamic
{
  "prompt": "dashboard for fermentor monitoring",
  "context": {
    "domain": "biotech",
    "metrics": ["Temperature", "pH", "DO2", "Cell Density"],
    "polling": { "interval": 5000, "enabled": true }
  }
}
```

### Use Case 3: Clinical Trial Management

```javascript
POST /api/generate-dynamic
{
  "prompt": "workflow for patient enrollment",
  "context": {
    "domain": "clinical",
    "steps": ["Screening", "Consent", "Enrollment", "Baseline"],
    "apiUrl": "/api/patients"
  }
}
```

## Testing Checklist

- [ ] Backend responds to `/api/health`
- [ ] `/api/generate-dynamic` returns valid AppSpec v2.0
- [ ] Template detection works (keywords: sample, dashboard, form, workflow)
- [ ] Frontend renders AppSpec with AppSpecInterpreter
- [ ] State updates when form inputs change
- [ ] Actions execute when buttons clicked
- [ ] Workflows execute successfully
- [ ] All 5 examples run without errors

## Troubleshooting

### Backend Won't Start
```bash
# Check if port 4000 is in use
netstat -ano | findstr :4000  # Windows
lsof -i :4000                 # Mac/Linux

# Verify dependencies installed
cd backend && npm list
```

### Frontend Can't Connect
```bash
# Check VITE_API_BASE environment variable
echo $VITE_API_BASE

# Should be: http://localhost:4000
# Set in .env file:
VITE_API_BASE=http://localhost:4000
```

### Template Not Detected
- Use exact keywords: `sample`, `dashboard`, `form`, `workflow`, `analytics`
- Or explicitly pass template in context: `context: { template: 'sample-tracker' }`

### State Not Updating
- Check binding path matches state structure
- Verify action trigger matches component ID
- Open browser DevTools → Console for errors

## Next Steps

- Read the [Complete Architecture Guide](./DYNAMIC_APP_GUIDE.md)
- Explore [AppSpec v2.0 Schema](../backend/schemas/appspec.state.schema.js)
- View [Example Workflows](../backend/schemas/appspec.workflow.schema.js)
- Customize [Dynamic Templates](../backend/services/templates.dynamic.js)

## API Reference Quick Links

- `POST /api/generate-dynamic` - Generate app from prompt
- `POST /api/workflows/execute` - Execute workflow
- `GET /api/workflows/history` - View execution history
- `GET /api/workflows/examples` - Get example workflows
- `GET /api/apps/:appId/*` - Dynamic app-specific APIs

Happy building! 🚀
