import Snoowrap from 'snoowrap';
import { env } from '../shared/config/env.js';
import { logger } from '../shared/utils/logger.js';
import { supabase } from '../shared/utils/database.js';
import { redditCache } from './reddit.cache.js';
import { RedditPost, RedditComment, RedditCollectionResult, SubredditConfig } from './reddit.types.js';

class RedditService {
  private client: Snoowrap;
  private readonly POSTS_LIMIT = 25;
  private readonly COMMENTS_LIMIT = 10;
  private readonly RATE_LIMIT_DELAY = 1000;

  constructor() {
    this.client = new Snoowrap({
      userAgent: env.REDDIT_USER_AGENT,
      clientId: env.REDDIT_CLIENT_ID,
      clientSecret: env.REDDIT_CLIENT_SECRET,
      refreshToken: '',
    });

    this.client.config({
      requestDelay: this.RATE_LIMIT_DELAY,
      continueAfterRatelimitError: true,
    });
  }

  async getPopularSubreddits(): Promise<SubredditConfig[]> {
    const { data, error } = await supabase
      .from('reddit_sources')
      .select('subreddit_name, category, is_active')
      .eq('is_active', true);

    if (error) {
      logger.error('Failed to fetch subreddit sources', { error });
      return this.getDefaultSubreddits();
    }

    if (!data || data.length === 0) {
      return this.getDefaultSubreddits();
    }

    return data.map(source => ({
      name: source.subreddit_name,
      category: source.category,
      isActive: source.is_active,
    }));
  }

  private getDefaultSubreddits(): SubredditConfig[] {
    return [
      { name: 'SaaS', category: 'devtools', isActive: true },
      { name: 'Entrepreneur', category: 'business', isActive: true },
      { name: 'startups', category: 'business', isActive: true },
      { name: 'indiehackers', category: 'devtools', isActive: true },
      { name: 'productivity', category: 'productivity', isActive: true },
    ];
  }

  async collectSubredditData(subredditName: string): Promise<RedditCollectionResult> {
    logger.info('Starting subreddit data collection', { subreddit: subredditName });

    const cacheKey = redditCache.getCacheKey('subreddit', subredditName);
    const cached = await redditCache.get<RedditCollectionResult>(cacheKey);

    if (cached) {
      logger.info('Using cached subreddit data', { subreddit: subredditName });
      return cached;
    }

    const posts = await this.fetchRecentPosts(subredditName);
    const postsWithComments = await this.fetchPostComments(posts);

    await this.storePostsInDatabase(postsWithComments);

    const result: RedditCollectionResult = {
      subreddit: subredditName,
      postsCollected: posts.length,
      commentsCollected: postsWithComments.reduce((acc, p) => acc + (p.comments?.length || 0), 0),
      timestamp: new Date(),
    };

    await redditCache.set(cacheKey, result, 1800);
    await this.updateSourceMetadata(subredditName, posts.length);

    logger.info('Subreddit data collection completed', result);
    return result;
  }

  private async fetchRecentPosts(subredditName: string): Promise<RedditPost[]> {
    try {
      const posts: RedditPost[] = [];
      const submissions = await this.client.getSubreddit(subredditName).getHot({ limit: this.POSTS_LIMIT }) as any[];

      for (const post of submissions) {
        posts.push({
          id: post.id,
          subreddit: subredditName,
          title: post.title,
          body: post.selftext || '',
          author: post.author.name,
          score: post.score,
          numComments: post.num_comments,
          createdAt: post.created_utc,
          url: post.url,
        });
      }

      return posts;
    } catch (error) {
      logger.error('Failed to fetch posts', { subreddit: subredditName, error });
      return [];
    }
  }

  private async fetchPostComments(posts: RedditPost[]): Promise<Array<RedditPost & { comments: RedditComment[] }>> {
    const postsWithComments: Array<RedditPost & { comments: RedditComment[] }> = [];

    for (const post of posts) {
      try {
        const topComments: RedditComment[] = [];
        const comments = await this.client.getSubmission(post.id).comments.fetchAll() as any[];

        for (const comment of comments) {
          if (comment.body && comment.body !== '[deleted]' && comment.body !== '[removed]') {
            topComments.push({
              id: comment.id,
              postId: post.id,
              author: comment.author.name,
              body: comment.body,
              score: comment.score,
              createdAt: comment.created_utc,
            });

            if (topComments.length >= this.COMMENTS_LIMIT) {
              break;
            }
          }
        }

        postsWithComments.push({
          ...post,
          comments: topComments,
        });
      } catch (error) {
        logger.error('Failed to fetch comments', { postId: post.id, error });
        postsWithComments.push({ ...post, comments: [] });
      }
    }

    return postsWithComments;
  }

  private async storePostsInDatabase(posts: Array<RedditPost & { comments: RedditComment[] }>): Promise<void> {
    for (const post of posts) {
      try {
        const { error } = await supabase.from('reddit_posts').upsert({
          reddit_id: post.id,
          subreddit: post.subreddit,
          title: post.title,
          body: post.body,
          author: post.author,
          score: post.score,
          num_comments: post.numComments,
          processed: false,
        }, {
          onConflict: 'reddit_id',
        });

        if (error) {
          logger.error('Failed to store post', { postId: post.id, error });
        }
      } catch (error) {
        logger.error('Database insert error', { postId: post.id, error });
      }
    }
  }

  private async updateSourceMetadata(subredditName: string, postCount: number): Promise<void> {
    const { error } = await supabase.from('reddit_sources').upsert({
      subreddit_name: subredditName,
      category: 'general',
      last_fetched_at: new Date().toISOString(),
      post_count: postCount,
      avg_engagement: 0,
      is_active: true,
    }, {
      onConflict: 'subreddit_name',
    });

    if (error) {
      logger.error('Failed to update source metadata', { subreddit: subredditName, error });
    }
  }

  async getUnprocessedPosts(limit: number = 100) {
    const { data, error } = await supabase
      .from('reddit_posts')
      .select('*')
      .eq('processed', false)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) {
      logger.error('Failed to fetch unprocessed posts', { error });
      return [];
    }

    return data || [];
  }

  async markPostsAsProcessed(postIds: string[]): Promise<void> {
    const { error } = await supabase
      .from('reddit_posts')
      .update({ processed: true })
      .in('reddit_id', postIds);

    if (error) {
      logger.error('Failed to mark posts as processed', { error });
    }
  }
}

export const redditService = new RedditService();
