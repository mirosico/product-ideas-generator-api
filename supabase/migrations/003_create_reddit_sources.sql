CREATE TABLE IF NOT EXISTS reddit_sources (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  subreddit_name TEXT NOT NULL UNIQUE,
  category TEXT NOT NULL,
  last_fetched_at TIMESTAMPTZ,
  post_count INTEGER NOT NULL DEFAULT 0,
  avg_engagement NUMERIC(10, 2) NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE UNIQUE INDEX idx_reddit_sources_subreddit_name ON reddit_sources(subreddit_name);
CREATE INDEX idx_reddit_sources_is_active ON reddit_sources(is_active) WHERE is_active = true;
CREATE INDEX idx_reddit_sources_category ON reddit_sources(category);

COMMENT ON TABLE reddit_sources IS 'Tracked subreddits for data collection';
COMMENT ON COLUMN reddit_sources.last_fetched_at IS 'Last time posts were fetched from this subreddit';
COMMENT ON COLUMN reddit_sources.avg_engagement IS 'Average engagement score (upvotes + comments)';
