# NewGen Studio — Low-Code Biologics & Pharma App Generator

A platform for rapidly generating compliant applications for biologics, pharma, and clinical domains using multi-stage AI orchestration.

## 📋 System Overview & Deployment Docs

**Before deploying or contributing, read these:**

| Document | Purpose | Audience |
|----------|---------|----------|
| [ENDPOINT_STATUS_REPORT.md](./ENDPOINT_STATUS_REPORT.md) | Complete API contract, port mappings, timeout architecture, known limitations | Developers, DevOps, Tech Leads |
| [STAGING_CHECKLIST.md](./STAGING_CHECKLIST.md) | Go/no-go runbook for first staging deploy | Release Engineers, QA |
| [.github/copilot-instructions.md](./.github/copilot-instructions.md) | Architecture patterns, AI generation pipeline, service boundaries | AI Agents, Contributors |

**Quick Links:**
- **API Status**: [17 endpoints across 4 namespaces](./ENDPOINT_STATUS_REPORT.md#2-api-endpoint-inventory)
- **Generation Pipeline**: [5-stage AI orchestration with graceful fallback](./ENDPOINT_STATUS_REPORT.md#5-generation-pipeline-ai--timeouts)
- **Known Limitations**: [Auth, rate-limiting, telemetry todos](./ENDPOINT_STATUS_REPORT.md#9-known-limitations--todos)
- **First Staging Deploy**: [Complete pre-deploy checklist](./STAGING_CHECKLIST.md)

---

## Development Quick Start

```bash
# Backend
cd backend && node server.js          # Listens on 0.0.0.0:4000

# Frontend (new terminal)
npm run dev                           # Vite SPA on localhost:5175

# Health check
curl http://localhost:4000/api/health
# → {"status":"ok"}
```

## Import from BASE44

NewGen Studio supports importing applications from BASE44 format:

1. Click the **"Import BASE44"** button in the Build page
2. Select a BASE44 JSON file from your computer
3. The app structure will be automatically converted to a human-readable prompt
4. Review the generated prompt text in the textarea
5. Click **"Generate App"** to create the application from the imported structure

**Example BASE44 file format:**
```json
{
  "name": "Customer Dashboard",
  "components": [
    {
      "type": "table",
      "props": {
        "title": "Customer List",
        "columns": ["Name", "Email", "Phone"],
        "data": [
          {"Name": "John Doe", "Email": "john@example.com", "Phone": "555-1234"}
        ]
      }
    },
    {
      "type": "card",
      "props": {
        "title": "Total Customers",
        "value": "42"
      }
    }
  ]
}
```

**Sample test file:** See `test-import.json` in the project root for a complete example.

---

## Production Overview

This project ships with a **production-ready operational documentation spine** designed to keep deployments calm and predictable.

### What Each Document Does

**[ENDPOINT_STATUS_REPORT.md](./ENDPOINT_STATUS_REPORT.md)** — The Backend Contract  
Enumerates all 17 active endpoints with methods, expected behavior, port mappings (DEV: 4000, PROD: 443 behind proxy), timeout hierarchy (30s total, 20s AI processing), CORS rules, request limits, and known limitations (auth, rate-limiting, telemetry all documented as Phase 2 items).

**[STAGING_CHECKLIST.md](./STAGING_CHECKLIST.md)** — The Deployment Runbook  
Step-by-step staging guide with copy-pasteable curl commands, explicit go/no-go criteria, and troubleshooting hints. Covers secrets, build, environment, CORS, smoke tests, observability, and performance validation so ops can execute without extra meetings.

**[.github/copilot-instructions.md](./.github/copilot-instructions.md)** — AI Agent & Contributor Guide  
Architecture patterns, AI generation pipeline, service boundaries, and development workflows for building features.

### Audience Quick Links

- **Developers**: Start with dev setup above → read [Copilot instructions](./.github/copilot-instructions.md) before building features
- **DevOps / Release**: Jump to [STAGING_CHECKLIST.md](./STAGING_CHECKLIST.md) → execute line-by-line for any deployment
- **QA / Testers**: Use [STAGING_CHECKLIST.md](./STAGING_CHECKLIST.md) as the objective basis for staging sign-off
- **Security / Reviewers**: Read [ENDPOINT_STATUS_REPORT.md](./ENDPOINT_STATUS_REPORT.md) for current behavior, explicit gaps, and Phase 2 roadmap

### Keeping Docs in Sync

**Change Management**: If runtime behavior changes, update [ENDPOINT_STATUS_REPORT.md](./ENDPOINT_STATUS_REPORT.md). If deployment steps change, update [STAGING_CHECKLIST.md](./STAGING_CHECKLIST.md). Keep documents in sync with behavior, not intentions.

---

## React + Vite Foundation

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Babel](https://babeljs.io/) (or [oxc](https://oxc.rs) when used in [rolldown-vite](https://vite.dev/guide/rolldown)) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the ESLint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and [`typescript-eslint`](https://typescript-eslint.io) in your project.
