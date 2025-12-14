# 🤖 One-Shot Copilot Prompt: Universal App Migration + Multi-Platform Interop

Copy this entire prompt into GitHub Copilot to recreate the complete NewGen Studio ecosystem:

---

## PROMPT START

You are transforming a legacy or Base44-style application into a modern NewGen Studio compatible architecture with biologics/pharma support and multi-platform interoperability.

### 1. React Frontend Scaffold (Vite + React 19 + Tailwind)

Generate a complete frontend with:

**Structure:**
```
src/
├── main.jsx                     # Entry point
├── App.jsx                      # Router setup
├── layout/
│   ├── AppShell.jsx            # Main layout wrapper
│   ├── Sidebar.jsx             # Navigation sidebar
│   └── TopBar.jsx              # Header bar
├── pages/
│   ├── Dashboard.jsx           # Overview page
│   ├── Projects.jsx            # Project management
│   ├── Templates.jsx           # Template library
│   └── AgentWorkbench.jsx      # AI orchestration
├── builder/
│   └── BuilderView.jsx         # AI-powered app builder
├── lib/
│   ├── apiClient.js            # Axios wrapper with interceptors
│   └── data.js                 # Mock data and utilities
└── components/
    ├── PluginMarketplace.jsx   # Plugin ecosystem
    └── [other components]
```

**Key Requirements:**
- Modular layout with Sidebar, TopBar, AppShell pattern
- AI Architect panel in BuilderView with:
  - Chat-style prompt interface
  - Real-time code generation
  - Live preview using iframe with srcDoc
  - File state management (App.jsx, styles.css)
- apiClient.js with:
  - Environment-aware baseURL (`VITE_API_BASE_URL`)
  - 30-second timeout for AI calls
  - Request/response interceptors for logging
  - Error handling with retry logic
- Tailwind CSS for styling
- Lucide React for icons

**apiClient.js Template:**
```javascript
import axios from "axios";

const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || "http://localhost:4000",
  timeout: 30000,
});

apiClient.interceptors.response.use(
  (res) => res,
  (err) => {
    console.error("[api] error:", err?.response || err);
    return Promise.reject(err);
  }
);

export default apiClient;

export async function generate(prompt) {
  const res = await apiClient.post("/generate", { prompt });
  return res.data;
}

export async function healthCheck() {
  const res = await apiClient.get("/health");
  return res.data;
}
```

**BuilderView.jsx Pattern:**
```javascript
// Connect to real backend API instead of mocks
import { generate } from '../lib/apiClient';

const handleAiBuild = async (prompt) => {
  setIsBuilding(true);
  try {
    const response = await generate(prompt);
    const { files, messages } = response;
    
    if(files) setFiles(prev => ({...prev, ...files}));
    if(messages?.length > 0) {
      messages.forEach(m => setMessages(prev => [...prev, m]));
    }
  } catch (error) {
    console.error('AI Build Error:', error);
    const errorMsg = error.response?.data?.message || 'Backend error';
    setMessages(prev => [...prev, {role: 'assistant', content: `❌ ${errorMsg}`}]);
  } finally { 
    setIsBuilding(false); 
  }
};
```

---

### 2. Node/Express Backend Scaffold

Generate production-ready backend with:

**Structure:**
```
backend/
├── server.js                    # Entry point
├── app.js                       # Express app config
├── routes/
│   ├── index.js                # Route aggregator
│   ├── generate.routes.js      # POST /api/generate
│   ├── projects.routes.js      # CRUD operations
│   └── biologics.routes.js     # Pharma-specific endpoints
├── controllers/
│   ├── generate.controller.js  # AI generation logic
│   ├── projects.controller.js
│   └── templates.controller.js
├── services/
│   ├── ai.service.js           # Mock AI (replaceable)
│   └── ai.service.enhanced.js  # Biologics-aware AI
├── middleware/
│   ├── errorHandler.js         # Global error handling
│   ├── notFound.js             # 404 handler
│   └── logger.js               # Request logging
├── .env.example
├── nodemon.json                # Auto-reload config
└── package.json
```

**Key Requirements:**
- CORS enabled (configurable for dev/prod)
- JSON body parsing
- Environment-based configuration
- Proper error middleware chain
- Logging middleware for all requests
- Health check endpoint (`GET /api/health`)
- Generate endpoint (`POST /api/generate`)

**server.js Template:**
```javascript
import 'dotenv/config';
import app from './app.js';

const PORT = process.env.PORT || 4000;

app.listen(PORT, () => {
  console.log(`✅ API running on http://localhost:${PORT}`);
  console.log(`📋 Endpoints:`);
  console.log(`   GET  /api/health`);
  console.log(`   POST /api/generate`);
});
```

**app.js Template:**
```javascript
import express from 'express';
import cors from 'cors';
import routes from './routes/index.js';
import notFound from './middleware/notFound.js';
import errorHandler from './middleware/errorHandler.js';

const app = express();

const FRONTEND_ORIGIN = process.env.FRONTEND_ORIGIN || 'http://localhost:5173';
const isDevelopment = process.env.NODE_ENV !== 'production';

app.use(cors({ 
  origin: isDevelopment ? '*' : FRONTEND_ORIGIN,
  credentials: true 
}));
app.use(express.json());

// Mount all API routes
app.use('/api', routes);

// Error handling
app.use(notFound);
app.use(errorHandler);

export default app;
```

**generate.controller.js Template:**
```javascript
import { runAI } from '../services/ai.service.enhanced.js';

export const generateApp = async (req, res, next) => {
  try {
    const { prompt } = req.body;
    if (!prompt || typeof prompt !== 'string') {
      return res.status(400).json({ 
        status: 'error', 
        message: 'prompt is required' 
      });
    }
    const result = await runAI(prompt);
    res.json(result);
  } catch (err) {
    next(err);
  }
};
```

**ai.service.enhanced.js Pattern:**
```javascript
// Detect biologics/pharma keywords
function isBiologicsPrompt(prompt) {
  const keywords = ['protein', 'antibody', 'drug', 'assay', 'chromatography', 
                    'alphafold', 'maxquant', 'galaxy', 'openms'];
  return keywords.some(kw => prompt.toLowerCase().includes(kw));
}

// Generate biologics-specific dashboard
function generateBiologicsApp(prompt) {
  return {
    'App.jsx': `// Biologics dashboard with FlaskConical, Microscope icons...`,
    'styles.css': `// Pharma-themed styles`
  };
}

// Generate general-purpose app
function generateGeneralApp(prompt) {
  return {
    'App.jsx': `// Modern interactive app with state management...`,
    'styles.css': `// Clean, professional styles`
  };
}

export const runAI = async (prompt) => {
  const isBiologics = isBiologicsPrompt(prompt);
  const files = isBiologics ? generateBiologicsApp(prompt) : generateGeneralApp(prompt);
  
  return {
    status: 'ok',
    files,
    messages: [{ role: 'assistant', content: 'Generated app successfully' }]
  };
};
```

---

### 3. Integration Layer

**Request/Response Flow:**
```
User types prompt → BuilderView.jsx
  ↓
generate(prompt) → apiClient.js
  ↓
POST /api/generate → generate.routes.js
  ↓
generateApp() → generate.controller.js
  ↓
runAI(prompt) → ai.service.enhanced.js
  ↓
Returns { status, files, messages }
  ↓
BuilderView updates preview → Iframe renders
```

**Unified TypeScript Interfaces:**
```typescript
interface GenerateRequest {
  prompt: string;
}

interface GenerateResponse {
  status: 'ok' | 'error';
  files?: Record<string, string>;
  messages?: Array<{role: string; content: string}>;
  error?: string;
}

interface AppFile {
  name: string;
  content: string;
  language: 'javascript' | 'typescript' | 'css' | 'html';
}
```

---

### 4. Migration Helpers

**Base44/Bubble/Retool Import Functions:**

```javascript
// Convert Base44 JSON schema to NewGen format
export function convertBase44Schema(base44App) {
  return {
    name: base44App.name,
    pages: base44App.pages.map(convertPage),
    workflows: base44App.workflows.map(convertWorkflow),
    dataSources: base44App.dataSources.map(convertDataSource),
    components: base44App.components.map(convertComponent)
  };
}

function convertPage(base44Page) {
  return {
    id: base44Page.id,
    name: base44Page.name,
    route: base44Page.route,
    components: base44Page.elements.map(convertComponent),
    layout: {
      type: base44Page.layout || 'flex',
      props: extractLayoutProps(base44Page)
    }
  };
}

function convertComponent(base44Component) {
  // Map Base44 component types to NewGen equivalents
  const typeMap = {
    'Button': 'Button',
    'Input': 'TextField',
    'Table': 'DataTable',
    'Chart': 'ChartWidget',
    // ... more mappings
  };
  
  return {
    type: typeMap[base44Component.type] || 'Container',
    props: normalizeProps(base44Component.props),
    children: base44Component.children?.map(convertComponent) || []
  };
}

// Generic schema normalizer
export function normalizeAppSchema(schema, platform) {
  switch(platform) {
    case 'base44':
      return convertBase44Schema(schema);
    case 'bubble':
      return convertBubbleSchema(schema);
    case 'retool':
      return convertRetoolSchema(schema);
    default:
      return schema; // Assume NewGen format
  }
}
```

---

### 5. Collaboration Layer

**Adapter Pattern for 3rd-Party Platforms:**

```javascript
// Generic platform adapter interface
class PlatformAdapter {
  async connect(credentials) { throw new Error('Not implemented'); }
  async fetchApps() { throw new Error('Not implemented'); }
  async importApp(appId) { throw new Error('Not implemented'); }
  async exportApp(app) { throw new Error('Not implemented'); }
}

// Base44 Adapter
class Base44Adapter extends PlatformAdapter {
  async connect(credentials) {
    this.apiKey = credentials.apiKey;
    this.baseUrl = credentials.baseUrl || 'https://api.base44.com';
  }
  
  async fetchApps() {
    const response = await fetch(`${this.baseUrl}/apps`, {
      headers: { 'Authorization': `Bearer ${this.apiKey}` }
    });
    return response.json();
  }
  
  async importApp(appId) {
    const app = await fetch(`${this.baseUrl}/apps/${appId}`).then(r => r.json());
    return normalizeAppSchema(app, 'base44');
  }
}

// Instrument Adapter SDK for Biologics Integrations
class InstrumentAdapter {
  constructor(config) {
    this.instrumentType = config.type; // 'alphafold', 'maxquant', etc.
    this.endpoint = config.endpoint;
    this.credentials = config.credentials;
  }
  
  async executeWorkflow(workflow) {
    // Send workflow to instrument API
    const response = await fetch(`${this.endpoint}/execute`, {
      method: 'POST',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(workflow)
    });
    return response.json();
  }
  
  async fetchResults(jobId) {
    const response = await fetch(`${this.endpoint}/jobs/${jobId}`);
    return response.json();
  }
  
  async streamLogs(jobId, callback) {
    // WebSocket or SSE connection for real-time logs
    const ws = new WebSocket(`${this.endpoint}/logs/${jobId}`);
    ws.onmessage = (event) => callback(JSON.parse(event.data));
  }
}

// Adapter Registry
class AdapterRegistry {
  constructor() {
    this.adapters = new Map();
  }
  
  register(name, adapterClass) {
    this.adapters.set(name, adapterClass);
  }
  
  create(name, config) {
    const AdapterClass = this.adapters.get(name);
    if (!AdapterClass) throw new Error(`Unknown adapter: ${name}`);
    return new AdapterClass(config);
  }
}

// Usage
const registry = new AdapterRegistry();
registry.register('base44', Base44Adapter);
registry.register('alphafold', InstrumentAdapter);

const base44 = registry.create('base44', { apiKey: '...' });
const apps = await base44.fetchApps();
```

**Webhook Event Framework:**

```javascript
// Event emitter for app lifecycle
class AppEventBus {
  constructor() {
    this.listeners = new Map();
  }
  
  on(event, callback) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, []);
    }
    this.listeners.get(event).push(callback);
  }
  
  async emit(event, data) {
    const callbacks = this.listeners.get(event) || [];
    for (const callback of callbacks) {
      await callback(data);
    }
  }
}

// App lifecycle events
const eventBus = new AppEventBus();

eventBus.on('app:save', async (app) => {
  console.log('App saved:', app.name);
  // Trigger webhooks, backups, etc.
});

eventBus.on('app:deploy', async (app) => {
  console.log('Deploying:', app.name);
  // Deploy to Vercel/Render
});

eventBus.on('app:generate', async ({ prompt, result }) => {
  console.log('Generated from:', prompt);
  // Log to analytics, save to history
});

// Webhook delivery
eventBus.on('app:save', async (app) => {
  const webhooks = await getWebhooks(app.id);
  for (const webhook of webhooks) {
    await fetch(webhook.url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        event: 'app:save',
        app: app,
        timestamp: new Date().toISOString()
      })
    });
  }
});
```

---

### 6. Configuration Files

**Frontend (.env):**
```env
VITE_API_BASE_URL=http://localhost:4000
```

**Backend (backend/.env):**
```env
PORT=4000
NODE_ENV=development
FRONTEND_ORIGIN=http://localhost:5173
ENABLE_CORS=true
AUDIT_ENABLED=true
REQUIRE_SIGNATURE=true
```

**nodemon.json:**
```json
{
  "watch": ["*.js", "routes/**/*.js", "controllers/**/*.js", "services/**/*.js"],
  "ext": "js,json",
  "ignore": ["node_modules/**"],
  "exec": "node server.js",
  "delay": "1000"
}
```

**package.json (backend):**
```json
{
  "scripts": {
    "start": "node server.js",
    "dev": "nodemon server.js"
  }
}
```

---

### 7. Development Workflow

**Start Backend:**
```bash
cd backend
npm install
npm run dev  # Uses nodemon for auto-reload
```

**Start Frontend:**
```bash
npm install
npm run dev  # Vite dev server on port 5173
```

**Test Integration:**
```bash
# Test health check
curl http://localhost:4000/api/health

# Test generation
curl -X POST http://localhost:4000/api/generate \
  -H "Content-Type: application/json" \
  -d '{"prompt":"Build a protein dashboard"}'
```

---

### 8. Deployment

**Frontend (Vercel):**
```bash
vercel --prod
```

**Backend (Render):**
- Connect GitHub repo
- Set environment variables
- Deploy web service

---

### 9. Key Features to Include

✅ **Frontend:**
- AI Architect panel with chat interface
- Real-time code preview in iframe
- File state management (App.jsx, styles.css)
- Error handling with user-friendly messages
- Loading states during generation
- Responsive Tailwind UI

✅ **Backend:**
- Environment-aware CORS configuration
- Proper error middleware chain
- Request logging
- Health check endpoint
- Biologics keyword detection
- Two code generation modes (biologics vs general)

✅ **Integration:**
- Axios-based API client
- Timeout handling (30s for AI calls)
- Request/response interceptors
- Error boundary in React
- Environment variable fallbacks

✅ **Migration:**
- Base44/Bubble/Retool schema converters
- Component mapping logic
- Data source normalization
- Workflow translation

✅ **Collaboration:**
- Platform adapter registry
- Instrument adapter SDK
- Webhook event framework
- Real-time log streaming

---

## OUTPUT REQUIREMENTS

Generate clean, production-ready code with:
- Comprehensive comments explaining key logic
- Error handling at every level
- Type safety (JSDoc or TypeScript)
- Environment-based configuration
- Modular, testable architecture
- Clear separation of concerns
- RESTful API design
- Security best practices (CORS, input validation)

**Focus on:**
1. Real backend integration (no hard-coded mocks in components)
2. Biologics/pharma-aware AI service
3. Extensible adapter pattern for platforms
4. Complete end-to-end flow from UI to API to response

## PROMPT END

---

## 📝 Usage Instructions

1. Copy the entire "PROMPT START" to "PROMPT END" section
2. Paste into GitHub Copilot Chat
3. Copilot will generate all files in correct structure
4. Review and adjust as needed
5. Run `npm install` in both root and backend
6. Start development servers

**Result:** Complete NewGen Studio ecosystem with frontend, backend, biologics support, and multi-platform interoperability.
