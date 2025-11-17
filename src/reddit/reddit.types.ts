import { z } from 'zod';

export const redditPostSchema = z.object({
  id: z.string(),
  subreddit: z.string(),
  title: z.string(),
  body: z.string(),
  author: z.string(),
  score: z.number(),
  numComments: z.number(),
  createdAt: z.number(),
  url: z.string(),
});

export const redditCommentSchema = z.object({
  id: z.string(),
  postId: z.string(),
  author: z.string(),
  body: z.string(),
  score: z.number(),
  createdAt: z.number(),
});

export type RedditPost = z.infer<typeof redditPostSchema>;
export type RedditComment = z.infer<typeof redditCommentSchema>;

export interface RedditCollectionResult {
  subreddit: string;
  postsCollected: number;
  commentsCollected: number;
  timestamp: Date;
}

export interface SubredditConfig {
  name: string;
  category: string;
  isActive: boolean;
}
