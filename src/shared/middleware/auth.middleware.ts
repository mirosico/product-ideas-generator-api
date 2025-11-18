import { Request, Response, NextFunction } from 'express';
import { supabase } from '../utils/database.js';
import { logger } from '../utils/logger.js';

export interface AuthRequest extends Request {
  user?: {
    id: string;
    email: string;
  };
  accessToken?: string;
}

export async function authMiddleware(
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      res.status(401).json({ error: 'Missing or invalid authorization header' });
      return;
    }

    const token = authHeader.substring(7);

    const { data, error } = await supabase.auth.getUser(token);

    if (error || !data.user) {
      logger.warn('Authentication failed', { error: error?.message });
      res.status(401).json({ error: 'Invalid or expired token' });
      return;
    }

    req.user = {
      id: data.user.id,
      email: data.user.email!,
    };
    req.accessToken = token;

    next();
  } catch (error) {
    logger.error('Auth middleware error', { error });
    res.status(500).json({ error: 'Internal server error' });
  }
}
