import { Request, Response, NextFunction } from 'express';
import { logger } from '../shared/utils/logger.js';
import {
  redditCollectQueue,
  ideasGenerateQueue,
  emailSendQueue,
} from '../shared/queue/jobs.js';

export class AdminController {
  async triggerRedditCollect(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { subreddits, triggerIdeasGeneration = true } = req.body;

      const job = await redditCollectQueue.add({
        subreddits,
        triggerIdeasGeneration,
      });

      logger.info('Manually triggered reddit:collect job', {
        jobId: job.id,
        subreddits: subreddits?.length || 'all',
      });

      res.status(202).json({
        message: 'Reddit collection job queued',
        jobId: job.id,
        data: {
          subreddits: subreddits || 'all',
          triggerIdeasGeneration,
        },
      });
    } catch (error) {
      next(error);
    }
  }

  async triggerIdeasGeneration(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { batchSize = 50 } = req.body;

      const job = await ideasGenerateQueue.add({ batchSize });

      logger.info('Manually triggered ideas:generate job', {
        jobId: job.id,
        batchSize,
      });

      res.status(202).json({
        message: 'Idea generation job queued',
        jobId: job.id,
        data: {
          batchSize,
        },
      });
    } catch (error) {
      next(error);
    }
  }

  async triggerEmailSend(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { subscriptionId, ideaIds } = req.body;

      const job = await emailSendQueue.add({
        subscriptionId,
        ideaIds,
      });

      logger.info('Manually triggered email:send job', {
        jobId: job.id,
        subscriptionId,
        ideaCount: ideaIds?.length,
      });

      res.status(202).json({
        message: 'Email send job queued',
        jobId: job.id,
        data: {
          subscriptionId: subscriptionId || 'all',
          ideaCount: ideaIds?.length || 'all',
        },
      });
    } catch (error) {
      next(error);
    }
  }

  async getJobStatus(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { jobId } = req.params;
      const { queue } = req.query;

      let job;

      switch (queue) {
        case 'reddit:collect':
          job = await redditCollectQueue.getJob(jobId);
          break;
        case 'ideas:generate':
          job = await ideasGenerateQueue.getJob(jobId);
          break;
        case 'email:send':
          job = await emailSendQueue.getJob(jobId);
          break;
        default:
          res.status(400).json({ error: 'Invalid queue name' });
          return;
      }

      if (!job) {
        res.status(404).json({ error: 'Job not found' });
        return;
      }

      const state = await job.getState();
      const progress = job.progress();
      const result = job.returnvalue;

      res.status(200).json({
        jobId: job.id,
        queue,
        state,
        progress,
        result,
        data: job.data,
        createdAt: job.timestamp,
        processedAt: job.processedOn,
        finishedAt: job.finishedOn,
      });
    } catch (error) {
      next(error);
    }
  }

  async getQueueStats(_req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const [redditStats, ideasStats, emailStats] = await Promise.all([
        this.getQueueCounts(redditCollectQueue),
        this.getQueueCounts(ideasGenerateQueue),
        this.getQueueCounts(emailSendQueue),
      ]);

      res.status(200).json({
        queues: {
          'reddit:collect': redditStats,
          'ideas:generate': ideasStats,
          'email:send': emailStats,
        },
      });
    } catch (error) {
      next(error);
    }
  }

  private async getQueueCounts(queue: any) {
    const [waiting, active, completed, failed, delayed] = await Promise.all([
      queue.getWaitingCount(),
      queue.getActiveCount(),
      queue.getCompletedCount(),
      queue.getFailedCount(),
      queue.getDelayedCount(),
    ]);

    return {
      waiting,
      active,
      completed,
      failed,
      delayed,
      total: waiting + active + completed + failed + delayed,
    };
  }
}

export const adminController = new AdminController();
