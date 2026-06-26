# AI Usage Documentation

## Sprint 2: Immutable Audit Log Service

## Tool Used

- **Claude** (Anthropic) via Cursor IDE integration

## Purpose

I used AI as a thinking partner and code reviewer throughout this sprint. It helped me move faster on boilerplate and scaffolding, but the core technical decisions and the parts I care most about — I worked through those myself.

## How I Used AI

### Architecture & Design

- I discussed technology options (TypeScript/Express, Drizzle vs Prisma) and made the final stack choices myself
- I used it to think through project structure and separation of concerns before writing any code
- I asked it to explain tradeoffs rather than just pick for me

### Scaffolding & Boilerplate

- I used AI to generate initial project setup, Express config, and migration files — the parts where the pattern is well-known and the value is in moving fast, not in figuring it out
- I reviewed everything it generated before committing

### Debugging

- I hit runtime errors with Zod v4 compatibility and UUID validation — I used AI to help diagnose them, but I read the error output myself and understood what was wrong before applying any fix
- Route ordering bug: AI pointed me in the right direction, I traced it through the code myself

### Testing & Documentation

- AI generated the initial test structure and OpenAPI spec
- I reviewed all tests to verify they were actually testing the right things, not just passing

## What I Built and Understand

These are the parts I worked through carefully and can explain without notes:

**HMAC signing** — I understand how the signature is computed (HMAC-SHA256 over a deterministic string of the event fields), why the secret key must stay server-side, and what tamper detection actually catches vs what it doesn't. I wrote the verification logic and the "what this does NOT protect against" section from my own understanding.

**Zod schema design** — I designed the validation schemas myself. I understand why required fields fail fast, how Zod serves as both the runtime validator and the TypeScript type source, and why `before_state`/`after_state` are optional objects rather than strings.

**Pagination logic** — I implemented the `limit`/`offset` pattern and the `has_more` calculation myself. I understand the tradeoff between offset pagination and cursor pagination for this use case.

**Atomicity validation** — I understand why the bulk insert uses a transaction, what "all-or-nothing" means at the database level, and how a failed insert mid-batch rolls back the entire operation.

## What I Leaned on AI For

- Initial Express and Drizzle boilerplate
- Generating 40+ edge case tests (I verified them, didn't write them all)
- PR descriptions and commit message wording
- This document's structure

## How I Verified Everything

I ran `npx vitest run` after every phase and `npx tsc --noEmit` before every commit. If something failed, I read the output and understood why before touching the code.
