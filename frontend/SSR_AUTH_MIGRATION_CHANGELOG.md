# SSR Auth Migration Changelog

## Date

2026-02-21

## Overview

This document captures the authentication and server-side rendering (SSR) migration work completed for the frontend app.  
The goal was to remove the client-only auth bottleneck and ensure authenticated pages render with correct account data on first server render (no empty-state flicker after refresh).

## What Changed

### 1) Server-Readable Session State

- Added `src/lib/auth-cookies.ts` with shared auth cookie constants and helper utilities:
  - `hmm_token`
  - `hmm_user_id`
  - `hmm_email`
  - `hmm_username`
  - `hmm_timezone`
- Updated `src/lib/stores/auth.ts` to use cookie persistence for auth/session metadata instead of direct localStorage auth state.
- Kept legacy localStorage cleanup in place for safe migration from older sessions.

### 2) Root SSR Auth Hydration

- Added `src/routes/+layout.server.ts`:
  - Reads token/user id cookies on each request.
  - Validates current session with backend user lookup.
  - Returns normalized `{ token, user }` to layout/page loads.
  - Clears auth cookies when session is missing/invalid.
- Updated `src/routes/+layout.svelte`:
  - Removed client-only `onMount` session bootstrap for auth.
  - Hydrates auth store from server `data.user` / `data.token`.

### 3) Auth Guards Updated for SSR Data

- Updated `src/routes/(app)/+layout.svelte` to consider both store and server data (`$auth` plus `data.token`/`data.user`) during initial render.
- Updated `src/routes/auth/+layout.svelte` to use the same server-aware token check and avoid guard timing mismatches.

### 4) Authenticated Loaders Moved Off localStorage

All auth-protected `+page.ts` loaders were migrated to `await parent()` token/user context, removing browser/localStorage gating:

- `src/routes/(app)/inbox/+page.ts`
- `src/routes/(app)/inbox/[uid]/+page.ts`
- `src/routes/(app)/links/+page.ts`
- `src/routes/(app)/links/[uid]/+page.ts`
- `src/routes/(app)/digests/+page.ts`
- `src/routes/(app)/digests/[uid]/+page.ts`
- `src/routes/(app)/sources/+page.ts`
- `src/routes/(app)/sources/[uid]/+page.ts`
- `src/routes/(app)/user/+page.ts`
- `src/routes/(app)/user/[uid]/+page.ts`

### 5) App Layout Data Source Cleanup

- Updated `src/routes/(app)/+layout.ts` to derive Gravatar email from parent auth data (`parent().user.email`) instead of localStorage.

### 6) Extension Callback Session Read

- Updated `src/routes/auth/extension-callback/+page.svelte` to read active web session token/user id from cookies (not localStorage) before minting extension token.

## Bug Fixes During Migration

### Post-login first-render mismatch

- Symptom: initial app navigation after login briefly showed missing account data until refresh.
- Fix: force load invalidation on login redirect (`goto("/", { invalidateAll: true })`) so loaders re-run with newly established auth context.

### `/user/[uid]` refresh 500

- Symptom: reload on user settings route threw SSR error `Cannot read properties of null (reading 'id')`.
- Cause: SEO block dereferenced `$auth.user.id` during SSR before store hydration.
- Fixes:
  - `src/routes/(app)/user/[uid]/+page.ts`: redirect to `/auth/login` when auth context is missing/invalid instead of returning null user.
  - `src/routes/(app)/user/[uid]/+page.svelte`: SEO now uses safe loaded-data fallbacks (`loadedUser?.id`, `loadedUser?.username`) rather than null-unsafe store access.

## Privacy/Documentation Updates

- Updated privacy policy language (`src/routes/privacy/+page.svelte`) to reflect cookie-based session/auth behavior.
- Updated extension privacy wording (`src/routes/chrome-extension-privacy/+page.svelte`) to clarify extension storage vs website session model.
- Updated architecture notes in `README.md` to reflect SSR-aware auth loading and parent-based loader flow.

## Current Outcome

- Authenticated routes SSR with correct account context.
- Refresh on app pages preserves session and renders real data immediately.
- Client-side route navigation remains functional.
- `/user/[uid]` SSR refresh crash resolved.

## Follow-up Recommendation (Optional)

Current cookies are first-party and server-readable.  
If desired, security can be hardened further by moving to strictly `HttpOnly` session cookies and routing browser API calls through server endpoints/proxy so raw bearer tokens are never available to client JS.
