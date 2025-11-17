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

### Project Structure (DDD - Domain-Centric)

Organized by bounded contexts, each domain contains all its layers:

```
/src
  /users
    /domain            - User entity, value objects
    /application       - User use cases (RegisterUser, LoginUser)
    /infrastructure    - Supabase auth integration, user repository
    /presentation      - Auth routes, controllers, middleware

  /product-ideas
    /domain            - ProductIdea entity, Score value object, scoring domain service
    /application       - Use cases (GenerateIdeas, GetIdeasFeed, ScoreIdea)
    /infrastructure    - Product ideas repository, LLM service integration
    /presentation      - Ideas API routes, controllers, DTOs

  /subscriptions
    /domain            - Subscription entity, Topic value objects
    /application       - Use cases (SubscribeUser, UpdatePreferences, Unsubscribe)
    /infrastructure    - Subscriptions repository, email service integration
    /presentation      - Subscription routes, controllers

  /reddit-sources
    /domain            - RedditSource entity, engagement metrics value objects
    /application       - Use cases (CollectSources, ExtractSignals)
    /infrastructure    - Reddit API client, source repository, caching
    /presentation      - Admin routes for source management (if needed)

  /shared
    /domain            - Shared value objects (Email, Id, DateRange)
    /infrastructure
      /queue           - Bull job definitions and processors
      /config          - Environment config, LLM prompts, constants
      /database        - Supabase client, migrations
    /presentation
      /middleware      - Shared middleware (error handling, logging)
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
