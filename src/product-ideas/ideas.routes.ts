import { Router } from 'express';
import { ideasController } from './ideas.controller.js';

const router = Router();

router.get('/', ideasController.getIdeas.bind(ideasController));
router.get('/:id', ideasController.getIdeaById.bind(ideasController));

export default router;
