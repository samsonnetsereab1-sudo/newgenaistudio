// backend/routes/templates.js
const express = require('express');
const router = express.Router();
const fs = require('fs');
const path = require('path');
const yaml = require('js-yaml');

const templatesDir = path.resolve(__dirname, '..', '..', 'resources', 'templates');

// GET /api/v1/templates - list all templates
router.get('/', (req, res) => {
  try {
    const files = fs.readdirSync(templatesDir).filter(f => f.endsWith('.yaml'));
    const templates = files.map(file => {
      const content = fs.readFileSync(path.join(templatesDir, file), 'utf8');
      const data = yaml.load(content);
      return {
        id: data.id,
        title: data.title,
        domain_tags: data.domain_tags,
        complexity: data.complexity,
        filename: file
      };
    });
    res.json({ templates });
  } catch (error) {
    console.error('Error reading templates:', error);
    res.status(500).json({ error: 'Failed to load templates' });
  }
});

// GET /api/v1/templates/:id - get single template with full details
router.get('/:id', (req, res) => {
  try {
    const files = fs.readdirSync(templatesDir).filter(f => f.endsWith('.yaml'));
    for (const file of files) {
      const content = fs.readFileSync(path.join(templatesDir, file), 'utf8');
      const data = yaml.load(content);
      if (data.id === req.params.id) {
        return res.json({ template: data });
      }
    }
    res.status(404).json({ error: 'Template not found' });
  } catch (error) {
    console.error('Error reading template:', error);
    res.status(500).json({ error: 'Failed to load template' });
  }
});

module.exports = router;
