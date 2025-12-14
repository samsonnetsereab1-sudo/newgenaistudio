/**
 * In-Memory App Store (No MongoDB dependency)
 * Stores generated apps in memory for this session
 * TODO: Replace with real database when MongoDB is connected
 */

const apps = new Map();

/**
 * Save a new app or update existing
 */
export async function saveApp(appData) {
  const appId = appData.appId || `app-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
  const timestamp = new Date().toISOString();
  
  const app = {
    appId,
    ...appData,
    createdAt: appData.createdAt || timestamp,
    updatedAt: timestamp,
    version: appData.version || '2.0'
  };
  
  apps.set(appId, app);
  console.log(`[AppStore] Saved app ${appId}`);
  return app;
}

/**
 * Get app by ID
 */
export async function getApp(appId) {
  const app = apps.get(appId);
  if (!app) {
    throw new Error(`App ${appId} not found`);
  }
  return app;
}

/**
 * List all apps
 */
export async function listApps() {
  return Array.from(apps.values());
}

/**
 * Delete app
 */
export async function deleteApp(appId) {
  const existed = apps.delete(appId);
  if (!existed) {
    throw new Error(`App ${appId} not found`);
  }
  console.log(`[AppStore] Deleted app ${appId}`);
  return { success: true };
}

/**
 * Update app spec (for refine)
 */
export async function updateAppSpec(appId, newSpec, patch) {
  const app = await getApp(appId);
  
  app.spec = newSpec;
  app.updatedAt = new Date().toISOString();
  app.mode = 'refined';
  app.patches = app.patches || [];
  if (patch) {
    app.patches.push({
      timestamp: app.updatedAt,
      patch
    });
  }
  
  apps.set(appId, app);
  console.log(`[AppStore] Updated app ${appId}`);
  return app;
}
