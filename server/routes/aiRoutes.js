import { Router } from 'express';
import { aiController } from '../controllers/aiController.js';

const router = Router();

router.get('/prompts', aiController.getPromptTemplates);
router.post('/stream', aiController.streamPrompt);

export default router;
