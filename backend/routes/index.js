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

const router = express.Router();

router.use('/v1/projects', projects);
router.use('/v1/templates', templates);
router.use('/v1/simulations', simulations);
router.use('/v1/presets', presets);
router.use('/v1/graphs', graphs);
router.use('/v1/agents', agents);
router.use('/v1/biologics', biologics);
router.use('/v1/plugins', marketplace);
router.use('/generate', generate);

// Health check
router.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

export default router;
