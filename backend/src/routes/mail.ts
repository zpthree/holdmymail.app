import { Hono } from "hono";
import { ingestInboundEmail } from "../inbound/ingest";
import { replayInboundFromPostmark } from "../jobs/replayInbound";
import { deliverDueEmails } from "../jobs/deliverDueEmails";
import { authMiddleware } from "../middleware/auth";
import { users } from "../db";
import { isAdmin } from "../admin";

type Env = {
  Variables: {
    userId: string;
  };
};

export const mailRoutes = new Hono<Env>();

mailRoutes.get("/", (c) => {
  return c.json({ status: "ok", endpoint: "mail" });
});

mailRoutes.post("/replay", authMiddleware, async (c) => {
  const user = await users.getById(c.get("userId"));
  if (!user || !isAdmin(user.username, user.email)) {
    return c.json({ error: "Forbidden" }, 403);
  }

  const body = await c.req.json().catch(() => ({}));
  const summary = await replayInboundFromPostmark({
    fromdate: body.fromdate,
    todate: body.todate,
  });

  return c.json(summary);
});

mailRoutes.post("/deliver-digests", authMiddleware, async (c) => {
  const user = await users.getById(c.get("userId"));
  if (!user || !isAdmin(user.username, user.email)) {
    return c.json({ error: "Forbidden" }, 403);
  }

  try {
    const result = await deliverDueEmails();
    return c.json(result);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Digest delivery failed";
    return c.json({ error: message }, 500);
  }
});

mailRoutes.post("/", async (c) => {
  let payload: Parameters<typeof ingestInboundEmail>[0];

  try {
    payload = await c.req.json();
  } catch {
    return c.json({ status: "ok" }, 200);
  }

  if (!payload || !payload.OriginalRecipient) {
    return c.json({ status: "ok" }, 200);
  }

  const result = await ingestInboundEmail(payload);

  if (result.status === "stored") {
    return c.json({ success: true, emailId: result.emailId });
  }
  if (result.status === "duplicate") {
    return c.json({ success: true, emailId: result.emailId, duplicate: true });
  }
  if (result.status === "unknown_recipient") {
    return c.json({ error: "Unknown recipient" }, 404);
  }

  return c.json({ error: result.reason }, 400);
});
