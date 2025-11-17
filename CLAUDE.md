# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Backend API for a SaaS product idea generator that monitors popular subreddits, extracts pain points and problems discussed by users, and uses LLM to generate scored product ideas for aspiring founders.

The project uses Node.js + TypeScript with ES6 modules.

## Core Workflow (MVP Pipeline)

1. **Source Collection**: Periodically discover/fetch popular subreddits where users discuss problems
2. **Signal Extraction**: Extract problem formulations, pain triggers, and engagement metrics from recent posts/comments
3. **Idea Generation**: LLM generates product ideas with:
   - Product name
   - Elevator pitch
   - Target audience
   - Pain point being solved
4. **Viability Scoring**: LLM or formula provides numerical score (0-100) based on pain level, willingness to pay, competition, TAM
5. **Result Delivery**: API endpoints for product idea feed with filtering, email subscription management

## Tech Stack

- **Runtime**: Node.js + TypeScript (ES6 modules)
- **Database & Auth**: Supabase (Postgres + Auth)
- **LLM Provider**: Claude (Anthropic) - prompts and config externalized
- **Email Service**: SendGrid (SDK integration via .env config)
- **Reddit Data**: Reddit API (with OAuth tokens/rate limits)
- **Job Queue**: Bull (Redis-backed job processing)
- **Architecture**: Domain-Driven Design (DDD)

## MVP Features (Backend)

### API Endpoints Required

1. **Authentication** (Supabase Auth integration)
   - Registration
   - Login
   - Logout
   - Session management

2. **Product Ideas Feed**
   - GET /api/ideas - List ideas with filtering by topic (devtools, health, education, etc.)
   - Fields per idea: name, pitch, pain/insight, sources (subreddit/link), score (0-100), isNew badge
   - Support pagination and topic filters

3. **Email Subscriptions**
   - POST /api/subscriptions - Subscribe with topic filter preferences
   - PATCH /api/subscriptions - Update topic filters
   - DELETE /api/subscriptions - Unsubscribe
   - GET /api/unsubscribe/:token - Unsubscribe via email link

4. **Background Jobs** (Bull Queue)
   - Reddit data collection job
   - LLM idea generation pipeline job
   - Email notification sender job (filtered by user preferences)

## Architecture Considerations

### Project Structure (Domain-Oriented)

Code is grouped by business domain, with each domain containing its own routes, controllers, services, and models:

```
/src
  /users
    users.routes.ts       - User API routes
    users.controller.ts   - Request/response handlers
    users.service.ts      - Business logic
    users.model.ts        - User entity/types

  /auth
    auth.routes.ts        - Authentication routes
    auth.controller.ts    - Auth handlers
    auth.service.ts       - Supabase auth integration

  /product-ideas
    ideas.routes.ts       - Product ideas API routes
    ideas.controller.ts   - Ideas request handlers
    ideas.service.ts      - Idea generation & scoring logic
    ideas.model.ts        - ProductIdea entity/types

  /subscriptions
    subscriptions.routes.ts     - Subscription API routes
    subscriptions.controller.ts - Subscription handlers
    subscriptions.service.ts    - Email subscription logic
    subscriptions.model.ts      - Subscription entity/types

  /reddit
    reddit.service.ts     - Reddit API client
    reddit.types.ts       - Reddit data types
    reddit.cache.ts       - Caching layer

  /shared
    /config
      env.ts              - Environment configuration
      prompts.ts          - Claude LLM prompts
    /queue
      jobs.ts             - Bull job definitions
      processors.ts       - Job processors
    /middleware
      auth.middleware.ts  - Authentication middleware
      error.middleware.ts - Error handling
    /utils
      database.ts         - Supabase client
      logger.ts           - Logging utilities
```

### Database Schema (Supabase Postgres)
Key tables to implement:
- `users` - Managed by Supabase Auth
- `product_ideas` - Generated ideas with scores, sources, topics
- `subscriptions` - User email preferences with topic filters
- `reddit_sources` - Tracked subreddits and engagement metrics
- `email_logs` - Audit trail for sent notifications

### Claude LLM Integration
- Externalize prompts in `/src/infrastructure/config`
- Strict TypeScript typing for Claude API responses
- Separate concerns: idea generation vs scoring (different prompts)
- Handle rate limits and errors gracefully
- Use Anthropic SDK

### SendGrid Email Integration
- All credentials in .env (never commit)
- Implement unsubscribe token generation
- Use Bull queue for sending emails asynchronously
- Template management for notification emails
- Track delivery status in `email_logs` table

### Reddit API Integration
- OAuth authentication with Reddit API
- Handle rate limiting (60 requests per minute)
- Cache responses to minimize API calls
- Extract: problem statements, engagement metrics, user sentiment
- Store raw data for reprocessing if needed

### Bull Job Queue
- Redis-backed job processing
- Job types: `reddit:collect`, `ideas:generate`, `email:send`
- Implement retry logic with exponential backoff
- Job monitoring and failure handling
- Scheduled jobs via cron patterns

## Environment Variables

Required .env configuration:
- `SUPABASE_URL` - Supabase project URL
- `SUPABASE_KEY` - Supabase anon/service key
- `ANTHROPIC_API_KEY` - Claude API key
- `SENDGRID_API_KEY` - SendGrid API key
- `REDDIT_CLIENT_ID` - Reddit OAuth client ID
- `REDDIT_CLIENT_SECRET` - Reddit OAuth secret
- `REDDIT_USER_AGENT` - Reddit API user agent
- `REDIS_URL` - Redis connection for Bull queue
- `PORT` - API server port

## Development Commands

To be defined as build/test infrastructure is added.
