# Hold My Mail — Frontend

A SvelteKit 2 + Svelte 5 single-page application for managing held emails, sources, saved links, and digest history. Communicates with the Hono/Bun backend REST API for all data loading and mutations. List pages use cursor-based pagination with "Load More" buttons.

## Architecture Overview

```
┌─────────────────────────────────────────────────────┐
│                   SvelteKit App                      │
│                                                     │
│  ┌─────────────┐   ┌──────────────┐   ┌──────────┐ │
│  │  Root Layout │──▶│  (app) Layout│──▶│  Pages   │ │
│  │  Session     │   │  Auth Guard  │   │  Inbox   │ │
│  │  Restore     │   │  Gate render │   │  Sources │ │
│  │  <Header>    │   │              │   │  Links   │ │
│  └─────────────┘   └──────────────┘   │  Digests │ │
│                                        │  User    │ │
│  ┌─────────────┐                      └──────────┘ │
│  │  Auth Layout │                                   │
│  │  Redirect if │──▶  Login / Register / etc.       │
│  │  logged in   │                                   │
│  │  (skip for   │                                   │
│  │   /logout &  │                                   │
│  │   /ext-cb)   │                                   │
│  └─────────────┘                                    │
│                                                     │
│  ┌────────────────────────────────────────────────┐ │
│  │              Stores / Data                     │ │
│  │  auth (writable) — user, token, loading        │ │
│  │  constants   — PAGE_SIZE (shared)              │ │
│  └────────────────────────────────────────────────┘ │
│                      │                              │
│                    fetch (REST + pagination)         │
│                      │                              │
└──────────────────────┼──────────────────────────────┘
                       │
               ┌───────▼───────┐
               │  Hono Backend │
               │  localhost:3000│
               └───────────────┘
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
│   │   ├── constants.ts                # Shared constants (PAGE_SIZE)
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
│       │   │                           #   (skips redirect for /auth/logout & /auth/extension-callback)
│       │   ├── login/+page.svelte
│       │   ├── register/+page.svelte
│       │   ├── logout/+page.svelte
│       │   ├── forgot-password/+page.svelte
│       │   ├── reset-password/+page.svelte
│       │   ├── verify-email/+page.svelte
│       │   └── extension-callback/+page.svelte  # Chrome extension auth callback
│       └── (app)/
│           ├── +layout.svelte          # App layout — auth guard
│           ├── +page.svelte            # Root redirect → /inbox
│           ├── +page.ts                # Redirect logic
│           ├── inbox/
│           │   ├── +page.svelte        # Email list (grouped by date, paginated)
│           │   ├── +page.ts            # Load first page of emails
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
│           │   ├── +page.svelte        # Saved links list with OG previews (paginated)
│           │   ├── +page.ts            # Load first page of links
│           │   └── [uid]/
│           │       ├── +page.svelte    # Link detail
│           │       └── +page.ts        # Load link
│           └── digests/
│               ├── +page.svelte        # Digest history list (paginated)
│               ├── +page.ts            # Load first page of digests
│               └── [uid]/
│                   ├── +page.svelte    # Digest detail (rendered HTML)
│                   └── +page.ts        # Load digest
├── static/
│   └── robots.txt
├── svelte.config.js                    # SvelteKit config (adapter-auto)
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

- If `!loading && token` → redirect to `/` (skips for paths in `SKIP_REDIRECT`: `/auth/logout` and `/auth/extension-callback`)
- Shows empty div while loading or if token exists (prevents flash of auth page)

### State Management

#### Auth Store (`$lib/stores/auth.ts`)

```typescript
{ user: User | null, token: string | null, loading: boolean }
```

- `setAuth(user, token)` — saves to store + `localStorage`
- `clearAuth()` — wipes store + `localStorage`
- `loading: true` initially, set to `false` after session restore completes

#### Shared Constants (`$lib/constants.ts`)

```typescript
export const PAGE_SIZE = 25;
```

Centralized constant imported by all paginated `+page.ts` loaders and `+page.svelte` components to ensure consistent page sizes. SvelteKit restricts exports from `+page.ts` to specific names (`load`, `prerender`, etc.), so shared values live here instead.

### Pagination

List pages (Inbox, Links, Digests) use cursor-based pagination via the backend REST API. The Sources page does not paginate (smaller dataset).

#### Pattern

Each paginated page follows this pattern:

**`+page.ts` (loader)**:
```typescript
import { PAGE_SIZE } from "$lib/constants";

export const load: PageLoad = async () => {
  if (!browser) return { items: [], cursor: null, hasMore: false };
  const token = localStorage.getItem("token");
  if (!token) return { items: [], cursor: null, hasMore: false };

  const result = await emailApi.listPaginated(token, PAGE_SIZE);
  return {
    emails: result.items,
    cursor: result.hasMore ? result.cursor : null,
    hasMore: result.hasMore,
  };
};
```

**`+page.svelte` (component)**:
```typescript
import { PAGE_SIZE } from "$lib/constants";

let { data } = $props();

// Extra items accumulated from "Load More" clicks
let extraItems = $state<Email[]>([]);
let cursor = $state<string | null>(null);
let hasMore = $state(false);
let pageInit = $state(false);

// Seed pagination state from the initial load (avoids state_referenced_locally warning)
$effect(() => {
  if (!pageInit) {
    cursor = data.cursor;
    hasMore = data.hasMore;
    pageInit = true;
  }
});

// Merge initial data + extra loaded pages, deduplicating by _id
let items = $derived.by<Email[]>(() => {
  if (extraItems.length === 0) return data.emails;
  const seen = new Set(data.emails.map((e) => e._id));
  const unique = extraItems.filter((e) => !seen.has(e._id));
  return [...data.emails, ...unique];
});

// Load next page
async function loadMore() {
  const result = await emailApi.listPaginated($auth.token, PAGE_SIZE, cursor);
  extraItems = [...extraItems, ...result.items];
  cursor = result.hasMore ? result.cursor : null;
  hasMore = result.hasMore;
}
```

A "Load More" button is shown when `hasMore` is true, with a loading spinner during fetch.

#### API Client Pagination

The `listPaginated()` methods on `emailApi`, `linkApi`, and `digestApi` build URLs with `?limit=` and optional `&cursor=` query params:

```typescript
emailApi.listPaginated(token, limit?, cursor?) →
  GET /email?limit=25&cursor=abc123
  → PaginatedResponse<Email> { items, cursor, hasMore }
```

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
4. Paginated pages (inbox, links, digests) use `listPaginated()` and return `{ items, cursor, hasMore }`
5. Non-paginated pages (sources, detail views) use simple `list()` or `get()` calls

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

| Variable       | Description                                        |
| -------------- | -------------------------------------------------- |
| `VITE_API_URL` | Backend API URL (default: `http://localhost:3000`) |

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
- **REST API with cursor-based pagination**: All data flows through the Hono backend REST API. List pages (inbox, links, digests) use cursor-based pagination (`?limit=&cursor=`) for efficient loading. The frontend loads one page initially and appends more via "Load More" buttons. (Previously used Convex live queries via WebSocket, but these were removed because they loaded all data at once, defeating pagination.)
- **Shared constants**: `PAGE_SIZE` lives in `$lib/constants.ts` and is imported by both `+page.ts` (loader) and `+page.svelte` (component) files. SvelteKit restricts `+page.ts` exports to specific names, so shared values must live in a separate module.
- **Svelte 5 runes**: Uses `$state`, `$derived`, `$derived.by`, `$effect`, `$props` throughout. Auth store still uses Svelte 4 `writable` for cross-component reactivity. Pagination state uses `$effect` with a `pageInit` guard to seed `$state` from `data` props without triggering `state_referenced_locally` warnings.
- **Sandboxed iframes for email**: HTML email bodies are isolated in sandboxed iframes to prevent style bleed and XSS while still allowing link clicks.
- **Dual auth guards**: `(app)/+layout.svelte` protects app routes (requires auth), `auth/+layout.svelte` protects auth routes (redirects if already authed, with exceptions for `/auth/logout` and `/auth/extension-callback`). Both use the same `$auth` store to avoid timing mismatches.
- **No SSR data**: All `+page.ts` loaders gate on `browser` and return empty arrays during SSR. This avoids hydration mismatches and keeps auth client-side.
