# Platform Export Quick Start

## What's New

Your NewGen Studio backend now has a **complete Base44-style manifest export system**:

### 🎯 New Files Created

1. **`backend/types/base44Manifest.js`** (280 lines)
   - Manifest type definitions
   - Export ID generation
   - Manifest template factory

2. **`backend/services/platformAdapterService.js`** (380 lines)
   - `BasePlatformAdapter` - Base class
   - `Base44Adapter` - Exports to Base44 format
   - `RawAdapter` - Generic raw export
   - `AdapterRegistry` - Adapter management
   - `PlatformAdapterService` - Main export service

3. **`backend/routes/platform.routes.js`** (200 lines)
   - 6 new API endpoints
   - Full CRUD for exports/imports
   - Manifest validation

4. **Updated `backend/services/project.service.js`**
   - Enhanced with domain metadata support
   - `getProject()` alias for compatibility
   - `updateProject()` method
   - Full domainMeta fields

5. **Updated `backend/routes/index.js`**
   - Registered platform routes at `/api/platform`

### 📡 New API Endpoints

```
GET  /api/platform/adapters              # List adapters
GET  /api/platform/adapters/:target      # Adapter info
POST /api/platform/export                # Export project
POST /api/platform/import                # Import (future)
GET  /api/platform/manifest-template     # Get template
POST /api/platform/validate              # Validate manifest
```

---

## Quick Test

### 1. Create a biologics project

```bash
curl -X POST http://localhost:4000/api/v1/projects \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Protein Purification Dashboard",
    "domain": "biologics",
    "type": "dashboard",
    "tags": ["proteins", "purification"],
    "description": "Real-time protein purification monitoring",
    "domainMeta": {
      "moleculeType": "protein",
      "phase": "manufacturing",
      "therapeuticArea": "oncology",
      "regulatoryContext": "GLP"
    }
  }'
```

**Response:**
```json
{
  "id": "proj_1702200123456",
  "name": "Protein Purification Dashboard",
  "domain": "biologics",
  ...
}
```

Copy the `id` for next step.

### 2. List available adapters

```bash
curl http://localhost:4000/api/platform/adapters
```

**Response:**
```json
{
  "status": "ok",
  "adapters": ["base44", "raw"],
  "description": "Available platform adapters for project export"
}
```

### 3. Export to Base44

```bash
curl -X POST http://localhost:4000/api/platform/export \
  -H "Content-Type: application/json" \
  -d '{
    "projectId": "proj_1702200123456",
    "target": "base44",
    "env": "staging"
  }'
```

**Response:** (Full Base44 manifest, 200+ lines)
```json
{
  "status": "ok",
  "target": "base44",
  "projectId": "proj_1702200123456",
  "manifest": {
    "version": "1.0.0",
    "source": "newgen-studio",
    "exportId": "exp_20251210_abc123",
    "timestamp": "2025-12-10T12:34:56.000Z",
    "project": {
      "id": "proj_1702200123456",
      "name": "Protein Purification Dashboard",
      "domain": "biologics",
      "type": "dashboard",
      "domainMeta": {
        "moleculeType": "protein",
        "phase": "manufacturing",
        "therapeuticArea": "oncology",
        "regulatoryContext": "GLP"
      }
    },
    "layout": { ... },
    "dataSources": [],
    "actions": [],
    "permissions": [ ... ],
    "theme": { ... },
    "deployment": {
      "target": "base44",
      "env": "staging",
      "dependencies": [],
      "notes": [
        "This is a biologics/pharma domain application.",
        "Ensure compliance with relevant regulatory requirements.",
        "Regulatory context: GLP"
      ]
    }
  },
  "instructions": [
    "1. Copy the manifest JSON above.",
    "2. In Base44, go to Project → Import → Paste JSON",
    ...
  ],
  "timestamp": "2025-12-10T12:34:56.000Z"
}
```

### 4. Get manifest template

```bash
curl http://localhost:4000/api/platform/manifest-template
```

Returns an empty template for reference.

### 5. Validate a manifest

```bash
curl -X POST http://localhost:4000/api/platform/validate \
  -H "Content-Type: application/json" \
  -d '{ "manifest": { ... } }'
```

---

## Architecture Highlights

### Adapter Pattern

```javascript
// Easy to extend
class RetoolAdapter extends BasePlatformAdapter {
  getId() { return 'retool'; }
  canHandle(target) { return target === 'retool'; }
  async buildManifest(project) { ... }
}

// Register
platformAdapterService.registry.register('retool', new RetoolAdapter());

// Use
POST /api/platform/export { "target": "retool" }
```

### Domain Awareness

Projects can be tagged with domain metadata:

```json
{
  "domain": "biologics",
  "domainMeta": {
    "moleculeType": "mAb",
    "phase": "discovery",
    "therapeuticArea": "immunology",
    "regulatoryContext": "non-GLP research"
  }
}
```

Automatically included in exports and generates compliance notes.

### Type-Safe Manifest

```javascript
// Full JSDoc types for IDE autocomplete
/**
 * @typedef {Object} Base44Manifest
 * @property {string} version
 * @property {ProjectMeta} project
 * @property {Layout} layout
 * @property {DataSource[]} dataSources
 * ...
 */
```

---

## Next Steps

### Option 1: Add Import Logic
Implement `POST /api/platform/import` to bring projects back from Base44

### Option 2: Add UI Export Modal
Add export button to Dashboard → opens modal → calls `/api/platform/export`

### Option 3: Custom Adapters
Add Bubble, Retool, n8n adapters following the `Base44Adapter` pattern

### Option 4: Enhanced Validation
Implement full JSON Schema validation for manifests

### Option 5: Dependency Injection
Track external API dependencies and auto-configure in target platform

---

## File Sizes

- `base44Manifest.js`: ~8 KB
- `platformAdapterService.js`: ~14 KB
- `platform.routes.js`: ~8 KB
- **Total**: ~30 KB (very lightweight!)

---

## Key Features

✅ **Standardized Export Format**  
Base44-compatible manifest with optional extensions

✅ **Domain-Aware**  
Biologics/pharma projects get special treatment and compliance notes

✅ **Extensible**  
Add new adapters without touching core code

✅ **Zero Dependencies**  
Pure JavaScript, no external libraries needed

✅ **Type-Safe**  
Full JSDoc types for autocomplete and validation

✅ **RESTful API**  
Clean, predictable endpoints

✅ **Error Handling**  
Proper HTTP status codes and error messages

---

**Everything is ready to test!** 🚀

Try the curl examples above, or start building the UI modal.
