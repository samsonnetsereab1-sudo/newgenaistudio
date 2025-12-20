console.log('🔧 [Generate Routes] Loading generate routes...');
import express from 'express';
import { generateApp } from '../controllers/generate.controller.js';

const router = express.Router();
console.log('🔧 [Generate Routes] Router created');
console.log('🔧 [Generate Routes] Router created');

// Test endpoint
router.get('/test', (req, res) => {
  console.log('🎯 [Generate Routes] /test endpoint hit!');
  console.log('✅ TEST ENDPOINT HIT!');
  res.json({ message: 'Test endpoint works!' });
});

console.log('🔧 [Generate Routes] Registering POST / handler...');
router.post('/', (req, res, next) => {
  console.log('🎯 [Generate Routes] POST / handler hit!');
  console.log('🎯 [Generate Routes] Body:', req.body);
  next();
}, generateApp);
console.log('🔧 [Generate Routes] ✅ POST handler registered');

export default router;
