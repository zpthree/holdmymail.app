import { writable } from "svelte/store";
import { browser } from "$app/environment";
import { getConvexClient } from "$lib/convex";
import { anyApi } from "convex/server";

export const unreadCount = writable(0);

let unsubscribe: (() => void) | null = null;

export function subscribeToUnread(userId: string) {
  if (!browser) return;

  // Clean up previous subscription
  if (unsubscribe) {
    unsubscribe();
    unsubscribe = null;
  }

  const client = getConvexClient();
  unsubscribe = client.onUpdate(
    anyApi.emails.countUnread,
    { userId },
    (count: number) => {
      unreadCount.set(count);
    },
  );
}

export function unsubscribeFromUnread() {
  if (unsubscribe) {
    unsubscribe();
    unsubscribe = null;
  }
}
