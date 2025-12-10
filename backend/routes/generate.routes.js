import express from 'express';
import { generateApp } from '../controllers/generate.controller.js';

const router = express.Router();

router.post('/', generateApp);

export default router;
