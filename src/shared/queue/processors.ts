import { Job } from 'bull';
import { logger } from '../utils/logger.js';
import { redditService } from '../../reddit/reddit.service.js';
import {
  redditCollectQueue,
  ideasGenerateQueue,
  emailSendQueue,
  RedditCollectJobData,
  IdeasGenerateJobData,
  EmailSendJobData,
} from './jobs.js';

redditCollectQueue.process(async (job: Job<RedditCollectJobData>) => {
  logger.info('Processing reddit:collect job', { jobId: job.id });

  const { subreddits, triggerIdeasGeneration } = job.data;

  const targetSubreddits = subreddits || (await redditService.getPopularSubreddits()).map(s => s.name);

  const results = [];
  for (const subreddit of targetSubreddits) {
    try {
      const result = await redditService.collectSubredditData(subreddit);
      results.push(result);
      await job.progress((results.length / targetSubreddits.length) * 100);
    } catch (error) {
      logger.error('Failed to collect subreddit data', { subreddit, error });
    }
  }

  if (triggerIdeasGeneration) {
    await ideasGenerateQueue.add({ batchSize: 50 });
    logger.info('Triggered ideas:generate job');
  }

  logger.info('reddit:collect job completed', {
    jobId: job.id,
    subredditsProcessed: results.length,
    totalPosts: results.reduce((acc, r) => acc + r.postsCollected, 0),
    totalComments: results.reduce((acc, r) => acc + r.commentsCollected, 0),
  });

  return results;
});

ideasGenerateQueue.process(async (job: Job<IdeasGenerateJobData>) => {
  logger.info('Processing ideas:generate job', { jobId: job.id });

  const { batchSize = 50 } = job.data;

  const { ideasService } = await import('../../product-ideas/ideas.service.js');
  const ideasCreated = await ideasService.generateIdeasFromReddit(batchSize);

  if (ideasCreated > 0) {
    await emailSendQueue.add({});
    logger.info('Triggered email:send job', { ideasCreated });
  }

  logger.info('ideas:generate job completed', { jobId: job.id, ideasCreated });

  return { generated: ideasCreated };
});

emailSendQueue.process(async (job: Job<EmailSendJobData>) => {
  logger.info('Processing email:send job', { jobId: job.id });

  logger.info('email:send job completed (placeholder)', { jobId: job.id });

  return { sent: 0 };
});

redditCollectQueue.on('completed', (job, result) => {
  logger.info('Job completed', { queue: 'reddit:collect', jobId: job.id, result });
});

redditCollectQueue.on('failed', (job, err) => {
  logger.error('Job failed', { queue: 'reddit:collect', jobId: job?.id, error: err.message });
});

ideasGenerateQueue.on('completed', (job, result) => {
  logger.info('Job completed', { queue: 'ideas:generate', jobId: job.id, result });
});

ideasGenerateQueue.on('failed', (job, err) => {
  logger.error('Job failed', { queue: 'ideas:generate', jobId: job?.id, error: err.message });
});

emailSendQueue.on('completed', (job, result) => {
  logger.info('Job completed', { queue: 'email:send', jobId: job.id, result });
});

emailSendQueue.on('failed', (job, err) => {
  logger.error('Job failed', { queue: 'email:send', jobId: job?.id, error: err.message });
});

logger.info('Queue processors initialized');
