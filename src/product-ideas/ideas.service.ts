import { supabase } from '../shared/utils/database.js';
import { logger } from '../shared/utils/logger.js';
import { redditService } from '../reddit/reddit.service.js';
import { claudeService } from '../shared/services/claude.service.js';
import { GetIdeasQuery, ProductIdea } from './ideas.model.js';

class IdeasService {
  async generateIdeasFromReddit(batchSize: number = 50): Promise<number> {
    logger.info('Starting idea generation process', { batchSize });

    const unprocessedPosts = await redditService.getUnprocessedPosts(batchSize);

    if (unprocessedPosts.length === 0) {
      logger.info('No unprocessed posts found');
      return 0;
    }

    const redditData = this.formatRedditDataForClaude(unprocessedPosts);
    const generatedIdeas = await claudeService.generateIdeas(redditData);

    let ideasCreated = 0;
    for (const idea of generatedIdeas) {
      try {
        const scoringResult = await claudeService.scoreIdea(idea);

        const { error } = await supabase.from('product_ideas').insert({
          name: idea.name,
          pitch: idea.pitch,
          target_audience: idea.targetAudience,
          pain_point: idea.painPoint,
          subreddit_sources: { sources: idea.sources, scoring: scoringResult },
          score: scoringResult.score,
          topic: idea.topic,
          is_new: true,
        });

        if (error) {
          logger.error('Failed to insert product idea', { error, ideaName: idea.name });
        } else {
          ideasCreated++;
        }
      } catch (error) {
        logger.error('Failed to process idea', { error, ideaName: idea.name });
      }
    }

    const processedPostIds = unprocessedPosts.map(p => p.reddit_id);
    await redditService.markPostsAsProcessed(processedPostIds);

    logger.info('Idea generation completed', {
      postsProcessed: unprocessedPosts.length,
      ideasCreated,
    });

    return ideasCreated;
  }

  async getIdeas(query: GetIdeasQuery): Promise<ProductIdea[]> {
    let dbQuery = supabase
      .from('product_ideas')
      .select('*')
      .order('created_at', { ascending: false })
      .range(query.offset, query.offset + query.limit - 1);

    if (query.topic) {
      dbQuery = dbQuery.eq('topic', query.topic);
    }

    if (query.minScore !== undefined) {
      dbQuery = dbQuery.gte('score', query.minScore);
    }

    const { data, error } = await dbQuery;

    if (error) {
      logger.error('Failed to fetch product ideas', { error });
      throw new Error('Failed to fetch product ideas');
    }

    return (data || []).map(idea => ({
      id: idea.id,
      name: idea.name,
      pitch: idea.pitch,
      targetAudience: idea.target_audience,
      painPoint: idea.pain_point,
      subredditSources: idea.subreddit_sources,
      score: idea.score,
      topic: idea.topic,
      isNew: idea.is_new,
      createdAt: idea.created_at,
    }));
  }

  async getIdeaById(id: string): Promise<ProductIdea | null> {
    const { data, error } = await supabase
      .from('product_ideas')
      .select('*')
      .eq('id', id)
      .single();

    if (error || !data) {
      logger.error('Failed to fetch product idea', { error, id });
      return null;
    }

    return {
      id: data.id,
      name: data.name,
      pitch: data.pitch,
      targetAudience: data.target_audience,
      painPoint: data.pain_point,
      subredditSources: data.subreddit_sources,
      score: data.score,
      topic: data.topic,
      isNew: data.is_new,
      createdAt: data.created_at,
    };
  }

  async markIdeasAsViewed(ids: string[]): Promise<void> {
    const { error } = await supabase
      .from('product_ideas')
      .update({ is_new: false })
      .in('id', ids);

    if (error) {
      logger.error('Failed to mark ideas as viewed', { error });
    }
  }

  private formatRedditDataForClaude(posts: any[]): string {
    return posts.map((post, idx) => {
      return `
Post ${idx + 1}:
Subreddit: r/${post.subreddit}
Title: ${post.title}
Body: ${post.body || 'N/A'}
Score: ${post.score}
Comments: ${post.num_comments}
---`;
    }).join('\n');
  }
}

export const ideasService = new IdeasService();
