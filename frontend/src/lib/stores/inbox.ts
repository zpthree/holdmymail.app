import { writable, get } from "svelte/store";
import { browser } from "$app/environment";
import { auth } from "$lib/stores/auth";
import { emailApi } from "$lib/api";

export const unreadCount = writable(0);

let pollTimer: ReturnType<typeof setInterval> | null = null;

async function refreshUnread() {
  const token = get(auth).token;
  if (!token) {
    unreadCount.set(0);
    return;
  }
  try {
    const { count } = await emailApi.countUnread(token);
    unreadCount.set(count);
  } catch {
    // ignore polling errors
  }
}

export function subscribeToUnread(_userId: string) {
  if (!browser) return;

  unsubscribeFromUnread();
  refreshUnread();
  pollTimer = setInterval(refreshUnread, 30_000);
}

export function unsubscribeFromUnread() {
  if (pollTimer) {
    clearInterval(pollTimer);
    pollTimer = null;
  }
}
