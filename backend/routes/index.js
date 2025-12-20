console.log('🔧 [Routes Index] Loading routes...');
import express from 'express';
import projects from './projects.routes.js';
import templates from './templates.routes.js';
import generate from './generate.routes.js';
import simulations from './simulations.routes.js';
import presets from './presets.routes.js';
import graphs from './graphs.routes.js';
import agents from './agents.routes.js';
import biologics from './biologics.routes.js';
import marketplace from './marketplace.routes.js';
import platform from './platform.routes.js';
import layouts from './layouts.routes.js';
import apps from './apps.routes.js';
import test from './test.routes.js';
import dev from './dev.routes.js';
import metrics from './metrics.routes.js';

const router = express.Router();

router.use('/v1/projects', projects);
router.use('/v1/templates', templates);
router.use('/v1/simulations', simulations);
router.use('/v1/presets', presets);
router.use('/v1/graphs', graphs);
router.use('/v1/agents', agents);
router.use('/v1/biologics', biologics);
router.use('/v1/plugins', marketplace);
router.use('/v1/layouts', layouts);
router.use('/apps', apps); // New staged generation endpoints
router.use('/test', test); // Test endpoints for AI providers
router.use('/dev', dev); // Development/debug endpoints
router.use('/platform', platform);
router.use('/v1/metrics', metrics); // Metrics summary
console.log('🔧 [Routes Index] Mounting /generate route...');
router.use('/generate', (req, res, next) => {
  console.log(`🚀 [Routes Index] /generate middleware hit: ${req.method} ${req.url}`);
  next();
}, generate);
console.log('🔧 [Routes Index] ✅ /generate route mounted');

// Health check
router.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

export default router;
