# Intelligent Routing Guide

## Overview

NewGen Studio's intelligent routing system analyzes prompt complexity and automatically routes requests to the optimal generation workflow. This ensures simple prompts get fast responses while complex prompts leverage advanced AI capabilities.

## Routing Decision Tree

```
User Input
    │
    ├─► Format Detection
    │   ├─► Technical (JSX/HTML/JSON) → Adapter → Direct Generation
    │   └─► Natural Language → Complexity Analysis
    │
    └─► Complexity Analysis (0-10 scale)
        │
        ├─► Score >= 7.0 → Low Confidence (< 50%)
        │   └─► AUTO: Triple Power Combo
        │
        ├─► Score 5.0-6.9 → Medium Confidence (50-69%)
        │   └─► ASK USER: Show routing modal
        │       ├─► User chooses: Direct Generation
        │       └─► User chooses: Triple Power Combo
        │
        └─► Score < 5.0 → High Confidence (>= 70%)
            └─► DIRECT: NewGen Standard Generation
```

## Complexity Analysis

### Scoring Factors

```javascript
complexity = 0

// 1. Length (max +4)
if (prompt.length > 500)  complexity += 2
if (prompt.length > 1000) complexity += 2

// 2. Technical Terms (max +3)
for each technical term: complexity += 0.5
cap at 3.0

// 3. Multiple Sections (max +2)
for each section/page/tab mention: complexity += 0.3
cap at 2.0

// 4. Complex Workflows (max +2)
for each workflow/wizard/rule: complexity += 1.0
cap at 2.0

// 5. Custom Components (+1)
if contains custom component keywords: complexity += 1

// 6. Integrations (+1)
if contains integration keywords: complexity += 1

// Total: 0-10 scale
```

### Detection Patterns

#### Custom Components
```javascript
const CUSTOM_COMPONENTS = [
  'custom', 'special', 'unique', 'proprietary',
  'drag and drop', 'drag-and-drop',
  'calendar', 'scheduler', 'gantt', 'kanban', 'timeline',
  'rich text editor', 'wysiwyg',
  'file upload', 'image gallery', 'video player'
];
```

#### Complex Logic
```javascript
const COMPLEX_LOGIC = [
  'calculate', 'algorithm', 'formula',
  'if...then', 'if then', 'when...do', 'when do',
  'rule', 'condition',
  'multi-step', 'wizard',
  'validation', 'state machine', 'workflow engine',
  'decision tree', 'complex validation'
];
```

#### Integrations
```javascript
const INTEGRATIONS = [
  'stripe', 'paypal', 'twilio', 'sendgrid',
  'slack', 'teams', 'zoom', 'salesforce',
  'integrate with', 'connect to', 'sync with',
  'api call', 'webhook', 'third-party',
  'external service', 'oauth', 'authentication'
];
```

#### Technical Terms
```javascript
const TECHNICAL_TERMS = [
  'microservice', 'websocket', 'real-time',
  'database', 'sql', 'nosql', 'mongodb', 'postgres', 'redis',
  'cache', 'queue', 'async', 'concurrent',
  'distributed', 'scalable', 'load balancer',
  'cdn', 'serverless'
];
```

## Confidence Calculation

```javascript
confidence = 100

if (complexity > 7) {
  confidence -= 30  // High complexity reduces confidence
}

if (hasCustomComponents) {
  confidence -= 25  // Custom components need advanced AI
}

if (hasComplexLogic) {
  confidence -= 20  // Complex logic requires careful handling
}

if (hasIntegrations) {
  confidence -= 25  // Integrations need special handling
}

// Final: 0-100%
```

## Routes

### 1. DIRECT Generation

**When**: Confidence >= 70%

**Characteristics**:
- Simple, straightforward prompts
- Standard components only
- No complex workflows
- No third-party integrations

**Example Prompts**:
- "Build a task tracker"
- "Create a contact list"
- "Simple inventory dashboard"

**Process**:
1. Standard NewGen AI generation
2. AppSpec validation
3. Direct rendering

**Performance**: 2-5 seconds

### 2. ASK USER (Routing Modal)

**When**: Confidence 50-69%

**Characteristics**:
- Medium complexity
- Some custom components OR
- Some workflow logic OR
- Moderate length

**Example Prompts**:
- "Build a sample tracker with custom validation rules"
- "Create a dashboard with calendar scheduling"
- "Multi-step form wizard with conditional fields"

**Process**:
1. Analyze complexity
2. Show routing modal with options:
   - **Option 1**: Direct Generation (faster, simpler)
   - **Option 2**: Triple Power Combo (slower, more powerful)
3. User selects preferred route
4. Execute chosen workflow

**Modal UI**:
```
┌─────────────────────────────────────┐
│ 🤔 Choose Generation Method         │
├─────────────────────────────────────┤
│ Analysis: Prompt requires advanced  │
│ AI capabilities                     │
│ Complexity: 6.5/10                  │
│ Confidence: 55%                     │
├─────────────────────────────────────┤
│ ┌─────────────┐  ┌─────────────┐   │
│ │ 📝 Generate │  │ 🔄 Triple   │   │
│ │ with NewGen │  │ Power Combo │   │
│ │ (faster)    │  │ (powerful)  │   │
│ │ Conf: 55%   │  │ Conf: 95%   │   │
│ └─────────────┘  └─────────────┘   │
├─────────────────────────────────────┤
│              [Cancel]               │
└─────────────────────────────────────┘
```

### 3. TRIPLE POWER COMBO

**When**: Confidence < 50% (auto-triggered)

**Characteristics**:
- High complexity (score > 7)
- Multiple custom components
- Complex workflows with state machines
- Third-party integrations
- Very long/detailed prompts (> 1000 chars)

**Example Prompts**:
- "Build a biologics manufacturing execution system with fermentor integration, real-time SCADA data, automated SOP workflows, electronic batch records, deviation management with CAPA, and full 21 CFR Part 11 audit trail"
- "Create a clinical trial management system integrating with Medidata Rave, with protocol deviation tracking, adverse event reporting, site monitoring visits, and patient randomization"

**Process**:

```
Step 1: Gemini Design (5-8s)
  ├─► Enhanced prompt with domain context
  ├─► Gemini generates React component structure
  └─► Extract JSX code from response

Step 2: NewGen Adaptation (1-2s)
  ├─► Format detection (JSX)
  ├─► Parse component tree
  ├─► Convert to AppSpec nodes
  └─► Map custom components to built-ins

Step 3: Domain Enhancement (1-2s)
  ├─► Detect domain (pharma/biotech/clinical)
  ├─► Add compliance features:
  │   ├─► Audit trail fields
  │   ├─► Data integrity validations
  │   ├─► User authentication
  │   └─► Change tracking
  ├─► Add industry-specific validations
  └─► Insert audit columns in tables

Step 4: AI Learning (< 1s)
  ├─► Extract patterns from final spec
  ├─► Store in learning database
  ├─► Update usage counts
  └─► Update success rates

Total: 8-13 seconds
```

**Performance**: 10-15 seconds

## API Integration

### Analyze Route (Testing)

```http
POST /api/generate/analyze-route
Content-Type: application/json

{
  "prompt": "Your prompt here"
}
```

Response:
```json
{
  "status": "ok",
  "routing": {
    "route": "ASK_USER",
    "confidence": 55,
    "requiresConfirmation": true,
    "complexity": {
      "score": 6.5,
      "breakdown": {
        "length": 2,
        "technicalTerms": 1.5,
        "multipleSections": 0.9,
        "complexWorkflows": 1,
        "customComponents": 1,
        "integrations": 0
      },
      "detected": {
        "customComponents": ["calendar", "scheduler"],
        "complexLogic": ["wizard", "validation"],
        "integrations": [],
        "technicalTerms": ["websocket", "real-time"],
        "sections": [{ "term": "page", "count": 3 }]
      }
    },
    "reasoning": "Custom components: calendar, scheduler; Complex logic: wizard, validation. Complexity: 6.5/10. Confidence: 55%. User confirmation recommended."
  },
  "details": {
    "name": "User Choice Required",
    "description": "Medium complexity - choose your preferred method",
    "speed": "Variable",
    "quality": "Variable",
    "confidence": 55,
    "icon": "🤔"
  }
}
```

### Standard Generation with Routing

```http
POST /api/generate
Content-Type: application/json

{
  "prompt": "Build a sample tracker",
  "inputMode": "no-code"
}
```

Possible responses:

**1. Direct Generation** (confidence >= 70%):
```json
{
  "status": "ok",
  "mode": "generated",
  "children": [...],
  "meta": {...}
}
```

**2. Needs Confirmation** (confidence 50-69%):
```json
{
  "status": "needs-confirmation",
  "routing": {
    "complexity": {...},
    "confidence": 55,
    "reasoning": "..."
  },
  "options": [
    {
      "route": "DIRECT",
      "name": "Generate with NewGen",
      "description": "Faster, simpler generation",
      "speed": "Fast (2-5 seconds)",
      "quality": "Good",
      "confidence": 55,
      "icon": "📝"
    },
    {
      "route": "TRIPLE_POWER_COMBO",
      "name": "Triple Power Combo",
      "description": "Advanced AI pipeline",
      "speed": "Slower (10-15 seconds)",
      "quality": "Excellent",
      "confidence": 95,
      "icon": "🔄"
    }
  ],
  "message": "Please choose generation method"
}
```

**3. Auto Triple Power Combo** (confidence < 50%):
```json
{
  "status": "ok",
  "mode": "triple-power-combo",
  "children": [...],
  "meta": {
    "routing": {
      "steps": [
        { "id": "gemini", "label": "Gemini Design", "status": "complete" },
        { "id": "adapt", "label": "NewGen Adaptation", "status": "complete" },
        { "id": "enhance", "label": "Domain Enhancement", "status": "complete" },
        { "id": "learn", "label": "AI Learning", "status": "complete" }
      ]
    }
  }
}
```

### Confirm Route

```http
POST /api/generate/confirm-route
Content-Type: application/json

{
  "prompt": "Build a complex workflow...",
  "route": "TRIPLE_POWER_COMBO",
  "inputMode": "no-code"
}
```

Response: Same as standard generation

## Frontend Integration

### Routing Modal Component

```jsx
import RoutingModal from './components/RoutingModal';

function BuildPage() {
  const [showRoutingModal, setShowRoutingModal] = useState(false);
  const [routingOptions, setRoutingOptions] = useState(null);
  
  const handleGenerate = async () => {
    const response = await fetch('/api/generate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ prompt, inputMode })
    });
    
    const result = await response.json();
    
    if (result.status === 'needs-confirmation') {
      setRoutingOptions(result);
      setShowRoutingModal(true);
      return;
    }
    
    // Handle direct generation
    setGeneratedApp(result);
  };
  
  const handleRouteChoice = async (route) => {
    setShowRoutingModal(false);
    
    const response = await fetch('/api/generate/confirm-route', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ prompt, route, inputMode })
    });
    
    const result = await response.json();
    setGeneratedApp(result);
  };
  
  return (
    <>
      {/* Your UI */}
      
      {showRoutingModal && (
        <RoutingModal
          routing={routingOptions.routing}
          options={routingOptions.options}
          onChoose={handleRouteChoice}
          onCancel={() => setShowRoutingModal(false)}
        />
      )}
    </>
  );
}
```

### Progress Display

```jsx
import ProgressDisplay from './components/ProgressDisplay';

const [triplePowerSteps, setTriplePowerSteps] = useState([
  { id: 'gemini', label: 'Gemini Design', status: 'pending' },
  { id: 'adapt', label: 'NewGen Adaptation', status: 'pending' },
  { id: 'enhance', label: 'Domain Enhancement', status: 'pending' },
  { id: 'learn', label: 'AI Learning', status: 'pending' }
]);

<ProgressDisplay steps={triplePowerSteps} visible={showProgress} />
```

## Configuration

### Environment Variables

```bash
# Force specific route (for testing)
FORCE_ROUTE=DIRECT|ASK_USER|TRIPLE_POWER_COMBO

# Adjust confidence thresholds
CONFIDENCE_THRESHOLD_DIRECT=70
CONFIDENCE_THRESHOLD_ASK=50
```

### Customize Detection Patterns

Edit `backend/routing/intelligent-router.js`:

```javascript
const PATTERNS = {
  customComponents: [
    // Add your custom component keywords
    'my-custom-component',
    ...
  ],
  ...
};
```

## Testing

### Unit Tests

```javascript
import { analyzeComplexity, determineRoute } from './routing/intelligent-router.js';

// Test complexity analysis
const result = analyzeComplexity('Build a simple task tracker');
assert(result.score < 5);

// Test routing decision
const routing = determineRoute('Complex system with Stripe integration');
assert(routing.route === 'TRIPLE_POWER_COMBO');
assert(routing.confidence < 50);
```

### Integration Tests

```bash
# Simple prompt → Direct
curl -X POST http://localhost:4000/api/generate \
  -H "Content-Type: application/json" \
  -d '{"prompt": "task tracker"}'

# Complex prompt → Needs confirmation
curl -X POST http://localhost:4000/api/generate \
  -H "Content-Type: application/json" \
  -d '{"prompt": "complex workflow with calendar and Stripe integration"}'

# Very complex → Auto Triple Power Combo
curl -X POST http://localhost:4000/api/generate \
  -H "Content-Type: application/json" \
  -d '{"prompt": "enterprise system with real-time websockets, microservices, state machines, custom drag-and-drop interface, and Salesforce integration"}'
```

## Troubleshooting

### Issue: Always routes to Triple Power Combo

**Solution**: Complexity threshold too low. Check for:
- Very long prompts (> 1000 chars)
- Many technical terms
- Custom component keywords

### Issue: Never shows routing modal

**Solution**: Confidence always high or low. Adjust prompts:
- Add moderate complexity
- Use some custom components
- Avoid extreme complexity

### Issue: Wrong route selected

**Solution**: Review detection patterns, adjust scoring:
```javascript
// Lower technical term weight
breakdown.technicalTerms = Math.min(breakdown.technicalTerms, 2);
```

## Best Practices

1. **Test with real prompts**: Use actual user inputs to calibrate thresholds
2. **Monitor routing decisions**: Log all routing decisions for analysis
3. **Gather user feedback**: Ask if routing choice was appropriate
4. **Adjust thresholds**: Based on success rates and user satisfaction
5. **Document patterns**: Keep list of patterns that trigger each route

## Performance Optimization

- **Cache routing decisions**: Store analysis results for 5 minutes
- **Lazy load modals**: Only render when needed
- **Preload Triple Power Combo**: Warm up Gemini connection for common patterns
- **Batch analysis**: Analyze multiple prompts in parallel for A/B testing

## Future Enhancements

- **Machine Learning**: Learn optimal thresholds from usage patterns
- **A/B Testing**: Test different routing strategies automatically
- **User Preferences**: Remember user's preferred route choice
- **Smart Defaults**: Auto-select route based on user history
- **Custom Rules**: Allow domain-specific routing rules
