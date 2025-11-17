import { Router } from 'express';
import { adminController } from './admin.controller.js';
import { adminMiddleware } from '../shared/middleware/admin.middleware.js';

const router = Router();

router.use(adminMiddleware);

router.post('/jobs/reddit-collect', adminController.triggerRedditCollect.bind(adminController));
router.post('/jobs/generate-ideas', adminController.triggerIdeasGeneration.bind(adminController));
router.post('/jobs/send-emails', adminController.triggerEmailSend.bind(adminController));
router.get('/jobs/:jobId', adminController.getJobStatus.bind(adminController));
router.get('/queue-stats', adminController.getQueueStats.bind(adminController));

export default router;
