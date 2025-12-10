/**
 * ONE-SHOT CONTEXT FOR COPILOT
 *
 * Project: NewGen Studio – AI-driven biologics/pharma platform with migration & orchestration
 *
 * Goal:
 * Build a Node/Express + React platform that combines:
 * 1. AI-driven biologics/pharma capabilities (simulation, graph networks, agentic AI)
 * 2. Migration/orchestration layer for low-code platforms (Base 44, Retool, Bubble, Outsystems)
 * 3. No-code → light-code → full-code progression for all user personas
 *
 * Core concepts:
 * - Projects: imported apps or generated scaffolds with metadata, pages, data models, workflows
 * - Templates: vetted biologics protocols, pipelines, algorithms (CRISPR, AlphaFold, mRNA-seq)
 * - Resources Center: marketplace of reusable templates, presets, algorithms, datasets
 * - Simulation Engine: virtual experiments, reagent modeling, timeline/cost analysis
 * - Graph Networks: molecular interactions, protocol DAGs, instrument topology, sample lineage
 * - Agentic AI: Retriever, Planner, Simulator, Executor, Safety/Compliance agents
 *
 * Tech stack:
 * - Backend: Node.js + Express (modular routers, async/await, error middleware)
 *   - REST endpoints: /api/v1/projects, /api/v1/templates, /api/v1/generate, /api/v1/simulate
 *   - Future: JWT/OAuth, vector DB (Qdrant), graph DB (Neo4j), LIMS connectors (Benchling)
 *
 * - Frontend: React 19 + Vite + react-router + TailwindCSS
 *   - Screens: Dashboard, Builder (AI Architect), Resources Center, Support, Projects, Templates
 *   - Components: clean composition, hooks, lucide-react icons
 *
 * Domain focus (biologics/pharma):
 * - Computational-first: AlphaFold, genomics pipelines, imaging analytics (no wet-lab procedures)
 * - Instrument integration: metadata profiles only, human-in-loop for any lab actions
 * - Safety & compliance: 21 CFR Part 11, audit trails, policy engine, sandboxed execution
 * - Sample metadata: chain-of-custody, provenance, barcode tracking
 *
 * Collaboration & interoperability:
 * - Import/export project configs (JSON), webhook notifications, connector adapters
 * - Template validation (JSON Schema), smoke tests, CI enforcement
 *
 * Coding style:
 * - Small, pure functions; TypeScript-friendly patterns; JSDoc for non-trivial code
 * - Centralize constants; favor clarity over cleverness
 * - Existing naming: NewGenStudioApp, projects, templates, builder, generateWithGemini
 *
 * When generating code:
 * - Think: "How does this help migrate/scaffold/simulate biologics workflows?"
 * - Always include safety checks for lab-impacting actions
 * - Provide provenance (model version, sources, citations) for AI-generated artifacts
 */
