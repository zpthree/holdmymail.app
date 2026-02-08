import { ConvexClient } from "convex/browser";
import { writable, type Readable } from "svelte/store";
import { browser } from "$app/environment";
import type {
  FunctionReference,
  FunctionArgs,
  FunctionReturnType,
} from "convex/server";
import { anyApi } from "convex/server";

// anyApi is a Proxy that builds typed function references from property paths
// e.g. api.emails.listByUser → FunctionReference for that Convex query
const api = anyApi as any;

const CONVEX_URL = import.meta.env.VITE_CONVEX_URL;

let client: ConvexClient | null = null;

function getClient(): ConvexClient {
  if (!client) {
    if (!CONVEX_URL) {
      throw new Error("VITE_CONVEX_URL environment variable is required");
    }
    client = new ConvexClient(CONVEX_URL);
  }
  return client;
}

/**
 * Create a Svelte readable store that subscribes to a Convex live query.
 * Automatically updates whenever the underlying data changes.
 */
export function liveQuery<F extends FunctionReference<"query">>(
  query: F,
  args: FunctionArgs<F>,
  initialValue: FunctionReturnType<F>,
): Readable<FunctionReturnType<F>> & { destroy: () => void } {
  if (!browser) {
    const store = writable(initialValue);
    return { subscribe: store.subscribe, destroy: () => {} };
  }

  const store = writable<FunctionReturnType<F>>(initialValue);
  const convexClient = getClient();

  const { unsubscribe } = convexClient.onUpdate(query, args, (value) => {
    store.set(value as FunctionReturnType<F>);
  });

  return {
    subscribe: store.subscribe,
    destroy: unsubscribe,
  };
}

export { api };
