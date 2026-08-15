import { Hono } from "hono";
import { emails } from "../db";
import { authMiddleware } from "../middleware/auth";
import { sanitizeEmailHtml } from "../emails/sanitizeEmailHtml";

type Env = {
  Variables: {
    userId: string;
  };
};

export const emailRoutes = new Hono<Env>();

emailRoutes.use("*", authMiddleware);

emailRoutes.post("/", async (c) => {
  const userId = c.get("userId");
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

  const sanitizedHtmlBody = htmlBody ? sanitizeEmailHtml(htmlBody) : "";

  const email = await emails.create({
    userId,
    senderId,
    fromEmail,
    fromName: fromName || "",
    to: to || "",
    subject,
    textBody: textBody || "",
    htmlBody: sanitizedHtmlBody,
    date: date || new Date().toISOString(),
    messageId: messageId || crypto.randomUUID(),
  });

  return c.json(email, 201);
});

emailRoutes.get("/", async (c) => {
  const userId = c.get("userId");
  const limitParam = c.req.query("limit");

  if (limitParam) {
    const numItems = Math.min(parseInt(limitParam) || 25, 100);
    const cursor = c.req.query("cursor") || null;
    const result = await emails.paginatedListByUser(userId, numItems, cursor);
    return c.json({
      items: result.page,
      cursor: result.continueCursor,
      hasMore: !result.isDone,
    });
  }

  return c.json(await emails.listByUser(userId));
});

emailRoutes.get("/unread-count", async (c) => {
  const userId = c.get("userId");
  const count = await emails.countUnread(userId);
  return c.json({ count });
});

emailRoutes.post("/schedule", async (c) => {
  const userId = c.get("userId");
  const { emailIds, scheduledFor } = await c.req.json();

  if (!emailIds || !scheduledFor) {
    return c.json({ error: "emailIds and scheduledFor required" }, 400);
  }

  const scheduledDate = new Date(scheduledFor).getTime();
  const updated = await emails.schedule(emailIds, scheduledDate, userId);

  return c.json({ scheduled: updated.length, emails: updated });
});

emailRoutes.get("/:id", async (c) => {
  const userId = c.get("userId");
  const id = c.req.param("id");

  const email = await emails.getById(id);

  if (!email || email.userId !== userId) {
    return c.json({ error: "Email not found" }, 404);
  }

  return c.json(email);
});

emailRoutes.patch("/:id/read", async (c) => {
  const userId = c.get("userId");
  const id = c.req.param("id");

  const email = await emails.getById(id);

  if (!email || email.userId !== userId) {
    return c.json({ error: "Email not found" }, 404);
  }

  const updated = await emails.markRead(id);
  return c.json(updated);
});

emailRoutes.delete("/bulk", async (c) => {
  const userId = c.get("userId");
  const { ids } = await c.req.json();

  if (!ids || !Array.isArray(ids) || ids.length === 0) {
    return c.json({ error: "ids array is required" }, 400);
  }

  let deleted = 0;
  for (const id of ids) {
    const email = await emails.getById(id);
    if (email && email.userId === userId) {
      await emails.remove(id);
      deleted++;
    }
  }

  return c.json({ deleted });
});

emailRoutes.delete("/:id", async (c) => {
  const userId = c.get("userId");
  const id = c.req.param("id");

  const email = await emails.getById(id);

  if (!email || email.userId !== userId) {
    return c.json({ error: "Email not found" }, 404);
  }

  await emails.remove(id);
  return c.json({ message: "Email deleted" });
});
