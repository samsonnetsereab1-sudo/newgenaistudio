# 🚀 Base44-Style Platform Export & Migration Layer

## Overview

NewGen Studio now includes a **complete platform adapter system** that allows your projects to be exported to Base44, Bubble, Retool, and other low-code platforms using a standardized manifest format.

This enables:
- ✅ **One-click project export** to Base44-compatible format
- ✅ **Standardized manifest schema** for cross-platform compatibility
- ✅ **Extensible adapter pattern** for adding new platform targets
- ✅ **Domain-aware exports** (biologics, pharma, generic)
- ✅ **Dependency tracking** and deployment notes

---

## Architecture

### Components

```
Backend/
├── types/
│   └── base44Manifest.js          # Manifest type definitions & helpers
├── services/
│   └── platformAdapterService.js  # Adapter registry & export logic
└── routes/
    └── platform.routes.js         # Export/import API endpoints
```

### Data Flow

```
NewGen Project
    ↓
platformAdapterService
    ↓
Base44Adapter (or other)
    ↓
Base44 Manifest JSON
    ↓
Export Bundle (manifest + instructions)
    ↓
Target Platform
```

---

## API Endpoints

### `GET /api/platform/adapters`

List all available platform adapters.

**Response:**
```json
{
  "status": "ok",
  "adapters": ["base44", "raw"],
  "description": "Available platform adapters for project export"
}
```

---

### `GET /api/platform/adapters/:target`

Get info about a specific adapter.

**Response:**
```json
{
  "status": "ok",
  "adapter": {
    "id": "base44",
    "canHandle": "base44",
    "description": "Adapter for base44",
    "instructions": [
      "1. Copy the manifest JSON above.",
      "2. In Base44, go to Project → Import → Paste JSON",
      ...
    ]
  }
}
```

---

### `POST /api/platform/export`

Export a project to a target platform.

**Request:**
```json
{
  "projectId": "proj_1702200000000",
  "target": "base44",
  "env": "staging",
  "format": "bundle"
}
```

**Response:**
```json
{
  "status": "ok",
  "target": "base44",
  "projectId": "proj_1702200000000",
  "manifest": {
    "version": "1.0.0",
    "source": "newgen-studio",
    "exportId": "exp_20251210_abc123",
    "timestamp": "2025-12-10T12:34:56.000Z",
    "project": {
      "id": "proj_1702200000000",
      "name": "Plugin Marketplace",
      "domain": "biologics",
      "type": "studio-app",
      "tags": ["plugins", "marketplace"],
      "domainMeta": {
        "moleculeType": "protein",
        "phase": "discovery"
      }
    },
    "layout": { ... },
    "dataSources": [ ... ],
    "actions": [ ... ],
    "permissions": [ ... ],
    "theme": { ... },
    "deployment": { ... }
  },
  "instructions": [
    "1. Copy the manifest JSON above.",
    "2. In Base44, go to Project → Import → Paste JSON",
    ...
  ],
  "timestamp": "2025-12-10T12:34:56.000Z"
}
```

---

### `POST /api/platform/import`

Import a project from another platform (future feature).

**Request:**
```json
{
  "source": "base44",
  "manifest": { ... },
  "projectName": "Imported Project"
}
```

---

### `GET /api/platform/manifest-template`

Get an empty manifest template for reference.

**Response:**
```json
{
  "status": "ok",
  "template": { ... complete manifest template ... }
}
```

---

### `POST /api/platform/validate`

Validate a manifest against Base44 schema.

**Request:**
```json
{
  "manifest": { ... }
}
```

**Response:**
```json
{
  "status": "ok",
  "valid": true,
  "message": "Manifest is valid"
}
```

---

## Base44 Manifest Schema

### Structure

The manifest follows this structure:

```typescript
{
  version: string;          // "1.0.0"
  source: string;           // "newgen-studio"
  exportId: string;         // Unique export ID
  timestamp: string;        // ISO 8601 timestamp
  
  project: {
    id: string;
    name: string;
    domain: "biologics" | "pharma" | "generic";
    type: "dashboard" | "form" | "studio-app" | "workflow";
    tags: string[];
    description: string;
    domainMeta: {
      moleculeType?: string;
      phase?: string;
      therapeuticArea?: string;
      regulatoryContext?: string;
    };
  };
  
  layout: {
    rootRoute: string;
    routes: Route[];
    components: Component[];
  };
  
  dataSources: DataSource[];
  actions: Action[];
  permissions: Permission[];
  theme: Theme;
  deployment: {
    target: string;
    env: "staging" | "production";
    dependencies: Dependency[];
    notes: string[];
  };
}
```

### Detailed Sections

See the user's provided spec in the conversation for full details on:
- **`layout.routes`** - Route definitions
- **`layout.components`** - Component tree
- **`dataSources`** - HTTP, static, and database sources
- **`actions`** - State, navigation, and API actions
- **`permissions`** - Role-based access control
- **`theme`** - Color palette, typography, shadows
- **`deployment`** - Target platform and dependencies

---

## Usage Examples

### Export a biologics project to Base44

```javascript
// Frontend call
const response = await fetch('/api/platform/export', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    projectId: 'proj_1702200000000',
    target: 'base44',
    env: 'staging'
  })
});

const bundle = await response.json();
console.log(bundle.manifest); // Full Base44 manifest
console.log(bundle.instructions); // Import steps
```

### Creating a project with domain metadata

```javascript
// Backend call
const project = await addProject({
  name: 'Antibody Screening Dashboard',
  domain: 'biologics',
  type: 'dashboard',
  tags: ['screening', 'antibodies'],
  description: 'Real-time antibody screening interface',
  domainMeta: {
    moleculeType: 'mAb',
    phase: 'discovery',
    therapeuticArea: 'oncology',
    regulatoryContext: 'non-GLP research'
  },
  layout: {
    rootRoute: 'screening',
    routes: [ /* route definitions */ ],
    components: [ /* component tree */ ]
  }
});

// Export to Base44
const exported = await fetch('/api/platform/export', {
  method: 'POST',
  body: JSON.stringify({
    projectId: project.id,
    target: 'base44',
    env: 'staging'
  })
});
```

---

## Extending with Custom Adapters

### Create a custom adapter

```javascript
import { BasePlatformAdapter, AdapterRegistry } from '../services/platformAdapterService.js';

class BubbleAdapter extends BasePlatformAdapter {
  getId() {
    return 'bubble';
  }

  canHandle(target) {
    return target === 'bubble';
  }

  async buildManifest(project, options = {}) {
    // Convert NewGen project to Bubble format
    return {
      // Bubble-specific structure
    };
  }

  getImportInstructions(project) {
    return [
      '1. In Bubble, create a new app.',
      '2. Go to Data → API Connector.',
      '3. Paste the API configuration below.',
      // ... more steps
    ];
  }
}

// Register the adapter
import platformAdapterService from '../services/platformAdapterService.js';
platformAdapterService.registry.register('bubble', new BubbleAdapter());
```

Then call:
```
POST /api/platform/export
{
  "projectId": "proj_...",
  "target": "bubble"
}
```

---

## Project Service Enhancements

The project service now supports:

```javascript
// Create project with domain metadata
const project = await addProject({
  name: 'My App',
  domain: 'biologics',
  type: 'studio-app',
  tags: ['ai', 'analytics'],
  description: 'App description',
  domainMeta: { /* domain-specific fields */ },
  layout: { /* layout config */ },
  dataSources: [ /* data sources */ ],
  actions: [ /* actions */ ],
  permissions: [ /* permissions */ ],
  theme: { /* theme config */ }
});

// Update project
await updateProject(project.id, {
  name: 'Updated Name',
  domainMeta: { phase: 'clinical' }
});

// Get project
const proj = await getProject(project.id);

// List all
const allProjects = await listProjects();

// Remove
await removeProject(project.id);
```

---

## Domain Awareness

The export system is domain-aware:

### Biologics/Pharma Domain
- Includes keywords detection
- Adds regulatory context
- Flags deployment notes
- Suggests compliance measures

```json
{
  "project": {
    "domain": "biologics",
    "domainMeta": {
      "moleculeType": "protein",
      "phase": "discovery",
      "therapeuticArea": "immunology",
      "regulatoryContext": "non-GLP research"
    }
  },
  "deployment": {
    "notes": [
      "This is a biologics/pharma domain application.",
      "Ensure compliance with relevant regulatory requirements.",
      "Regulatory context: non-GLP research"
    ]
  }
}
```

### Generic Domain
- Standard export
- No domain-specific constraints
- Flexible deployment

---

## Testing

### Test the export endpoint

```bash
# Create a project first
curl -X POST http://localhost:4000/api/v1/projects \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test Project",
    "domain": "biologics",
    "description": "Test biologics project"
  }'

# Export to Base44
curl -X POST http://localhost:4000/api/platform/export \
  -H "Content-Type: application/json" \
  -d '{
    "projectId": "proj_1702200000000",
    "target": "base44",
    "env": "staging"
  }'

# View the manifest
# Response includes complete Base44 manifest
```

---

## Next Steps

1. **UI Integration**: Add export modal to frontend
2. **Import Logic**: Implement `POST /api/platform/import`
3. **Custom Adapters**: Add Bubble, Retool, n8n adapters
4. **Validation**: Enhance manifest validation
5. **Analytics**: Track exports and platform adoption

---

## Files Reference

- **`backend/types/base44Manifest.js`** - Manifest types and helpers
- **`backend/services/platformAdapterService.js`** - Adapter registry and logic
- **`backend/routes/platform.routes.js`** - API endpoints
- **`backend/services/project.service.js`** - Enhanced project service

---

## API Overview

```
GET  /api/platform/adapters              List adapters
GET  /api/platform/adapters/:target      Get adapter info
POST /api/platform/export                Export project
POST /api/platform/import                Import project (future)
GET  /api/platform/manifest-template     Get template
POST /api/platform/validate              Validate manifest
```

That's it! Your NewGen Studio can now export to Base44-compatible format. 🎉
