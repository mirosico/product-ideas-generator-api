# Database Schema Documentation

## Overview

This project uses Supabase (Postgres) for data persistence. All migrations are located in `supabase/migrations/`.

## Tables

### product_ideas
Stores AI-generated product ideas from Reddit data.

| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key |
| name | TEXT | Product name |
| pitch | TEXT | Elevator pitch (1-2 sentences) |
| target_audience | TEXT | Specific user persona |
| pain_point | TEXT | Core problem being solved |
| subreddit_sources | JSONB | Sources and scoring details |
| score | INTEGER | Viability score (0-100) |
| topic | TEXT | Category (devtools, health, education, etc.) |
| is_new | BOOLEAN | Flag for email delivery |
| created_at | TIMESTAMPTZ | Creation timestamp |

**Indexes:**
- `topic` - Fast filtering by category
- `score DESC` - Top scored ideas
- `created_at DESC` - Recent ideas
- `is_new` - Undelivered ideas
- `(topic, score DESC)` - Combined filter

### subscriptions
User email subscriptions with topic filters.

| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key |
| user_id | UUID | FK to auth.users |
| email | TEXT | User email address |
| topic_filters | TEXT[] | Array of interested topics |
| unsubscribe_token | TEXT | Secure unsubscribe token (unique) |
| is_active | BOOLEAN | Subscription status |
| created_at | TIMESTAMPTZ | Creation timestamp |
| updated_at | TIMESTAMPTZ | Last update timestamp |

**Indexes:**
- `user_id` (unique) - One subscription per user
- `unsubscribe_token` (unique) - Fast unsubscribe lookup
- `is_active` - Active subscriptions
- `email` - Email lookup

**Triggers:**
- Auto-update `updated_at` on modifications

### reddit_sources
Tracked subreddits for data collection.

| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key |
| subreddit_name | TEXT | Subreddit name (unique) |
| category | TEXT | Topic category |
| last_fetched_at | TIMESTAMPTZ | Last fetch timestamp |
| post_count | INTEGER | Number of posts collected |
| avg_engagement | NUMERIC | Average engagement score |
| is_active | BOOLEAN | Source status |
| created_at | TIMESTAMPTZ | Creation timestamp |

**Indexes:**
- `subreddit_name` (unique) - Prevent duplicates
- `is_active` - Active sources
- `category` - Category filtering

### reddit_posts
Cached Reddit posts for processing.

| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key |
| reddit_id | TEXT | Reddit post ID (unique, e.g., t3_abc123) |
| subreddit | TEXT | Source subreddit |
| title | TEXT | Post title |
| body | TEXT | Post content |
| author | TEXT | Reddit username |
| score | INTEGER | Reddit score (upvotes) |
| num_comments | INTEGER | Comment count |
| created_at | TIMESTAMPTZ | Fetch timestamp |
| processed | BOOLEAN | Processing status |

**Indexes:**
- `reddit_id` (unique) - Prevent duplicates
- `subreddit` - Filter by source
- `processed` - Unprocessed posts
- `created_at DESC` - Recent posts
- `score DESC` - High-engagement posts

### email_logs
Audit trail for email notifications.

| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key |
| subscription_id | UUID | FK to subscriptions |
| status | TEXT | Delivery status (sent/failed/bounced) |
| sent_at | TIMESTAMPTZ | Send timestamp |
| ideas_sent | UUID[] | Array of product idea IDs |

**Indexes:**
- `subscription_id` - User email history
- `sent_at DESC` - Recent emails
- `status` - Delivery statistics

## Row Level Security (RLS)

All tables have RLS enabled.

**product_ideas:**
- Public read access (anyone can view ideas)

**subscriptions:**
- Users can only access their own subscription (CRUD)

**reddit_sources, reddit_posts, email_logs:**
- Service role only (backend operations)

## Functions

### update_updated_at_column()
Trigger function that automatically updates `updated_at` timestamp.

### get_top_ideas_by_topic(topic_filter, min_score, result_limit)
Efficient query function for filtered product ideas.

**Parameters:**
- `topic_filter` - Category filter (NULL for all)
- `min_score` - Minimum viability score (default: 0)
- `result_limit` - Max results (default: 20)

**Returns:** Table of product ideas ordered by score and date

## Setup Instructions

### Using Supabase CLI (Recommended)

```bash
npm install -g supabase
supabase login
supabase link --project-ref <your-project-id>
supabase db push
supabase db seed
```

### Using Supabase Dashboard

1. Go to SQL Editor in Supabase Dashboard
2. Run migrations in order (001 → 007)
3. Run `seed.sql` for sample data

### Verification

```sql
SELECT table_name
FROM information_schema.tables
WHERE table_schema = 'public';
```

Expected tables:
- product_ideas
- subscriptions
- reddit_sources
- reddit_posts
- email_logs

## Seed Data

The `seed.sql` file includes:
- 10 default Reddit sources (r/SaaS, r/Entrepreneur, etc.)
- 3 sample product ideas with realistic scores

## Performance Considerations

- All frequently queried columns are indexed
- Partial indexes on boolean flags (is_new, is_active, processed)
- Composite index on (topic, score) for common query pattern
- JSONB column for flexible metadata storage

## Maintenance

### Clean up old posts
```sql
DELETE FROM reddit_posts
WHERE processed = true
AND created_at < NOW() - INTERVAL '30 days';
```

### Reset new flags
```sql
UPDATE product_ideas
SET is_new = false
WHERE created_at < NOW() - INTERVAL '7 days';
```

### Check email delivery stats
```sql
SELECT status, COUNT(*)
FROM email_logs
GROUP BY status;
```
