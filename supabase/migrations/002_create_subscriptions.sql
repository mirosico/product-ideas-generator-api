CREATE TABLE IF NOT EXISTS subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  topic_filters TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
  unsubscribe_token TEXT NOT NULL UNIQUE,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE UNIQUE INDEX idx_subscriptions_user_id ON subscriptions(user_id);
CREATE UNIQUE INDEX idx_subscriptions_unsubscribe_token ON subscriptions(unsubscribe_token);
CREATE INDEX idx_subscriptions_is_active ON subscriptions(is_active) WHERE is_active = true;
CREATE INDEX idx_subscriptions_email ON subscriptions(email);

COMMENT ON TABLE subscriptions IS 'User email subscriptions with topic filters';
COMMENT ON COLUMN subscriptions.topic_filters IS 'Array of topics user is interested in';
COMMENT ON COLUMN subscriptions.unsubscribe_token IS 'Secure token for email unsubscribe link';
