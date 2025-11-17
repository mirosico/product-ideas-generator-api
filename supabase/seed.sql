INSERT INTO reddit_sources (subreddit_name, category, is_active) VALUES
  ('SaaS', 'devtools', true),
  ('Entrepreneur', 'business', true),
  ('startups', 'business', true),
  ('indiehackers', 'devtools', true),
  ('productivity', 'productivity', true),
  ('smallbusiness', 'business', true),
  ('digitalnomad', 'business', true),
  ('SideProject', 'devtools', true),
  ('financialindependence', 'finance', true),
  ('personalfinance', 'finance', true)
ON CONFLICT (subreddit_name) DO NOTHING;

INSERT INTO product_ideas (name, pitch, target_audience, pain_point, subreddit_sources, score, topic, is_new) VALUES
  (
    'CodeReview AI',
    'Automated code review tool that provides instant feedback on code quality, security issues, and best practices using AI.',
    'Software developers and engineering teams',
    'Manual code reviews are time-consuming and inconsistent',
    '{"sources": ["r/programming", "r/SaaS"], "scoring": {"painLevel": 22, "willingnessToPay": 20, "marketSize": 23, "competition": 18, "reasoning": "Strong market demand, proven willingness to pay for dev tools"}}'::jsonb,
    83,
    'devtools',
    true
  ),
  (
    'MeetingDigest',
    'Automatically records, transcribes, and summarizes your virtual meetings, extracting action items and key decisions.',
    'Remote teams and managers',
    'Difficulty tracking what was discussed and decided in meetings',
    '{"sources": ["r/productivity", "r/Entrepreneur"], "scoring": {"painLevel": 20, "willingnessToPay": 19, "marketSize": 22, "competition": 16, "reasoning": "High pain point in remote work era, growing market"}}'::jsonb,
    77,
    'productivity',
    true
  ),
  (
    'BudgetBuddy',
    'Smart budgeting app that learns your spending patterns and provides personalized financial advice.',
    'Millennials and Gen Z looking to manage finances',
    'Traditional budgeting apps are too complex and dont adapt to individual needs',
    '{"sources": ["r/personalfinance", "r/financialindependence"], "scoring": {"painLevel": 18, "willingnessToPay": 17, "marketSize": 21, "competition": 15, "reasoning": "Competitive market but personalization angle is strong"}}'::jsonb,
    71,
    'finance',
    true
  )
ON CONFLICT DO NOTHING;
