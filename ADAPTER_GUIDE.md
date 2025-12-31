# Adapter Guide

## Overview

The NewGen Studio Adapter System provides intelligent format detection and conversion capabilities, allowing users to paste code in various formats (JSX, HTML, JSON, component lists) and automatically convert them to NewGen AppSpec format.

## Architecture

### Core Components

1. **format-detector.js** - Detects input format with confidence scoring
2. **jsx-parser.js** - Parses React JSX into component trees
3. **html-converter.js** - Converts HTML to AppSpec nodes
4. **style-mapper.js** - Maps CSS/Tailwind classes to inline styles
5. **gemini-to-newgen.js** - Main orchestration adapter

## Format Detection

### Supported Formats

- **JSON**: Direct AppSpec or structured data
- **React JSX**: Component code with imports/exports
- **HTML**: Standard HTML markup
- **Component Lists**: Simple text lists of components
- **Natural Language**: Falls back to AI generation

### Detection Algorithm

```javascript
import { detectFormat } from './adapters/format-detector.js';

const result = detectFormat(input);
// Returns: { format, confidence, metadata }
```

**Confidence Scoring:**
- JSON: 0.95 (if valid and contains AppSpec-like structure)
- JSX: 0.5-0.9 (based on pattern matches)
- HTML: 0.5-0.85 (based on tag detection)
- Component List: 0.4-0.8 (based on keyword matches)
- Natural Language: 0.7 (default fallback)

## JSX Parsing

### Capabilities

- Extracts component hierarchy
- Parses props and attributes
- Identifies imports and exports
- Detects hooks (useState, useEffect, useRef)

### Example

```javascript
import { parseJSX } from './adapters/jsx-parser.js';

const jsxCode = `
export default function MyApp() {
  return (
    <div className="container">
      <h1>Hello World</h1>
      <button onClick={handleClick}>Click</button>
    </div>
  );
}
`;

const result = parseJSX(jsxCode);
// Returns: { success: true, tree, props, metadata }
```

## HTML Conversion

### Tag Mapping

```javascript
const typeMapping = {
  'div': 'container',
  'section': 'section',
  'form': 'form',
  'table': 'table',
  'input': 'form-field',
  'button': 'button',
  'h1-h6': 'text',
  'ul/ol': 'list'
};
```

### Example

```javascript
import { convertHTMLToAppSpec } from './adapters/html-converter.js';

const html = `
<div class="dashboard">
  <h1>Dashboard</h1>
  <table>
    <thead>
      <tr><th>ID</th><th>Name</th></tr>
    </thead>
  </table>
  <button>Add</button>
</div>
`;

const appSpec = convertHTMLToAppSpec(html);
// Returns valid AppSpec with page/section/table/button nodes
```

## Style Mapping

### Tailwind to Inline Styles

```javascript
import { classNameToStyle } from './adapters/style-mapper.js';

const style = classNameToStyle('grid grid-cols-3 gap-4 p-6');
// Returns: {
//   display: 'grid',
//   gridTemplateColumns: 'repeat(3, 1fr)',
//   gap: '1rem',
//   padding: '1.5rem'
// }
```

### Supported Utilities

- **Layout**: grid, flex, block, inline-block, hidden
- **Grid**: grid-cols-{n}
- **Spacing**: p-{n}, px-{n}, py-{n}, m-{n}, mx-{n}, my-{n}, gap-{n}
- **Sizing**: w-full, w-1/2, h-full, h-screen
- **Typography**: text-{size}, font-{weight}, text-{align}
- **Colors**: text-{color}, bg-{color}
- **Borders**: border, rounded-{size}
- **Shadows**: shadow, shadow-md, shadow-lg
- **Flexbox**: flex-row, flex-col, items-{align}, justify-{align}

## Custom Component Mapping

The adapter recognizes custom components and maps them to NewGen equivalents:

```javascript
const customComponentMapping = {
  'DatePicker': { type: 'form-field', props: { type: 'date' } },
  'Select': { type: 'form-field', props: { type: 'select' } },
  'DataGrid': { type: 'table', props: {} },
  'Chart': { type: 'widget', props: { widgetType: 'chart' } },
  'Card': { type: 'container', props: {} },
  'Calendar': { type: 'widget', props: { widgetType: 'calendar' } },
  'Scheduler': { type: 'widget', props: { widgetType: 'scheduler' } },
  'Gantt': { type: 'widget', props: { widgetType: 'gantt' } },
  'Kanban': { type: 'widget', props: { widgetType: 'kanban' } }
};
```

## Main Adapter Usage

```javascript
import { adaptToNewGen } from './adapters/gemini-to-newgen.js';

const input = `
  <div className="p-4">
    <h1>Sample Tracker</h1>
    <DataGrid columns={['ID', 'Name', 'Status']} />
    <Button variant="primary">Add Sample</Button>
  </div>
`;

const result = await adaptToNewGen(input);

if (result.success) {
  console.log('Converted AppSpec:', result.appSpec);
  console.log('Detected format:', result.format);
} else if (result.requiresAI) {
  console.log('Natural language - requires AI processing');
} else {
  console.error('Conversion failed:', result.error);
}
```

## Error Handling

### Validation Errors

```javascript
import { validateFormat } from './adapters/format-detector.js';

const errors = validateFormat(input, 'json');
// Returns array of { type, message, line? }
```

### Recovery Strategies

1. **Invalid JSON**: Return syntax error with line number
2. **Malformed JSX**: Attempt partial conversion, wrap in container
3. **Unknown Components**: Map to generic 'container' type
4. **Missing Styles**: Use default styles from component type

## Integration with Backend

The adapter is integrated into the generate controller:

```javascript
// In generate.controller.js
if (inputMode === 'technical') {
  const adaptResult = await adaptToNewGen(prompt);
  
  if (adaptResult.success) {
    // Use adapted spec
    return res.json(appSpecToFrontend(adaptResult.appSpec));
  } else if (adaptResult.requiresAI) {
    // Fall through to normal AI generation
  }
}
```

## Best Practices

1. **Always validate** adapted specs before rendering
2. **Preserve metadata** for debugging (set `preserveMetadata: true`)
3. **Handle partial conversions** gracefully
4. **Test edge cases** (empty inputs, malformed code, mixed formats)
5. **Use confidence thresholds** to decide when to fall back to AI

## Performance

- **Format detection**: < 10ms
- **JSX parsing**: < 50ms (simple components)
- **HTML conversion**: < 100ms (medium complexity)
- **Style mapping**: < 5ms per element

## Extending the Adapter

### Adding New Formats

1. Add detection pattern in `format-detector.js`
2. Create parser in `{format}-parser.js`
3. Add conversion logic in `gemini-to-newgen.js`
4. Update custom component mapping

### Adding New Style Utilities

Add to `tailwindMapping` in `style-mapper.js`:

```javascript
tailwindMapping['your-utility'] = { cssProperty: 'value' };
```

## Troubleshooting

### Common Issues

**Issue**: JSX conversion fails
- **Solution**: Check for balanced tags, valid attribute syntax

**Issue**: Styles not converting
- **Solution**: Ensure utility is in tailwindMapping, or use inline styles

**Issue**: Custom components not recognized
- **Solution**: Add to customComponentMapping in gemini-to-newgen.js

**Issue**: Low confidence detection
- **Solution**: Provide more context, use clearer format markers

## Examples

See `backend/adapters/` for complete implementation examples and test cases.
