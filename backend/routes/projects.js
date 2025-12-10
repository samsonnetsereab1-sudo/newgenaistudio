// backend/routes/projects.js
const express = require('express');
const router = express.Router();

// Mock in-memory store (replace with DB later)
let projects = [
  { id: 'proj-1', name: 'CRISPR Workflow', status: 'active', owner: 'lab-team', created: '2025-12-01' },
  { id: 'proj-2', name: 'mRNA Library Analysis', status: 'draft', owner: 'research-group', created: '2025-12-05' }
];

// GET /api/v1/projects - list all projects
router.get('/', (req, res) => {
  res.json({ projects });
});

// GET /api/v1/projects/:id - get single project
router.get('/:id', (req, res) => {
  const project = projects.find(p => p.id === req.params.id);
  if (!project) return res.status(404).json({ error: 'Project not found' });
  res.json({ project });
});

// POST /api/v1/projects - create new project
router.post('/', (req, res) => {
  const { name, owner } = req.body;
  if (!name) return res.status(400).json({ error: 'name is required' });
  
  const project = {
    id: `proj-${Date.now()}`,
    name,
    owner: owner || 'unknown',
    status: 'draft',
    created: new Date().toISOString()
  };
  
  projects.push(project);
  res.status(201).json({ project });
});

// DELETE /api/v1/projects/:id - delete project
router.delete('/:id', (req, res) => {
  const idx = projects.findIndex(p => p.id === req.params.id);
  if (idx === -1) return res.status(404).json({ error: 'Project not found' });
  
  projects.splice(idx, 1);
  res.json({ success: true });
});

module.exports = router;
