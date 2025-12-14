import express from 'express';
import { fetchLayout, updateLayout } from '../controllers/layouts.controller.js';

const router = express.Router();

router.get('/:id', fetchLayout);
router.put('/:id', updateLayout);

export default router;
