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