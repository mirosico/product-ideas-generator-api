import { supabase, createAuthenticatedClient } from '../shared/utils/database.js';
import { logger } from '../shared/utils/logger.js';
import { CreateSubscriptionDto, UpdateSubscriptionDto, Subscription } from './subscriptions.model.js';
import { randomBytes } from 'crypto';

class SubscriptionsService {
  async createSubscription(userId: string, dto: CreateSubscriptionDto, accessToken: string): Promise<Subscription> {
    const unsubscribeToken = this.generateUnsubscribeToken();
    const client = createAuthenticatedClient(accessToken);

    const { data: existing } = await client
      .from('subscriptions')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (existing) {
      return this.updateSubscription(userId, { topicFilters: dto.topicFilters }, accessToken);
    }

    const { data, error } = await client
      .from('subscriptions')
      .insert({
        user_id: userId,
        email: dto.email,
        topic_filters: dto.topicFilters,
        unsubscribe_token: unsubscribeToken,
        is_active: true,
      })
      .select()
      .single();

    if (error || !data) {
      logger.error('Failed to create subscription', { error, userId });
      throw new Error('Failed to create subscription');
    }

    logger.info('Subscription created', { userId, email: dto.email });

    return this.mapToSubscription(data);
  }

  async getSubscription(userId: string, accessToken: string): Promise<Subscription | null> {
    const client = createAuthenticatedClient(accessToken);
    const { data, error } = await client
      .from('subscriptions')
      .select('*')
      .eq('user_id', userId)
      .eq('is_active', true)
      .single();

    if (error || !data) {
      return null;
    }

    return this.mapToSubscription(data);
  }

  async updateSubscription(userId: string, dto: UpdateSubscriptionDto, accessToken: string): Promise<Subscription> {
    const client = createAuthenticatedClient(accessToken);
    const { data, error } = await client
      .from('subscriptions')
      .update({
        topic_filters: dto.topicFilters,
        is_active: true,
        updated_at: new Date().toISOString(),
      })
      .eq('user_id', userId)
      .select()
      .single();

    if (error || !data) {
      logger.error('Failed to update subscription', { error, userId });
      throw new Error('Failed to update subscription');
    }

    logger.info('Subscription updated', { userId });

    return this.mapToSubscription(data);
  }

  async deleteSubscription(userId: string, accessToken: string): Promise<void> {
    const client = createAuthenticatedClient(accessToken);
    const { error } = await client
      .from('subscriptions')
      .update({ is_active: false })
      .eq('user_id', userId);

    if (error) {
      logger.error('Failed to delete subscription', { error, userId });
      throw new Error('Failed to delete subscription');
    }

    logger.info('Subscription deleted', { userId });
  }

  async unsubscribeByToken(token: string): Promise<void> {
    const { error } = await supabase
      .from('subscriptions')
      .update({ is_active: false })
      .eq('unsubscribe_token', token);

    if (error) {
      logger.error('Failed to unsubscribe by token', { error });
      throw new Error('Failed to unsubscribe');
    }

    logger.info('Unsubscribed by token', { token });
  }

  async getActiveSubscriptions(): Promise<Subscription[]> {
    const { data, error } = await supabase
      .from('subscriptions')
      .select('*')
      .eq('is_active', true);

    if (error) {
      logger.error('Failed to fetch active subscriptions', { error });
      return [];
    }

    return (data || []).map(this.mapToSubscription);
  }

  private generateUnsubscribeToken(): string {
    return randomBytes(32).toString('hex');
  }

  private mapToSubscription(data: any): Subscription {
    return {
      id: data.id,
      userId: data.user_id,
      email: data.email,
      topicFilters: data.topic_filters,
      unsubscribeToken: data.unsubscribe_token,
      isActive: data.is_active,
      createdAt: data.created_at,
      updatedAt: data.updated_at,
    };
  }
}

export const subscriptionsService = new SubscriptionsService();
