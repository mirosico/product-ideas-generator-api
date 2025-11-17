CREATE TABLE IF NOT EXISTS reddit_posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  reddit_id TEXT NOT NULL UNIQUE,
  subreddit TEXT NOT NULL,
  title TEXT NOT NULL,
  body TEXT,
  author TEXT NOT NULL,
  score INTEGER NOT NULL DEFAULT 0,
  num_comments INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  processed BOOLEAN NOT NULL DEFAULT false
);

CREATE UNIQUE INDEX idx_reddit_posts_reddit_id ON reddit_posts(reddit_id);
CREATE INDEX idx_reddit_posts_subreddit ON reddit_posts(subreddit);
CREATE INDEX idx_reddit_posts_processed ON reddit_posts(processed) WHERE processed = false;
CREATE INDEX idx_reddit_posts_created_at ON reddit_posts(created_at DESC);
CREATE INDEX idx_reddit_posts_score ON reddit_posts(score DESC);

COMMENT ON TABLE reddit_posts IS 'Cached Reddit posts for processing';
COMMENT ON COLUMN reddit_posts.reddit_id IS 'Unique Reddit post ID (e.g., t3_abc123)';
COMMENT ON COLUMN reddit_posts.processed IS 'Flag indicating if post was used for idea generation';
