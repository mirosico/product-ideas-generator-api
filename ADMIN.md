# Admin API Documentation

## Overview

Admin endpoints for manually triggering background jobs and monitoring queue status. Protected by API key authentication.

## Authentication

All admin endpoints require the `X-Admin-API-Key` header:

```bash
curl -X POST http://localhost:3000/api/admin/jobs/reddit-collect \
  -H "X-Admin-API-Key: your-admin-api-key"
```

Set the admin API key in `.env`:
```
ADMIN_API_KEY=your-secure-32-character-admin-key
```

**Security Notes:**
- Admin API key must be at least 32 characters
- Generate with: `openssl rand -hex 32`
- Keep secret and rotate regularly
- If not set, admin endpoints return 503

## Endpoints

### Trigger Reddit Collection

Manually start Reddit data collection from configured subreddits.

```http
POST /api/admin/jobs/reddit-collect
```

**Request Body:**
```json
{
  "subreddits": ["SaaS", "Entrepreneur"],
  "triggerIdeasGeneration": true
}
```

**Parameters:**
- `subreddits` (optional): Array of subreddit names. If omitted, uses all active sources.
- `triggerIdeasGeneration` (optional): Whether to trigger idea generation after collection. Default: `true`.

**Response (202):**
```json
{
  "message": "Reddit collection job queued",
  "jobId": "1234",
  "data": {
    "subreddits": ["SaaS", "Entrepreneur"],
    "triggerIdeasGeneration": true
  }
}
```

**Example:**
```bash
curl -X POST http://localhost:3000/api/admin/jobs/reddit-collect \
  -H "X-Admin-API-Key: your-key" \
  -H "Content-Type: application/json" \
  -d '{
    "subreddits": ["SaaS"],
    "triggerIdeasGeneration": true
  }'
```

### Trigger Idea Generation

Manually start AI-powered idea generation from unprocessed Reddit posts.

```http
POST /api/admin/jobs/generate-ideas
```

**Request Body:**
```json
{
  "batchSize": 50
}
```

**Parameters:**
- `batchSize` (optional): Number of Reddit posts to process. Default: `50`.

**Response (202):**
```json
{
  "message": "Idea generation job queued",
  "jobId": "5678",
  "data": {
    "batchSize": 50
  }
}
```

**Example:**
```bash
curl -X POST http://localhost:3000/api/admin/jobs/generate-ideas \
  -H "X-Admin-API-Key: your-key" \
  -H "Content-Type: application/json" \
  -d '{"batchSize": 100}'
```

### Trigger Email Send

Manually send email notifications to active subscribers.

```http
POST /api/admin/jobs/send-emails
```

**Request Body:**
```json
{
  "subscriptionId": "uuid-here",
  "ideaIds": ["uuid1", "uuid2"]
}
```

**Parameters:**
- `subscriptionId` (optional): Specific subscription to send to. If omitted, sends to all active.
- `ideaIds` (optional): Specific idea IDs to include. If omitted, uses new ideas matching filters.

**Response (202):**
```json
{
  "message": "Email send job queued",
  "jobId": "9012",
  "data": {
    "subscriptionId": "all",
    "ideaCount": "all"
  }
}
```

**Example:**
```bash
curl -X POST http://localhost:3000/api/admin/jobs/send-emails \
  -H "X-Admin-API-Key: your-key" \
  -H "Content-Type: application/json"
```

### Get Job Status

Check the status and progress of a specific job.

```http
GET /api/admin/jobs/:jobId?queue=reddit:collect
```

**Query Parameters:**
- `queue` (required): Queue name (`reddit:collect`, `ideas:generate`, or `email:send`)

**Response (200):**
```json
{
  "jobId": "1234",
  "queue": "reddit:collect",
  "state": "completed",
  "progress": 100,
  "result": {
    "postsCollected": 125,
    "subredditsProcessed": 5
  },
  "data": {
    "subreddits": ["SaaS"],
    "triggerIdeasGeneration": true
  },
  "createdAt": 1234567890,
  "processedAt": 1234567891,
  "finishedAt": 1234567900
}
```

**Job States:**
- `waiting` - Job queued, waiting to be processed
- `active` - Job currently being processed
- `completed` - Job finished successfully
- `failed` - Job failed with error
- `delayed` - Job scheduled for future execution

**Example:**
```bash
curl http://localhost:3000/api/admin/jobs/1234?queue=reddit:collect \
  -H "X-Admin-API-Key: your-key"
```

### Get Queue Statistics

Get counts and statistics for all job queues.

```http
GET /api/admin/queue-stats
```

**Response (200):**
```json
{
  "queues": {
    "reddit:collect": {
      "waiting": 0,
      "active": 1,
      "completed": 45,
      "failed": 2,
      "delayed": 0,
      "total": 48
    },
    "ideas:generate": {
      "waiting": 1,
      "active": 0,
      "completed": 38,
      "failed": 1,
      "delayed": 0,
      "total": 40
    },
    "email:send": {
      "waiting": 0,
      "active": 0,
      "completed": 120,
      "failed": 5,
      "delayed": 0,
      "total": 125
    }
  }
}
```

**Example:**
```bash
curl http://localhost:3000/api/admin/queue-stats \
  -H "X-Admin-API-Key: your-key"
```

## Testing Workflow

### 1. Collect Reddit Data
```bash
curl -X POST http://localhost:3000/api/admin/jobs/reddit-collect \
  -H "X-Admin-API-Key: your-key" \
  -H "Content-Type: application/json" \
  -d '{"triggerIdeasGeneration": false}'
```

### 2. Check Collection Status
```bash
curl http://localhost:3000/api/admin/jobs/{jobId}?queue=reddit:collect \
  -H "X-Admin-API-Key: your-key"
```

### 3. Generate Ideas
```bash
curl -X POST http://localhost:3000/api/admin/jobs/generate-ideas \
  -H "X-Admin-API-Key: your-key"
```

### 4. Check Queue Stats
```bash
curl http://localhost:3000/api/admin/queue-stats \
  -H "X-Admin-API-Key: your-key"
```

### 5. Send Test Emails
```bash
curl -X POST http://localhost:3000/api/admin/jobs/send-emails \
  -H "X-Admin-API-Key: your-key"
```

## Error Responses

**401 Unauthorized:**
```json
{
  "error": "Admin API key required"
}
```

**403 Forbidden:**
```json
{
  "error": "Invalid admin API key"
}
```

**503 Service Unavailable:**
```json
{
  "error": "Admin functionality not available"
}
```

## Security Best Practices

1. **Generate Strong Keys:**
   ```bash
   openssl rand -hex 32
   ```

2. **Rotate Keys Regularly:**
   Update `ADMIN_API_KEY` in your environment

3. **Use HTTPS in Production:**
   Never send API keys over unencrypted connections

4. **Restrict Access:**
   Only expose admin endpoints to trusted IPs/networks

5. **Monitor Usage:**
   Check logs for unauthorized access attempts

6. **Disable in Production (Optional):**
   Remove `ADMIN_API_KEY` from production environment if not needed
