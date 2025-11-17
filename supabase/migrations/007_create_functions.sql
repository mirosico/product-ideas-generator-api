CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_subscriptions_updated_at
  BEFORE UPDATE ON subscriptions
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE OR REPLACE FUNCTION get_top_ideas_by_topic(
  topic_filter TEXT,
  min_score INTEGER DEFAULT 0,
  result_limit INTEGER DEFAULT 20
)
RETURNS TABLE (
  id UUID,
  name TEXT,
  pitch TEXT,
  target_audience TEXT,
  pain_point TEXT,
  subreddit_sources JSONB,
  score INTEGER,
  topic TEXT,
  is_new BOOLEAN,
  created_at TIMESTAMPTZ
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    pi.id,
    pi.name,
    pi.pitch,
    pi.target_audience,
    pi.pain_point,
    pi.subreddit_sources,
    pi.score,
    pi.topic,
    pi.is_new,
    pi.created_at
  FROM product_ideas pi
  WHERE
    (topic_filter IS NULL OR pi.topic = topic_filter)
    AND pi.score >= min_score
  ORDER BY pi.score DESC, pi.created_at DESC
  LIMIT result_limit;
END;
$$ LANGUAGE plpgsql STABLE;

COMMENT ON FUNCTION get_top_ideas_by_topic IS 'Get top product ideas filtered by topic and minimum score';
