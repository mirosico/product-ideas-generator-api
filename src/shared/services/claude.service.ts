import Anthropic from '@anthropic-ai/sdk';
import { env } from '../config/env.js';
import { logger } from '../utils/logger.js';
import { z } from 'zod';

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
      const prompt = this.buildGenerationPrompt(redditData);

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
      const prompt = this.buildScoringPrompt(idea);

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

  private buildGenerationPrompt(redditData: string): string {
    return `You are an expert startup advisor analyzing Reddit discussions to identify product opportunities.

Given the following Reddit posts and comments about user problems and pain points, generate innovative product ideas.

Reddit Data:
${redditData}

For each viable product opportunity, create a detailed product idea with:
1. Name: A clear, memorable product name
2. Pitch: A compelling 1-2 sentence elevator pitch
3. Target Audience: Specific user persona who would benefit
4. Pain Point: The core problem being solved
5. Topic: Category (devtools, health, education, productivity, business, finance, other)

Return a JSON array of product ideas. Each idea should have this structure:
{
  "name": "Product Name",
  "pitch": "Clear value proposition in 1-2 sentences",
  "targetAudience": "Specific user persona",
  "painPoint": "Core problem being solved",
  "topic": "category",
  "sources": ["r/subreddit1", "r/subreddit2"]
}

Focus on:
- Real, validated problems mentioned by multiple users
- Solutions that could be built as SaaS products
- Clear value propositions
- Specific, actionable ideas

Generate 3-5 high-quality product ideas. Return only the JSON array, no additional text.`;
  }

  private buildScoringPrompt(idea: Omit<GeneratedIdea, 'sources'>): string {
    return `You are a startup investment analyst evaluating product idea viability.

Evaluate this product idea on a scale of 0-100 based on:
1. Pain Level (0-25): How severe is the problem?
2. Willingness to Pay (0-25): Would users pay for this solution?
3. Market Size (0-25): How large is the potential market?
4. Competition (0-25): How differentiated is this from existing solutions?

Product Idea:
Name: ${idea.name}
Pitch: ${idea.pitch}
Target Audience: ${idea.targetAudience}
Pain Point: ${idea.painPoint}

Return a JSON object with this structure:
{
  "score": 75,
  "painLevel": 20,
  "willingnessToPay": 18,
  "marketSize": 20,
  "competition": 17,
  "reasoning": "Brief explanation of the score"
}

Be realistic and critical. Only exceptional ideas should score above 80.
Return only the JSON object, no additional text.`;
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
