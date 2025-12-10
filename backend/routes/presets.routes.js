import express from 'express';
import presetsService from '../services/presets.service.js';

const router = express.Router();

/**
 * GET /api/v1/presets
 * Get all presets (with optional filters)
 */
router.get('/', (req, res) => {
  try {
    const { category, templateId, search } = req.query;

    let presets;

    if (search) {
      presets = presetsService.search(search);
    } else if (category) {
      presets = presetsService.getByCategory(category);
    } else if (templateId) {
      presets = presetsService.getCompatible(templateId);
    } else {
      presets = presetsService.getAll();
    }

    res.json(presets);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET /api/v1/presets/recommended
 * Get recommended presets
 */
router.get('/recommended', (req, res) => {
  try {
    const presets = presetsService.getRecommended();
    res.json(presets);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET /api/v1/presets/categories
 * Get all preset categories
 */
router.get('/categories', (req, res) => {
  try {
    const categories = presetsService.getCategories();
    res.json(categories);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET /api/v1/presets/tags
 * Get all tags
 */
router.get('/tags', (req, res) => {
  try {
    const tags = presetsService.getAllTags();
    res.json(tags);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET /api/v1/presets/:id
 * Get preset by ID
 */
router.get('/:id', (req, res) => {
  try {
    const preset = presetsService.getById(req.params.id);

    if (!preset) {
      return res.status(404).json({ error: 'Preset not found' });
    }

    res.json(preset);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * POST /api/v1/presets
 * Create a custom preset
 */
router.post('/', (req, res) => {
  try {
    const preset = req.body;

    if (!preset.name || !preset.config) {
      return res
        .status(400)
        .json({ error: 'Missing required fields: name, config' });
    }

    const created = presetsService.createCustom(preset);
    res.status(201).json(created);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * PUT /api/v1/presets/:id
 * Update a custom preset
 */
router.put('/:id', (req, res) => {
  try {
    const updated = presetsService.updateCustom(req.params.id, req.body);

    if (!updated) {
      return res.status(404).json({ error: 'Preset not found' });
    }

    res.json(updated);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * DELETE /api/v1/presets/:id
 * Delete a custom preset
 */
router.delete('/:id', (req, res) => {
  try {
    const deleted = presetsService.deleteCustom(req.params.id);

    if (!deleted) {
      return res.status(404).json({ error: 'Preset not found' });
    }

    res.json({ success: true, id: req.params.id });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
