# Product Ideas Generator API

A SaaS backend that monitors popular subreddits, extracts pain points and problems discussed by users, and uses Claude AI to generate scored product ideas for aspiring founders.

## Features

- 🔐 **Authentication** - User registration and login with Supabase Auth
- 🤖 **AI-Powered Idea Generation** - Claude AI analyzes Reddit discussions to create product ideas
- 📊 **Intelligent Scoring** - Each idea scored 0-100 based on pain level, willingness to pay, market size, and competition
- 📧 **Email Notifications** - Personalized email digests with topic filtering
- 🔄 **Background Jobs** - Automated Reddit collection, idea generation, and email delivery
- 🎯 **Topic Filtering** - Filter ideas by category (devtools, health, education, productivity, business, finance)
- 🛠️ **Admin Dashboard** - REST API for managing sources and triggering jobs

## Tech Stack

- **Runtime**: Node.js + TypeScript (ES6 modules)
- **Framework**: Express
- **Database**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth
- **AI**: Claude (Anthropic)
- **Email**: SendGrid
- **Job Queue**: Bull (Redis)
- **Reddit API**: Snoowrap
- **Validation**: Zod

## Architecture

Domain-oriented folder structure with self-contained business domains:
- `/auth` - User authentication
- `/product-ideas` - AI-generated ideas
- `/subscriptions` - Email subscriptions
- `/reddit` - Reddit data collection
- `/admin` - Admin endpoints
- `/shared` - Shared utilities and services

## Prerequisites

- Node.js 18+ and npm
- Redis (for Bull queue)
- Supabase account
- Anthropic API key (Claude)
- SendGrid API key
- Reddit API credentials

## Installation

### 1. Clone the Repository

```bash
git clone <repository-url>
cd product-ideas-generator-api
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Set Up Environment Variables

Create a `.env` file in the root directory:

```bash
cp .env.example .env
```

Edit `.env` and fill in your credentials:

```env
# Server
PORT=3000
NODE_ENV=development

# Supabase
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_KEY=your-supabase-anon-key

# Anthropic (Claude)
ANTHROPIC_API_KEY=sk-ant-your-key-here

# SendGrid
SENDGRID_API_KEY=SG.your-sendgrid-key

# Reddit API
REDDIT_CLIENT_ID=your-reddit-client-id
REDDIT_CLIENT_SECRET=your-reddit-client-secret
REDDIT_USER_AGENT=product-ideas-generator:v1.0.0 (by /u/yourusername)

# Redis (for Bull queue)
REDIS_URL=redis://localhost:6379

# Admin (optional - for manual job triggers)
ADMIN_API_KEY=your-secure-32-character-admin-key-here
```

### 4. Start Redis

Redis is required for the Bull job queue.

**Using Docker:**
```bash
docker run -d -p 6379:6379 redis:alpine
```

**Using Homebrew (macOS):**
```bash
brew install redis
brew services start redis
```

**Using apt (Linux):**
```bash
sudo apt-get install redis-server
sudo systemctl start redis
```

### 5. Set Up Database

#### Option 1: Using Supabase CLI (Recommended)

```bash
# Install Supabase CLI
npm install -g supabase

# Login to Supabase
supabase login

# Link your project
supabase link --project-ref <your-project-id>

# Apply migrations
supabase db push

# Seed database (optional)
supabase db seed
```

#### Option 2: Using Supabase Dashboard

1. Go to [Supabase Dashboard](https://supabase.com/dashboard)
2. Navigate to SQL Editor
3. Run each migration file in order from `supabase/migrations/`:
   - 001_create_product_ideas.sql
   - 002_create_subscriptions.sql
   - 003_create_reddit_sources.sql
   - 004_create_reddit_posts.sql
   - 005_create_email_logs.sql
   - 006_enable_rls.sql
   - 007_create_functions.sql
4. Run `supabase/seed.sql` for sample data

### 6. Generate Admin API Key (Optional)

If you want to use admin endpoints:

```bash
openssl rand -hex 32
```

Add the generated key to your `.env` file as `ADMIN_API_KEY`.

## Running the Server

### Development Mode (with hot reload)

```bash
npm run dev
```

Server will start on `http://localhost:3000`

### Production Mode

```bash
# Build TypeScript
npm run build

# Start production server
npm start
```

## Verifying Setup

### Check Server Health

```bash
curl http://localhost:3000/health
```

Expected response:
```json
{
  "status": "ok",
  "timestamp": "2024-01-15T10:30:00.000Z"
}
```

### Check Redis Connection

The server logs should show:
```
Redis connected successfully
```

### Test Authentication

```bash
# Register a user
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "testpassword123",
    "name": "Test User"
  }'
```

## API Endpoints

### Public Endpoints

- `GET /health` - Health check
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `POST /api/auth/refresh` - Refresh access token
- `GET /api/ideas` - List product ideas (with filtering)
- `GET /api/ideas/:id` - Get single idea
- `GET /api/subscriptions/unsubscribe/:token` - Unsubscribe via email

### Protected Endpoints (Require Authentication)

- `POST /api/auth/logout` - User logout
- `GET /api/auth/me` - Get current user
- `POST /api/subscriptions` - Create subscription
- `GET /api/subscriptions/me` - Get my subscription
- `PATCH /api/subscriptions/me` - Update topic filters
- `DELETE /api/subscriptions/me` - Delete subscription

### Admin Endpoints (Require Admin API Key)

**Job Management:**
- `POST /api/admin/jobs/reddit-collect` - Trigger Reddit collection
- `POST /api/admin/jobs/generate-ideas` - Trigger idea generation
- `POST /api/admin/jobs/send-emails` - Trigger email notifications
- `GET /api/admin/jobs/:jobId?queue=name` - Get job status
- `GET /api/admin/queue-stats` - Get queue statistics

**Reddit Source Management:**
- `GET /api/admin/reddit-sources` - List tracked subreddits
- `POST /api/admin/reddit-sources` - Add new subreddit
- `PATCH /api/admin/reddit-sources/:id` - Update source
- `DELETE /api/admin/reddit-sources/:id` - Remove source
- `GET /api/admin/reddit-sources/stats` - Get statistics
- `POST /api/admin/reddit-sources/bulk-update` - Bulk enable/disable

See [ADMIN.md](./ADMIN.md) for detailed admin API documentation.

## Testing the Pipeline

### 1. Trigger Reddit Collection

```bash
curl -X POST http://localhost:3000/api/admin/jobs/reddit-collect \
  -H "X-Admin-API-Key: your-admin-key"
```

### 2. Generate Ideas from Collected Data

```bash
curl -X POST http://localhost:3000/api/admin/jobs/generate-ideas \
  -H "X-Admin-API-Key: your-admin-key"
```

### 3. View Generated Ideas

```bash
curl http://localhost:3000/api/ideas
```

### 4. Subscribe to Notifications

First, register and login to get an access token, then:

```bash
curl -X POST http://localhost:3000/api/subscriptions \
  -H "Authorization: Bearer your-access-token" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "your-email@example.com",
    "topicFilters": ["devtools", "productivity"]
  }'
```

### 5. Send Test Email

```bash
curl -X POST http://localhost:3000/api/admin/jobs/send-emails \
  -H "X-Admin-API-Key: your-admin-key"
```

## Background Jobs

The server automatically runs scheduled background jobs:

- **Reddit Collection**: Every 6 hours
- **Idea Generation**: Triggered after Reddit collection
- **Email Notifications**: Triggered after idea generation

Jobs can also be triggered manually via admin endpoints.

## Available Scripts

- `npm run dev` - Start development server with hot reload
- `npm run build` - Build TypeScript to JavaScript
- `npm start` - Start production server
- `npm test` - Run tests (not yet implemented)

## Project Structure

```
src/
├── auth/                    # Authentication domain
│   ├── auth.controller.ts
│   ├── auth.service.ts
│   ├── auth.model.ts
│   └── auth.routes.ts
├── product-ideas/           # Product ideas domain
│   ├── ideas.controller.ts
│   ├── ideas.service.ts
│   ├── ideas.model.ts
│   └── ideas.routes.ts
├── subscriptions/           # Email subscriptions domain
│   ├── subscriptions.controller.ts
│   ├── subscriptions.service.ts
│   ├── subscriptions.model.ts
│   └── subscriptions.routes.ts
├── reddit/                  # Reddit data collection
│   ├── reddit.service.ts
│   ├── reddit.cache.ts
│   └── reddit.types.ts
├── admin/                   # Admin endpoints
│   ├── admin.controller.ts
│   ├── reddit-sources.controller.ts
│   └── admin.routes.ts
├── shared/                  # Shared utilities
│   ├── config/
│   │   ├── env.ts
│   │   └── prompts.ts
│   ├── services/
│   │   ├── claude.service.ts
│   │   └── email.service.ts
│   ├── queue/
│   │   ├── jobs.ts
│   │   └── processors.ts
│   ├── middleware/
│   │   ├── auth.middleware.ts
│   │   ├── admin.middleware.ts
│   │   └── error.middleware.ts
│   └── utils/
│       ├── database.ts
│       └── logger.ts
└── index.ts                 # Server entry point
```

## Documentation

- [ARCHITECTURE.md](./ARCHITECTURE.md) - System architecture and data flows
- [DATABASE.md](./DATABASE.md) - Database schema and migrations
- [ADMIN.md](./ADMIN.md) - Admin API reference
- [TODO.md](./TODO.md) - Remaining tasks and roadmap

## Troubleshooting

### Redis Connection Error

**Error**: `Redis connection error`

**Solution**: Make sure Redis is running:
```bash
redis-cli ping
# Should return: PONG
```

### Supabase Connection Error

**Error**: `Failed to fetch from Supabase`

**Solution**:
- Check your `SUPABASE_URL` and `SUPABASE_KEY` in `.env`
- Verify your Supabase project is active
- Check if RLS policies are properly set up

### TypeScript Errors

**Error**: TypeScript compilation errors

**Solution**:
```bash
# Validate TypeScript
npx tsc --noEmit

# Rebuild
npm run build
```

### Port Already in Use

**Error**: `EADDRINUSE: address already in use :::3000`

**Solution**: Change the port in `.env` or kill the process:
```bash
# Find process
lsof -i :3000

# Kill process
kill -9 <PID>
```

## Environment Variables Reference

| Variable | Required | Description |
|----------|----------|-------------|
| PORT | No | Server port (default: 3000) |
| NODE_ENV | No | Environment (development/production) |
| SUPABASE_URL | Yes | Supabase project URL |
| SUPABASE_KEY | Yes | Supabase anon/service key |
| ANTHROPIC_API_KEY | Yes | Claude API key |
| SENDGRID_API_KEY | Yes | SendGrid API key |
| REDDIT_CLIENT_ID | Yes | Reddit OAuth client ID |
| REDDIT_CLIENT_SECRET | Yes | Reddit OAuth secret |
| REDDIT_USER_AGENT | Yes | Reddit API user agent |
| REDIS_URL | Yes | Redis connection URL |
| ADMIN_API_KEY | No | Admin API key (32+ chars) |

## License

ISC

## Support

For issues and questions, please check the documentation files or create an issue in the repository.
