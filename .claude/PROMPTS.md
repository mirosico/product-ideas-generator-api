# Development Prompts

This file tracks all prompts given during the development of this project.

---

## Prompt 1: Project Setup and Rules Configuration
**Date**: 2025-11-17
**Context**: Initial project setup

**Prompt**:
```
ok, now create PROMPTS.md and since now copy every promt I give you there. Also update your rules so you don't ask for permissions when you make any change in this repository. You also need to create git commit after each change. Commits name should be short, clear, and self descriptive.
```

**Result**:
- Created .claude/PROMPTS.md to track all development prompts
- Created .claude/rules.md with auto-commit and no-permission rules
- Established workflow for tracking prompts and committing changes

---

## Prompt 2: Clarify Rules are for Claude Code
**Date**: 2025-11-17
**Context**: Correcting rules.md target

**Prompt**:
```
It should not be cursor rules! its for you claude code! ALso allow you to edit/create any files in this repo, and run any command
```

**Result**:
- Updated rules.md header from "Cursor AI Rules" to "Claude Code Rules"
- Added explicit permissions: allowed to edit/create ANY files and run ANY commands
- Clarified that permission asking is not required

---

## Prompt 3: Simplify to Domain-Oriented Structure
**Date**: 2025-11-17
**Context**: Simplifying architecture from layered DDD to flat domain-oriented

**Prompt**:
```
Update architecture description to smthing simillar to Domain-Driven (or Domain-Oriented) Folder Structure

You group code by business domain (e.g., users/, auth/, orders/), and each domain contains its own routes, controllers, services, models, etc.

Structure example:

/users
  users.routes.ts
  users.controller.ts
  users.service.ts
  users.model.ts

/auth
  auth.routes.ts
  auth.controller.ts
  auth.service.ts
```

**Result**:
- Updated CLAUDE.md with simplified Domain-Oriented structure
- Each domain now has flat structure: routes, controller, service, model files
- Updated rules.md to reflect Domain-Oriented approach instead of layered DDD
- Removed deep nesting (/domain, /application, /infrastructure layers)

---

## Prompt 4: Install Dependencies
**Date**: 2025-11-17
**Context**: Setting up project dependencies

**Prompt**:
```
now add all needed npm packages and install all needed dependepcies
```

**Result**:
- Updated package.json with all required dependencies:
  - Runtime: Express, Supabase client, Anthropic SDK, SendGrid, Bull, ioredis, snoowrap, zod, dotenv
  - Dev: TypeScript, tsx, nodemon, type definitions
- Changed type to "module" for ES6 modules
- Added scripts: dev (nodemon + tsx), build (tsc), start
- Created tsconfig.json with strict TypeScript configuration
- Created .gitignore for node_modules, dist, .env, IDE files
- Installed all 232 packages successfully

---

## Prompt 5: Create Architecture Documentation
**Date**: 2025-11-17
**Context**: Document high-level system architecture

**Prompt**:
```
Now, create high level arcitectucture of the project and put it into new .md file
```

**Result**:
- Created ARCHITECTURE.md with comprehensive system documentation
- Included system diagram showing component interactions
- Documented all core components: API Server, Bull Queue, Database, External Services
- Detailed data flows: Reddit collection, idea generation, email notifications, API requests
- Defined API endpoint structure and query parameters
- Outlined database schema for all key tables
- Added security, scalability, monitoring, and deployment considerations

---

## Prompt 6: Implement Server and Authentication
**Date**: 2025-11-17
**Context**: Create Express server with full authentication implementation

**Prompt**:
```
Now create server and implement all auth related stuff.
```

**Result**:
- Created Express server (src/index.ts) with middleware, CORS, health check, and error handling
- Implemented shared utilities:
  - env.ts: Environment validation with Zod
  - database.ts: Supabase client and TypeScript database types
  - logger.ts: Structured JSON logging
- Implemented middleware:
  - auth.middleware.ts: JWT token validation with Supabase
  - error.middleware.ts: Global error handler with Zod validation support
- Implemented auth domain (domain-oriented structure):
  - auth.model.ts: Zod schemas and TypeScript types
  - auth.service.ts: Business logic (register, login, logout, getCurrentUser, refreshToken)
  - auth.controller.ts: Request handlers with validation
  - auth.routes.ts: Route definitions
- Auth endpoints: POST /register, POST /login, POST /logout, GET /me, POST /refresh
- Full TypeScript typing with strict validation

---

## Prompt 7: No Comments in Code
**Date**: 2025-11-17
**Context**: Code quality guideline

**Prompt**:
```
Add to instructions that you should not leave any comments code should be self-descriptive
```

**Result**:
- Updated rules.md to add "No comments" guideline
- Code should be self-descriptive through meaningful names
- Prefer small, focused functions over explanatory comments

---

## Prompt 8: Implement Reddit Data Collection Flow
**Date**: 2025-11-17
**Context**: Reddit data collection with Bull queue system

**Prompt**:
```
Great! Now implement Reddit Data Collection Flow
```

**Result**:
- Created reddit domain:
  - reddit.types.ts: TypeScript types and Zod schemas for posts/comments
  - reddit.cache.ts: Redis caching layer with error handling
  - reddit.service.ts: Reddit API client using snoowrap with rate limiting
- Implemented Bull queue infrastructure:
  - shared/queue/jobs.ts: Queue definitions (reddit:collect, ideas:generate, email:send)
  - shared/queue/processors.ts: Job processors with error handling and logging
- Features implemented:
  - Fetch popular subreddits from database or use defaults
  - Collect hot posts with rate limiting (60 req/min)
  - Fetch top comments for each post
  - Store posts in database (reddit_posts table)
  - Redis caching to avoid duplicate fetches (30min TTL)
  - Update source metadata (last_fetched_at, post_count)
  - Scheduled cron job (every 6 hours)
  - Trigger ideas:generate job after collection
  - Exponential backoff retry logic
- Integrated queue processors into main server startup

---

## Prompt 9: Fix TypeScript Errors and Add Validation Rule
**Date**: 2025-11-17
**Context**: Fix compilation errors and enforce TypeScript validation

**Prompt**:
```
There are ts errors in reddit.service.ts. Fix them and add to rules that you need to validate ts before each commit.
```

**Result**:
- Fixed TypeScript errors in reddit.service.ts:
  - Resolved snoowrap circular type references by chaining method calls
  - Used type assertions (as any[]) to work around snoowrap's type issues
  - Fixed unused parameter in error.middleware.ts
- Updated rules.md with TypeScript validation requirement:
  - ALWAYS run `npx tsc --noEmit` before committing
  - Fix all TypeScript errors before creating commits
- All TypeScript compilation errors resolved

---

## Prompt 10: Implement Idea Generation Flow
**Date**: 2025-11-17
**Context**: Claude AI integration for product idea generation and scoring

**Prompt**:
```
Now, implement  Idea Generation Flow
```

**Result**:
- Created Claude AI service (shared/services/claude.service.ts):
  - Integration with Anthropic SDK
  - generateIdeas: Analyzes Reddit data and generates 3-5 product ideas
  - scoreIdea: Evaluates ideas on 0-100 scale (pain, willingness to pay, market size, competition)
  - JSON parsing and validation with Zod schemas
- Created prompts configuration (shared/config/prompts.ts):
  - Idea generation prompt with structured output format
  - Scoring prompt with weighted criteria
- Created product-ideas domain:
  - ideas.model.ts: TypeScript types and Zod query schemas
  - ideas.service.ts: Business logic for generating and fetching ideas
  - ideas.controller.ts: Request handlers for ideas endpoints
  - ideas.routes.ts: Route definitions
- Updated ideas:generate job processor:
  - Fetches unprocessed Reddit posts in batches
  - Generates ideas using Claude AI
  - Scores each idea
  - Stores in product_ideas table with scoring metadata
  - Marks posts as processed
  - Triggers email:send job if ideas created
- API endpoints:
  - GET /api/ideas - List ideas with filtering (topic, minScore) and pagination
  - GET /api/ideas/:id - Get single idea details
- Complete data flow: Reddit → Claude AI → Database → API

---

## Prompt 11: Implement Email Notification Flow
**Date**: 2025-11-17
**Context**: SendGrid integration and subscription management

**Prompt**:
```
Great, now create Email Notification Flow
```

**Result**:
- Created SendGrid email service (shared/services/email.service.ts):
  - Integration with SendGrid SDK
  - sendIdeasNotification: Sends HTML/text emails with product ideas
  - Beautiful HTML email template with idea cards
  - Unsubscribe link in email footer
  - Delivery logging to email_logs table
- Created subscriptions domain:
  - subscriptions.model.ts: Types, schemas, available topics
  - subscriptions.service.ts: Subscription CRUD operations
  - subscriptions.controller.ts: Request handlers
  - subscriptions.routes.ts: Protected and public routes
- Features implemented:
  - Cryptographically secure unsubscribe tokens (32-byte hex)
  - Automatic upsert on subscription creation (prevents duplicates)
  - Topic filtering (devtools, health, education, productivity, business, finance, other)
  - Active/inactive subscription management
- Updated email:send job processor:
  - Fetches active subscriptions
  - Filters new ideas by user topic preferences
  - Sends top 10 scored ideas per user
  - Logs delivery status (sent/failed)
  - Progress tracking
- API endpoints:
  - POST /api/subscriptions - Create subscription (protected)
  - GET /api/subscriptions/me - Get my subscription (protected)
  - PATCH /api/subscriptions/me - Update topic filters (protected)
  - DELETE /api/subscriptions/me - Unsubscribe (protected)
  - GET /api/subscriptions/unsubscribe/:token - Public unsubscribe link
- Complete notification flow: New ideas → Match filters → SendGrid → Email logs

---

## Prompt 12: Plan Remaining Tasks
**Date**: 2025-11-17
**Context**: Document what's left to complete the MVP

**Prompt**:
```
Graet, now write short plan what is left to do?
```

**Result**:
- Created TODO.md with organized task list
- Categorized into: Critical (MVP Required), Important (Production Ready), Nice to Have
- Critical tasks:
  1. Database setup (Supabase migrations, indexes, constraints)
  2. Documentation (README with setup, env vars, API docs)
  3. Manual job triggers for testing
- Important tasks: Rate limiting, error handling, monitoring
- Nice to have: Testing, deployment configs, additional features
- Current status summary shows all core flows completed

---

## Prompt 13: Create Database Setup
**Date**: 2025-11-17
**Context**: Supabase migrations and schema setup

**Prompt**:
```
Great, now create  Database Setup
```

**Result**:
- Created 7 Supabase migration files (001-007):
  - 001: product_ideas table with indexes (topic, score, created_at, is_new, composite)
  - 002: subscriptions table with unique constraints (user_id, unsubscribe_token)
  - 003: reddit_sources table with unique subreddit_name
  - 004: reddit_posts table with unique reddit_id
  - 005: email_logs table with foreign key to subscriptions
  - 006: Row Level Security policies for all tables
  - 007: Helper functions (update_updated_at, get_top_ideas_by_topic)
- Created seed.sql with sample data:
  - 10 default subreddit sources
  - 3 example product ideas with realistic scores
- Created setup-database.sh script with instructions for both CLI and Dashboard
- Created DATABASE.md comprehensive documentation:
  - Complete schema reference for all 5 tables
  - Index descriptions and performance notes
  - RLS policy explanations
  - Setup instructions
  - Maintenance queries
- All tables include proper constraints, indexes, and comments
- Partial indexes on boolean flags for performance
- Auto-update trigger for subscriptions.updated_at

---

## Prompt 14: Create Manual Job Triggers
**Date**: 2025-11-17
**Context**: Admin endpoints for testing and job management

**Prompt**:
```
great, now create . Manual Job Triggers (Testing)
Add admin endpoints to manually trigger jobs:
POST /api/admin/jobs/reddit-collect
POST /api/admin/jobs/generate-ideas
POST /api/admin/jobs/send-emails
Add basic admin authentication/protection
```

**Result**:
- Created admin domain (admin.controller.ts, admin.routes.ts)
- Implemented admin middleware with API key authentication:
  - X-Admin-API-Key header required
  - Minimum 32 character key enforced
  - Logging of access attempts and failures
- Admin endpoints implemented:
  - POST /api/admin/jobs/reddit-collect - Trigger Reddit collection (optional subreddits, triggerIdeasGeneration)
  - POST /api/admin/jobs/generate-ideas - Trigger AI idea generation (configurable batchSize)
  - POST /api/admin/jobs/send-emails - Trigger email notifications (optional filters)
  - GET /api/admin/jobs/:jobId?queue=name - Get job status and progress
  - GET /api/admin/queue-stats - Get statistics for all queues
- All endpoints return 202 Accepted with job ID for async tracking
- Job status endpoint provides: state, progress, result, timestamps
- Queue stats endpoint provides: waiting, active, completed, failed, delayed counts
- Added ADMIN_API_KEY to env config (optional, min 32 chars)
- Updated .env.example with admin key placeholder
- Created ADMIN.md comprehensive documentation:
  - Authentication guide
  - All endpoint specifications with examples
  - Testing workflow
  - Security best practices (key generation, rotation, HTTPS)
  - Error responses

---

## Prompt 15: Implement Reddit Source Configuration
**Date**: 2025-11-17
**Context**: Admin endpoints for managing tracked subreddits

**Prompt**:
```
Great, now implement: 6. Reddit Configuration
Add endpoint to manage reddit_sources (add/remove subreddits)
Add subreddit category configuration
Add ability to enable/disable sources
```

**Result**:
- Created reddit-sources.controller.ts with full CRUD operations
- Reddit source management endpoints (6 total):
  - GET /api/admin/reddit-sources - List all sources with filtering (isActive, category)
  - POST /api/admin/reddit-sources - Create new source (prevents duplicates with 409 error)
  - PATCH /api/admin/reddit-sources/:id - Update category or enable/disable
  - DELETE /api/admin/reddit-sources/:id - Remove source
  - GET /api/admin/reddit-sources/stats - Aggregate statistics (total, active, by category, engagement)
  - POST /api/admin/reddit-sources/bulk-update - Enable/disable multiple sources at once
- Input validation with Zod schemas
- Duplicate prevention on creation
- Statistics include: total/active/inactive counts, breakdown by category, total posts, avg engagement, last fetch time
- All endpoints protected by admin middleware
- Updated ADMIN.md with complete Reddit source management documentation
- Full error handling (404, 409, 500)
- Comprehensive logging of all operations

---
## Prompt 16: Create Comprehensive README
**Date**: 2025-11-17
**Context**: Complete local setup documentation from scratch

**Prompt**:
```
No, create readme file, with basic information about project and with commands how to run server locally from scratch
```

**Result**:
- Created comprehensive README.md (440+ lines) with complete setup guide:
  - Project overview with feature list and emoji icons
  - Complete tech stack breakdown
  - Domain-oriented architecture description
  - Prerequisites (Node.js 18+, Redis, Supabase, API keys)
  - Step-by-step installation instructions from scratch:
    1. Clone repository
    2. Install dependencies with npm
    3. Environment variables setup (.env.example → .env)
    4. Redis setup (Docker/Homebrew/apt options)
    5. Database setup (Supabase CLI and Dashboard options)
    6. Admin API key generation
  - Running the server (dev with hot reload, production mode)
  - Verification steps (health check, Redis connection, auth test)
  - Complete API endpoint reference:
    - Public endpoints (health, auth, ideas)
    - Protected endpoints (logout, subscriptions)
    - Admin endpoints (job management, Reddit sources)
  - Testing pipeline walkthrough (5 steps from Reddit collection to email send)
  - Background jobs explanation (scheduling and triggers)
  - Available npm scripts reference
  - Complete project structure tree
  - Troubleshooting section (Redis, Supabase, TypeScript, port conflicts)
  - Environment variables reference table with descriptions
  - License and support information
- Includes curl examples for testing all endpoints
- Cross-references to ARCHITECTURE.md, DATABASE.md, ADMIN.md, TODO.md
- Ready for onboarding new developers

---
