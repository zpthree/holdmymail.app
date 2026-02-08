# Hold My Mail — Frontend

A SvelteKit 2 + Svelte 5 single-page application for managing held emails, sources, saved links, and digest history. Communicates with the Hono/Bun backend API for mutations and receives real-time updates via Convex live queries.

## Architecture Overview

```
┌─────────────────────────────────────────────────────┐
│                   SvelteKit App                      │
│                                                     │
│  ┌─────────────┐   ┌──────────────┐   ┌──────────┐ │
│  │  Root Layout │──▶│  (app) Layout│──▶│  Pages   │ │
│  │  Session     │   │  Auth Guard  │   │  Inbox   │ │
│  │  Restore     │   │  Gate render │   │  Subs    │ │
│  │  <Header>    │   │              │   │  Links   │ │
│  └─────────────┘   └──────────────┘   │  Digests │ │
│                                        │  User    │ │
│  ┌─────────────┐                      └──────────┘ │
│  │  Auth Layout │                                   │
│  │  Redirect if │──▶  Login / Register / etc.       │
│  │  logged in   │                                   │
│  └─────────────┘                                    │
│                                                     │
│  ┌────────────────────────────────────────────────┐ │
│  │              Stores / Data                     │ │
│  │  auth (writable) — user, token, loading        │ │
│  │  convex (live)  — emails, senders, links, tags │ │
│  └────────────────────────────────────────────────┘ │
│                      │              │               │
│                    fetch       Convex WS             │
│                      │              │               │
└──────────────────────┼──────────────┼───────────────┘
                       │              │
               ┌───────▼───────┐  ┌───▼──────────────┐
               │  Hono Backend │  │  Convex Cloud    │
               │  localhost:3000│  │  (live queries)  │
               └───────────────┘  └──────────────────┘
```

## Tech Stack

| Layer      | Technology                                   |
| ---------- | -------------------------------------------- |
| Framework  | [SvelteKit](https://svelte.dev/docs/kit) v2  |
| UI Library | [Svelte](https://svelte.dev) v5 (runes)      |
| Build      | [Vite](https://vitejs.dev) v7                |
| Language   | TypeScript                                   |
| Styling    | Vanilla CSS with custom properties           |
| Fonts      | Playfair Display (serif), Rubik (sans-serif) |

## Project Structure

```
frontend/
├── src/
│   ├── app.html                        # HTML shell
│   ├── app.d.ts                        # SvelteKit type augmentations
│   ├── lib/
│   │   ├── api.ts                      # API client — typed wrappers for all endpoints
│   │   ├── convex.ts                   # Convex client — live query store helper
│   │   ├── index.ts                    # Lib barrel export
│   │   ├── stores/
│   │   │   └── auth.ts                 # Auth store (user, token, loading)
│   │   ├── components/
│   │   │   ├── Header.svelte           # Global nav bar with tab navigation
│   │   │   └── Logo.svelte             # SVG logo component
│   │   └── assets/
│   │       └── css/
│   │           ├── main.css            # CSS entry point (imports theme + core)
│   │           └── common/
│   │               ├── theme.css       # CSS custom properties (colors, fonts, sizes)
│   │               ├── core.css        # Box-sizing reset, body defaults
│   │               └── typography.css  # Font faces / typography rules
│   └── routes/
│       ├── +layout.svelte              # Root layout — session restore, <Header>, CSS
│       ├── auth/
│       │   ├── +layout.svelte          # Auth layout — redirects to / if logged in
│       │   ├── login/+page.svelte
│       │   ├── register/+page.svelte
│       │   ├── logout/+page.svelte
│       │   ├── forgot-password/+page.svelte
│       │   ├── reset-password/+page.svelte
│       │   └── verify-email/+page.svelte
│       └── (app)/
│           ├── +layout.svelte          # App layout — auth guard
│           ├── +page.svelte            # Root redirect → /inbox
│           ├── +page.ts                # Redirect logic
│           ├── inbox/
│           │   ├── +page.svelte        # Email list (grouped by date)
│           │   ├── +page.ts            # Load emails
│           │   └── [uid]/
│           │       ├── +page.svelte    # Email detail (iframe for HTML body)
│           │       └── +page.ts        # Load email + mark read
│           ├── sources/
│           │   ├── +page.svelte        # Sender list with avatars + tags
│           │   ├── +page.ts            # Load senders
│           │   └── [uid]/
│           │       ├── +page.svelte    # Sender detail + email history
│           │       ├── +page.ts        # Load sender + emails
│           │       └── edit/
│           │           └── +page.svelte # Edit sender (name, color, tags, digest prefs)
│           ├── links/
│           │   ├── +page.svelte        # Saved links list with OG previews
│           │   ├── +page.ts            # Load links
│           │   └── [uid]/
│           │       ├── +page.svelte    # Link detail
│           │       └── +page.ts        # Load link
│           └── digests/
│               ├── +page.svelte        # Digest history list
│               ├── +page.ts            # Load digests
│               └── [uid]/
│                   ├── +page.svelte    # Digest detail (rendered HTML)
│                   └── +page.ts        # Load digest
├── static/
│   └── robots.txt
├── svelte.config.js                    # SvelteKit config (adapter-auto, @convex alias)
├── vite.config.ts                      # Vite config (allowed hosts)
├── tsconfig.json
└── package.json
```

## Core Concepts

### Authentication Flow

```
┌──────────┐     POST /auth/login      ┌──────────┐
│  Login   │ ────────────────────────▶  │  Backend │
│  Page    │ ◀────── { token, userId }  │          │
└────┬─────┘                            └──────────┘
     │
     │  setAuth(user, token)
     │  └─ localStorage: token, userId, username, timezone
     │  └─ auth store: { user, token, loading: false }
     │
     ▼
  goto("/")  →  (app)/+page.ts  →  redirect("/inbox")
```

**Session Restore** (root `+layout.svelte`):

- On mount, reads `token` and `userId` from `localStorage`
- If found, calls `GET /auth/:id` to validate and hydrate the user
- On failure, clears auth state → redirects to login

**Auth Guard** (`(app)/+layout.svelte`):

- Uses `$effect` to watch `$auth` store
- If `!loading && !token` → redirect to `/auth/login`
- Renders children only when `token` exists (prevents flash)

**Reverse Guard** (`auth/+layout.svelte`):

- If `!loading && token` → redirect to `/` (skip for `/auth/logout`)
- Shows empty div while loading or if token exists (prevents flash of auth page)

### State Management

#### Auth Store (`$lib/stores/auth.ts`)

```typescript
{ user: User | null, token: string | null, loading: boolean }
```

- `setAuth(user, token)` — saves to store + `localStorage`
- `clearAuth()` — wipes store + `localStorage`
- `loading: true` initially, set to `false` after session restore completes

#### Convex Live Queries (`$lib/convex.ts`)

Provides a `liveQuery()` helper that creates a Svelte readable store backed by a Convex live query subscription:

```typescript
import { liveQuery, api } from "$lib/convex";

// Subscribe to a Convex query — auto-updates when data changes
const live = liveQuery(api.emails.listByUser, { userId }, []);

// Use as a Svelte store
const unsub = live.subscribe((emails) => { ... });

// Clean up
live.destroy();
```

- Uses `ConvexClient` which maintains a WebSocket connection to Convex Cloud
- Each page subscribes to its own queries directly (no centralized store)
- Pages merge live data with initial page-load data for instant renders:

```typescript
let emails = $derived(liveEmails.length > 0 ? liveEmails : data.emails);
```

- For senders and links, tags are hydrated client-side by subscribing to both the entity query and `tags.listByUser`, then joining `tagIds` to tag objects
- The `@convex` import alias points to `../backend/convex/_generated` (configured in `svelte.config.js`)

### API Client (`$lib/api.ts`)

A typed wrapper around `fetch` that handles:

- Base URL from `VITE_API_URL` (defaults to `http://localhost:3000`)
- Bearer token injection
- JSON serialization/deserialization
- Error extraction from response body

Organized into namespaced objects: `authApi`, `emailApi`, `senderApi`, `linkApi`, `tagApi`, `digestApi`.

### Page Data Loading

All `+page.ts` loaders follow the same pattern:

1. Check `browser` — return empty data during SSR
2. Read `token` from `localStorage`
3. Call the API and return typed data
4. Pages use the data as initial state, then merge with Convex live query data

This is a **client-side only** approach — no server-side rendering of authenticated content. The `localStorage` auth model prevents SSR data loading.

### Email Rendering

Email HTML bodies are rendered in a sandboxed `<iframe>`:

```html
<iframe
  sandbox="allow-same-origin allow-popups allow-popups-to-escape-sandbox"
  srcdoc="{email.htmlBody}"
/>
```

- `allow-same-origin` — enables height measurement via `contentDocument`
- `allow-popups` + `allow-popups-to-escape-sandbox` — allows links to open in new tabs
- Scripts remain blocked for security
- Auto-height: on load, sets `iframe.style.height` to `scrollHeight`

## Design System

### CSS Custom Properties

Defined in `common/theme.css`:

| Property                            | Value                                 |
| ----------------------------------- | ------------------------------------- |
| `--black`                           | `#000`                                |
| `--white`                           | `#fff`                                |
| `--offwhite`                        | `oklch(99.06% 0.01 78.28)`            |
| `--accent`                          | `oklch(47.72% 0.19 23.59)` (deep red) |
| `--font-serif`                      | Playfair Display, serif               |
| `--font-sans`                       | Rubik, sans-serif                     |
| `--container-width`                 | `768px`                               |
| `--br-sm` / `--br-lg` / `--br-full` | `0.25rem` / `1rem` / `999px`          |

Font sizes use fluid `clamp()` scaling from `--fs-sm` through `--fs-headline`.

### Navigation

The `<Header>` component is a fixed top bar with a pill-shaped nav:

- Logo (left), tabs (center), user avatar (right)
- Tabs: **Inbox**, **Digests**, **Sources**, **Links**
- Active tab detection via `$page.url.pathname`
- "Alpha" badge in the top-left corner

### Layout Pattern

- Fixed header with `padding-top: 5rem` on `#main` to offset
- Content constrained to `max-width: var(--container-width)` (768px)
- Dark theme nav bar with white text, white background content areas
- Card-style detail views with thick black borders and rounded corners

## Route Map

| Path                    | View               | Description                           |
| ----------------------- | ------------------ | ------------------------------------- |
| `/`                     | Redirect           | → `/inbox` if logged in               |
| `/auth/login`           | Login form         | Email + password                      |
| `/auth/register`        | Register form      | Email + password + username           |
| `/auth/logout`          | Logout             | Clears session                        |
| `/auth/forgot-password` | Forgot password    | Email input                           |
| `/auth/reset-password`  | Reset password     | New password form                     |
| `/auth/verify-email`    | Email verification | Verification flow                     |
| `/inbox`                | Email list         | Grouped by date, select + bulk delete |
| `/inbox/:uid`           | Email detail       | Full email with iframe HTML body      |
| `/sources`              | Sender list        | Colored avatars, tags                 |
| `/sources/:uid`         | Sender detail      | Sender info + email history           |
| `/sources/:uid/edit`    | Edit sender        | Name, color, tags, digest prefs       |
| `/links`                | Link list          | OG metadata previews                  |
| `/links/:uid`           | Link detail        | Full OG card                          |
| `/digests`              | Digest history     | List of sent digests                  |
| `/digests/:uid`         | Digest detail      | Rendered HTML digest                  |

## Environment Variables

| Variable          | Description                                        |
| ----------------- | -------------------------------------------------- |
| `VITE_API_URL`    | Backend API URL (default: `http://localhost:3000`) |
| `VITE_CONVEX_URL` | Convex deployment URL for live queries             |

## Getting Started

```bash
# Install dependencies
npm install

# Start dev server
npm run dev
```

The app runs at `http://localhost:5173` by default.

Ensure the backend is running at the URL specified by `VITE_API_URL`.

## Key Design Decisions

- **Client-side auth only**: Tokens in `localStorage`, no cookies. This means no SSR for authenticated routes — all data loading happens in the browser. Trade-off: simpler implementation, no CSRF concerns, but no server-side rendering benefits.
- **Convex live queries for real-time data**: The frontend connects directly to Convex Cloud via WebSocket using `ConvexClient`. Each list page subscribes to the relevant Convex query (e.g., `emails.listByUser`), getting instant push updates when data changes — no polling, no intermediate server. Senders and links hydrate tags client-side.
- **Svelte 5 runes**: Uses `$state`, `$derived`, `$effect`, `$props` throughout. Auth store still uses Svelte 4 `writable` for cross-component reactivity.
- **Sandboxed iframes for email**: HTML email bodies are isolated in sandboxed iframes to prevent style bleed and XSS while still allowing link clicks.
- **Dual auth guards**: `(app)/+layout.svelte` protects app routes (requires auth), `auth/+layout.svelte` protects auth routes (redirects if already authed). Both use the same `$auth` store to avoid timing mismatches.
- **No SSR data**: All `+page.ts` loaders gate on `browser` and return empty arrays during SSR. This avoids hydration mismatches and keeps auth client-side.
