import { Hono } from "hono";
import { senders } from "../db";
import { authMiddleware } from "../middleware/auth";
import { resolveTagNames, hydrateItem, hydrateItems } from "../tags";
import { rescheduleUndeliveredForUser } from "../inbound/ingest";
import { deliverDueEmails } from "../jobs/deliverDueEmails";

type Env = {
  Variables: {
    userId: string;
  };
};

export const senderRoutes = new Hono<Env>();

// Apply auth middleware to all sender routes
senderRoutes.use("*", authMiddleware);

// POST /sender
senderRoutes.post("/", async (c) => {
  const userId = c.get("userId");
  const {
    email,
    name,
    color,
    tags = [],
    digestFrequency,
    digestDay,
    digestTime,
  } = await c.req.json();

  if (!email || !name) {
    return c.json({ error: "Email and name required" }, 400);
  }

  // Resolve tag names to IDs
  const tagIds =
    tags.length > 0 ? await resolveTagNames(userId, tags) : undefined;

  const sender = await senders.create({
    userId,
    email,
    name,
    color,
    tagIds,
    digestFrequency,
    digestDay,
    digestTime,
  });

  return c.json(sender ? await hydrateItem(sender) : null, 201);
});

// GET /sender
senderRoutes.get("/", async (c) => {
  const userId = c.get("userId");
  const sendersList = await senders.listByUser(userId);
  return c.json(await hydrateItems(sendersList));
});

// GET /sender/:id
senderRoutes.get("/:id", async (c) => {
  const userId = c.get("userId");
  const id = c.req.param("id");

  try {
    const sender = await senders.getById(id);

    if (!sender || sender.userId !== userId) {
      return c.json({ error: "Sender not found" }, 404);
    }

    return c.json(await hydrateItem(sender));
  } catch {
    return c.json({ error: "Sender not found" }, 404);
  }
});

// PUT /sender/:id
senderRoutes.put("/:id", async (c) => {
  const userId = c.get("userId");
  const id = c.req.param("id");

  try {
    const existing = await senders.getById(id);

    if (!existing || existing.userId !== userId) {
      return c.json({ error: "Sender not found" }, 404);
    }

    const body = await c.req.json();

    // Resolve tag names to IDs if provided
    const tagIds = body.tags
      ? await resolveTagNames(userId, body.tags)
      : undefined;

    const sender = await senders.update(id, {
      email: body.email,
      name: body.name,
      color: body.color,
      tagIds,
      digestFrequency: body.digestFrequency,
      digestDay: body.digestDay,
      digestTime: body.digestTime,
    });

    const digestSettingsChanged =
      body.digestFrequency !== undefined ||
      body.digestDay !== undefined ||
      body.digestTime !== undefined;

    if (digestSettingsChanged) {
      try {
        await rescheduleUndeliveredForUser(userId);
        await deliverDueEmails();
      } catch (err) {
        console.error("[digest] deliver after sender settings save failed:", err);
      }
    }

    return c.json(sender ? await hydrateItem(sender) : null);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Sender not found";
    return c.json({ error: message }, 404);
  }
});

// DELETE /sender/:id
senderRoutes.delete("/:id", async (c) => {
  const userId = c.get("userId");
  const id = c.req.param("id");

  try {
    const sender = await senders.getById(id);

    if (!sender || sender.userId !== userId) {
      return c.json({ error: "Sender not found" }, 404);
    }

    await senders.remove(id);
    return c.json({ message: "Sender deleted" });
  } catch {
    return c.json({ error: "Sender not found" }, 404);
  }
});
