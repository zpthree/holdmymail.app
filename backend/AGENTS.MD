# Hold My Mail application

## Summary

The Hold My Mail application is a web application that receives mail and holds it for the user until they are ready to view it.

The application allows users to set up schedules so the mail they receive at Hold My Mail gets delivered to their actual inbox.

The Hono backend handles authentication, REST API endpoints (with cursor-based pagination for list endpoints), email ingestion, and digest delivery. The frontend communicates exclusively via REST — there are no real-time push connections (SSE or WebSocket) from the backend to the frontend.

## Features

- Receive and hold mail for users.
- Schedule mail delivery to the user's actual inbox.
- View held mail at any time.
- Cursor-based pagination for email, link, and digest list endpoints.
- Health check endpoint to ensure the service is running.

## Endpoints

- `GET /` - Returns a welcome message.
- `GET /health` - Returns the health status of the service.

## User Authentication

- `POST /auth/register` - Registers a new user.
- `POST /auth/login` - Authenticates a user and returns a token.
- `POST /auth/logout` - Logs out a user and invalidates the token.
- `POST /auth/token` - Mint a new token from an existing valid token.
- `GET /auth/:id` - Retrieves a specific user.
- `PUT /auth/:id` - Updates a specific user.
- `DELETE /auth/:id` - Deletes a specific user.

## Sender Handling

- `POST /sender` - Registers a new sender.
- `GET /sender` - Retrieves all registered senders.
- `GET /sender/:id` - Retrieves a specific sender.
- `DELETE /sender/:id` - Deletes a specific sender (cascade-deletes emails).
- `GET /sender/:id/emails` - Lightweight list (subject/date, no bodies) of emails from a sender.
- `PUT /sender/:id` - Updates a specific sender. Can add tags to group senders.

## Email Handling

- `POST /email` - Receives an email and holds it for the user.
- `GET /email` - Retrieves held emails for the user. Supports pagination via `?limit=N&cursor=C`.
- `GET /email/:id` - Retrieves a specific held email for the user.
- `PATCH /email/:id/read` - Marks an email as read.
- `POST /email/schedule` - Schedules the delivery of held emails to the user's actual inbox.
- `DELETE /email/:id` - Deletes a specific held email for the user.
- `DELETE /email/bulk` - Bulk deletes held emails.

## Digest

- `POST /digest` - Generates and sends a digest email for the user.
- `GET /digest` - Retrieves digests for the user. Supports pagination via `?limit=N&cursor=C`.
- `GET /digest/:id` - Retrieves a specific digest.

## Links

- `POST /link` - Receives a link and saves it in the database.
- `GET /link` - Retrieves all saved links. Supports pagination via `?limit=N&cursor=C`; with `?limit`, `?tag=name` (repeatable) filters to links with any of those tags.
- `GET /link/tags` - Retrieves the tags used across the user's links.
- `PATCH /link/bulk/visibility` - Hides/shows links on the public feed (`{ ids, hidden }`).
- `GET /link/:id` - Retrieves a specific saved link.
- `DELETE /link/:id` - Deletes a specific saved link.
- `DELETE /link/bulk` - Bulk deletes saved links.
- `PUT /link/:id` - Updates a specific saved link -- can add tags to group common links, or set `hidden` to hide it from the public feed.

## Public Links Feed

Users can make their links feed public by setting `linksPublic: true` via `PUT /auth/:id`. These endpoints need no auth and return 404 unless the feed is public. Links with `hidden: true` are excluded.

- `GET /public/:username` - Returns the username and the tags used on visible links.
- `GET /public/:username/links` - Paginated visible links (`?limit=N&cursor=C`, `?tag=name` repeatable).

## Pagination

List endpoints for emails, links, and digests support cursor-based pagination when the `?limit=` query parameter is present:

- `?limit=N` — Return at most N items (max 100, default 25)
- `?cursor=C` — Continue from a previous page's cursor

Response shape when paginated:

```json
{
  "items": [...],
  "cursor": "eyJ...",
  "hasMore": true
}
```

When `?limit` is omitted, the endpoint returns the full array (backwards-compatible).
