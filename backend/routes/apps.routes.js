/**
 * Apps Routes - Staged generation and refine endpoints
 */

import express from 'express';
import { 
  generateAppStaged, 
  refineExistingApp, 
  getAppById, 
  listAllApps 
} from '../controllers/apps.controller.js';

const router = express.Router();

// Generate app with staged pipeline
router.post('/generate-staged', (req, res, next) => {
  console.log('🎯 Route handler ENTERED');
  console.log('🎯 req.body:', req.body);
  try {
    generateAppStaged(req, res, next).catch(err => {
      console.error('🔥 Handler promise rejected:', err);
      next(err);
    });
  } catch (err) {
    console.error('🔥 Handler threw synchronously:', err);
    next(err);
  }
});

// Refine existing app
router.post('/:appId/refine', refineExistingApp);

// Get app by ID
router.get('/:appId', getAppById);

// List all apps
router.get('/', listAllApps);

export default router;
