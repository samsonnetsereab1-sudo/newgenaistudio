import { listProjects, getProjectById, addProject, removeProject } from '../services/project.service.js';

export const getProjects = async (req, res, next) => {
  try {
    const projects = await listProjects();
    res.json({ projects });
  } catch (err) {
    next(err);
  }
};

export const getProject = async (req, res, next) => {
  try {
    const project = await getProjectById(req.params.id);
    if (!project) return res.status(404).json({ error: 'Project not found' });
    res.json({ project });
  } catch (err) {
    next(err);
  }
};

export const createProject = async (req, res, next) => {
  try {
    const { name, owner } = req.body;
    if (!name) return res.status(400).json({ error: 'name is required' });
    const project = await addProject({ name, owner: owner || 'unknown' });
    res.status(201).json({ project });
  } catch (err) {
    next(err);
  }
};

export const deleteProject = async (req, res, next) => {
  try {
    const removed = await removeProject(req.params.id);
    if (!removed) return res.status(404).json({ error: 'Project not found' });
    res.json({ success: true });
  } catch (err) {
    next(err);
  }
};
