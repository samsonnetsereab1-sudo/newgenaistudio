import { getLayout, saveLayout } from '../services/layout.service.js';

export const fetchLayout = async (req, res, next) => {
  try {
    const { id } = req.params;
    const layout = getLayout(id);
    res.json({ status: 'ok', layout });
  } catch (err) {
    next(err);
  }
};

export const updateLayout = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { layout } = req.body;
    if (!layout || typeof layout !== 'object') {
      return res.status(400).json({ status: 'error', message: 'layout object is required' });
    }
    const saved = saveLayout(id, layout);
    res.json({ status: 'ok', layout: saved });
  } catch (err) {
    next(err);
  }
};
