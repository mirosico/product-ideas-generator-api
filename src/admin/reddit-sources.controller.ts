import { Request, Response, NextFunction } from 'express';
import { supabase } from '../shared/utils/database.js';
import { logger } from '../shared/utils/logger.js';
import { z } from 'zod';

const createSourceSchema = z.object({
  subredditName: z.string().min(1).max(100),
  category: z.string().min(1),
});

const updateSourceSchema = z.object({
  category: z.string().min(1).optional(),
  isActive: z.boolean().optional(),
});

export class RedditSourcesController {
  async getSources(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { isActive, category } = req.query;

      let query = supabase
        .from('reddit_sources')
        .select('*')
        .order('subreddit_name', { ascending: true });

      if (isActive !== undefined) {
        query = query.eq('is_active', isActive === 'true');
      }

      if (category) {
        query = query.eq('category', category);
      }

      const { data, error } = await query;

      if (error) {
        logger.error('Failed to fetch reddit sources', { error });
        res.status(500).json({ error: 'Failed to fetch sources' });
        return;
      }

      res.status(200).json({
        sources: data || [],
        count: data?.length || 0,
      });
    } catch (error) {
      next(error);
    }
  }

  async createSource(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const dto = createSourceSchema.parse(req.body);

      const { data: existing } = await supabase
        .from('reddit_sources')
        .select('id')
        .eq('subreddit_name', dto.subredditName)
        .single();

      if (existing) {
        res.status(409).json({ error: 'Subreddit already exists' });
        return;
      }

      const { data, error } = await supabase
        .from('reddit_sources')
        .insert({
          subreddit_name: dto.subredditName,
          category: dto.category,
          is_active: true,
          post_count: 0,
          avg_engagement: 0,
        })
        .select()
        .single();

      if (error || !data) {
        logger.error('Failed to create reddit source', { error, dto });
        res.status(500).json({ error: 'Failed to create source' });
        return;
      }

      logger.info('Reddit source created', { subreddit: dto.subredditName, category: dto.category });

      res.status(201).json({
        id: data.id,
        subredditName: data.subreddit_name,
        category: data.category,
        isActive: data.is_active,
        postCount: data.post_count,
        avgEngagement: data.avg_engagement,
        lastFetchedAt: data.last_fetched_at,
        createdAt: data.created_at,
      });
    } catch (error) {
      next(error);
    }
  }

  async updateSource(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const dto = updateSourceSchema.parse(req.body);

      const updates: any = {};
      if (dto.category !== undefined) {
        updates.category = dto.category;
      }
      if (dto.isActive !== undefined) {
        updates.is_active = dto.isActive;
      }

      if (Object.keys(updates).length === 0) {
        res.status(400).json({ error: 'No updates provided' });
        return;
      }

      const { data, error } = await supabase
        .from('reddit_sources')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error || !data) {
        logger.error('Failed to update reddit source', { error, id });
        res.status(404).json({ error: 'Source not found' });
        return;
      }

      logger.info('Reddit source updated', {
        id,
        subreddit: data.subreddit_name,
        updates: Object.keys(updates),
      });

      res.status(200).json({
        id: data.id,
        subredditName: data.subreddit_name,
        category: data.category,
        isActive: data.is_active,
        postCount: data.post_count,
        avgEngagement: data.avg_engagement,
        lastFetchedAt: data.last_fetched_at,
        createdAt: data.created_at,
      });
    } catch (error) {
      next(error);
    }
  }

  async deleteSource(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;

      const { data: source } = await supabase
        .from('reddit_sources')
        .select('subreddit_name')
        .eq('id', id)
        .single();

      if (!source) {
        res.status(404).json({ error: 'Source not found' });
        return;
      }

      const { error } = await supabase
        .from('reddit_sources')
        .delete()
        .eq('id', id);

      if (error) {
        logger.error('Failed to delete reddit source', { error, id });
        res.status(500).json({ error: 'Failed to delete source' });
        return;
      }

      logger.info('Reddit source deleted', { id, subreddit: source.subreddit_name });

      res.status(200).json({
        message: 'Source deleted successfully',
        subredditName: source.subreddit_name,
      });
    } catch (error) {
      next(error);
    }
  }

  async getSourceStats(_req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { data: sources, error } = await supabase
        .from('reddit_sources')
        .select('*');

      if (error) {
        logger.error('Failed to fetch source stats', { error });
        res.status(500).json({ error: 'Failed to fetch stats' });
        return;
      }

      const stats = {
        total: sources?.length || 0,
        active: sources?.filter(s => s.is_active).length || 0,
        inactive: sources?.filter(s => !s.is_active).length || 0,
        byCategory: this.groupByCategory(sources || []),
        totalPosts: sources?.reduce((sum, s) => sum + (s.post_count || 0), 0) || 0,
        avgEngagement: sources?.length
          ? sources.reduce((sum, s) => sum + (s.avg_engagement || 0), 0) / sources.length
          : 0,
        lastFetched: sources
          ?.filter(s => s.last_fetched_at)
          .sort((a, b) => new Date(b.last_fetched_at).getTime() - new Date(a.last_fetched_at).getTime())[0]
          ?.last_fetched_at || null,
      };

      res.status(200).json(stats);
    } catch (error) {
      next(error);
    }
  }

  async bulkUpdateStatus(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { sourceIds, isActive } = req.body;

      if (!Array.isArray(sourceIds) || sourceIds.length === 0) {
        res.status(400).json({ error: 'sourceIds array required' });
        return;
      }

      if (typeof isActive !== 'boolean') {
        res.status(400).json({ error: 'isActive boolean required' });
        return;
      }

      const { data, error } = await supabase
        .from('reddit_sources')
        .update({ is_active: isActive })
        .in('id', sourceIds)
        .select();

      if (error) {
        logger.error('Failed to bulk update sources', { error });
        res.status(500).json({ error: 'Failed to update sources' });
        return;
      }

      logger.info('Bulk updated reddit sources', {
        count: data?.length || 0,
        isActive,
      });

      res.status(200).json({
        message: `${data?.length || 0} sources updated`,
        updatedCount: data?.length || 0,
      });
    } catch (error) {
      next(error);
    }
  }

  private groupByCategory(sources: any[]): Record<string, number> {
    return sources.reduce((acc, source) => {
      const category = source.category || 'unknown';
      acc[category] = (acc[category] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
  }
}

export const redditSourcesController = new RedditSourcesController();
