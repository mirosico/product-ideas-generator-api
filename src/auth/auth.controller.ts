import { Request, Response, NextFunction } from 'express';
import { authService } from './auth.service.js';
import { registerSchema, loginSchema } from './auth.model.js';
import { AuthRequest } from '../shared/middleware/auth.middleware.js';

export class AuthController {
  async register(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const dto = registerSchema.parse(req.body);
      const result = await authService.register(dto);
      res.status(201).json(result);
    } catch (error) {
      next(error);
    }
  }

  async login(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const dto = loginSchema.parse(req.body);
      const result = await authService.login(dto);
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  }

  async logout(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const token = req.headers.authorization?.substring(7);
      if (!token) {
        res.status(401).json({ error: 'No token provided' });
        return;
      }
      await authService.logout(token);
      res.status(200).json({ message: 'Logged out successfully' });
    } catch (error) {
      next(error);
    }
  }

  async me(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const token = req.headers.authorization?.substring(7);
      if (!token) {
        res.status(401).json({ error: 'No token provided' });
        return;
      }
      const user = await authService.getCurrentUser(token);
      res.status(200).json(user);
    } catch (error) {
      next(error);
    }
  }

  async refresh(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { refresh_token } = req.body;
      if (!refresh_token) {
        res.status(400).json({ error: 'Refresh token is required' });
        return;
      }
      const result = await authService.refreshToken(refresh_token);
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  }
}

export const authController = new AuthController();
