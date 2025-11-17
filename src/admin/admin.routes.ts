import { Router } from 'express';
import { adminController } from './admin.controller.js';
import { redditSourcesController } from './reddit-sources.controller.js';
import { adminMiddleware } from '../shared/middleware/admin.middleware.js';

const router = Router();

router.use(adminMiddleware);

router.post('/jobs/reddit-collect', adminController.triggerRedditCollect.bind(adminController));
router.post('/jobs/generate-ideas', adminController.triggerIdeasGeneration.bind(adminController));
router.post('/jobs/send-emails', adminController.triggerEmailSend.bind(adminController));
router.get('/jobs/:jobId', adminController.getJobStatus.bind(adminController));
router.get('/queue-stats', adminController.getQueueStats.bind(adminController));

router.get('/reddit-sources', redditSourcesController.getSources.bind(redditSourcesController));
router.post('/reddit-sources', redditSourcesController.createSource.bind(redditSourcesController));
router.patch('/reddit-sources/:id', redditSourcesController.updateSource.bind(redditSourcesController));
router.delete('/reddit-sources/:id', redditSourcesController.deleteSource.bind(redditSourcesController));
router.get('/reddit-sources/stats', redditSourcesController.getSourceStats.bind(redditSourcesController));
router.post('/reddit-sources/bulk-update', redditSourcesController.bulkUpdateStatus.bind(redditSourcesController));

export default router;
