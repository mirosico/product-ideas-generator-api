export function buildIdeaGenerationPrompt(redditData: string): string {
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
