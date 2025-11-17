CREATE TABLE IF NOT EXISTS product_ideas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  pitch TEXT NOT NULL,
  target_audience TEXT NOT NULL,
  pain_point TEXT NOT NULL,
  subreddit_sources JSONB NOT NULL DEFAULT '{}'::jsonb,
  score INTEGER NOT NULL CHECK (score >= 0 AND score <= 100),
  topic TEXT NOT NULL,
  is_new BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_product_ideas_topic ON product_ideas(topic);
CREATE INDEX idx_product_ideas_score ON product_ideas(score DESC);
CREATE INDEX idx_product_ideas_created_at ON product_ideas(created_at DESC);
CREATE INDEX idx_product_ideas_is_new ON product_ideas(is_new) WHERE is_new = true;
CREATE INDEX idx_product_ideas_topic_score ON product_ideas(topic, score DESC);

COMMENT ON TABLE product_ideas IS 'Generated product ideas from Reddit data';
COMMENT ON COLUMN product_ideas.score IS 'Viability score from 0-100';
COMMENT ON COLUMN product_ideas.subreddit_sources IS 'JSON containing sources and scoring details';
COMMENT ON COLUMN product_ideas.is_new IS 'Flag to indicate if idea has been sent in emails';
