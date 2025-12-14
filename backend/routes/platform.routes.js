/**
 * Platform Integration Routes
 * 
 * Endpoints for exporting NewGen Studio projects to other platforms
 * and managing platform integrations.
 */

import { Router } from 'express';
import platformAdapterService from '../services/platformAdapterService.js';
import projectService from '../services/project.service.js';

const router = Router();

/**
 * GET /api/platform/adapters
 * List available platform adapters
 */
router.get('/adapters', (req, res) => {
  try {
    const adapters = platformAdapterService.listAdapters();
    res.json({
      status: 'ok',
      adapters,
      description: 'Available platform adapters for project export'
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: error.message
    });
  }
});

/**
 * GET /api/platform/adapters/:target
 * Get info about a specific adapter
 */
router.get('/adapters/:target', (req, res) => {
  try {
    const info = platformAdapterService.getAdapterInfo(req.params.target);
    res.json({
      status: 'ok',
      adapter: info
    });
  } catch (error) {
    res.status(404).json({
      status: 'error',
      message: error.message
    });
  }
});

/**
 * POST /api/platform/export
 * Export a project to a target platform
 * 
 * Request body:
 * {
 *   "projectId": "proj_123",
 *   "target": "base44" | "raw" | "custom",
 *   "env": "staging" | "production" (optional),
 *   "format": "config" | "files" | "bundle" (optional)
 * }
 * 
 * Response:
 * {
 *   "status": "ok",
 *   "target": "base44",
 *   "projectId": "proj_123",
 *   "manifest": { ... },
 *   "instructions": [ ... ],
 *   "timestamp": "2025-12-10T..."
 * }
 */
router.post('/export', async (req, res, next) => {
  try {
    const { projectId, target, env, format } = req.body;

    // Validate input
    if (!projectId) {
      return res.status(400).json({
        status: 'error',
        message: 'projectId is required'
      });
    }

    if (!target) {
      return res.status(400).json({
        status: 'error',
        message: 'target is required (e.g., "base44", "raw")'
      });
    }

    // Fetch project
    const project = projectService.getProject(projectId);
    if (!project) {
      return res.status(404).json({
        status: 'error',
        message: `Project not found: ${projectId}`
      });
    }

    // Export project
    const exportBundle = await platformAdapterService.exportProject(
      project,
      target,
      { env: env || 'staging', format: format || 'bundle' }
    );

    res.json(exportBundle);
  } catch (error) {
    console.error('Export error:', error);
    res.status(400).json({
      status: 'error',
      message: error.message
    });
  }
});

/**
 * POST /api/platform/import
 * Import a project from another platform
 * 
 * Request body:
 * {
 *   "source": "base44" | "bubble" | "retool",
 *   "manifest": { ... },
 *   "projectName": "Imported Project"
 * }
 */
router.post('/import', async (req, res, next) => {
  try {
    const { source, manifest, projectName } = req.body;

    if (!source || !manifest) {
      return res.status(400).json({
        status: 'error',
        message: 'source and manifest are required'
      });
    }

    // TODO: Implement import logic
    // For now, return a placeholder response
    res.json({
      status: 'ok',
      message: 'Import functionality coming soon',
      source,
      projectName: projectName || 'Imported Project'
    });
  } catch (error) {
    console.error('Import error:', error);
    res.status(400).json({
      status: 'error',
      message: error.message
    });
  }
});

/**
 * GET /api/platform/manifest-template
 * Get an empty manifest template
 */
router.get('/manifest-template', async (req, res) => {
  try {
    const { createManifestTemplate } = await import('../types/base44Manifest.js');
    const template = createManifestTemplate('New Project');
    res.json({
      status: 'ok',
      template
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: error.message
    });
  }
});

/**
 * POST /api/platform/validate
 * Validate a manifest against Base44 schema
 */
router.post('/validate', (req, res) => {
  try {
    const { manifest } = req.body;

    if (!manifest) {
      return res.status(400).json({
        status: 'error',
        message: 'manifest is required'
      });
    }

    // TODO: Implement validation logic
    const isValid = manifest.version && manifest.project && manifest.layout;

    if (isValid) {
      res.json({
        status: 'ok',
        valid: true,
        message: 'Manifest is valid'
      });
    } else {
      res.status(400).json({
        status: 'error',
        valid: false,
        message: 'Manifest is missing required fields'
      });
    }
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: error.message
    });
  }
});

export default router;
