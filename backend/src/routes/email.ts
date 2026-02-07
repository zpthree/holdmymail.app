import { Hono } from "hono";
import { convex, api } from "../convex";
import { authMiddleware } from "../middleware/auth";
import type { Id } from "../../convex/_generated/dataModel";

type Env = {
  Variables: {
    userId: string;
  };
};

export const emailRoutes = new Hono<Env>();

// Apply auth middleware to all email routes
emailRoutes.use("*", authMiddleware);

// POST /email
emailRoutes.post("/", async (c) => {
  const userId = c.get("userId") as Id<"users">;
  const {
    senderId,
    fromEmail,
    fromName,
    to,
    subject,
    textBody,
    htmlBody,
    date,
    messageId,
  } = await c.req.json();

  if (!subject || !fromEmail) {
    return c.json({ error: "subject and fromEmail required" }, 400);
  }

  const email = await convex.mutation(api.emails.create, {
    userId,
    senderId: senderId as Id<"senders"> | undefined,
    fromEmail,
    fromName: fromName || "",
    to: to || "",
    subject,
    textBody: textBody || "",
    htmlBody: htmlBody || "",
    date: date || new Date().toISOString(),
    messageId: messageId || crypto.randomUUID(),
  });

  return c.json(email, 201);
});

// GET /email
emailRoutes.get("/", async (c) => {
  const userId = c.get("userId") as Id<"users">;
  const emails = await convex.query(api.emails.listByUser, { userId });

  return c.json(emails);
});

// POST /email/schedule
emailRoutes.post("/schedule", async (c) => {
  const userId = c.get("userId") as Id<"users">;
  const { emailIds, scheduledFor } = await c.req.json();

  if (!emailIds || !scheduledFor) {
    return c.json({ error: "emailIds and scheduledFor required" }, 400);
  }

  const scheduledDate = new Date(scheduledFor).getTime();
  const updated = await convex.mutation(api.emails.schedule, {
    emailIds: emailIds as Id<"emails">[],
    scheduledFor: scheduledDate,
    userId,
  });

  return c.json({ scheduled: updated.length, emails: updated });
});

// GET /email/:id
emailRoutes.get("/:id", async (c) => {
  const userId = c.get("userId") as Id<"users">;
  const id = c.req.param("id") as Id<"emails">;

  try {
    const email = await convex.query(api.emails.getById, { id });

    if (!email || email.userId !== userId) {
      return c.json({ error: "Email not found" }, 404);
    }

    return c.json(email);
  } catch {
    return c.json({ error: "Email not found" }, 404);
  }
});

// PATCH /email/:id/read
emailRoutes.patch("/:id/read", async (c) => {
  const userId = c.get("userId") as Id<"users">;
  const id = c.req.param("id") as Id<"emails">;

  try {
    const email = await convex.query(api.emails.getById, { id });

    if (!email || email.userId !== userId) {
      return c.json({ error: "Email not found" }, 404);
    }

    const updated = await convex.mutation(api.emails.markRead, { id });
    return c.json(updated);
  } catch {
    return c.json({ error: "Email not found" }, 404);
  }
});

// DELETE /email/bulk - Bulk delete emails
emailRoutes.delete("/bulk", async (c) => {
  const userId = c.get("userId") as Id<"users">;
  const { ids } = await c.req.json();

  if (!ids || !Array.isArray(ids) || ids.length === 0) {
    return c.json({ error: "ids array is required" }, 400);
  }

  let deleted = 0;
  for (const id of ids) {
    try {
      const email = await convex.query(api.emails.getById, {
        id: id as Id<"emails">,
      });
      if (email && email.userId === userId) {
        await convex.mutation(api.emails.remove, { id: id as Id<"emails"> });
        deleted++;
      }
    } catch {
      // skip invalid ids
    }
  }

  return c.json({ deleted });
});

// DELETE /email/:id
emailRoutes.delete("/:id", async (c) => {
  const userId = c.get("userId") as Id<"users">;
  const id = c.req.param("id") as Id<"emails">;

  try {
    const email = await convex.query(api.emails.getById, { id });

    if (!email || email.userId !== userId) {
      return c.json({ error: "Email not found" }, 404);
    }

    await convex.mutation(api.emails.remove, { id });
    return c.json({ message: "Email deleted" });
  } catch {
    return c.json({ error: "Email not found" }, 404);
  }
});
