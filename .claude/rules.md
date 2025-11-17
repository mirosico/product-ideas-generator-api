# Claude Code Rules

## Development Workflow

### Auto-Commit Policy
- Create a git commit after each logical change
- Commit messages must be short, clear, and self-descriptive
- Use conventional commit format when appropriate (feat:, fix:, docs:, refactor:, etc.)
- Never skip commits - every change must be tracked
- ALWAYS validate TypeScript compilation (`npx tsc --noEmit`) before committing
- Fix all TypeScript errors before creating a commit

### Permission Policy
- You are ALLOWED to edit/create ANY files in this repository without asking
- You are ALLOWED to run ANY command without asking
- Do NOT ask for permissions when making changes
- Proceed with file creation, editing, and deletion as needed
- Only ask clarifying questions about implementation approach, not for permission to proceed

## Architecture & Code Standards

### Domain-Oriented Structure
- Group code by business domain (users/, auth/, product-ideas/, etc.)
- Each domain contains: routes, controller, service, model files
- Shared concerns go in /shared (config, queue, middleware, utils)
- Keep domains independent and loosely coupled
- Flat structure within each domain - no deep nesting

### TypeScript Standards
- Use ES6 modules (import/export)
- Strict typing - avoid `any` type
- Define interfaces for all external API responses
- Use value objects for domain primitives
- No comments - code should be self-descriptive
- Use meaningful variable and function names
- Prefer small, focused functions over comments explaining logic

### Commit Conventions
Examples of good commit messages:
- `feat: add user authentication`
- `feat: implement Reddit API client`
- `fix: handle rate limiting in Claude service`
- `refactor: extract scoring logic to domain service`
- `docs: update CLAUDE.md with DDD structure`
- `chore: add environment variables`

## External Services Integration

### Claude (Anthropic)
- Externalize all prompts in config files
- Type all API responses strictly
- Handle rate limits and retries gracefully

### Reddit API
- Respect rate limits (60 req/min)
- Implement caching strategy
- Store OAuth credentials in .env

### SendGrid
- Queue all emails via Bull
- Never send emails synchronously from API requests
- Track delivery status

### Bull Queue
- Define job types: `reddit:collect`, `ideas:generate`, `email:send`
- Implement exponential backoff for retries
- Add job monitoring and failure recovery

## Development Practices

### Error Handling
- Use domain-specific errors
- Never expose internal errors to API responses
- Log all errors with context

### Testing
- Write tests for domain logic
- Mock external services in tests
- Test use cases independently

### Environment
- Never commit .env files
- Document all required env vars in CLAUDE.md
- Validate env vars on startup
