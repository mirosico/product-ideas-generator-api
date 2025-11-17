import { Router } from 'express';
import { subscriptionsController } from './subscriptions.controller.js';
import { authMiddleware } from '../shared/middleware/auth.middleware.js';

const router = Router();

router.post('/', authMiddleware, subscriptionsController.createSubscription.bind(subscriptionsController));
router.get('/me', authMiddleware, subscriptionsController.getMySubscription.bind(subscriptionsController));
router.patch('/me', authMiddleware, subscriptionsController.updateMySubscription.bind(subscriptionsController));
router.delete('/me', authMiddleware, subscriptionsController.deleteMySubscription.bind(subscriptionsController));
router.get('/unsubscribe/:token', subscriptionsController.unsubscribe.bind(subscriptionsController));

export default router;
