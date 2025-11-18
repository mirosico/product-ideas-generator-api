import { GeneratedIdea } from '../services/claude.service.js';

export function buildIdeaScoringPrompt(idea: Omit<GeneratedIdea, 'sources'>): string {
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
