# NewGen Studio — AI Agent Coding Instructions

## Architecture Overview

**NewGen Studio** is a low-code platform for building biologics & pharma applications. It combines:
- **Frontend**: React 19 + Vite SPA (`src/`) with drag-and-drop builder UI
- **Backend**: Express.js Node.js API (`backend/`) with Copilot orchestration + staged generation
- **AI Integration**: Multi-stage generation (Intent → Model → Workflow → Screens → Wiring)
- **Export System**: BASE44 manifest format for regulatory compliance & interoperability
- **Agent Framework**: Multi-agent orchestration with safety review & compliance validation

### Core Data Flow
1. User describes app requirements → Frontend sends to `/api/generate` or `/api/v1/agents/orchestrate`
2. **Copilot Orchestrator** analyzes domain (pharma/biotech/clinical) → enriches prompt with regulatory templates
3. **Staged AI Service** (`ai.service.staged.js`) decomposes generation across 5 stages for better code quality
4. **AppSpec** schema normalizes output into component tree; validated by `appspec.validator.js` (uses AJV)
5. **Safety Agent** validates compliance with domain standards (21 CFR Part 11, ALCOA+, etc.)
6. Frontend renders interactive builder; export via BASE44 adapter for platform interoperability

### Why This Architecture?
- **Staged generation** prevents single-pass failures on complex biotech/pharma apps (e.g., fermentor monitoring requires data model → workflow → screens separately)
- **AppSpec schema** (source of truth in `backend/schemas/appspec.schema.js`) decouples AI output from rendering logic
- **Domain patterns** in orchestrator pre-load regulatory requirements, reducing hallucinations on compliance-critical features
- **Validation layer** (`appspec.validator.js`) catches malformed specs before reaching frontend (90% of issues caught here)

### Key Services (Must Know These)
| Service | Purpose | Location |
|---------|---------|----------|
| **copilot-orchestrator** | Domain + intent detection; applies architecture templates; enriches prompts with domain knowledge | `backend/services/copilot-orchestrator.js` |
| **ai.service.staged** | 5-stage generation (Intent → Model → Workflow → Screens → Wiring) with OpenAI gpt-4o | `backend/services/ai.service.staged.js` |
| **ai.service.enhanced** | Legacy single-pass generation with Gemini/OpenAI routing; fallback mode | `backend/services/ai.service.enhanced.js` |
| **AppSpec Validator** | AJV-based strict validation + repair logic; catches 90% of spec errors | `backend/validators/appspec.validator.js` |
| **AppSpec Schema** | Normalizer + contract between generator & renderer | `backend/schemas/appspec.schema.js` |
| **generate.controller** | Main orchestration for `/api/generate` endpoint; calls orchestrator → ai service → validator → repair | `backend/controllers/generate.controller.js` |
| **orchestrator.service** | Multi-agent orchestration with execution history & status tracking | `backend/services/orchestrator.service.js` |
| **platformAdapterService** | BASE44 export + platform-agnostic manifest generation | `backend/services/platformAdapterService.js` |
| **geminiClient** | Gemini API wrapper (legacy, for UI layout generation) | `backend/services/llm/geminiClient.js` |

---

## Environment Configuration & Startup

### Backend Environment Variables
Create `backend/.env` with these required variables:
```
# API Keys
OPENAI_API_KEY=sk-...                          # Required (gpt-4o model)
GEMINI_API_KEY=AIza...                         # Optional (legacy UI generation)

# Server
PORT=4000                                      # Default: 4000
NODE_ENV=development                           # development | production
FRONTEND_ORIGIN=http://localhost:5175          # Allowed frontend origin for CORS

# Fallback Mode
DEMO_MODE=false                                # If true, returns placeholder data (no API calls)
UI_PROVIDER=openai                             # openai | gemini (provider selection)
```

### Frontend Environment Variables
Vite environment variables in `.env`:
```
VITE_API_BASE=http://localhost:4000            # Dev backend URL
```
In production (Vercel/Render), set via platform UI:
```
VITE_API_BASE=https://your-backend-domain.com # Production backend URL
```

### Startup Checklist
1. **Backend startup** (`backend/server.js` logs configuration):
   ```bash
   cd backend && node server.js
   # Logs show: DEMO_MODE status, API keys present, UI_PROVIDER setting
   ```
   - Verify console shows `✅ API routes mounted successfully`
   - Health check: `curl http://localhost:4000/api/health` returns `{"status":"ok"}`

2. **Frontend startup**:
   ```bash
   npm run dev
   # Runs on http://localhost:5175
   ```
   - Verify requests use `VITE_API_BASE` when calling backend
   - Check browser DevTools Network tab for backend URL

3. **Full stack connectivity**:
   ```bash
   curl http://localhost:4000/api/health         # Backend alive
   curl http://localhost:4000/api/v1/agents/status  # Agent system ready
   ```

---

### Running the Full Stack
```bash
# Terminal 1: Backend (WSL or PowerShell)
cd backend && node server.js          # Runs on http://0.0.0.0:4000
# OR use: npm run dev (if npm script exists)

# Terminal 2: Frontend 
npm run dev                           # Runs on http://localhost:5175
```

**Health Check** (both required):
```bash
curl http://localhost:4000/api/health
# Should return: {"status":"ok"}
```

### Testing Generation Pipeline
```bash
# Basic generation (OpenAI will be used if DEMO_MODE=false)
curl -X POST http://localhost:4000/api/generate \
  -H "Content-Type: application/json" \
  -d '{"prompt": "batch tracking for GMP pharma"}'

# Orchestrated generation (includes domain + safety review)
curl -X POST http://localhost:4000/api/v1/agents/orchestrate \
  -H "Content-Type: application/json" \
  -d '{"goal": "Create a cell culture monitoring dashboard"}'

# Check agent execution history
curl http://localhost:4000/api/v1/agents/history

# Biologics domain endpoints
curl http://localhost:4000/api/v1/biologics/summary
curl http://localhost:4000/api/v1/biologics/pipelines
```

### Scripts & Validation
```bash
# Validate YAML/JSON biologics templates (if npm script exists)
npm run validate:templates

# Lint frontend code
npm run lint

# Build for production
npm run build                         # Creates dist/ folder
```

### Common Debugging Commands
```bash
# Check if backend port is in use (Windows PowerShell)
netstat -ano | findstr :4000

# Kill process on port (Windows)
taskkill /PID <PID> /F

# Check backend logs for startup issues
Get-Content backend/server.js | Select-String "DEMO_MODE|API_KEY|OPENAI"
```

---

## Project-Specific Patterns

### 1. **AppSpec Schema** — The Universal Format
ALL generated applications normalize to this tree structure:
```javascript
{
  id: "layout-xyz",
  name: "App Name",
  domain: "biologics|pharma|clinical|generic",
  nodes: [{
    id, type: "page|section|card|table|button|chart",
    props: { title, variant, columns... },
    children: [/* nested nodes */]
  }]
}
```
**Why**: Decouples AI generation from frontend rendering. All AI models produce this format.
**When modifying**: Any generation service must output valid AppSpec. Use `validateAppSpec()` in `appspec.schema.js`.

### 2. **Staged Generation Pipeline** — 5-Stage Decomposition
Instead of one-shot generation, `ai.service.staged.js` breaks work into discrete stages:
```
Stage 1: parseIntent() → domain, entities, goals (JSON)
Stage 2: buildDataModel() → entity schema + relationships (JSON)
Stage 3: designWorkflow() → process steps + transitions (JSON)
Stage 4: generateScreens() → AppSpec with full layout.nodes
Stage 5: generateWiring() → Complete code + handlers + validation
```
**Why**: Each stage improves quality; intermediate outputs are cached; easier to debug failures.
**Use this for**: Complex apps (biotech, manufacturing) where single-pass generation fails.
**Legacy fallback**: `ai.service.enhanced.js` for simpler requests or when OpenAI unavailable.

### 3. **Copilot Orchestration** — Domain-Aware Routing
The orchestrator detects *intent* and *domain*, then applies architectural patterns:
```javascript
// Input: "batch tracking for GMP pharma"
// orchestrate() returns:
{
  domain: "pharma",
  intent: { type: "data-management", features: ["crud", "export", "audit"] },
  components: ["batch-tracker", "sample-management", "audit-trail", "deviation-log"],
  architectureTemplate: "pharmaceutical_quality_system",
  routing: { service: "ai.service.staged", fallback: "ai.service.enhanced" }
}
```
**Key domains** (in `DOMAIN_PATTERNS` lines 7-26):
- `pharma`: GMP, compliance, batch tracking, audit trails, deviations
- `biotech`: Fermentors, bioprocess, SCADA, digital twins, sensor integration
- `clinical`: Patient enrollment, adverse events, protocols, sites, CTMS
- `manufacturing`: Production dashboards, OEE, equipment status, batch records

**Extend domains**: Add new keywords/components in `backend/services/copilot-orchestrator.js` lines 7-26, then add architecture template (lines 31+).

### 4. **Validation & Error Recovery** — AppSpec Validator
The `appspec.validator.js` is critical to code quality:
```javascript
import { validateAppSpecStrict, isViableSpec, formatProblems } from './validators/appspec.validator.js';

// Validate output from any AI service
const validation = validateAppSpecStrict(generatedSpec);
if (!validation.valid) {
  console.error(formatProblems(validation.problems));
  // Attempt automatic repair or escalate to user
}
```
**Three validation levels**:
- **Strict** (`validateAppSpecStrict`): Full schema compliance; rejects invalid node types/missing required fields
- **Viable** (`isViableSpec`): Lenient check; allows partial specs for incremental generation
- **Repairable** (`isRepairableSpec`): Identifies specs fixable via auto-repair (missing ids, invalid types)

**When to use each**:
- Use `validateAppSpecStrict` after full generation (Stages 4-5 complete)
- Use `isViableSpec` after intermediate stages (1-3) to allow partial data models
- **Never** send unvalidated specs to frontend renderer; always call validator first

### 5. **Multi-Agent Orchestration** — Stateful Execution
`orchestrator.service.js` manages 5-phase execution with audit trail:
```
Phase 1: Retrieve (fetch domain knowledge, templates)
Phase 2: Plan (decompose goal, assign tasks to specialized agents)
Phase 3: Simulate (dry-run with validation)
Phase 4: Execute (generate code, apply templates)
Phase 5: Review (safety agent validates compliance, flags risks)
```
**Endpoints**:
- `POST /api/v1/agents/orchestrate` — Submit goal, get orchestration plan
- `GET /api/v1/agents/history` — Retrieve past executions with status
- `GET /api/v1/agents/status` — Real-time agent statuses
- `GET /api/v1/agents/tools` — Available tools per agent

**Safety Review Phase**: Validates against 21 CFR Part 11, ALCOA+, IND/GLP requirements. Flags non-compliant components before returning to user.

### 5. **AI Provider Selection** — Gemini vs OpenAI
Current strategy (configurable via `UI_PROVIDER` env var):
```
PRIMARY: OpenAI (gpt-4) via ai.service.staged.js
  ✓ Better structured output (stages)
  ✓ Better code generation
  ✓ Better function calling
  
LEGACY: Gemini via geminiClient.js
  ✓ Better layout/UI visualization
  ✓ Fallback for edge cases
  ✗ No function calling support
```
**Environment variables**:
- `OPENAI_API_KEY` — Required (gpt-4 model)
- `GEMINI_API_KEY` — Optional (for legacy UI gen)
- `UI_PROVIDER` — Set to 'openai' (default) or 'gemini' (legacy)
- `DEMO_MODE` — If 'true', returns placeholder data without API calls

### 6. **BASE44 Export & Platform Interoperability**
`platformAdapterService.js` exports generated apps to platform-neutral BASE44 format:
```javascript
POST /api/platform/export {
  projectId: "...",
  target: "base44|raw|custom",
  options: { domain, regulatory }
}
```
**Output**: `{ manifest, importInstructions, timestamp }`

The **BASE44 adapter** preserves:
- Domain context (pharma/biotech/clinical)
- Regulatory metadata (21 CFR Part 11, ALCOA+, GLP)
- Audit trail structure
- Component tree (layout.nodes)
- Data schemas + validations

**Use this for**: FDA submissions, multi-platform deployments, regulatory handoffs.

### 7. **Frontend Component Patterns & API Client**
Components follow hook-based architecture:
```javascript
// src/hooks/useGenerateApp.js — Orchestrates /api/generate calls
// src/api/client.js — HTTP wrapper with error handling + retry logic
// src/components/builder/* — Visual builder UI (drag-drop, tree editing)
// src/pages/* — Full-page views (Dashboard, AppBuilder, Export)
```
**HTTP Client Pattern** (from `src/api/client.js`):
```javascript
const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:4000';
// All requests go through centralized fetchAPI() with error handling
// Environment variable VITE_API_BASE controls backend URL (dev: localhost:4000, prod: deployed URL)
```
**Convention**: 
- All backend calls through `src/api/client.js`
- State management via React hooks (no Redux)
- Real-time feedback via loading + error states
- Export button triggers `/api/platform/export`
- Environment URL resolved via `import.meta.env.VITE_API_BASE`

### 8. **Backend Route Structure**
REST API follows `/api/v1/{resource}` convention (imported in `backend/routes/index.js`):
```
/api/health                              — System status
/api/generate                            — Code generation (legacy, calls copilot orchestrator)
/api/v1/projects/{id}                    — Project CRUD
/api/v1/layouts/{id}                     — Layout CRUD
/api/v1/templates                        — Template library
/api/v1/biologics/summary                — Biologics pipeline summary
/api/v1/biologics/pipelines              — Detailed biotech pipelines
/api/v1/agents/orchestrate               — Multi-phase orchestration
/api/v1/agents/history                   — Execution history + audit
/api/v1/agents/status                    — Real-time agent status
/api/v1/agents/tools                     — Available tools per agent
/api/v1/simulations                      — Process simulations
/api/v1/metrics                          — Metrics summary endpoints
/api/platform/export                     — BASE44 export endpoint
```
**Route files in `backend/routes/`**:
- `projects.routes.js`, `layouts.routes.js`, `templates.routes.js` — Core CRUD
- `generate.routes.js` — Generation endpoints (legacy)
- `agents.routes.js` — Orchestration & agent endpoints
- `biologics.routes.js` — Domain-specific biologics endpoints
- `platform.routes.js` — Export & interoperability
- `index.js` — Main router that mounts all above routes

**Adding new routes**: 
1. Create `backend/routes/feature.routes.js` with Express Router
2. Import in `backend/routes/index.js`
3. Mount with `router.use('/v1/feature', featureRoutes)`
4. Verify via `curl http://localhost:4000/api/v1/feature/...`

---

## Critical Integration Points

### Backend ↔ Frontend API Contract
**Request** (frontend → backend):
```javascript
POST /api/generate {
  prompt: "string",
  currentApp?: { children: [...] }  // For refinement
}

// OR (for orchestration):
POST /api/v1/agents/orchestrate {
  goal: "string",
  domain?: "pharma|biotech|clinical",
  options?: { safetyReview: true, exportFormat: "base44" }
}
```
**Response** (all endpoints):
```javascript
{
  status: "ok|error",
  mode: "generated|demo|error",
  schema: { 
    /* AppSpec: complete layout.nodes tree */
    id, name, domain, nodes: [...]
  },
  files: { 
    "App.jsx": "React code", 
    "styles.css": "Styling",
    "README.md": "Documentation"
  },
  messages: [{ role: "assistant|error|warning", content: "..." }],
  manifest?: { /* BASE44 export data */ }  // If exporting
}
```

### Gemini Integration (Legacy)
- Endpoint: `https://generativelanguage.googleapis.com/v1/models/gemini-pro-vision:generateContent`
- Client: `backend/services/llm/geminiClient.js`
- Format: Sends AppSpec + context → receives layout JSON
- **Note**: Requires post-processing to extract valid AppSpec; used as fallback only

### OpenAI Integration (Primary)
- Model: `gpt-4o` (primary) or `gpt-4` (fallback)
- Client: `backend/services/ai.service.staged.js` (5 stages) or `ai.service.enhanced.js` (legacy)
- Format: System prompts + user request → structured JSON responses
- **Error handling**: Catches API errors, falls back to DEMO_MODE gracefully
- **Rate limiting**: Implements exponential backoff with retry logic
- **Lazy initialization**: OpenAI client created only on first API call (see `getOpenAIClient()` in staged service)

---

## Debugging & Common Issues

### Backend Won't Start
```bash
# Check port conflict (should be 4000)
netstat -ano | findstr :4000  # Windows
lsof -i :4000                 # WSL/Mac

# Verify .env exists
type backend\.env             # Windows
cat backend/.env              # WSL/Mac

# Check API key configuration  
echo $OPENAI_API_KEY $GEMINI_API_KEY
```

### Generation Returns Placeholder Data (DEMO_MODE)
- **Check**: `DEMO_MODE` not set to `true` in `backend/.env`
- **Verify**: Both `OPENAI_API_KEY` and `GEMINI_API_KEY` present
- **Debug**: `backend/server.js` lines 26-31 shows startup config
- **See**: `backend/services/ai.service.enhanced.js` lines 378-384 for fallback logic

### AppSpec Validation Errors
- **Run**: `node backend/schemas/appspec.schema.js` to test schema
- **Check**: All nodes have required fields: `id`, `type`, `props`
- **Verify**: `type` is one of: `page|section|card|table|button|chart|text|form|input|select`
- **Test**: Use `validateAppSpec(spec)` function before rendering

### 5-Stage Generation Fails Midway
- **Stage 1 (parseIntent)**: If domain detection fails, falls back to "generic" domain
- **Stage 2 (buildDataModel)**: Requires valid schema from Stage 1 output
- **Stage 3 (designWorkflow)**: Optional if `intent.hasWorkflow === false`
- **Stages 4-5**: Depend on valid output from earlier stages
- **Debug**: Check console logs for which stage failed; retry with simpler prompt

### CORS Errors (Frontend ↔ Backend)
- **Config**: `backend/app.js` line 17 sets `FRONTEND_ORIGIN`
- **Dev mode**: CORS allows `*` if `NODE_ENV !== 'production'`
- **WSL**: Backend listens on `0.0.0.0:4000` so Windows can reach it
- **Fix**: Ensure frontend URL matches `FRONTEND_ORIGIN` env var

### Agents/Orchestration Not Responding
- **Check**: `/api/v1/agents/status` endpoint returns current state
- **Verify**: `orchestrator.service.js` is initialized (singleton pattern)
- **Debug**: Check execution history with `/api/v1/agents/history`
- **Reset**: Restart backend if agent state corrupted (no persistence)

---

## Key Files Quick Reference

| File | Purpose | Modify When... |
|------|---------|----------------|
| `backend/services/copilot-orchestrator.js` | Domain detection & prompt enhancement | Adding new domains or intent types |
| `backend/services/ai.service.staged.js` | 5-stage OpenAI generation | Changing model version, tweaking stage logic, improving quality |
| `backend/services/ai.service.enhanced.js` | Legacy single-pass generation | Changing fallback behavior or gemini prompts |
| `backend/schemas/appspec.schema.js` | AppSpec validation & normalization | Changing component tree format, adding new node types |
| `backend/services/orchestrator.service.js` | Multi-agent orchestration core | Adding new agents, phases, or execution logic |
| `backend/services/platformAdapterService.js` | BASE44 export + adapters | Adding new export formats or regulatory metadata |
| `backend/routes/agents.routes.js` | Agent endpoint definitions | Adding new orchestration endpoints |
| `src/api/client.js` | Frontend HTTP client | Adding new backend endpoint calls |
| `src/hooks/useGenerateApp.js` | Frontend generation hook | Changing UI state or refinement flow |
| `backend/.env.example` | Environment template | Adding new required env vars |

---

## Conventions for AI Agents

**When generating code:**
1. Always normalize output to AppSpec schema using `validateAppSpec()`
2. For biologics features: Consult `DOMAIN_PATTERNS.pharma|biotech` templates first
3. Domain detection: Check `orchestrate()` output before hard-coding component names
4. Error messages: Include prefixes (🤖 AI service, 📨 HTTP, 💎 Gemini, 🔗 orchestrator)
5. Prompts sent to OpenAI: Use staged approach (separate stage per responsibility)
6. Prompts sent to Gemini: Structure as `[TASK] ... [CONTEXT] ... [FORMAT]`

**Testing new features:**
- Always verify against `/api/health` first
- Use `DEMO_MODE=true` for offline testing without API keys
- Check `backend/server.js` lines 26-36 for configured endpoints
- Validate templates: `npm run validate:templates`
- Test domain detection with diverse industry terms before commit

**When modifying generation:**
- Update both `ai.service.staged.js` AND `ai.service.enhanced.js` for consistency
- Add unit tests for new prompt templates
- Verify AppSpec output against validator before returning
- Check agent execution history for errors: `GET /api/v1/agents/history`

**Deployment:**
- Frontend: Builds to `dist/` via `vite build`, deploy to Vercel/Render/Netlify
- Backend: Node.js + Express, needs all environment variables (see `.env.example`)
- Both: Must share CORS-compatible origin or set FRONTEND_ORIGIN explicitly
- Check: Verify `/api/health` responds before considering deployment complete
