CREATE TABLE IF NOT EXISTS email_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  subscription_id UUID NOT NULL REFERENCES subscriptions(id) ON DELETE CASCADE,
  status TEXT NOT NULL CHECK (status IN ('sent', 'failed', 'bounced')),
  sent_at TIMESTAMPTZ NOT NULL,
  ideas_sent UUID[] NOT NULL DEFAULT ARRAY[]::UUID[]
);

CREATE INDEX idx_email_logs_subscription_id ON email_logs(subscription_id);
CREATE INDEX idx_email_logs_sent_at ON email_logs(sent_at DESC);
CREATE INDEX idx_email_logs_status ON email_logs(status);

COMMENT ON TABLE email_logs IS 'Audit trail for email notifications';
COMMENT ON COLUMN email_logs.status IS 'Delivery status: sent, failed, or bounced';
COMMENT ON COLUMN email_logs.ideas_sent IS 'Array of product idea UUIDs included in email';
