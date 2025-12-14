/**
 * Base44-style Manifest Types & Schema
 * 
 * This file defines the structure for exporting NewGen Studio projects
 * to Base44 and other low-code platforms.
 * 
 * @typedef {Object} Base44Manifest
 */

/**
 * @typedef {Object} ManifestHeader
 * @property {string} version - Manifest format version (e.g., "1.0.0")
 * @property {string} source - Source platform ("newgen-studio")
 * @property {string} exportId - Unique export identifier
 * @property {string} timestamp - ISO 8601 timestamp
 */

/**
 * @typedef {Object} ProjectMeta
 * @property {string} id - Project ID
 * @property {string} name - Project name
 * @property {string} domain - Domain type: "biologics" | "pharma" | "generic"
 * @property {string} type - App type: "dashboard" | "form" | "studio-app" | "workflow"
 * @property {string[]} tags - Project tags
 * @property {string} description - Project description
 * @property {Object} domainMeta - Domain-specific metadata
 * @property {string} [domainMeta.moleculeType] - e.g., "protein", "mAb", "small-molecule"
 * @property {string} [domainMeta.phase] - Clinical/research phase
 * @property {string} [domainMeta.therapeuticArea] - e.g., "oncology", "immunology"
 * @property {string} [domainMeta.regulatoryContext] - e.g., "non-GLP research", "GLP", "IND"
 */

/**
 * @typedef {Object} Route
 * @property {string} id - Route ID
 * @property {string} path - URL path
 * @property {string} title - Route title
 * @property {string} layout - Layout preset: "app-shell-left-nav" | "blank" | etc.
 * @property {string} navGroup - Navigation group
 * @property {string} icon - Icon identifier (lucide-react name)
 * @property {string} pageComponentId - Reference to page component
 */

/**
 * @typedef {Object} ComponentProp
 * @property {string} [name] - Prop name
 * @property {string} [type] - Data type
 * @property {*} [default] - Default value
 */

/**
 * @typedef {Object} ComponentBinding
 * @property {string} [key] - Binding key (e.g., "onChange", "items")
 * @property {string} value - Binding expression (e.g., "{{state.filters}}", "action_update")
 */

/**
 * @typedef {Object} Component
 * @property {string} id - Component ID
 * @property {string} type - Component type (e.g., "Page", "Card", "CardList", "Button")
 * @property {Object} [props] - Component properties
 * @property {string[]} [children] - Child component IDs
 * @property {Object} [slots] - Named slots (header, footer, etc.)
 * @property {Object} [bindings] - Event/data bindings
 * @property {Object} [itemTemplate] - Template for list items
 */

/**
 * @typedef {Object} Layout
 * @property {string} rootRoute - Root route ID
 * @property {Route[]} routes - Route definitions
 * @property {Component[]} components - Component definitions
 */

/**
 * @typedef {Object} DataSourceConfig
 * @property {string} method - HTTP method
 * @property {string} url - API endpoint
 * @property {Object} [queryParams] - Query parameters
 * @property {Object} [headers] - HTTP headers
 */

/**
 * @typedef {Object} StaticDataSourceConfig
 * @property {Object[]} items - Static data items
 */

/**
 * @typedef {Object} DataSourceSchema
 * @property {string} itemsPath - JSON path to items array
 * @property {Object} fields - Field definitions
 */

/**
 * @typedef {Object} DataSourceRefresh
 * @property {boolean} onInit - Refresh on init
 * @property {boolean} [onFilterChange] - Refresh when filters change
 * @property {number} [interval] - Poll interval in ms
 */

/**
 * @typedef {Object} DataSource
 * @property {string} id - Data source ID
 * @property {"http" | "static" | "graphql" | "database"} type - Data source type
 * @property {string} label - Display label
 * @property {DataSourceConfig | StaticDataSourceConfig} config - Configuration
 * @property {DataSourceSchema} [schema] - Response schema
 * @property {DataSourceRefresh} [refresh] - Refresh behavior
 */

/**
 * @typedef {Object} ActionSideEffect
 * @property {string} type - Side effect type (e.g., "datasource.refresh", "state.update")
 * @property {string} [dataSourceId] - Target data source
 * @property {string} [targetStatePath] - Target state path
 * @property {*} [value] - Value to set
 */

/**
 * @typedef {Object} Action
 * @property {string} id - Action ID
 * @property {string} type - Action type (e.g., "state.update", "navigation.navigate", "api.call")
 * @property {string} label - Display label
 * @property {Object} config - Action configuration
 * @property {ActionSideEffect[]} [sideEffects] - Side effects to trigger
 */

/**
 * @typedef {Object} Permission
 * @property {string} role - Role name (e.g., "viewer", "admin")
 * @property {string} description - Role description
 * @property {string[]} routes - Accessible routes
 * @property {string[]} actions - Accessible actions
 */

/**
 * @typedef {Object} Theme
 * @property {string} preset - Theme preset
 * @property {Object} colors - Color palette
 * @property {Object} typography - Typography settings
 * @property {Object} radius - Border radius settings
 * @property {Object} shadows - Shadow definitions
 */

/**
 * @typedef {Object} Dependency
 * @property {string} type - Dependency type (e.g., "api", "package", "service")
 * @property {string} name - Dependency name
 * @property {string} url - URL or endpoint
 * @property {string} description - Description
 */

/**
 * @typedef {Object} Deployment
 * @property {string} target - Target platform (e.g., "base44", "bubble", "retool")
 * @property {string} env - Environment (e.g., "development", "staging", "production")
 * @property {Dependency[]} dependencies - External dependencies
 * @property {string[]} notes - Deployment notes
 */

/**
 * @typedef {Object} Base44Manifest
 * @property {string} version - Manifest version
 * @property {string} source - Source platform
 * @property {string} exportId - Unique export ID
 * @property {string} timestamp - Export timestamp
 * @property {ProjectMeta} project - Project metadata
 * @property {Layout} layout - Layout and component definitions
 * @property {DataSource[]} dataSources - Data sources
 * @property {Action[]} actions - Actions
 * @property {Permission[]} permissions - Permissions
 * @property {Theme} theme - Theme configuration
 * @property {Deployment} deployment - Deployment configuration
 */

/**
 * Validation helper: check if manifest is valid
 * @param {Base44Manifest} manifest
 * @returns {boolean}
 */
export function isValidManifest(manifest) {
  return (
    manifest &&
    manifest.version &&
    manifest.source &&
    manifest.exportId &&
    manifest.project &&
    manifest.layout &&
    Array.isArray(manifest.dataSources) &&
    Array.isArray(manifest.actions)
  );
}

/**
 * Generate a unique export ID
 * @returns {string}
 */
export function generateExportId() {
  const timestamp = Date.now().toString(36);
  const random = Math.random().toString(36).substring(2, 8);
  return `exp_${timestamp}_${random}`;
}

/**
 * Create an empty manifest template
 * @param {string} projectName
 * @returns {Base44Manifest}
 */
export function createManifestTemplate(projectName) {
  return {
    version: "1.0.0",
    source: "newgen-studio",
    exportId: generateExportId(),
    timestamp: new Date().toISOString(),
    project: {
      id: `proj_${Date.now()}`,
      name: projectName,
      domain: "generic",
      type: "studio-app",
      tags: [],
      description: "",
      domainMeta: {}
    },
    layout: {
      rootRoute: "home",
      routes: [],
      components: []
    },
    dataSources: [],
    actions: [],
    permissions: [
      {
        role: "viewer",
        description: "Can view the application",
        routes: [],
        actions: []
      }
    ],
    theme: {
      preset: "newgen-light",
      colors: {
        primary: "#7C3AED",
        primarySoft: "#F3E8FF",
        background: "#F8FAFC",
        surface: "#FFFFFF",
        textPrimary: "#0F172A",
        textSecondary: "#64748B"
      },
      typography: {
        fontFamily: "Inter, system-ui, -apple-system, BlinkMacSystemFont",
        headingWeight: 700,
        bodyWeight: 400
      },
      radius: {
        base: 12,
        pill: 999
      },
      shadows: {
        card: "0 10px 30px -10px rgba(15, 23, 42, 0.12)"
      }
    },
    deployment: {
      target: "base44",
      env: "staging",
      dependencies: [],
      notes: []
    }
  };
}

export default {
  isValidManifest,
  generateExportId,
  createManifestTemplate
};
