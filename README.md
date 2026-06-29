# Immutable Audit Log Service

A write-only REST API service that records audit events into a permanent, queryable, tamper-evident record.

## What This Service Does

This service provides a centralized, immutable audit log for multiple web applications. It records **who** did **what** to **which resource**, when they did it, and from where. Once written, events can never be updated or deleted through the API. Each event is cryptographically signed to detect tampering at the database level.

### Key Features

- **Write-only API** — events can be created and read, never modified or deleted
- **Structured validation** — all input validated at the API boundary
- **Atomic bulk operations** — batch up to 100 events, all-or-nothing
- **Flexible querying** — filter by actor, action, resource, and date range
- **Tamper-evidence** — HMAC-SHA256 signatures detect unauthorized database modifications
- **Pagination** — efficiently page through large audit logs

---

## Setup & Configuration

### Prerequisites

- Node.js 18+
- PostgreSQL 14+

### Installation

```bash
npm install
cp .env.example .env
```

### Environment Variables

Edit `.env` with your configuration:

| Variable           | Description         | Default     |
| ------------------ | ------------------- | ----------- |
| `PORT`             | Server port         | `3000`      |
| `DB_HOST`          | PostgreSQL host     | `localhost` |
| `DB_PORT`          | PostgreSQL port     | `5432`      |
| `DB_NAME`          | Database name       | `audit_log` |
| `DB_USER`          | Database user       | `postgres`  |
| `DB_PASSWORD`      | Database password   | (required)  |
| `AUDIT_SECRET_KEY` | HMAC signing secret | (required)  |

### Database Setup

```bash
# Create the database
sudo -u postgres psql -c "CREATE DATABASE audit_log;"

# Run migrations
npm run db:migrate
```

### Running the Server

```bash
# Development (with hot reload)
npm run dev

# Production
npm run build
npm start
```

The server starts on `http://localhost:3000`.

### Running Tests

```bash
npm test
```

---

## The Event Shape

An audit event answers six questions: who, what, what-to, what-changed, when, and from-where.

| Field           | Type   | Required | Description                                  |
| --------------- | ------ | -------- | -------------------------------------------- |
| `actor_id`      | string | Yes      | Who performed the action                     |
| `action`        | string | Yes      | What they did (e.g., `delete`, `update`)     |
| `resource_type` | string | Yes      | The kind of thing acted on (e.g., `invoice`) |
| `resource_id`   | string | Yes      | Which specific thing                         |
| `before_state`  | object | No       | The data before the change                   |
| `after_state`   | object | No       | The data after the change                    |
| `ip_address`    | string | No       | Where the request came from                  |
| `user_agent`    | string | No       | What client was used                         |

**Server-assigned fields** (never accepted from the client):

- `id` — UUID v4, assigned on write
- `timestamp` — ISO 8601 (e.g. `2026-06-26T12:30:32.749Z`), assigned on write

---

## API Reference

### POST `/events` — Record a single event

```bash
curl -X POST http://localhost:3000/events \
  -H "Content-Type: application/json" \
  -d '{
    "actor_id": "user-123",
    "action": "delete",
    "resource_type": "invoice",
    "resource_id": "inv-456"
  }'
```

**Success (201):**

```json
{
  "ok": true,
  "event": {
    "id": "5383db82-f735-4be7-a995-1b64ca42e17b",
    "timestamp": "2026-06-26T12:30:32.749Z",
    "actor_id": "user-123",
    "action": "delete",
    "resource_type": "invoice",
    "resource_id": "inv-456",
    "before_state": null,
    "after_state": null,
    "ip_address": null,
    "user_agent": null
  }
}
```

**Error (400):**

```json
{
  "ok": false,
  "event": null,
  "errors": [
    {
      "field": "actor_id",
      "message": "actor_id is required.",
      "code": "MISSING_FIELD"
    }
  ]
}
```

---

### POST `/events` — Recording a state change

Use `before_state` and `after_state` to capture what changed:

```bash
curl -X POST http://localhost:3000/events \
  -H "Content-Type: application/json" \
  -d '{
    "actor_id": "user-123",
    "action": "update",
    "resource_type": "invoice",
    "resource_id": "inv-456",
    "before_state": { "status": "draft", "amount": 5000 },
    "after_state": { "status": "approved", "amount": 5000 }
  }'
```

**Success (201):**

```json
{
  "ok": true,
  "event": {
    "id": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
    "timestamp": "2026-06-26T13:15:00.000Z",
    "actor_id": "user-123",
    "action": "update",
    "resource_type": "invoice",
    "resource_id": "inv-456",
    "before_state": { "status": "draft", "amount": 5000 },
    "after_state": { "status": "approved", "amount": 5000 },
    "ip_address": null,
    "user_agent": null
  }
}
```

---

### POST `/events/bulk` — Record events atomically

Batch up to 100 events. All succeed or all fail.

```bash
curl -X POST http://localhost:3000/events/bulk \
  -H "Content-Type: application/json" \
  -d '{
    "events": [
      {"actor_id": "user-1", "action": "create", "resource_type": "order", "resource_id": "ord-001"},
      {"actor_id": "user-1", "action": "update", "resource_type": "order", "resource_id": "ord-002"},
      {"actor_id": "user-2", "action": "delete", "resource_type": "order", "resource_id": "ord-003"}
    ]
  }'
```

**Success (201):**

```json
{
  "ok": true,
  "events": ["...array of stored events..."],
  "count": 3
}
```

---

### GET `/events` — Query events

Retrieve events with optional filters.

| Parameter       | Description             | Example                  |
| --------------- | ----------------------- | ------------------------ |
| `actor_id`      | Filter by actor         | `?actor_id=user-123`     |
| `action`        | Filter by action        | `?action=delete`         |
| `resource_type` | Filter by resource type | `?resource_type=invoice` |
| `resource_id`   | Filter by resource ID   | `?resource_id=inv-456`   |
| `from`          | Start date (ISO 8601)   | `?from=2026-01-01`       |
| `to`            | End date (ISO 8601)     | `?to=2026-12-31`         |

Filters can be combined.

```bash
# All events
curl http://localhost:3000/events

# Filter by actor
curl "http://localhost:3000/events?actor_id=user-123"

# Combine filters
curl "http://localhost:3000/events?actor_id=user-123&action=delete&from=2026-01-01"
```

**Pagination:**

```bash
curl "http://localhost:3000/events?limit=10&offset=0"  # first page
curl "http://localhost:3000/events?limit=10&offset=10" # second page
```

Responses include pagination metadata:

```json
{
  "pagination": {
    "total": 150,
    "limit": 10,
    "offset": 0,
    "has_more": true
  }
}
```

---

### GET `/events/:id` — Get a single event

```bash
curl http://localhost:3000/events/5383db82-f735-4be7-a995-1b64ca42e17b
```

---

### GET `/events/:id/verify` — Verify event integrity

Each event is signed with HMAC-SHA256 using a server secret. This detects tampering at the database level.

```bash
curl http://localhost:3000/events/5383db82-f735-4be7-a995-1b64ca42e17b/verify
```

**Intact:**

```json
{
  "ok": true,
  "event_id": "5383db82-f735-4be7-a995-1b64ca42e17b",
  "verified": true,
  "status": "intact"
}
```

**Tampered:**

```json
{
  "ok": true,
  "event_id": "5383db82-f735-4be7-a995-1b64ca42e17b",
  "verified": false,
  "status": "tampered"
}
```

**What signing protects against:**

- Direct database modifications (someone editing records manually)
- Bypassing the API to change records
- Accidental data corruption

**What signing does NOT protect against:**

- An attacker who knows the secret key
- Deleting entire records (detection only, not prevention)
- API-level attacks (handled separately by write-only enforcement)

---

## Why Write-Only

This API deliberately exposes no `UPDATE`, `PUT`, `PATCH`, or `DELETE` endpoints for events. This is the central security property of the audit log.

**What this defends against:**

- **Insider threats** — a compromised admin account cannot erase their tracks
- **Accidental modifications** — no one can accidentally overwrite audit data
- **API-level attacks** — even with valid credentials, events cannot be modified through the API
- **Compliance requirements** — many regulations require immutable audit trails

**What this does NOT defend against:**

- Direct database access (addressed by HMAC signing)
- Denial of service (addressed by batch size limits)
- Event deletion at the database level (addressed by database access controls)

---

## Endpoints Summary

| Method | Path                 | Description                        |
| ------ | -------------------- | ---------------------------------- |
| `POST` | `/events`            | Record a single event              |
| `POST` | `/events/bulk`       | Record events atomically (max 100) |
| `GET`  | `/events`            | Query events with filters          |
| `GET`  | `/events/:id`        | Get a specific event               |
| `GET`  | `/events/:id/verify` | Verify event integrity             |
| `GET`  | `/health`            | Health check                       |

### Status Codes

| Code  | Meaning                                     |
| ----- | ------------------------------------------- |
| `200` | Success (GET requests)                      |
| `201` | Created (POST requests)                     |
| `400` | Bad request (validation errors)             |
| `404` | Not found                                   |
| `405` | Method not allowed (write-only enforcement) |
| `500` | Internal server error                       |

The full API specification is available in `openapi.yaml`.

---

## Known Limitations

- **No authentication** — this service has no built-in auth. In production, deploy behind an API gateway and protect routes with JWT or mTLS at the gateway layer.
- **No event deletion** — events cannot be deleted through the API, even for GDPR right-to-erasure requests. Handle erasure at the database level with access controls.
- **Signature verification speed** — verification requires re-reading the full event and recomputing HMAC.
- **Single database** — no replication or clustering built in.
- **Batch limit** — maximum 100 events per bulk request to prevent memory exhaustion.
- **No real-time streaming** — clients must poll for new events.
