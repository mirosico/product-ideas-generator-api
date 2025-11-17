import { createClient } from '@supabase/supabase-js';
import { env } from '../config/env.js';

export const supabase = createClient(env.SUPABASE_URL, env.SUPABASE_KEY);

export type Database = {
  public: {
    Tables: {
      product_ideas: {
        Row: {
          id: string;
          name: string;
          pitch: string;
          target_audience: string;
          pain_point: string;
          subreddit_sources: any;
          score: number;
          topic: string;
          is_new: boolean;
          created_at: string;
        };
        Insert: Omit<Database['public']['Tables']['product_ideas']['Row'], 'id' | 'created_at'>;
        Update: Partial<Database['public']['Tables']['product_ideas']['Insert']>;
      };
      subscriptions: {
        Row: {
          id: string;
          user_id: string;
          email: string;
          topic_filters: string[];
          unsubscribe_token: string;
          is_active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database['public']['Tables']['subscriptions']['Row'], 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Database['public']['Tables']['subscriptions']['Insert']>;
      };
      reddit_sources: {
        Row: {
          id: string;
          subreddit_name: string;
          category: string;
          last_fetched_at: string | null;
          post_count: number;
          avg_engagement: number;
          is_active: boolean;
        };
        Insert: Omit<Database['public']['Tables']['reddit_sources']['Row'], 'id'>;
        Update: Partial<Database['public']['Tables']['reddit_sources']['Insert']>;
      };
      reddit_posts: {
        Row: {
          id: string;
          reddit_id: string;
          subreddit: string;
          title: string;
          body: string;
          author: string;
          score: number;
          num_comments: number;
          created_at: string;
          processed: boolean;
        };
        Insert: Omit<Database['public']['Tables']['reddit_posts']['Row'], 'id' | 'created_at'>;
        Update: Partial<Database['public']['Tables']['reddit_posts']['Insert']>;
      };
      email_logs: {
        Row: {
          id: string;
          subscription_id: string;
          status: string;
          sent_at: string;
          ideas_sent: string[];
        };
        Insert: Omit<Database['public']['Tables']['email_logs']['Row'], 'id'>;
        Update: Partial<Database['public']['Tables']['email_logs']['Insert']>;
      };
    };
  };
};
