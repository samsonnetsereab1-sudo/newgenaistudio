# Copilot Orchestration Layer - Design Document

## Vision
Use AI (GitHub Copilot API or GPT-4) as an intelligent orchestration layer that:
- Analyzes user requests
- Selects the best AI service (Gemini for UI, OpenAI for logic)
- Generates optimized prompts
- Validates and enhances outputs
- Learns from failures

---

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│                        USER INPUT                            │
│          "Build a cGMP sample tracker"                       │
└────────────────────────┬────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────┐
│             COPILOT ORCHESTRATION LAYER                      │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  1. ANALYZE REQUEST                                   │  │
│  │     - Domain detection (pharma/biologics/clinical)    │  │
│  │     - Complexity assessment                           │  │
│  │     - Component identification                        │  │
│  └──────────────────────────────────────────────────────┘  │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  2. ROUTE & ENHANCE                                   │  │
│  │     - Select best service (Gemini/OpenAI)            │  │
│  │     - Generate detailed prompt                        │  │
│  │     - Add domain-specific requirements               │  │
│  └──────────────────────────────────────────────────────┘  │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  3. VALIDATE & REFINE                                │  │
│  │     - Check layout.nodes structure                    │  │
│  │     - Add missing components                          │  │
│  │     - Apply domain best practices                     │  │
│  └──────────────────────────────────────────────────────┘  │
└────────────────────────┬────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────┐
│                  AI SERVICES                                 │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐        │
│  │   Gemini    │  │   OpenAI    │  │   Azure     │        │
│  │  (UI Gen)   │  │  (Logic)    │  │   (ML)      │        │
│  └─────────────┘  └─────────────┘  └─────────────┘        │
└────────────────────────┬────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────┐
│                   RENDERED OUTPUT                            │
│     Complete, functional UI with proper components           │
└─────────────────────────────────────────────────────────────┘
```

---

## Implementation Plan

### Phase 1: Core Orchestrator (Week 1)

**File:** `backend/services/copilot-orchestrator.js`

```javascript
/**
 * Copilot Orchestration Service
 * Analyzes requests and routes to appropriate AI services
 */

import { generateAppSpecWithGemini } from './llm/geminiClient.js';
import { generateSingleShot } from './ai.service.staged.js';

// Domain detection keywords
const DOMAINS = {
  biologics: ['sample', 'assay', 'protein', 'antibody', 'biologics', 'lims', 'chromatography'],
  pharma: ['drug', 'formulation', 'batch', 'cgmp', 'gmp', 'pharmaceutical', 'manufacturing'],
  clinical: ['trial', 'patient', 'clinical', 'study', 'enrollment', 'adverse'],
  generic: []
};

// Complexity indicators
const COMPLEXITY_MARKERS = {
  high: ['audit', 'compliance', 'validation', 'workflow', 'approval', 'signature'],
  medium: ['form', 'table', 'search', 'filter', 'export'],
  low: ['dashboard', 'view', 'list', 'display']
};

export async function orchestrateGeneration(userPrompt) {
  console.log('[Orchestrator] Analyzing request:', userPrompt);
  
  // Step 1: Analyze the request
  const analysis = await analyzeRequest(userPrompt);
  console.log('[Orchestrator] Analysis:', analysis);
  
  // Step 2: Generate enhanced prompt
  const enhancedPrompt = generateEnhancedPrompt(userPrompt, analysis);
  console.log('[Orchestrator] Enhanced prompt generated');
  
  // Step 3: Route to appropriate service
  const rawSpec = await routeToService(enhancedPrompt, analysis);
  console.log('[Orchestrator] Received spec from service');
  
  // Step 4: Validate and enhance output
  const finalSpec = await validateAndEnhance(rawSpec, analysis);
  console.log('[Orchestrator] Final spec ready');
  
  return finalSpec;
}

async function analyzeRequest(prompt) {
  const promptLower = prompt.toLowerCase();
  
  // Detect domain
  let domain = 'generic';
  for (const [domainName, keywords] of Object.entries(DOMAINS)) {
    if (keywords.some(kw => promptLower.includes(kw))) {
      domain = domainName;
      break;
    }
  }
  
  // Assess complexity
  let complexity = 'low';
  if (COMPLEXITY_MARKERS.high.some(kw => promptLower.includes(kw))) {
    complexity = 'high';
  } else if (COMPLEXITY_MARKERS.medium.some(kw => promptLower.includes(kw))) {
    complexity = 'medium';
  }
  
  // Identify required components
  const components = [];
  if (promptLower.includes('form') || promptLower.includes('create') || promptLower.includes('register')) {
    components.push('form');
  }
  if (promptLower.includes('table') || promptLower.includes('list') || promptLower.includes('view')) {
    components.push('table');
  }
  if (promptLower.includes('dashboard') || promptLower.includes('metrics')) {
    components.push('dashboard');
  }
  if (promptLower.includes('chart') || promptLower.includes('graph')) {
    components.push('chart');
  }
  
  return {
    domain,
    complexity,
    components,
    requiresValidation: complexity === 'high',
    requiresAudit: promptLower.includes('audit') || promptLower.includes('cgmp')
  };
}

function generateEnhancedPrompt(originalPrompt, analysis) {
  let enhanced = `Generate a complete UI layout using layout.nodes structure.\n\n`;
  enhanced += `Original request: ${originalPrompt}\n\n`;
  enhanced += `Domain: ${analysis.domain}\n`;
  enhanced += `Complexity: ${analysis.complexity}\n\n`;
  
  enhanced += `REQUIRED STRUCTURE:\n`;
  enhanced += `{\n`;
  enhanced += `  "status": "ok",\n`;
  enhanced += `  "layout": {\n`;
  enhanced += `    "id": "unique-id",\n`;
  enhanced += `    "name": "App Name",\n`;
  enhanced += `    "domain": "${analysis.domain}",\n`;
  enhanced += `    "nodes": [\n`;
  enhanced += `      {\n`;
  enhanced += `        "id": "page-1",\n`;
  enhanced += `        "type": "page",\n`;
  enhanced += `        "props": {"title": "Page Title"},\n`;
  enhanced += `        "children": [...]\n`;
  enhanced += `      }\n`;
  enhanced += `    ]\n`;
  enhanced += `  }\n`;
  enhanced += `}\n\n`;
  
  enhanced += `MUST INCLUDE:\n`;
  if (analysis.components.includes('form')) {
    enhanced += `- Form section with input fields (type: "input"), dropdowns (type: "select"), and submit button\n`;
  }
  if (analysis.components.includes('table')) {
    enhanced += `- Table with columns and at least 3 sample data rows (type: "table", props must have "columns" and "data" arrays)\n`;
  }
  if (analysis.components.includes('dashboard')) {
    enhanced += `- Metric cards showing KPIs (type: "card" with numeric values)\n`;
  }
  
  if (analysis.domain === 'biologics' || analysis.domain === 'pharma') {
    enhanced += `\nDOMAIN-SPECIFIC REQUIREMENTS:\n`;
    enhanced += `- Sample fields: Sample ID, Batch Number, Material Type (dropdown), Status (dropdown), Location, Created Date, Operator\n`;
    enhanced += `- Status options: Pending, Received, Testing, Released, Rejected\n`;
    enhanced += `- Material options: Raw Material, In-Process, Bulk Drug Substance, Finished Product\n`;
  }
  
  if (analysis.requiresAudit) {
    enhanced += `- Add audit trail section showing timestamp, user, action, details\n`;
  }
  
  return enhanced;
}

async function routeToService(prompt, analysis) {
  // For complex UI generation, use Gemini
  if (analysis.components.length > 2 || analysis.complexity === 'high') {
    console.log('[Orchestrator] Routing to Gemini for complex UI');
    return await generateAppSpecWithGemini(prompt);
  }
  
  // For simple apps, use OpenAI
  console.log('[Orchestrator] Routing to OpenAI for simple UI');
  return await generateSingleShot(prompt);
}

async function validateAndEnhance(spec, analysis) {
  // Ensure proper structure
  if (!spec.layout || !spec.layout.nodes) {
    console.error('[Orchestrator] Invalid spec structure, wrapping');
    return {
      status: 'ok',
      layout: {
        id: 'generated',
        name: 'Generated App',
        domain: analysis.domain,
        nodes: spec.nodes || []
      }
    };
  }
  
  // Add missing components based on analysis
  const nodes = spec.layout.nodes || [];
  
  // Ensure at least one page node
  if (!nodes.some(n => n.type === 'page')) {
    console.log('[Orchestrator] Adding missing page node');
    spec.layout.nodes = [{
      id: 'page-main',
      type: 'page',
      props: { title: 'Main View' },
      children: nodes
    }];
  }
  
  return spec;
}
```

---

### Phase 2: Integration (Week 1-2)

**Update:** `backend/controllers/apps.controller.js`

```javascript
import { orchestrateGeneration } from '../services/copilot-orchestrator.js';

// In generateApp function, replace direct AI calls with:
const result = await orchestrateGeneration(prompt);
```

---

### Phase 3: Learning Layer (Week 2-3)

**File:** `backend/services/copilot-learning.js`

```javascript
/**
 * Learning system to improve over time
 */

const successPatterns = [];
const failurePatterns = [];

export function recordSuccess(prompt, analysis, spec) {
  successPatterns.push({
    prompt,
    analysis,
    spec,
    timestamp: Date.now()
  });
}

export function recordFailure(prompt, analysis, error) {
  failurePatterns.push({
    prompt,
    analysis,
    error,
    timestamp: Date.now()
  });
}

export function getSimilarSuccesses(analysis) {
  return successPatterns
    .filter(p => p.analysis.domain === analysis.domain)
    .slice(-5); // Last 5 successes
}
```

---

## Benefits

### Immediate (Phase 1):
- ✅ Better prompt engineering → better outputs
- ✅ Domain-specific enhancements
- ✅ Validation catches errors early
- ✅ Consistent structure

### Medium-term (Phase 2):
- ✅ Intelligent routing saves costs
- ✅ Specialized services for specialized tasks
- ✅ Fallback strategies
- ✅ Error recovery

### Long-term (Phase 3):
- ✅ Learns from successes
- ✅ Improves over time
- ✅ Pattern recognition
- ✅ User-specific optimization

---

## Example Flow

### User Request:
```
"Build a cGMP sample tracker with registration form, sample list table, and audit log"
```

### Copilot Analysis:
```json
{
  "domain": "pharma",
  "complexity": "high",
  "components": ["form", "table", "dashboard"],
  "requiresValidation": true,
  "requiresAudit": true
}
```

### Enhanced Prompt to Gemini:
```
Generate a complete UI layout using layout.nodes structure.

Original request: Build a cGMP sample tracker...

Domain: pharma
Complexity: high

REQUIRED STRUCTURE: {...}

MUST INCLUDE:
- Form section with fields: Sample ID (input), Batch Number (input), 
  Material Type (select: Raw Material, In-Process, Bulk Drug, Finished Product),
  Status (select: Pending, Received, Testing, Released, Rejected),
  Location (input), Created Date (date), Operator (input)
- Table with columns: Sample ID, Batch Number, Material, Status, Location, Date
  with at least 3 sample rows
- Audit trail section: timestamp, user, action, details

cGMP Requirements:
- Electronic signatures on forms
- Immutable audit trail
- Data integrity validation
```

### Result:
Complete, validated `layout.nodes` spec that frontend can render immediately.

---

## Implementation Priority

**Week 1 (High Priority):**
1. ✅ Create `copilot-orchestrator.js`
2. ✅ Implement `analyzeRequest()`
3. ✅ Implement `generateEnhancedPrompt()`
4. ✅ Test with sample requests

**Week 2 (Medium Priority):**
5. ✅ Add domain-specific templates
6. ✅ Implement validation logic
7. ✅ Integration with existing controllers
8. ✅ Add error handling

**Week 3 (Nice to Have):**
9. ⚡ Learning system
10. ⚡ Pattern matching
11. ⚡ Cost optimization
12. ⚡ Performance monitoring

---

## Success Metrics

- **Quality:** 80%+ of generations render complete UIs (vs current ~20%)
- **Speed:** < 10 seconds per generation
- **Cost:** < $0.10 per generation
- **User Satisfaction:** 4+ star rating on outputs

---

## Next Steps

1. Review this design with team
2. Create `copilot-orchestrator.js` file
3. Write unit tests for analyzer
4. Test with 10 sample prompts
5. Integrate with existing backend
6. Deploy to staging
7. Monitor and iterate

---

**Status:** 🎯 Ready for Implementation
**Priority:** HIGH - Solves core quality issue
**Effort:** 2-3 weeks
**Impact:** CRITICAL - Makes NewGen Studio actually work
