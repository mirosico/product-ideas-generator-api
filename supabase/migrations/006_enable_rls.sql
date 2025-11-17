ALTER TABLE product_ideas ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE reddit_sources ENABLE ROW LEVEL SECURITY;
ALTER TABLE reddit_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE email_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public read access to product ideas"
  ON product_ideas FOR SELECT
  USING (true);

CREATE POLICY "Users can read their own subscription"
  ON subscriptions FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own subscription"
  ON subscriptions FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own subscription"
  ON subscriptions FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own subscription"
  ON subscriptions FOR DELETE
  USING (auth.uid() = user_id);

CREATE POLICY "Service role can manage reddit sources"
  ON reddit_sources FOR ALL
  USING (auth.jwt()->>'role' = 'service_role');

CREATE POLICY "Service role can manage reddit posts"
  ON reddit_posts FOR ALL
  USING (auth.jwt()->>'role' = 'service_role');

CREATE POLICY "Service role can manage email logs"
  ON email_logs FOR ALL
  USING (auth.jwt()->>'role' = 'service_role');

COMMENT ON POLICY "Public read access to product ideas" ON product_ideas IS 'Anyone can read product ideas';
COMMENT ON POLICY "Users can read their own subscription" ON subscriptions IS 'Users can only access their own subscription';
