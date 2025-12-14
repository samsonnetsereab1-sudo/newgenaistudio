/**
 * Platform Adapter Service
 * 
 * Generic adapter pattern for exporting NewGen Studio projects
 * to Base44, Bubble, Retool, and other low-code platforms.
 */

import { createManifestTemplate, generateExportId } from '../types/base44Manifest.js';

/**
 * Base class for platform adapters
 */
class BasePlatformAdapter {
  constructor(config = {}) {
    this.config = config;
  }

  /**
   * Get adapter ID
   * @returns {string}
   */
  getId() {
    return 'base-adapter';
  }

  /**
   * Check if this adapter can handle the target platform
   * @param {string} target
   * @returns {boolean}
   */
  canHandle(target) {
    return false;
  }

  /**
   * Build a platform-specific manifest from a NewGen project
   * @param {Object} project - NewGen project object
   * @param {Object} options - Export options
   * @returns {Object} - Platform manifest
   */
  async buildManifest(project, options = {}) {
    throw new Error('buildManifest() not implemented');
  }

  /**
   * Build a complete export bundle
   * @param {Object} project - NewGen project object
   * @param {Object} options - Export options
   * @returns {Promise<Object>} - Export bundle with manifest, files, and instructions
   */
  async buildExportBundle(project, options = {}) {
    const manifest = await this.buildManifest(project, options);
    return {
      target: this.getId(),
      projectId: project.id,
      manifest,
      instructions: this.getImportInstructions(project)
    };
  }

  /**
   * Get platform-specific import instructions
   * @param {Object} project
   * @returns {string[]}
   */
  getImportInstructions(project) {
    return [];
  }
}

/**
 * Base44 Platform Adapter
 * 
 * Exports NewGen projects to Base44-compatible manifest format
 */
class Base44Adapter extends BasePlatformAdapter {
  getId() {
    return 'base44';
  }

  canHandle(target) {
    return target === 'base44' || target === 'base-44';
  }

  /**
   * Build Base44 manifest from NewGen project
   * @param {Object} project
   * @param {Object} options
   * @returns {Promise<Object>}
   */
  async buildManifest(project, options = {}) {
    const manifest = createManifestTemplate(project.name || 'Untitled Project');

    // Merge project metadata
    manifest.project = {
      ...manifest.project,
      id: project.id,
      name: project.name,
      domain: project.domain || 'generic',
      type: project.type || 'studio-app',
      tags: project.tags || [],
      description: project.description || '',
      domainMeta: project.domainMeta || {}
    };

    // Add layout from project if available
    if (project.layout) {
      manifest.layout = {
        ...manifest.layout,
        ...project.layout
      };
    }

    // Add data sources
    if (project.dataSources && Array.isArray(project.dataSources)) {
      manifest.dataSources = project.dataSources.map(ds => this.normalizeDataSource(ds));
    }

    // Add actions
    if (project.actions && Array.isArray(project.actions)) {
      manifest.actions = project.actions.map(action => this.normalizeAction(action));
    }

    // Add permissions
    if (project.permissions && Array.isArray(project.permissions)) {
      manifest.permissions = project.permissions;
    }

    // Apply theme
    if (project.theme) {
      manifest.theme = {
        ...manifest.theme,
        ...project.theme
      };
    }

    // Add deployment config
    manifest.deployment = {
      target: 'base44',
      env: options.env || 'staging',
      dependencies: this.buildDependencies(project),
      notes: this.buildDeploymentNotes(project)
    };

    return manifest;
  }

  /**
   * Normalize data source to Base44 format
   * @param {Object} ds
   * @returns {Object}
   */
  normalizeDataSource(ds) {
    // If it's already in the right format, return it
    if (ds.id && ds.type && ds.config) {
      return ds;
    }

    // Otherwise, convert from legacy format
    return {
      id: ds.id || `ds_${Date.now()}`,
      type: ds.type || 'http',
      label: ds.label || ds.name || '',
      config: ds.config || {},
      schema: ds.schema,
      refresh: ds.refresh
    };
  }

  /**
   * Normalize action to Base44 format
   * @param {Object} action
   * @returns {Object}
   */
  normalizeAction(action) {
    return {
      id: action.id || `action_${Date.now()}`,
      type: action.type || 'state.update',
      label: action.label || action.name || '',
      config: action.config || {},
      sideEffects: action.sideEffects || []
    };
  }

  /**
   * Build deployment dependencies from project
   * @param {Object} project
   * @returns {Array}
   */
  buildDependencies(project) {
    const dependencies = [];

    // Add backend API dependency
    if (project.backendUrl) {
      dependencies.push({
        type: 'api',
        name: 'newgen-backend',
        url: project.backendUrl,
        description: 'NewGen Studio backend API'
      });
    }

    // Add any custom dependencies
    if (project.dependencies && Array.isArray(project.dependencies)) {
      dependencies.push(...project.dependencies);
    }

    return dependencies;
  }

  /**
   * Build deployment notes
   * @param {Object} project
   * @returns {string[]}
   */
  buildDeploymentNotes(project) {
    const notes = [];

    // Domain-specific notes
    if (project.domain === 'biologics' || project.domain === 'pharma') {
      notes.push('This is a biologics/pharma domain application.');
      notes.push('Ensure compliance with relevant regulatory requirements.');
      if (project.domainMeta?.regulatoryContext) {
        notes.push(`Regulatory context: ${project.domainMeta.regulatoryContext}`);
      }
    }

    // Backend notes
    if (project.backendUrl) {
      notes.push(`Backend API: ${project.backendUrl}`);
      notes.push('Ensure the backend is accessible from the Base44 environment.');
    }

    // Theme notes
    if (project.theme?.preset) {
      notes.push(`Theme: Use "${project.theme.preset}" or map colors to your design system.`);
    }

    return notes;
  }

  /**
   * Get Base44-specific import instructions
   * @param {Object} project
   * @returns {string[]}
   */
  getImportInstructions(project) {
    return [
      '1. Copy the manifest JSON above.',
      '2. In Base44, go to Project → Import → Paste JSON',
      '3. Review the component layout and adjust styling as needed.',
      '4. Configure any API endpoints to match your environment.',
      '5. Test the import and validate all data sources are connected.',
      '6. Deploy to your Base44 workspace.'
    ];
  }
}

/**
 * Raw Adapter
 * 
 * Exports raw files and minimal manifest for generic use
 */
class RawAdapter extends BasePlatformAdapter {
  getId() {
    return 'raw';
  }

  canHandle(target) {
    return target === 'raw' || target === 'generic';
  }

  async buildManifest(project, options = {}) {
    const manifest = createManifestTemplate(project.name || 'Untitled Project');
    manifest.project = { ...manifest.project, ...project };
    manifest.deployment.target = 'raw';
    return manifest;
  }

  getImportInstructions(project) {
    return [
      'Raw export: use the manifest and files as reference.',
      'No specific platform constraints applied.',
      'Adapt the structure to your target environment as needed.'
    ];
  }
}

/**
 * Platform Adapter Registry
 * 
 * Manages available adapters and routes exports to the correct one
 */
class AdapterRegistry {
  constructor() {
    this.adapters = new Map();
    this.registerBuiltInAdapters();
  }

  /**
   * Register built-in adapters
   */
  registerBuiltInAdapters() {
    this.register('base44', new Base44Adapter());
    this.register('raw', new RawAdapter());
  }

  /**
   * Register a custom adapter
   * @param {string} name
   * @param {BasePlatformAdapter} adapter
   */
  register(name, adapter) {
    this.adapters.set(name, adapter);
  }

  /**
   * Get an adapter by name
   * @param {string} name
   * @returns {BasePlatformAdapter}
   */
  getAdapter(name) {
    const adapter = this.adapters.get(name);
    if (!adapter) {
      throw new Error(`Unknown adapter: "${name}". Available: ${Array.from(this.adapters.keys()).join(', ')}`);
    }
    return adapter;
  }

  /**
   * Find adapter that can handle a target
   * @param {string} target
   * @returns {BasePlatformAdapter}
   */
  findAdapter(target) {
    for (const adapter of this.adapters.values()) {
      if (adapter.canHandle(target)) {
        return adapter;
      }
    }
    throw new Error(`No adapter found for target: "${target}"`);
  }

  /**
   * List available adapters
   * @returns {string[]}
   */
  listAdapters() {
    return Array.from(this.adapters.keys());
  }
}

/**
 * Export bundle generator
 * 
 * Main service for creating export bundles
 */
class PlatformAdapterService {
  constructor() {
    this.registry = new AdapterRegistry();
  }

  /**
   * Export a project to a target platform
   * @param {Object} project - NewGen project
   * @param {string} target - Target platform (base44, raw, etc.)
   * @param {Object} options - Export options
   * @returns {Promise<Object>} - Export bundle
   */
  async exportProject(project, target, options = {}) {
    if (!project || !project.id) {
      throw new Error('Invalid project: must have an id');
    }

    const adapter = this.registry.findAdapter(target);
    const bundle = await adapter.buildExportBundle(project, options);

    return {
      status: 'ok',
      ...bundle,
      timestamp: new Date().toISOString()
    };
  }

  /**
   * Get export options for a target
   * @param {string} target
   * @returns {Object}
   */
  getAdapterInfo(target) {
    const adapter = this.registry.findAdapter(target);
    return {
      id: adapter.getId(),
      canHandle: target,
      description: `Adapter for ${adapter.getId()}`,
      instructions: adapter.getImportInstructions({})
    };
  }

  /**
   * List all available adapters
   * @returns {string[]}
   */
  listAdapters() {
    return this.registry.listAdapters();
  }
}

// Singleton instance
const service = new PlatformAdapterService();

export default service;
export { PlatformAdapterService, BasePlatformAdapter, Base44Adapter, RawAdapter, AdapterRegistry };
