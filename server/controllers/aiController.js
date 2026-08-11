import { ClaudeService } from '../services/claudeService.js';

export const aiController = {
  getPromptTemplates(req, res) {
    try {
      const templates = ClaudeService.getPromptTemplates();
      res.json({ success: true, templates });
    } catch (err) {
      res.status(500).json({ success: false, error: err.message });
    }
  },

  async streamPrompt(req, res) {
    try {
      const { prompt, systemPrompt, model, temperature } = req.body;
      if (!prompt || typeof prompt !== 'string') {
        return res.status(400).json({ success: false, error: 'Valid prompt string is required.' });
      }

      await ClaudeService.streamCompletion(
        { prompt, systemPrompt, model, temperature },
        res
      );
    } catch (err) {
      console.error('AI Controller Stream Error:', err);
      if (!res.headersSent) {
        res.status(500).json({ success: false, error: err.message });
      }
    }
  }
};
