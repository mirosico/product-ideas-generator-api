import { Router } from 'express';
import { authController } from './auth.controller.js';
import { authMiddleware } from '../shared/middleware/auth.middleware.js';

const router = Router();

router.post('/register', authController.register.bind(authController));
router.post('/login', authController.login.bind(authController));
router.post('/logout', authMiddleware, authController.logout.bind(authController));
router.get('/me', authMiddleware, authController.me.bind(authController));
router.post('/refresh', authController.refresh.bind(authController));

export default router;
