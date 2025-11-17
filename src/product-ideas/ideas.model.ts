import { z } from 'zod';

export const getIdeasQuerySchema = z.object({
  topic: z.string().optional(),
  minScore: z.coerce.number().min(0).max(100).optional(),
  limit: z.coerce.number().min(1).max(100).default(20),
  offset: z.coerce.number().min(0).default(0),
});

export type GetIdeasQuery = z.infer<typeof getIdeasQuerySchema>;

export interface ProductIdea {
  id: string;
  name: string;
  pitch: string;
  targetAudience: string;
  painPoint: string;
  subredditSources: any;
  score: number;
  topic: string;
  isNew: boolean;
  createdAt: string;
}

export interface ProductIdeaWithDetails extends ProductIdea {
  scoring?: {
    painLevel: number;
    willingnessToPay: number;
    marketSize: number;
    competition: number;
    reasoning: string;
  };
}
