import { ConvexClient } from "convex/browser";
import { browser } from "$app/environment";

const CONVEX_URL = import.meta.env.VITE_CONVEX_URL as string;

let client: ConvexClient | null = null;

export function getConvexClient(): ConvexClient {
  if (!client && browser) {
    client = new ConvexClient(CONVEX_URL);
  }
  return client!;
}
