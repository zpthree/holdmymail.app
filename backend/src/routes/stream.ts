import { Hono } from "hono";
import { streamSSE } from "hono/streaming";
import { convex, api } from "../convex";
import { hydrateItems } from "../tags";
import type { Id } from "../../convex/_generated/dataModel";

type Env = {
  Variables: {
    userId: string;
  };
};

export const streamRoutes = new Hono<Env>();

// SSE endpoint — streams emails, links, and senders updates to the client
// Auth via query param since EventSource can't set headers
streamRoutes.get("/", async (c) => {
  const token = c.req.query("token");
  if (!token) {
    return c.json({ error: "Unauthorized" }, 401);
  }

  // Validate token
  const authToken = await convex.query(api.users.getToken, { token });
  if (!authToken || authToken.expiresAt < Date.now()) {
    return c.json({ error: "Unauthorized" }, 401);
  }

  const userId = authToken.userId as Id<"users">;

  return streamSSE(c, async (stream) => {
    // Track hashes to only send when data changes
    let lastEmailHash = "";
    let lastLinkHash = "";
    let lastSenderHash = "";
    let lastTagHash = "";

    const poll = async () => {
      try {
        // Fetch all data in parallel
        const [emails, rawLinks, rawSenders, tags] = await Promise.all([
          convex.query(api.emails.listByUser, { userId }),
          convex.query(api.links.listByUser, { userId }),
          convex.query(api.senders.listByUser, { userId }),
          convex.query(api.tags.listByUser, { userId }),
        ]);

        // Simple hash: use count + latest _creationTime to detect changes
        const emailHash = `${emails.length}:${emails[0]?._creationTime ?? 0}`;
        const linkHash = `${rawLinks.length}:${rawLinks[0]?._creationTime ?? 0}`;
        const senderHash = `${rawSenders.length}:${rawSenders[0]?._creationTime ?? 0}`;
        const tagHash = `${tags.length}:${tags[0]?._creationTime ?? 0}`;

        if (emailHash !== lastEmailHash) {
          lastEmailHash = emailHash;
          await stream.writeSSE({
            event: "emails",
            data: JSON.stringify(emails),
          });
        }

        if (linkHash !== lastLinkHash) {
          lastLinkHash = linkHash;
          const links = await hydrateItems(rawLinks);
          await stream.writeSSE({
            event: "links",
            data: JSON.stringify(links),
          });
        }

        if (senderHash !== lastSenderHash) {
          lastSenderHash = senderHash;
          const senders = await hydrateItems(rawSenders);
          await stream.writeSSE({
            event: "senders",
            data: JSON.stringify(senders),
          });
        }

        if (tagHash !== lastTagHash) {
          lastTagHash = tagHash;
          await stream.writeSSE({
            event: "tags",
            data: JSON.stringify(tags),
          });
        }
      } catch (err) {
        // Client probably disconnected — will be caught by the loop
        console.error("SSE poll error:", err);
      }
    };

    // Send initial data immediately
    await poll();

    // Then poll every 2 seconds
    while (true) {
      await stream.sleep(2000);
      await poll();
    }
  });
});
