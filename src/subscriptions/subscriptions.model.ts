import { z } from 'zod';

export const createSubscriptionSchema = z.object({
  email: z.string().email('Invalid email format'),
  topicFilters: z.array(z.string()).min(1, 'At least one topic required'),
});

export const updateSubscriptionSchema = z.object({
  topicFilters: z.array(z.string()).min(1, 'At least one topic required'),
});

export type CreateSubscriptionDto = z.infer<typeof createSubscriptionSchema>;
export type UpdateSubscriptionDto = z.infer<typeof updateSubscriptionSchema>;

export interface Subscription {
  id: string;
  userId: string;
  email: string;
  topicFilters: string[];
  unsubscribeToken: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export const AVAILABLE_TOPICS = [
  'devtools',
  'health',
  'education',
  'productivity',
  'business',
  'finance',
  'other',
] as const;
