/**
 * App Runtime Service
 * Dynamically creates Express routers for generated apps based on their AppSpec
 */

import express from 'express';
import { createConnector } from './dataSources/index.js';

// In-memory store for app instances and their data sources
const appInstances = new Map();

/**
 * Create dynamic API routes for an app based on its AppSpec
 * @param {object} appSpec - AppSpec v2.0 with dataSources
 * @returns {express.Router} - Express router for the app
 */
export function createAppAPI(appSpec) {
  const router = express.Router();
  
  if (!appSpec || !appSpec.dataSources) {
    console.warn('[App Runtime] No data sources in AppSpec');
    return router;
  }

  const appId = appSpec.layout?.id || 'unknown';
  console.log(`[App Runtime] Creating API for app: ${appId}`);

  // Initialize data source connectors
  const connectors = new Map();
  for (const dataSource of appSpec.dataSources) {
    try {
      const connector = createConnector(dataSource);
      connectors.set(dataSource.id, connector);
      console.log(`[App Runtime] Created connector for: ${dataSource.id} (${dataSource.type})`);
    } catch (error) {
      console.error(`[App Runtime] Failed to create connector for ${dataSource.id}:`, error.message);
    }
  }

  // Store app instance
  appInstances.set(appId, {
    spec: appSpec,
    connectors
  });

  // Create routes for each data source
  for (const dataSource of appSpec.dataSources) {
    const connector = connectors.get(dataSource.id);
    if (!connector) continue;

    const basePath = dataSource.url.replace(/^\/api/, ''); // Remove /api prefix if present
    
    // GET route
    if (dataSource.methods?.includes('GET')) {
      router.get(basePath, async (req, res) => {
        try {
          console.log(`[App Runtime] GET ${basePath}`);
          const data = await connector.fetch({
            method: 'GET',
            params: req.query
          });
          res.json(data);
        } catch (error) {
          console.error(`[App Runtime] GET ${basePath} error:`, error.message);
          res.status(500).json({
            error: error.message
          });
        }
      });
    }

    // POST route
    if (dataSource.methods?.includes('POST')) {
      router.post(basePath, async (req, res) => {
        try {
          console.log(`[App Runtime] POST ${basePath}`);
          const data = await connector.fetch({
            method: 'POST',
            body: req.body
          });
          res.json(data);
        } catch (error) {
          console.error(`[App Runtime] POST ${basePath} error:`, error.message);
          res.status(500).json({
            error: error.message
          });
        }
      });
    }

    // PUT route
    if (dataSource.methods?.includes('PUT')) {
      router.put(`${basePath}/:id?`, async (req, res) => {
        try {
          console.log(`[App Runtime] PUT ${basePath}/${req.params.id || ''}`);
          const data = await connector.fetch({
            method: 'PUT',
            path: req.params.id ? `/${req.params.id}` : '',
            body: req.body
          });
          res.json(data);
        } catch (error) {
          console.error(`[App Runtime] PUT ${basePath} error:`, error.message);
          res.status(500).json({
            error: error.message
          });
        }
      });
    }

    // DELETE route
    if (dataSource.methods?.includes('DELETE')) {
      router.delete(`${basePath}/:id`, async (req, res) => {
        try {
          console.log(`[App Runtime] DELETE ${basePath}/${req.params.id}`);
          const data = await connector.fetch({
            method: 'DELETE',
            path: `/${req.params.id}`
          });
          res.json(data);
        } catch (error) {
          console.error(`[App Runtime] DELETE ${basePath} error:`, error.message);
          res.status(500).json({
            error: error.message
          });
        }
      });
    }
  }

  // Health check for this app
  router.get('/health', (req, res) => {
    res.json({
      status: 'ok',
      appId,
      dataSources: Array.from(connectors.keys())
    });
  });

  console.log(`[App Runtime] API created for ${appId} with ${connectors.size} data sources`);
  return router;
}

/**
 * Get an app instance by ID
 * @param {string} appId - App ID
 * @returns {object|null} - App instance or null
 */
export function getAppInstance(appId) {
  return appInstances.get(appId) || null;
}

/**
 * Remove an app instance
 * @param {string} appId - App ID
 */
export function removeAppInstance(appId) {
  const instance = appInstances.get(appId);
  if (instance) {
    // Disconnect all connectors
    instance.connectors.forEach(connector => {
      if (connector.disconnect) {
        connector.disconnect();
      }
    });
    appInstances.delete(appId);
    console.log(`[App Runtime] Removed app instance: ${appId}`);
  }
}

/**
 * Get all app instances
 * @returns {Map} - Map of app instances
 */
export function getAllAppInstances() {
  return appInstances;
}
