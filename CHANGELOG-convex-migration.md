# Changelog — SSE → Convex Live Queries Migration

**Date:** February 8, 2026

## Overview

Replaced the Server-Sent Events (SSE) real-time data layer with Convex live queries. The frontend now connects directly to Convex Cloud via WebSocket for instant push updates, eliminating the backend polling loop and SSE infrastructure entirely.

## Why

The old SSE system had several drawbacks:

| Problem                    | Detail                                                                                                                   |
| -------------------------- | ------------------------------------------------------------------------------------------------------------------------ |
| **2-second polling loop**  | Backend polled Convex 4× per cycle (emails, links, senders, tags) per connected client in an infinite `while(true)` loop |
| **Naive change detection** | Hash was `count:latestCreationTime` — missed in-place updates that didn't change count or newest item                    |
| **Auth via query param**   | `EventSource` can't set headers, so the token was passed as a query parameter                                            |
| **Backend as middleman**   | The Hono server sat between the frontend and Convex, adding latency and server load with no value add                    |

Convex live queries solve all of these:

- **Instant updates** — Convex pushes changes over WebSocket the moment data changes
- **Efficient** — only re-runs queries when their underlying data actually changes
- **Direct connection** — frontend talks to Convex Cloud directly, no backend intermediary
- **No auth workaround** — no token in URL needed

## What Changed

### New Files

| File                         | Purpose                                                                                                    |
| ---------------------------- | ---------------------------------------------------------------------------------------------------------- |
| `frontend/.env.local`        | Added `VITE_CONVEX_URL` pointing to the Convex deployment                                                  |
| `frontend/src/lib/convex.ts` | `ConvexClient` wrapper with `liveQuery()` helper — creates Svelte readable stores backed by Convex sources |

### Modified Files

| File                                             | Change                                                                                                                                    |
| ------------------------------------------------ | ----------------------------------------------------------------------------------------------------------------------------------------- |
| `frontend/svelte.config.js`                      | Added `@convex` path alias → `../backend/convex/_generated`                                                                               |
| `frontend/vite.config.ts`                        | No change needed (SvelteKit alias handles both vite + TS)                                                                                 |
| `frontend/src/routes/(app)/+layout.svelte`       | Removed SSE `connect()`/`disconnect()` lifecycle, removed `liveData` import, removed `onDestroy`                                          |
| `frontend/src/routes/(app)/inbox/+page.svelte`   | Replaced `liveData.emails` SSE source with `liveQuery(api.emails.listByUser, ...)`                                                        |
| `frontend/src/routes/(app)/sources/+page.svelte` | Replaced `liveData.senders` with Convex live queries for both `senders.listByUser` and `tags.listByUser`, added client-side tag hydration |
| `frontend/src/routes/(app)/links/+page.svelte`   | Same pattern as sources — live queries + client-side hydration                                                                            |
| `frontend/src/routes/(app)/digests/+page.svelte` | Added Convex live query (digests didn't have SSE before, now they get live updates too)                                                   |
| `frontend/README.md`                             | Updated architecture diagram, store docs, design decisions, env vars                                                                      |
| `backend/AGENTS.MD`                              | Updated summary to reflect removal of SSE                                                                                                 |
| `backend/src/index.ts`                           | Removed `streamRoutes` import and `/stream` route mount                                                                                   |

### Deleted Files

| File                                | What it was                                                                                         |
| ----------------------------------- | --------------------------------------------------------------------------------------------------- |
| `frontend/src/lib/stores/stream.ts` | SSE `EventSource` store — writable stores for emails/senders/links/tags, connect/disconnect methods |
| `backend/src/routes/stream.ts`      | Hono SSE endpoint — polled Convex every 2s, compared naive hashes, streamed named events            |

## Architecture Before vs After

### Before (SSE)

```
Frontend ──EventSource──▶ Hono Backend ──poll every 2s──▶ Convex
                              │
                         hash compare
                              │
                    SSE push if changed
```

- Backend maintained a polling loop per connected client
- 4 Convex queries per poll cycle × every 2 seconds
- Change detection: `${count}:${latestCreationTime}` (missed many real changes)

### After (Convex Live Queries)

```
Frontend ──WebSocket──▶ Convex Cloud
     │
     └── fetch ──▶ Hono Backend (mutations only)
```

- Frontend connects directly to Convex via `ConvexClient`
- Convex pushes updates instantly when underlying data changes
- Backend is only used for auth, mutations, email ingestion, and digest delivery

## Pattern Used in Consumer Pages

Each list page follows this pattern:

```typescript
// 1. Import the live query helper and Convex API
import { liveQuery, api } from "$lib/convex";

// 2. Get the userId from the auth store
const userId = $auth.user?.id;

// 3. Create a live query source
const live = userId
  ? liveQuery(api.emails.listByUser, { userId: userId as any }, [])
  : null;

// 4. Bridge into Svelte reactivity
let liveEmails = $state<Email[]>([]);
const unsub = live?.subscribe((v: any[]) => {
  if (v.length > 0) liveEmails = v;
});

// 5. Prefer live data, fall back to page-load data
let emails = $derived<Email[]>(
  liveEmails.length > 0 ? liveEmails : data.emails,
);

// 6. Clean up on destroy
onDestroy(() => {
  unsub?.();
  live?.destroy();
});
```

For senders and links, an additional `tags.listByUser` source is created and tags are hydrated client-side by joining `tagIds` → tag objects via a `Map`.

## Tag Hydration

The old SSE backend used `hydrateItems()` server-side to replace `tagIds` arrays with full tag objects before streaming. With Convex live queries, the raw Convex data includes `tagIds` (not hydrated tags), so hydration now happens on the frontend:

```typescript
function hydrateSenders(senders: any[], tags: any[]): Sender[] {
  const tagMap = new Map(tags.map((t) => [t._id, t]));
  return senders.map((s) => ({
    ...s,
    tags: (s.tagIds ?? []).map((id) => tagMap.get(id)).filter(Boolean),
  }));
}
```

Both the senders and tags sources are live, so when a tag is renamed or a sender's tags change, the hydrated view updates instantly.

## What Was NOT Changed

- **`+page.ts` load functions** — Still fetch initial data from the Hono REST API. This provides instant data on page load while the Convex WebSocket connection initializes.
- **Backend REST routes** — All CRUD routes (`/email`, `/sender`, `/link`, `/tag`, `/digest`, `/auth`) remain unchanged. Mutations still go through the Hono backend.
- **Convex functions** — No changes to any Convex query/mutation definitions.
- **Auth flow** — Unchanged. The Convex live query connection doesn't require auth — it uses the plain `userId` string to subscribe to user-scoped queries.
