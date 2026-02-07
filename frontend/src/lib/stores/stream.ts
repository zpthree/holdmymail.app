import { writable, derived } from "svelte/store";
import { browser } from "$app/environment";
import type { Email, Link, Sender, Tag } from "$lib/api";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

// Raw writable stores
const emailStore = writable<Email[]>([]);
const linkStore = writable<Link[]>([]);
const senderStore = writable<Sender[]>([]);
const tagStore = writable<Tag[]>([]);
const connected = writable(false);

let eventSource: EventSource | null = null;
let currentToken: string | null = null;

function connect(token: string) {
  if (!browser) return;

  // Already connected with same token
  if (eventSource && currentToken === token) return;

  // Disconnect existing
  disconnect();

  currentToken = token;
  const url = `${API_URL}/stream?token=${encodeURIComponent(token)}`;
  eventSource = new EventSource(url);

  eventSource.addEventListener("emails", (e) => {
    try {
      emailStore.set(JSON.parse(e.data));
    } catch {}
  });

  eventSource.addEventListener("links", (e) => {
    try {
      linkStore.set(JSON.parse(e.data));
    } catch {}
  });

  eventSource.addEventListener("senders", (e) => {
    try {
      senderStore.set(JSON.parse(e.data));
    } catch {}
  });

  eventSource.addEventListener("tags", (e) => {
    try {
      tagStore.set(JSON.parse(e.data));
    } catch {}
  });

  eventSource.addEventListener("open", () => {
    connected.set(true);
  });

  eventSource.addEventListener("error", () => {
    connected.set(false);
    // EventSource auto-reconnects, but if the token is bad we should stop
    if (eventSource?.readyState === EventSource.CLOSED) {
      disconnect();
    }
  });

  // Mark connected on first open
  eventSource.onopen = () => connected.set(true);
  eventSource.onerror = () => {
    connected.set(false);
    if (eventSource?.readyState === EventSource.CLOSED) {
      disconnect();
    }
  };
}

function disconnect() {
  if (eventSource) {
    eventSource.close();
    eventSource = null;
  }
  currentToken = null;
  connected.set(false);
}

export const liveData = {
  emails: { subscribe: emailStore.subscribe },
  links: { subscribe: linkStore.subscribe },
  senders: { subscribe: senderStore.subscribe },
  tags: { subscribe: tagStore.subscribe },
  connected: { subscribe: connected.subscribe },
  connect,
  disconnect,
};
