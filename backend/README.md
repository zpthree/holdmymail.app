# Hold My Mail — Backend

A Hono + Bun API server that receives inbound email via Postmark webhooks, holds it for users, and delivers scheduled digest emails. Uses Convex as the database and real-time backend.

## Architecture Overview

```
┌──────────────┐     Postmark Webhook      ┌────────────────┐
│   Inbound    │ ─────── POST /mail ──────▶ │   Hono Server  │
│   Email      │                            │   (Bun runtime) │
└──────────────┘                            │   Port 3000     │
                                            │                 │
┌──────────────┐     REST API + SSE         │  Routes:        │
│   SvelteKit  │ ◀════════════════════════▶ │  /auth          │
│   Frontend   │                            │  /email         │
└──────────────┘                            │  /sender        │
                                            │  /tag           │
                                            │  /link          │
                                            │  /digest        │
                                            │  /mail          │
                                            │  /stream (SSE)  │
                                            └───────┬─────────┘
                                                    │
                                            ConvexHttpClient
                                                    │
                                            ┌───────▼─────────┐
                                            │   Convex Cloud   │
                                            │   (Database +    │
                                            │    Cron Jobs +   │
                                            │    Actions)      │
                                            └──────────────────┘
```

## Tech Stack

| Layer      | Technology                          |
|------------|-------------------------------------|
| Runtime    | [Bun](https://bun.sh)               |
| Framework  | [Hono](https://hono.dev) v4          |
| Database   | [Convex](https://convex.dev) (cloud) |
| Email      | [Postmark](https://postmarkapp.com)  |
| Language   | TypeScript (ES2022)                  |

## Project Structure

```
backend/
├── src/
│   ├── index.ts              # Hono app entry point, mounts all routes
│   ├── convex.ts             # ConvexHttpClient singleton + re-exports api
│   ├── db.ts                 # Legacy in-memory store (unused, kept for reference)
│   ├── types.ts              # Legacy type definitions (unused)
│   ├── tags.ts               # Tag hydration utilities (resolveTagNames, hydrateItems)
│   ├── middleware/
│   │   └── auth.ts           # Bearer token auth middleware
│   ├── routes/
│   │   ├── auth.ts           # Registration, login, logout, token refresh, user CRUD
│   │   ├── email.ts          # Email CRUD, mark-read, schedule, bulk delete
│   │   ├── mail.ts           # Postmark inbound webhook handler + scheduling logic
│   │   ├── sender.ts         # Sender (subscription) CRUD with tag hydration
│   │   ├── tag.ts            # Tag CRUD
│   │   ├── link.ts           # Link CRUD with OG metadata fetching
│   │   ├── digest.ts         # Digest listing and retrieval
│   │   └── stream.ts         # SSE endpoint for real-time data push
│   └── emails/
│       └── digest.ts         # Digest HTML email template (Hono preview version)
├── convex/
│   ├── schema.ts             # Convex database schema (tables, indexes)
│   ├── users.ts              # User queries/mutations + token management
│   ├── emails.ts             # Email queries/mutations + digest delivery action
│   ├── senders.ts            # Sender queries/mutations (cascade-deletes emails)
│   ├── tags.ts               # Tag queries/mutations + resolveNames
│   ├── links.ts              # Link queries/mutations
│   ├── digests.ts            # Digest creation (internal) + listing
│   ├── digestTemplate.ts     # Digest HTML email template (Convex delivery version)
│   ├── crons.ts              # Convex cron job definitions
│   └── migrations.ts         # Data migration utilities
├── package.json
└── tsconfig.json
```

## Core Concepts

### Email Lifecycle

1. **Inbound**: Postmark forwards email to `POST /mail`. The handler extracts the username from the `To` address (e.g., `user1@inbox.holdmymail.app`), looks up the user, auto-creates the sender if new, and stores the email in Convex.

2. **Scheduling**: Each email gets a `scheduledFor` timestamp based on the sender's digest preferences (if set), falling back to the user's global preferences. Supported frequencies: `realtime`, `daily`, `weekly`, `monthly`. All scheduling respects the user's IANA timezone.

3. **Digest Delivery**: A Convex cron job periodically runs `deliverDueEmails`, which queries for emails where `scheduledFor <= now` and `delivered === false`. Emails are grouped by user, rendered into an HTML digest, sent via Postmark, and marked as delivered.

4. **Confirmation Emails**: Emails with "confirm" in the subject are scheduled normally. When a user reads one in the app, `markRead` clears its `scheduledFor` so it drops out of the next digest (they already saw it).

### Authentication

- **Token-based**: Users register/login and receive a UUID token stored in a `tokens` table with a 30-day expiry.
- **Middleware**: `authMiddleware` validates the `Authorization: Bearer <token>` header and sets `userId` on the Hono context. Applied to all routes except `/mail` (webhook) and `/auth/register|login`.
- **Password hashing**: Uses Bun's built-in `Bun.password.hash()` / `Bun.password.verify()` (Argon2).

### Real-time Updates (SSE)

The `/stream` endpoint provides Server-Sent Events for live data:
- Authenticates via query param (`?token=...`) since `EventSource` can't set headers
- Polls Convex every 2 seconds, compares hashes of each data type
- Emits `emails`, `senders`, `links`, and `tags` events only when data changes
- The frontend subscribes and merges live data with initial page-load data

### Tag System

Tags are user-scoped labels that can be attached to senders and links:
- **Resolution**: `resolveTagNames()` accepts string names and creates any that don't exist yet
- **Hydration**: `hydrateItems()` replaces `tagIds` arrays with full tag objects before sending to the client
- Tags flow through to digest emails, where emails are grouped by their sender's primary tag

## Database Schema

### Tables

| Table     | Purpose                                  | Key Indexes                     |
|-----------|------------------------------------------|---------------------------------|
| `users`   | User accounts + digest preferences       | `by_email`, `by_username`       |
| `tokens`  | Auth tokens (UUID, 30-day expiry)        | `by_token`                      |
| `emails`  | Stored inbound emails                    | `by_user`, `by_sender`          |
| `senders` | Known email senders (subscriptions)      | `by_user`, `by_user_email`      |
| `tags`    | User-scoped labels                       | `by_user`, `by_user_name`       |
| `links`   | Saved bookmarks with OG metadata         | `by_user`                       |
| `digests` | Sent digest records                      | `by_user`                       |

### Key Fields

**users**: `email`, `passwordHash`, `username`, `digestFrequency` (daily/weekly/monthly/none), `digestDay`, `digestTime`, `timezone`

**emails**: `userId`, `senderId`, `fromEmail`, `subject`, `htmlBody`, `textBody`, `read`, `scheduledFor`, `delivered`

**senders**: `userId`, `email`, `name`, `color`, `tagIds[]`, `digestFrequency` (realtime/daily/weekly/monthly), `digestDay`, `digestTime`

## API Reference

### Public Routes

| Method | Endpoint          | Description                          |
|--------|-------------------|--------------------------------------|
| GET    | `/`               | Welcome message                      |
| GET    | `/health`         | Health check                         |
| POST   | `/mail`           | Postmark inbound webhook             |
| GET    | `/preview/digest` | Digest email template preview (dev)  |

### Auth Routes (`/auth`)

| Method | Endpoint         | Description                  |
|--------|------------------|------------------------------|
| POST   | `/auth/register` | Create account               |
| POST   | `/auth/login`    | Login, returns token         |
| POST   | `/auth/logout`   | Invalidate token             |
| POST   | `/auth/token`    | Mint new token from existing |
| GET    | `/auth/:id`      | Get user profile             |
| PUT    | `/auth/:id`      | Update user profile          |
| DELETE | `/auth/:id`      | Delete account               |

### Email Routes (`/email`) — Auth Required

| Method | Endpoint            | Description             |
|--------|---------------------|-------------------------|
| GET    | `/email`            | List all emails         |
| POST   | `/email`            | Create email manually   |
| GET    | `/email/:id`        | Get single email        |
| PATCH  | `/email/:id/read`   | Mark email as read      |
| POST   | `/email/schedule`   | Schedule email delivery |
| DELETE | `/email/:id`        | Delete email            |
| DELETE | `/email/bulk`       | Bulk delete emails      |

### Sender Routes (`/sender`) — Auth Required

| Method | Endpoint       | Description                   |
|--------|----------------|-------------------------------|
| GET    | `/sender`      | List all senders              |
| POST   | `/sender`      | Create sender                 |
| GET    | `/sender/:id`  | Get sender details            |
| PUT    | `/sender/:id`  | Update sender (prefs, tags)   |
| DELETE | `/sender/:id`  | Delete sender + cascade emails|

### Tag Routes (`/tag`) — Auth Required

| Method | Endpoint    | Description   |
|--------|-------------|---------------|
| GET    | `/tag`      | List all tags |
| POST   | `/tag`      | Create tag    |
| PUT    | `/tag/:id`  | Update tag    |
| DELETE | `/tag/:id`  | Delete tag    |

### Link Routes (`/link`) — Auth Required

| Method | Endpoint     | Description                         |
|--------|--------------|-------------------------------------|
| GET    | `/link`      | List all links                      |
| POST   | `/link`      | Create link (auto-fetches OG data)  |
| GET    | `/link/:id`  | Get link details                    |
| PUT    | `/link/:id`  | Update link                         |
| DELETE | `/link/:id`  | Delete link                         |
| DELETE | `/link/bulk` | Bulk delete links                   |

### Digest Routes (`/digest`) — Auth Required

| Method | Endpoint      | Description        |
|--------|---------------|--------------------|
| GET    | `/digest`     | List all digests   |
| GET    | `/digest/:id` | Get digest details |

### SSE Stream (`/stream`)

| Method | Endpoint                | Description                        |
|--------|-------------------------|------------------------------------|
| GET    | `/stream?token=<token>` | Real-time SSE stream of all data   |

Events: `emails`, `senders`, `links`, `tags`

## Digest Templates

There are **two copies** of the digest HTML template that must be kept in sync:

1. **`src/emails/digest.ts`** — Used by the Hono server for the `/preview/digest` route. Does not include email links.
2. **`convex/digestTemplate.ts`** — Used by the Convex `deliverDueEmails` action. Includes clickable links to each email in the app (via `process.env.FRONTEND_URL`).

Both produce the same visual layout: logo → header → date/count → tag-grouped email list → CTA button → footer.

## Environment Variables

| Variable                | Description                                |
|-------------------------|--------------------------------------------|
| `CONVEX_URL`            | Convex deployment URL (required)           |
| `POSTMARK_SERVER_TOKEN` | Postmark API token for sending digests     |
| `FRONTEND_URL`          | Frontend URL for digest email links        |

## Getting Started

```bash
# Install dependencies
bun install

# Start Convex dev server (separate terminal)
npx convex dev

# Start the Hono server with hot reload
bun run dev
```

The server starts at `http://localhost:3000`.

## Key Design Decisions

- **Convex as primary database**: All data lives in Convex. The Hono server acts as an API gateway, using `ConvexHttpClient` to read/write. Convex also runs cron jobs and internal actions (digest delivery) server-side.
- **SSE over WebSockets**: Server-Sent Events chosen for simplicity — polling Convex every 2s with change detection via hashes. One-way data flow (server → client).
- **Sender-level digest overrides**: Each sender can have its own frequency/day/time, overriding the user's global settings. This lets users batch newsletters weekly but get transactional emails in real-time.
- **Cascade deletes**: Deleting a sender also deletes all emails from that sender.
- **Auto-create senders**: First email from an unknown address automatically creates a sender record.
