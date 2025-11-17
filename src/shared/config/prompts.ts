export const IDEA_GENERATION_PROMPT = `You are an expert startup advisor analyzing Reddit discussions to identify product opportunities.

Given the following Reddit posts and comments about user problems and pain points, generate innovative product ideas.

Reddit Data:
{redditData}

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

export const SCORING_PROMPT = `You are a startup investment analyst evaluating product idea viability.

Evaluate this product idea on a scale of 0-100 based on:
1. Pain Level (0-25): How severe is the problem?
2. Willingness to Pay (0-25): Would users pay for this solution?
3. Market Size (0-25): How large is the potential market?
4. Competition (0-25): How differentiated is this from existing solutions?

Product Idea:
Name: {name}
Pitch: {pitch}
Target Audience: {targetAudience}
Pain Point: {painPoint}

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
