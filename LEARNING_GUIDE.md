# AI Learning System Guide

## Overview

NewGen Studio learns from every generation to improve future suggestions, component recommendations, and layout patterns. The learning system operates entirely in the background, requiring no user intervention beyond optional feedback.

## Architecture

### Core Components

1. **pattern-storage.js** - Persistent storage and retrieval
2. **similarity-matcher.js** - Text similarity algorithms
3. **suggestion-engine.js** - Generate intelligent suggestions

## Storage Structure

### Patterns File

Location: `backend/learned_patterns/patterns.json`

```json
{
  "components": {
    "table": {
      "name": "table",
      "usageCount": 45,
      "successRate": 92.5,
      "totalPositive": 37,
      "totalNegative": 3,
      "contexts": [
        {
          "input": "Build a sample tracker...",
          "timestamp": "2025-12-31T18:00:00Z",
          "feedback": "positive"
        }
      ]
    },
    "form": {
      "name": "form",
      "usageCount": 30,
      "successRate": 85.0,
      "contexts": [...]
    }
  },
  "layouts": {
    "crud": {
      "type": "crud",
      "usageCount": 30,
      "structure": {
        "hasForm": true,
        "hasTable": true,
        "hasChart": false
      },
      "examples": [
        {
          "input": "Create a batch tracking...",
          "timestamp": "2025-12-31T17:30:00Z"
        }
      ]
    },
    "dashboard": {
      "type": "dashboard",
      "usageCount": 15,
      "structure": {
        "hasCharts": true,
        "multiPage": true
      }
    }
  },
  "metadata": {
    "totalLearned": 150,
    "lastUpdated": "2025-12-31T18:15:00Z"
  }
}
```

## Learning Triggers

### 1. Successful Generation

Automatically triggered after every successful app generation:

```javascript
import { learnFromGeneration } from './learning/pattern-storage.js';

learnFromGeneration({
  input: userPrompt,
  appSpec: generatedSpec,
  feedback: 'neutral'  // Will be updated when user provides rating
});
```

### 2. User Feedback

User rates generated app (1-5 stars):

```javascript
import { updateFeedback } from './learning/pattern-storage.js';

updateFeedback(appId, rating);
// rating >= 4 → positive
// rating <= 2 → negative
// Updates success rates for all components
```

### 3. Technical Input

High-quality learning from pasted code:

```javascript
// When user pastes JSX/HTML
learnFromGeneration({
  input: technicalInput,
  appSpec: adaptedSpec,
  feedback: 'positive'  // Technical input is high-quality
});
```

## What Gets Learned

### Component Usage

- **Usage Count**: How often each component type is used
- **Success Rate**: Percentage of positive feedback
- **Contexts**: Last 10 inputs that used this component
- **Feedback History**: Positive/negative/neutral counts

### Layout Patterns

- **Pattern Type**: CRUD, dashboard, form-focused, list-view
- **Usage Count**: Frequency of pattern
- **Structure**: Characteristics (hasForm, hasTable, etc.)
- **Examples**: Recent inputs that matched this pattern

### Pattern Detection

```javascript
// CRUD pattern
if (hasForm && hasTable) {
  pattern = 'crud';
}

// Dashboard pattern
if (hasChart && hasMultiplePages) {
  pattern = 'dashboard';
}

// Form-focused pattern
if (hasForm && !hasTable) {
  pattern = 'form-focused';
}

// List/table pattern
if (hasTable && !hasForm) {
  pattern = 'list-view';
}
```

## Using Learning Data

### Find Similar Inputs

```javascript
import { findSimilarInputs } from './learning/similarity-matcher.js';

const matches = findSimilarInputs(userInput, {
  threshold: 0.3,      // Minimum similarity (0-1)
  maxResults: 5,       // Max matches to return
  componentType: null  // Optional filter by component
});

// Returns: [
//   {
//     componentType: 'table',
//     context: { input, timestamp, feedback },
//     similarity: 0.75,
//     usageCount: 45,
//     successRate: 92.5
//   }
// ]
```

### Generate Suggestions

```javascript
import { generateSuggestions } from './learning/suggestion-engine.js';

const suggestions = generateSuggestions(userInput);

console.log(suggestions);
// {
//   components: [
//     { type: 'table', usageCount: 45, successRate: 92.5, relevance: 85 }
//   ],
//   layouts: [
//     { type: 'crud', usageCount: 30, relevance: 90 }
//   ],
//   similar: [
//     { input: '...', componentType: 'table', similarity: 75 }
//   ],
//   confidence: 85
// }
```

### Enhance Prompts with Learning

```javascript
import { enhancePromptWithLearning } from './learning/suggestion-engine.js';

const enhancedPrompt = enhancePromptWithLearning(userInput);
// Original: "Build a sample tracker"
// Enhanced: "Build a sample tracker
//            [Context: Based on similar requests, consider using: table, form, button]
//            [Suggested layout pattern: crud]"
```

### Recommend Components by Domain

```javascript
import { recommendComponentsForDomain } from './learning/suggestion-engine.js';

const recommendations = recommendComponentsForDomain('pharma');
// Returns: [
//   { type: 'table', usageCount: 45, successRate: 92.5, recommended: true },
//   { type: 'form', usageCount: 30, successRate: 85.0, recommended: true }
// ]
```

## Similarity Matching

### Algorithm

Uses weighted combination of:
- **Text Similarity** (60%): Levenshtein distance
- **Keyword Similarity** (40%): Jaccard similarity on extracted keywords

```javascript
// Example calculation
const textSim = levenshteinSimilarity("sample tracker", "sample management");
const keywordSim = jaccardSimilarity(
  new Set(["sample", "tracker"]),
  new Set(["sample", "management"])
);

const finalScore = textSim * 0.6 + keywordSim * 0.4;
```

### Keyword Extraction

Filters out stop words and short tokens:

```javascript
const stopWords = [
  'the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 
  'for', 'of', 'with', 'by', 'create', 'build', 'make', 'generate'
];

// Extract meaningful keywords
const keywords = extractKeywords(input);
// "Build a sample tracker" → Set(['sample', 'tracker'])
```

## Insights API

### Get Learning Insights

```http
GET /api/generate/insights
```

Response:
```json
{
  "status": "ok",
  "insights": {
    "totalPatterns": 150,
    "componentTypes": 12,
    "layoutTypes": 4,
    "topComponents": [
      {
        "name": "table",
        "usageCount": 45,
        "successRate": 92.5
      }
    ],
    "layoutPatterns": [
      {
        "type": "crud",
        "usageCount": 30
      }
    ],
    "lastUpdated": "2025-12-31T18:15:00Z"
  }
}
```

### Submit Feedback

```http
POST /api/generate/feedback
Content-Type: application/json

{
  "appId": "1735678901234",
  "rating": 5,
  "comments": ""
}
```

Response:
```json
{
  "status": "ok",
  "message": "✅ Thank you! NewGen Studio just got smarter! 🧠"
}
```

## Frontend Integration

### Feedback Prompt Component

Automatically appears 30 seconds after successful generation:

```jsx
import FeedbackPrompt from './components/FeedbackPrompt';

function BuildPage() {
  const [showFeedback, setShowFeedback] = useState(false);
  
  // Start timer after successful generation
  useEffect(() => {
    if (generatedApp) {
      const timer = setTimeout(() => {
        setShowFeedback(true);
      }, 30000);
      return () => clearTimeout(timer);
    }
  }, [generatedApp]);
  
  return (
    <>
      {/* Your UI */}
      
      {showFeedback && (
        <FeedbackPrompt
          appId={generatedApp.id}
          onSubmit={(rating) => {
            // Submit to backend
            fetch('/api/generate/feedback', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ appId, rating })
            });
          }}
          onSkip={() => setShowFeedback(false)}
        />
      )}
    </>
  );
}
```

### Learning Insights Dashboard

```jsx
import LearningInsights from './components/LearningInsights';

// Add to routes
<Route path="/app/insights" element={<LearningInsights />} />
```

## Performance Considerations

- **Storage**: Automatically limits context history (10 per component)
- **Similarity Matching**: Efficient for up to 1000 components
- **Background Processing**: Learning happens asynchronously
- **File Size**: patterns.json typically < 500KB for 1000 patterns

## Data Privacy

- **Local Storage**: All patterns stored locally in `learned_patterns/`
- **No External Sharing**: Data never leaves your instance
- **No PII**: Only component types and anonymized prompts stored
- **User Control**: Clear patterns by deleting `patterns.json`

## Troubleshooting

### Issue: Patterns not persisting

**Solution**: Check file permissions on `learned_patterns/` directory

```bash
chmod 755 backend/learned_patterns/
chmod 644 backend/learned_patterns/patterns.json
```

### Issue: Poor similarity matches

**Solution**: Increase threshold, use more descriptive prompts

```javascript
const matches = findSimilarInputs(input, { threshold: 0.5 });
```

### Issue: Success rates incorrect

**Solution**: Ensure feedback is being submitted correctly

```javascript
// Check that rating maps to correct feedback type
rating >= 4 → 'positive'
rating <= 2 → 'negative'
3 → 'neutral'
```

## Best Practices

1. **Encourage Feedback**: Display feedback prompt to all users
2. **Monitor Insights**: Check `/app/insights` regularly for patterns
3. **Seed Initial Data**: Manually add high-quality examples for cold start
4. **Clean Old Patterns**: Periodically review and remove outdated patterns
5. **Backup Data**: Include `learned_patterns/` in backups

## Advanced Usage

### Custom Learning Rules

Extend `pattern-storage.js` to add domain-specific learning:

```javascript
function learnDomainSpecificPatterns(appSpec, domain) {
  if (domain === 'pharma') {
    // Learn compliance-related patterns
    const hasAuditTrail = detectAuditTrail(appSpec);
    const hasValidation = detectValidation(appSpec);
    
    // Store domain-specific metadata
    updateDomainMetrics(domain, { hasAuditTrail, hasValidation });
  }
}
```

### Export/Import Patterns

Share learned patterns across teams:

```javascript
// Export
const patterns = loadPatterns();
fs.writeFileSync('export.json', JSON.stringify(patterns));

// Import
const imported = JSON.parse(fs.readFileSync('export.json'));
savePatterns(imported);
```

## Future Enhancements

- **Pattern Sharing**: Export/import between instances
- **A/B Testing**: Test different routing strategies
- **Trend Analysis**: Track pattern changes over time
- **Collaborative Learning**: Learn from team usage patterns
- **Smart Defaults**: Auto-populate common configurations
