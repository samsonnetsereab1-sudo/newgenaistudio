import express from 'express';
import { getProjects, getProject, createProject, deleteProject } from '../controllers/projects.controller.js';

const router = express.Router();

router.get('/', getProjects);
router.get('/:id', getProject);
router.post('/', createProject);
router.delete('/:id', deleteProject);

export default router;
