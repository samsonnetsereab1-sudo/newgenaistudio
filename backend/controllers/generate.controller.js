import { runAI } from '../services/ai.service.js';

export const generateApp = async (req, res, next) => {
  try {
    const { prompt } = req.body;
    if (!prompt || typeof prompt !== 'string') {
      return res.status(400).json({ status: 'error', message: 'prompt is required' });
    }
    const result = await runAI(prompt);
    res.json(result);
  } catch (err) {
    next(err);
  }
};
