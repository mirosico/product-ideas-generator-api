import Anthropic from '@anthropic-ai/sdk';
import { env } from '../config/env.js';
import { logger } from '../utils/logger.js';
import { z } from 'zod';
import { buildIdeaGenerationPrompt } from '../prompts/idea-generation.prompt.js';
import { buildIdeaScoringPrompt } from '../prompts/idea-scoring.prompt.js';

const productIdeaSchema = z.object({
  name: z.string(),
  pitch: z.string(),
  targetAudience: z.string(),
  painPoint: z.string(),
  topic: z.string(),
  sources: z.array(z.string()),
});

const scoringResultSchema = z.object({
  score: z.number().min(0).max(100),
  painLevel: z.number().min(0).max(25),
  willingnessToPay: z.number().min(0).max(25),
  marketSize: z.number().min(0).max(25),
  competition: z.number().min(0).max(25),
  reasoning: z.string(),
});

export type GeneratedIdea = z.infer<typeof productIdeaSchema>;
export type ScoringResult = z.infer<typeof scoringResultSchema>;

class ClaudeService {
  private client: Anthropic;
  private readonly model = 'claude-3-5-sonnet-20241022';
  private readonly maxTokens = 4096;

  constructor() {
    this.client = new Anthropic({
      apiKey: env.ANTHROPIC_API_KEY,
    });
  }

  async generateIdeas(redditData: string): Promise<GeneratedIdea[]> {
    try {
      const prompt = buildIdeaGenerationPrompt(redditData);

      logger.info('Sending idea generation request to Claude');

      const response = await this.client.messages.create({
        model: this.model,
        max_tokens: this.maxTokens,
        messages: [
          {
            role: 'user',
            content: prompt,
          },
        ],
      });

      const content = response.content[0];
      if (content.type !== 'text') {
        throw new Error('Unexpected response type from Claude');
      }

      const ideas = this.parseIdeasResponse(content.text);
      logger.info('Successfully generated ideas', { count: ideas.length });

      return ideas;
    } catch (error) {
      logger.error('Failed to generate ideas with Claude', { error });
      throw error;
    }
  }

  async scoreIdea(idea: Omit<GeneratedIdea, 'sources'>): Promise<ScoringResult> {
    try {
      const prompt = buildIdeaScoringPrompt(idea);

      logger.info('Sending scoring request to Claude', { ideaName: idea.name });

      const response = await this.client.messages.create({
        model: this.model,
        max_tokens: 1024,
        messages: [
          {
            role: 'user',
            content: prompt,
          },
        ],
      });

      const content = response.content[0];
      if (content.type !== 'text') {
        throw new Error('Unexpected response type from Claude');
      }

      const scoringResult = this.parseScoringResponse(content.text);
      logger.info('Successfully scored idea', { ideaName: idea.name, score: scoringResult.score });

      return scoringResult;
    } catch (error) {
      logger.error('Failed to score idea with Claude', { error, ideaName: idea.name });
      throw error;
    }
  }

  private parseIdeasResponse(text: string): GeneratedIdea[] {
    try {
      const jsonMatch = text.match(/\[[\s\S]*\]/);
      if (!jsonMatch) {
        throw new Error('No JSON array found in response');
      }

      const parsed = JSON.parse(jsonMatch[0]);
      const ideas = z.array(productIdeaSchema).parse(parsed);

      return ideas;
    } catch (error) {
      logger.error('Failed to parse ideas response', { error, text });
      throw new Error('Invalid ideas response format');
    }
  }

  private parseScoringResponse(text: string): ScoringResult {
    try {
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error('No JSON object found in response');
      }

      const parsed = JSON.parse(jsonMatch[0]);
      const result = scoringResultSchema.parse(parsed);

      return result;
    } catch (error) {
      logger.error('Failed to parse scoring response', { error, text });
      throw new Error('Invalid scoring response format');
    }
  }
}

export const claudeService = new ClaudeService();
