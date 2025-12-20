# NewGen Studio — AI Agent Coding Instructions

## Architecture Overview

**NewGen Studio** is a low-code platform for building biologics & pharma applications. It combines:
- **Frontend**: React 19 + Vite SPA (`src/`) with drag-and-drop builder UI
- **Backend**: Express.js Node.js API (`backend/`) with Copilot orchestration layer
- **AI Integration**: Gemini/OpenAI routing for intelligent code generation

### Core Data Flow
1. User describes app requirements → Frontend sends to `/api/generate`
2. **Copilot Orchestrator** analyzes domain (pharma/biotech/clinical) → enriches prompt
3. **AI Service** (Gemini/OpenAI) generates layout tree + code files
4. **AppSpec** schema normalizes all generation into component tree format
5. Frontend renders interactive builder with live code preview

### Key Services (Must Know These)
| Service | Purpose | Key Files |
|---------|---------|-----------|
| **copilot-orchestrator** | Domain analysis, architectural routing, prompt enhancement | `backend/services/copilot-orchestrator.js` |
| **ai.service.enhanced** | Biologics-aware code generation with OpenAI fallback | `backend/services/ai.service.enhanced.js` |
| **generateAppSpecWithGemini** | Gemini API client for layout generation | `backend/services/llm/geminiClient.js` |
| **AppSpec Schema** | Normalizes all generation output (layout tree format) | `backend/schemas/appspec.schema.js` |
| **Route Controllers** | HTTP endpoints for projects, templates, agents | `backend/controllers/*.js` |

---

## Developer Workflows

### Running the Full Stack
```bash
# Terminal 1: Backend
cd backend && node server.js          # Runs on http://0.0.0.0:4000

# Terminal 2: Frontend
npm run dev                           # Runs on http://localhost:5175
```

### Testing Endpoints
```bash
# Health check
curl http://localhost:4000/api/health

# Generate app from prompt
curl -X POST http://localhost:4000/api/generate \
  -H "Content-Type: application/json" \
  -d '{"prompt": "batch tracking for cell culture"}'

# Biologics endpoints
curl http://localhost:4000/api/v1/biologics/summary
curl http://localhost:4000/api/v1/biologics/pipelines
```

### Validation
```bash
# Validate YAML/JSON templates (biologics resources)
npm run validate:templates

# Lint frontend
npm run lint
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

### 2. **Copilot Orchestration** — Domain-Aware Routing
The orchestrator detects *intent* and *domain*, then applies architectural patterns:
```javascript
// Input: "batch tracking for GMP pharma"
// Output: {
//   domain: "pharma",
//   intent: { type: "create-dashboard" },
//   components: ["batch-management", "audit-trail", "deviation-log"],
//   routing: { primary: "gemini", fallback: "openai" }
// }
```
**Key domains** (in `DOMAIN_PATTERNS`):
- `pharma`: GMP, compliance, quality systems
- `biotech`: Fermentors, bioprocess, purification
- `clinical`: Patient enrollment, adverse events, protocols
- `manufacturing`: Production, OEE, equipment

**Extend this**: Add new domain keywords in `backend/services/copilot-orchestrator.js` lines 5-25.

### 3. **AI Provider Selection** — Gemini vs OpenAI
```javascript
// Strategy (from generate.controller.js):
// - Gemini (primary): Better for UI/layout generation
// - OpenAI (fallback): Better for business logic/workflows
// - Router checks: UI_PROVIDER env, complexity heuristics, domain
```
**Environment variables**:
- `GEMINI_API_KEY` — Required for Gemini calls
- `OPENAI_API_KEY` — Required for fallback/refinement
- `UI_PROVIDER` — Set to 'gemini' or 'openai' (default: 'gemini')
- `DEMO_MODE` — If true, returns placeholder data (for testing without API keys)

### 4. **Frontend Component Patterns**
Components follow a consistent hook-based architecture:
```javascript
// src/hooks/useGenerateApp.js — Custom hook for /api/generate calls
// src/api/client.js — HTTP client with error handling
// src/components/builder/* — Visual builder UI components
```
**Convention**: All backend calls go through `src/api/client.js` with proper error handling.

### 5. **Backend Route Structure**
Routes follow REST `/api/v1/{resource}` convention:
```
/api/v1/projects/{id}      — Project CRUD
/api/v1/templates          — Template library
/api/v1/biologics/{endpoint} — Biologics domain
/api/v1/agents/orchestrate — Copilot orchestration trigger
/api/generate              — Code generation (no v1 prefix, legacy)
```
**Adding routes**: Import in `backend/routes/index.js`, mount with `router.use()`.

---

## Critical Integration Points

### Backend ↔ Frontend API Contract
**Request** (frontend → backend):
```javascript
POST /api/generate {
  prompt: "string",
  currentApp?: { children: [...] }  // For refinement
}
```
**Response**:
```javascript
{
  status: "ok|error",
  mode: "generated|demo|error",
  schema: { /* AppSpec */ },
  files: { "App.jsx": "...", "styles.css": "..." },
  messages: [{ role: "assistant", content: "..." }]
}
```

### Gemini Integration
- Endpoint: `https://generativelanguage.googleapis.com/v1/models/gemini-pro-vision:generateContent`
- Client: `backend/services/llm/geminiClient.js`
- Format: Sends AppSpec + context → receives layout JSON
- **Note**: Gemini responses require post-processing to extract valid AppSpec

### OpenAI Integration
- Model: `gpt-4` or `gpt-3.5-turbo`
- Client: `backend/services/ai.service.enhanced.js` (lines 384+)
- Format: System + user prompt → structured code generation
- **Error handling**: Catches API errors, falls back gracefully

---

## Debugging & Common Issues

### Backend Won't Start
```bash
# Check port conflict (should be 4000)
netstat -ano | findstr :4000

# Verify .env exists
type backend/.env

# Check API key configuration
echo $GEMINI_API_KEY $OPENAI_API_KEY
```

### Generation Returns Placeholder Data
- Check: `DEMO_MODE` not set to `true` in `backend/.env`
- Verify: Both `GEMINI_API_KEY` and `OPENAI_API_KEY` present
- See: `backend/services/ai.service.enhanced.js` lines 378-384

### AppSpec Validation Errors
- Run: `node -e "import('./backend/schemas/appspec.schema.js').then(m => m.validateAppSpec(data))"`
- Check: All nodes have `id`, `type`, `props` fields
- Verify: `type` is one of: `page|section|card|table|button|chart|text`

### CORS Errors (Frontend ↔ Backend)
- Check `backend/app.js` line 18: `FRONTEND_ORIGIN` should match dev frontend URL
- For WSL: Backend listens on `0.0.0.0:4000` (Windows can reach it)

---

## Key Files Quick Reference

| File | Purpose | Modify When... |
|------|---------|----------------|
| `backend/services/copilot-orchestrator.js` | Domain detection & prompt enhancement | Adding new domains or intent types |
| `backend/services/ai.service.enhanced.js` | AI generation with OpenAI | Changing model, tweaking prompts, error handling |
| `backend/schemas/appspec.schema.js` | AppSpec validation & normalization | Changing component tree format |
| `backend/routes/generate.routes.js` | POST /api/generate endpoint | Changing generation request/response |
| `src/api/client.js` | Frontend HTTP client | Adding new backend endpoints |
| `src/hooks/useGenerateApp.js` | Frontend generation logic | Changing UI state, refinement flow |
| `backend/.env.example` | Environment template | Adding new required env vars |

---

## Conventions for AI Agents

**When generating code:**
1. Always normalize output to AppSpec schema using `validateAppSpec()`
2. For biologics features: Consult `DOMAIN_PATTERNS.pharma|biotech` templates first
3. Domain detection: Check `orchestrate()` output before hard-coding component names
4. Error messages: Include 🤖 prefix for AI service logs, 📨 for requests, 💎 for Gemini
5. Prompts sent to Gemini/OpenAI: Structure as `[TASK] ... [CONTEXT] ... [FORMAT]`

**Testing new features:**
- Always verify against `/api/health` first
- Use `DEMO_MODE=true` for offline testing
- Check `backend/server.js` startup logs for configured endpoints
- Validate templates: `npm run validate:templates`

**Deployment:**
- Frontend: Builds to `dist/` via `vite build`, deploy to Vercel/Render
- Backend: Node.js + Express, needs environment variables (see `.env.example`)
- Both: Must be on same parent domain or have CORS configured properly
