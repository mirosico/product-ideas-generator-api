import { Request, Response, NextFunction } from 'express';
import { subscriptionsService } from './subscriptions.service.js';
import { createSubscriptionSchema, updateSubscriptionSchema } from './subscriptions.model.js';
import { AuthRequest } from '../shared/middleware/auth.middleware.js';

export class SubscriptionsController {
  async createSubscription(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ error: 'Unauthorized' });
        return;
      }

      const dto = createSubscriptionSchema.parse(req.body);
      const subscription = await subscriptionsService.createSubscription(req.user.id, dto);

      res.status(201).json(subscription);
    } catch (error) {
      next(error);
    }
  }

  async getMySubscription(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ error: 'Unauthorized' });
        return;
      }

      const subscription = await subscriptionsService.getSubscription(req.user.id);

      if (!subscription) {
        res.status(404).json({ error: 'Subscription not found' });
        return;
      }

      res.status(200).json(subscription);
    } catch (error) {
      next(error);
    }
  }

  async updateMySubscription(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ error: 'Unauthorized' });
        return;
      }

      const dto = updateSubscriptionSchema.parse(req.body);
      const subscription = await subscriptionsService.updateSubscription(req.user.id, dto);

      res.status(200).json(subscription);
    } catch (error) {
      next(error);
    }
  }

  async deleteMySubscription(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ error: 'Unauthorized' });
        return;
      }

      await subscriptionsService.deleteSubscription(req.user.id);

      res.status(200).json({ message: 'Subscription deleted successfully' });
    } catch (error) {
      next(error);
    }
  }

  async unsubscribe(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { token } = req.params;

      if (!token) {
        res.status(400).json({ error: 'Token is required' });
        return;
      }

      await subscriptionsService.unsubscribeByToken(token);

      res.status(200).json({ message: 'Unsubscribed successfully' });
    } catch (error) {
      next(error);
    }
  }
}

export const subscriptionsController = new SubscriptionsController();
