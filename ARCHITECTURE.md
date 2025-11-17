# System Architecture

## Overview

Product Ideas Generator is a SaaS platform that monitors Reddit communities, extracts user pain points, and generates scored product ideas using AI. The system operates on a pipeline architecture with background job processing.

## System Diagram

```
┌─────────────┐
│   Reddit    │
│     API     │
└──────┬──────┘
       │
       ▼
┌─────────────────────────────────────────────────────────┐
│                    API Server (Express)                  │
│                                                          │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐             │
│  │   Auth   │  │  Ideas   │  │   Subs   │             │
│  │  Domain  │  │  Domain  │  │  Domain  │             │
│  └──────────┘  └──────────┘  └──────────┘             │
└───────┬──────────────────────────────────────────┬─────┘
        │                                           │
        ▼                                           ▼
┌──────────────┐                           ┌──────────────┐
│   Supabase   │                           │  Bull Queue  │
│  (Postgres)  │                           │   (Redis)    │
└──────────────┘                           └──────┬───────┘
                                                  │
        ┌─────────────────────────────────────────┼─────────┐
        │                                         │         │
        ▼                                         ▼         ▼
┌──────────────┐                         ┌─────────────┐   │
│   SendGrid   │◄────────────────────────│ Email Job   │   │
└──────────────┘                         └─────────────┘   │
                                                            │
┌──────────────┐                         ┌─────────────┐   │
│   Claude AI  │◄────────────────────────│ Ideas Gen   │◄──┘
└──────────────┘                         │     Job     │
                                         └─────────────┘
                                                ▲
                                                │
                                         ┌─────────────┐
                                         │ Reddit Coll │
                                         │     Job     │
                                         └─────────────┘
```

## Core Components

### 1. API Server (Express)
**Responsibility**: Handle HTTP requests, route to appropriate domain handlers

**Key Features**:
- RESTful API endpoints
- Authentication middleware (Supabase Auth)
- Request validation (Zod)
- Error handling middleware
- CORS configuration

**Domains**:
- `/auth` - User authentication and session management
- `/users` - User profile and settings
- `/product-ideas` - Product ideas feed with filtering
- `/subscriptions` - Email subscription management
- `/reddit` - Reddit sources administration (optional)

### 2. Background Job Queue (Bull + Redis)
**Responsibility**: Asynchronous task processing with retry logic

**Job Types**:
1. **reddit:collect** - Fetch new posts/comments from subreddits
2. **ideas:generate** - Process Reddit data through Claude AI
3. **email:send** - Send notification emails via SendGrid

**Features**:
- Scheduled cron jobs for periodic collection
- Retry with exponential backoff
- Job monitoring and failure recovery
- Concurrent processing with rate limiting

### 3. Database (Supabase Postgres)
**Responsibility**: Data persistence and user authentication

**Key Tables**:
- `users` - User accounts (managed by Supabase Auth)
- `product_ideas` - Generated product ideas with scores
- `subscriptions` - User email preferences and topic filters
- `reddit_sources` - Tracked subreddits and metadata
- `reddit_posts` - Cached Reddit data for processing
- `email_logs` - Email delivery audit trail

### 4. External Services Integration

#### Reddit API Client
- OAuth 2.0 authentication
- Rate limiting (60 requests/minute)
- Caching layer to minimize API calls
- Extract: titles, body, comments, upvotes, engagement

#### Claude AI (Anthropic)
- Prompt-based idea generation
- Separate prompts for idea creation and scoring
- Structured output parsing with Zod validation
- Rate limit handling

#### SendGrid Email Service
- Transactional email delivery
- Template management
- Unsubscribe link generation
- Delivery status tracking

## Data Flow

### 1. Reddit Data Collection Flow
```
Cron Trigger → reddit:collect Job
    ↓
Fetch Popular Subreddits (Reddit API)
    ↓
Fetch Recent Posts/Comments
    ↓
Store in reddit_posts table
    ↓
Trigger ideas:generate Job
```

### 2. Idea Generation Flow
```
ideas:generate Job
    ↓
Fetch Unprocessed Reddit Posts
    ↓
Extract Pain Points & Signals
    ↓
Send to Claude AI (Batch)
    ↓
Parse & Validate Response
    ↓
Score Ideas (Claude AI or Formula)
    ↓
Store in product_ideas table
    ↓
Trigger email:send Job (if new ideas match user filters)
```

### 3. Email Notification Flow
```
email:send Job
    ↓
Fetch Active Subscriptions with Filters
    ↓
Match New Ideas to User Preferences
    ↓
Generate Email Content
    ↓
Send via SendGrid
    ↓
Log Delivery in email_logs
```

### 4. API Request Flow
```
Client Request
    ↓
Auth Middleware (validate Supabase JWT)
    ↓
Validation Middleware (Zod schema)
    ↓
Domain Controller
    ↓
Domain Service (business logic)
    ↓
Database Query (Supabase client)
    ↓
Response Formatting
    ↓
Client Response
```

## API Design

### Authentication Endpoints
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `POST /api/auth/logout` - User logout
- `GET /api/auth/me` - Get current user

### Product Ideas Endpoints
- `GET /api/ideas` - List ideas with filters (topic, score, date)
- `GET /api/ideas/:id` - Get single idea details

Query parameters:
- `topic` - Filter by topic (devtools, health, education)
- `minScore` - Minimum viability score
- `limit` - Pagination limit
- `offset` - Pagination offset

### Subscriptions Endpoints
- `POST /api/subscriptions` - Subscribe with topic preferences
- `GET /api/subscriptions/me` - Get current user's subscription
- `PATCH /api/subscriptions/me` - Update topic filters
- `DELETE /api/subscriptions/me` - Unsubscribe
- `GET /api/unsubscribe/:token` - Public unsubscribe via email link

## Database Schema

### product_ideas
```sql
id: uuid (PK)
name: text
pitch: text
target_audience: text
pain_point: text
subreddit_sources: jsonb
score: integer (0-100)
topic: text
is_new: boolean
created_at: timestamp
```

### subscriptions
```sql
id: uuid (PK)
user_id: uuid (FK → users)
email: text
topic_filters: text[] (array of topics)
unsubscribe_token: text (unique)
is_active: boolean
created_at: timestamp
updated_at: timestamp
```

### reddit_sources
```sql
id: uuid (PK)
subreddit_name: text
category: text
last_fetched_at: timestamp
post_count: integer
avg_engagement: numeric
is_active: boolean
```

### reddit_posts
```sql
id: uuid (PK)
reddit_id: text (unique)
subreddit: text
title: text
body: text
author: text
score: integer
num_comments: integer
created_at: timestamp
processed: boolean
```

## Configuration Management

### Environment Variables
All secrets and configuration in `.env`:
- Database credentials (Supabase)
- API keys (Claude, SendGrid, Reddit)
- Redis connection
- Server port and environment

### LLM Prompts
Externalized in `/src/shared/config/prompts.ts`:
- Idea generation prompt template
- Scoring prompt template
- System instructions

## Security Considerations

1. **Authentication**: Supabase JWT validation on all protected routes
2. **API Keys**: Never exposed to client, stored in environment variables
3. **Rate Limiting**: Implement rate limiting on API endpoints
4. **Input Validation**: Zod schemas for all inputs
5. **SQL Injection**: Using parameterized queries via Supabase client
6. **CORS**: Configured for specific frontend origin
7. **Unsubscribe Tokens**: Cryptographically secure random tokens

## Scalability Considerations

1. **Database Indexing**: Index on `topic`, `score`, `created_at` for fast queries
2. **Caching**: Redis cache for frequently accessed ideas
3. **Job Concurrency**: Configurable worker count for Bull queues
4. **Reddit API**: Respect rate limits, use exponential backoff
5. **Batch Processing**: Process multiple ideas in single Claude API call

## Monitoring & Logging

1. **Job Monitoring**: Bull queue UI for job status
2. **Error Logging**: Structured logging for all errors
3. **Email Tracking**: Delivery status in email_logs table
4. **API Logging**: Request/response logging with correlation IDs
5. **Health Checks**: `/health` endpoint for uptime monitoring

## Development Workflow

1. **Local Development**: `npm run dev` - Hot reload with tsx
2. **Building**: `npm run build` - TypeScript compilation
3. **Production**: `npm start` - Run compiled JavaScript
4. **Environment**: Copy `.env.example` to `.env` and configure

## Deployment Considerations

1. **Redis**: Required for Bull queue (can use Redis Cloud)
2. **Database**: Supabase hosted Postgres
3. **Server**: Node.js hosting (Vercel, Railway, DigitalOcean)
4. **Cron Jobs**: Ensure scheduler is running for background jobs
5. **Environment Variables**: Set all required env vars in hosting platform
