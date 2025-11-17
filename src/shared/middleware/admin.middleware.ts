import { Request, Response, NextFunction } from 'express';
import { env } from '../config/env.js';
import { logger } from '../utils/logger.js';

export function adminMiddleware(
  req: Request,
  res: Response,
  next: NextFunction
): void {
  if (!env.ADMIN_API_KEY) {
    logger.warn('Admin API key not configured');
    res.status(503).json({ error: 'Admin functionality not available' });
    return;
  }

  const apiKey = req.headers['x-admin-api-key'] as string;

  if (!apiKey) {
    res.status(401).json({ error: 'Admin API key required' });
    return;
  }

  if (apiKey !== env.ADMIN_API_KEY) {
    logger.warn('Invalid admin API key attempt', {
      ip: req.ip,
      path: req.path
    });
    res.status(403).json({ error: 'Invalid admin API key' });
    return;
  }

  logger.info('Admin access granted', { path: req.path });
  next();
}
