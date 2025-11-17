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