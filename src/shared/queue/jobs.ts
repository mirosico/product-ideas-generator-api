import Queue from 'bull';
import { env } from '../config/env.js';

export interface RedditCollectJobData {
  subreddits?: string[];
  triggerIdeasGeneration?: boolean;
}

export interface IdeasGenerateJobData {
  batchSize?: number;
}

export interface EmailSendJobData {
  subscriptionId?: string;
  ideaIds?: string[];
}

export const redditCollectQueue = new Queue<RedditCollectJobData>('reddit:collect', env.REDIS_URL, {
  defaultJobOptions: {
    attempts: 3,
    backoff: {
      type: 'exponential',
      delay: 2000,
    },
    removeOnComplete: 100,
    removeOnFail: 50,
  },
});

export const ideasGenerateQueue = new Queue<IdeasGenerateJobData>('ideas:generate', env.REDIS_URL, {
  defaultJobOptions: {
    attempts: 3,
    backoff: {
      type: 'exponential',
      delay: 2000,
    },
    removeOnComplete: 100,
    removeOnFail: 50,
  },
});

export const emailSendQueue = new Queue<EmailSendJobData>('email:send', env.REDIS_URL, {
  defaultJobOptions: {
    attempts: 5,
    backoff: {
      type: 'exponential',
      delay: 1000,
    },
    removeOnComplete: 100,
    removeOnFail: 50,
  },
});

export async function scheduleRedditCollection(): Promise<void> {
  await redditCollectQueue.add(
    { triggerIdeasGeneration: true },
    {
      repeat: {
        cron: '0 */6 * * *',
      },
    }
  );
}
