# Copilot Instructions Update — December 21, 2025

## Summary
Updated `.github/copilot-instructions.md` with comprehensive AI agent guidance based on deep codebase analysis. The document now covers the full architectural complexity of NewGen Studio, including multi-agent orchestration, staged generation pipeline, regulatory compliance features, and BASE44 export system.

## Key Enhancements

### 1. **Architecture Overview** (Updated)
- Added 5-stage generation pipeline (Intent → Model → Workflow → Screens → Wiring)
- Added BASE44 manifest export system 
- Added safety agent + compliance validation layer
- Clarified "why" behind architectural decisions

### 2. **Key Services Table** (Expanded from 5 to 7 services)
**New entries**:
- `ai.service.staged.js` — Primary service for complex generation
- `orchestrator.service.js` — Multi-agent orchestration with audit trails
- `platformAdapterService.js` — BASE44 export + platform adapters

**Improvements**:
- Included file locations for all services
- Added purpose descriptions for each

### 3. **Developer Workflows** (Significantly Enhanced)
**New sections**:
- Health check command
- Orchestrated generation testing
- Agent history inspection
- Biologics endpoints testing
- Template validation

**Rationale**: Developers need concrete examples of how to test the platform end-to-end

### 4. **Project-Specific Patterns** (Expanded from 5 to 8 sections)

**New sections**:
- **2. Staged Generation Pipeline** — Detailed 5-stage decomposition with when/why to use
- **4. Multi-Agent Orchestration** — Phase breakdown + endpoints + safety review
- **6. BASE44 Export & Platform Interoperability** — Export format + use cases
- **8. Backend Route Structure** — Full API route listing

**Improvements**:
- Section 3 (Copilot Orchestration) now includes line numbers for domain/template configuration
- Section 5 (AI Provider Selection) restructured with clearer pros/cons and environment variables
- Section 7 (Frontend Patterns) clarified hook-based architecture

### 5. **Critical Integration Points** (Reorganized)
- Split Backend ↔ Frontend contract into orchestrated vs legacy generation
- Added `POST /api/v1/agents/orchestrate` request/response example
- Clarified Gemini legacy status + post-processing requirement
- Added OpenAI rate limiting note

### 6. **Debugging & Common Issues** (Significantly Expanded)
**New troubleshooting sections**:
- 5-Stage Generation Fails Midway
- Agents/Orchestration Not Responding

**Improvements**:
- Added specific line numbers for debugging
- Included diagnostic commands (WSL/Windows/Mac)
- Added fallback strategies

### 7. **Key Files Quick Reference** (Added context)
- Reordered by architectural importance
- Added `orchestrator.service.js` and `platformAdapterService.js`
- Added `backend/routes/agents.routes.js`
- Clarified "modify when" guidance for each

### 8. **Conventions for AI Agents** (Enhanced)
**New guidance**:
- 5 specific code generation patterns vs 4
- Staged approach for OpenAI, structure approach for Gemini
- Testing domain detection with diverse industry terms
- Keeping `ai.service.staged.js` and `ai.service.enhanced.js` in sync
- Deployment verification checklist

**Rationale**: Agents need clear rules about when to use which service and how to test

## Discovery Sources

### Architecture Patterns Found
- `backend/services/ai.service.staged.js` — 5-stage pipeline with lazy OpenAI initialization
- `backend/services/copilot-orchestrator.js` — DOMAIN_PATTERNS (4 domains) + ARCHITECTURE_TEMPLATES (7-layer biotech, 5-layer pharma)
- `backend/services/orchestrator.service.js` — Multi-agent execution with phases/audit trail
- `backend/services/platformAdapterService.js` — BASE44 adapter + regulatory metadata
- `backend/schemas/appspec.schema.js` — Universal AppSpec contract (layout.nodes format)

### Integration Points Found
- `/api/v1/agents/orchestrate` endpoint with 5-phase execution
- `/api/v1/agents/history` + `/api/v1/agents/status` for agent introspection
- `/api/platform/export` for BASE44 manifest export
- `/api/v1/biologics/{summary,pipelines}` domain-specific endpoints

### Key Conventions Discovered
- Backend binds to `0.0.0.0:4000` for WSL/Windows bridge
- Frontend uses `src/api/client.js` as HTTP wrapper
- All generation normalizes to AppSpec schema before rendering
- Domain detection drives template selection + architectural routing

## File Statistics
- **Total lines**: 375 (increased from 236, +59% more detail)
- **Sections**: 8 major sections (unchanged) + 27 subsections
- **Code examples**: 12+ specific examples with parameters
- **Line number references**: 25+ specific file:line locations for precise debugging

## Recommendations for Users

### For New Developers
1. Read sections **1-3** (Architecture, Developer Workflows)
2. Run the health check and test generation commands in **Developer Workflows**
3. Reference **Key Files** when navigating code
4. Use **Debugging & Common Issues** when stuck

### For Feature Implementation
1. Consult **Project-Specific Patterns** for your domain
2. Check **Conventions for AI Agents** before writing generation code
3. Reference specific services in **Key Services** table
4. Run `/api/v1/agents/history` to audit orchestration

### For Extending the Platform
1. Read **Multi-Agent Orchestration** (Section 4) to understand 5-phase flow
2. Review **BASE44 Export** (Section 6) for platform interoperability
3. Use **Backend Route Structure** as template when adding new endpoints
4. Update both `ai.service.staged.js` and `ai.service.enhanced.js` for consistency

## Next Steps
- Share with AI agents and development team
- Use as authoritative reference in code reviews
- Update periodically as architecture evolves
- Consider adding code examples from real successful generations
