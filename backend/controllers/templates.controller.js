import { listTemplates, getTemplateById } from '../services/template.service.js';

export const getTemplates = async (req, res, next) => {
  try {
    const templates = await listTemplates();
    res.json({ templates });
  } catch (err) {
    next(err);
  }
};

export const getTemplate = async (req, res, next) => {
  try {
    const template = await getTemplateById(req.params.id);
    if (!template) return res.status(404).json({ error: 'Template not found' });
    res.json({ template });
  } catch (err) {
    next(err);
  }
};
