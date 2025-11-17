# Remaining Tasks

## Critical (MVP Required)

### 1. Database Setup
- [ ] Create Supabase migration files for all tables
  - `users` (handled by Supabase Auth)
  - `product_ideas`
  - `subscriptions`
  - `reddit_sources`
  - `reddit_posts`
  - `email_logs`
- [ ] Add indexes for performance (topic, score, created_at, is_new)
- [ ] Add unique constraints (reddit_id, unsubscribe_token)

### 2. Documentation
- [ ] Update README.md with:
  - Setup instructions
  - Environment variables guide
  - Local development workflow
  - API endpoints documentation
- [ ] Database schema documentation

### 3. Manual Job Triggers (Testing)
- [ ] Add admin endpoints to manually trigger jobs:
  - POST /api/admin/jobs/reddit-collect
  - POST /api/admin/jobs/generate-ideas
  - POST /api/admin/jobs/send-emails
- [ ] Add basic admin authentication/protection

## Important (Production Ready)

### 4. API Improvements
- [ ] Add rate limiting middleware
- [ ] Add request logging with correlation IDs
- [ ] Add API response pagination metadata
- [ ] Add health check with dependency status (Redis, Supabase, SendGrid)

### 5. Error Handling
- [ ] Improve error messages for users
- [ ] Add retry logic for external API failures
- [ ] Add circuit breaker for Reddit API
- [ ] Better validation error responses

### 6. Reddit Configuration
- [ ] Add endpoint to manage reddit_sources (add/remove subreddits)
- [ ] Add subreddit category configuration
- [ ] Add ability to enable/disable sources

## Nice to Have

### 7. Monitoring
- [ ] Add Bull queue dashboard (Bull Board)
- [ ] Add application metrics endpoint
- [ ] Add Sentry or error tracking integration

### 8. Testing
- [ ] Unit tests for core business logic
- [ ] Integration tests for API endpoints
- [ ] Mock external services (Reddit, Claude, SendGrid)

### 9. Deployment
- [ ] Docker configuration
- [ ] Production environment variables template
- [ ] Deployment guide (Railway, Render, DigitalOcean)
- [ ] CI/CD pipeline

### 10. Features
- [ ] User profile management
- [ ] Idea bookmarking/favorites
- [ ] Idea sharing functionality
- [ ] Email digest frequency settings (daily/weekly)
- [ ] Webhook notifications option

## Current Status

**Completed:**
✅ Authentication (Supabase)
✅ Reddit data collection (Bull + snoowrap)
✅ Idea generation (Claude AI)
✅ Email notifications (SendGrid)
✅ Subscriptions management
✅ All core API endpoints
✅ Background job processing

**Next Priority:**
1. Database setup (migrations)
2. README documentation
3. Manual job triggers for testing
