# Hold My Mail – Save Links (Chrome Extension)

A Chrome extension for quickly saving links to your Hold My Mail account.

## File Overview

| File                | Purpose                                                                                            |
| ------------------- | -------------------------------------------------------------------------------------------------- |
| `manifest.json`     | Extension config (Manifest V3) — declares permissions, popup, icons, and background service worker |
| `popup.html`        | The UI that appears when you click the extension icon in the toolbar                               |
| `popup.css`         | Styles for the popup                                                                               |
| `popup.js`          | Popup logic — view toggling, form handling, saving links via the API                               |
| `background.js`     | Service worker that runs in the background — watches for the auth callback and stores the token    |
| `icons/`            | Extension icons (16, 48, 128px PNGs + source SVG)                                                  |
| `generate-icons.js` | Node script that generates the PNG icons from scratch (run once)                                   |

## How Authentication Works

The extension doesn't have its own login form. Instead it opens the real Hold My Mail web app and piggybacks on its auth:

1. User clicks **"Sign in with Hold My Mail"** in the popup
2. `popup.js` opens a new tab to `/auth/extension-callback` on the frontend
3. The popup closes immediately — the **background service worker** takes over
4. In the new tab, the SvelteKit callback page checks `localStorage`:
   - **Already logged in?** → Grabs the existing `token` and `userId` from `localStorage`, appends them as `?hmm_token=...&hmm_user=...` query params, and navigates to that URL
   - **Not logged in?** → Shows a login form. After successful login, does the same redirect with the token in the URL
5. `background.js` listens to `chrome.tabs.onUpdated` for any tab URL containing `hmm_token` and `hmm_user` params
6. When detected, it saves the credentials to `chrome.storage.local` and **auto-closes the tab**
7. Next time the user opens the popup, `popup.js` reads from `chrome.storage.local` and shows the save-link view

Tokens last 30 days.

## How Saving Links Works

1. User clicks the extension icon on any page
2. `popup.js` runs — checks `chrome.storage.local` for a token
3. If authenticated, it shows the save form pre-filled with the current tab's **URL** and **title** (via `chrome.tabs.query`)
4. User optionally adds a description and comma-separated tags
5. On submit, `popup.js` sends a `POST /link` request to the backend API with a `Bearer` token
6. The backend validates the token, creates the link in Convex, and returns the saved link
7. The popup shows a success banner

## Permissions

- **`activeTab`** — read the current tab's URL and title to pre-fill the form
- **`storage`** — persist the auth token in `chrome.storage.local` across sessions
- **`tabs`** — open the auth tab and watch for the callback URL
- **`host_permissions`** — allows `fetch` to the backend API without CORS issues

## Development

1. Go to `chrome://extensions`
2. Enable **Developer Mode**
3. Click **Load unpacked** and select this `chrome-extension/` folder
4. Click the extension icon in the toolbar to use it

To regenerate icons: `node generate-icons.js`

### Configuration

The API and frontend URLs are set at the top of `popup.js`:

```js
const API_BASE = "https://3000--main--holdmymail--zach.redtail.codes";
const APP_BASE = "https://5173--main--holdmymail--zach.redtail.codes";
```

Update these when deploying to production.
