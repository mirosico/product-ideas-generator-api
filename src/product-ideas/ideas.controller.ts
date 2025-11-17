import { Request, Response, NextFunction } from 'express';
import { ideasService } from './ideas.service.js';
import { getIdeasQuerySchema } from './ideas.model.js';

export class IdeasController {
  async getIdeas(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const query = getIdeasQuerySchema.parse(req.query);
      const ideas = await ideasService.getIdeas(query);

      res.status(200).json({
        ideas,
        pagination: {
          limit: query.limit,
          offset: query.offset,
          count: ideas.length,
        },
      });
    } catch (error) {
      next(error);
    }
  }

  async getIdeaById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const idea = await ideasService.getIdeaById(id);

      if (!idea) {
        res.status(404).json({ error: 'Product idea not found' });
        return;
      }

      res.status(200).json(idea);
    } catch (error) {
      next(error);
    }
  }
}

export const ideasController = new IdeasController();
