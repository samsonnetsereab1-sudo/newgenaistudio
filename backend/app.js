console.log('1. App.js loading - before imports');

import express from 'express';
import cors from 'cors';
console.log('2. Express and CORS imported');

import routes from './routes/index.js';
console.log('3. Routes imported successfully');

import notFound from './middleware/notFound.js';
import errorHandler from './middleware/errorHandler.js';
console.log('4. Middleware imported');

import { createAppAPI, getAppInstance } from './services/appRuntime.js';
import { getApp } from './services/app.store.js';
console.log('5. App runtime imported');

const app = express();

const FRONTEND_ORIGIN = process.env.FRONTEND_ORIGIN || 'http://localhost:5175';
const FRONTEND_ORIGINS = process.env.FRONTEND_ORIGINS || '';
const isDevelopment = process.env.NODE_ENV !== 'production';

console.log('5. Configuring CORS and body parser');
// Explicit CORS with allow-listed origin reflection for production
// Supports comma-separated FRONTEND_ORIGINS and simple wildcard entries like https://*.vercel.app
const parsedOrigins = [FRONTEND_ORIGIN]
  .concat(FRONTEND_ORIGINS.split(',').map(s => s.trim()).filter(Boolean))
  .filter(Boolean);

function matchesOrigin(allowed, origin) {
  if (!allowed || !origin) return false;
  if (allowed === origin) return true;
  if (allowed.includes('*')) {
    // Convert wildcard to a safe regex: escape dots, replace * with .+
    const pattern = allowed
      .replace(/[.+^${}()|[\]\\]/g, '\\$&')
      .replace(/\*/g, '.+');
    return new RegExp(`^${pattern}$`).test(origin);
  }
  return false;
}

app.use((req, res, next) => {
  const requestOrigin = req.headers.origin;
  let originToSend = '';
  if (isDevelopment) {
    originToSend = requestOrigin || '*';
  } else if (requestOrigin) {
    const ok = parsedOrigins.some(allowed => matchesOrigin(allowed, requestOrigin));
    originToSend = ok ? requestOrigin : FRONTEND_ORIGIN;
  }

  res.setHeader('Access-Control-Allow-Origin', originToSend || '');
  res.setHeader('Vary', 'Origin');
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Methods', 'GET,HEAD,PUT,PATCH,POST,DELETE');
  const reqHeaders = req.headers['access-control-request-headers'] || 'content-type';
  res.setHeader('Access-Control-Allow-Headers', reqHeaders);
  if (req.method === 'OPTIONS') {
    return res.sendStatus(204);
  }
  next();
});
app.use(express.json({ limit: '5mb' }));
console.log('6. Body parser enabled');

// Mount all API routes
console.log('7. Mounting /api routes');
// Removed request logging middleware to prevent crashes
app.use('/api', routes);
console.log('8. Routes mounted successfully');

// Mount dynamic app APIs
console.log('8.5. Mounting dynamic app APIs');
app.use('/api/apps/:appId', (req, res, next) => {
  const appId = req.params.appId;
  
  // Try to get app from runtime store first
  let appInstance = getAppInstance(appId);
  
  // If not in runtime, try to get from app store
  if (!appInstance) {
    const appSpec = getApp(appId);
    if (appSpec) {
      // Create runtime API for this app
      const appRouter = createAppAPI(appSpec);
      return appRouter(req, res, next);
    }
  }
  
  // If app exists in runtime, use its router
  if (appInstance) {
    const appRouter = createAppAPI(appInstance.spec);
    return appRouter(req, res, next);
  }
  
  // App not found
  next();
});
console.log('8.6. Dynamic app APIs mounted');

// Root info route for convenience
app.get('/', (req, res) => {
  res.json({
    status: 'ok',
    service: 'NewGen Studio backend',
    endpoints: [
      'GET /api/health',
      'POST /api/generate',
      'POST /api/platform/import',
      'POST /api/platform/export',
      'GET /api/v1/agents/status'
    ]
  });
});

// Error handling
app.use(notFound);
app.use(errorHandler);
console.log('9. Error handlers registered');

export default app;
