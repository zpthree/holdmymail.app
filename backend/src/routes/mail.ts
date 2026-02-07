import { Hono } from "hono";
import { convex, api } from "../convex";
import type { Id } from "../../convex/_generated/dataModel";

// Postmark inbound webhook payload
interface PostmarkInbound {
  From: string;
  FromName: string;
  To: string;
  Subject: string;
  TextBody: string;
  HtmlBody: string;
  Date: string;
  MessageID: string;
}

/**
 * Compute the next scheduledFor timestamp based on digest preferences.
 * Returns undefined if frequency is "realtime" or not set.
 * All scheduling is done in the user's timezone so "09:00" means 9 AM local.
 */
function computeScheduledFor(prefs: {
  digestFrequency?: string;
  digestDay?: string;
  digestTime?: string;
  timezone?: string;
}): number | undefined {
  const { digestFrequency, digestDay, digestTime, timezone } = prefs;

  if (!digestFrequency || digestFrequency === "realtime") {
    return undefined;
  }

  const tz = timezone || "UTC";
  const [hours, minutes] = (digestTime || "09:00").split(":").map(Number);

  // Get "now" expressed in the user's timezone
  const now = new Date();

  // Helper: build a Date for today (in user's tz) at the given H:M
  function todayAtTime(): Date {
    // Format today's date in the user's timezone as YYYY-MM-DD
    const parts = new Intl.DateTimeFormat("en-CA", {
      timeZone: tz,
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    }).formatToParts(now);
    const y = parts.find((p) => p.type === "year")!.value;
    const m = parts.find((p) => p.type === "month")!.value;
    const d = parts.find((p) => p.type === "day")!.value;

    // Build an ISO-ish string and parse it as if in the target timezone
    // We'll compute the UTC offset for that moment to get the correct absolute time
    const localStr = `${y}-${m}-${d}T${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}:00`;

    // Parse as UTC first, then adjust by the timezone offset
    const utcGuess = new Date(localStr + "Z");
    // Get what that UTC moment looks like in the target tz
    const inTz = new Date(utcGuess.toLocaleString("en-US", { timeZone: tz }));
    const offsetMs = inTz.getTime() - utcGuess.getTime();
    return new Date(utcGuess.getTime() - offsetMs);
  }

  // Get the current day-of-week in the user's timezone
  function currentDow(): number {
    const dowStr = new Intl.DateTimeFormat("en-US", {
      timeZone: tz,
      weekday: "short",
    }).format(now);
    const map: Record<string, number> = {
      Sun: 0,
      Mon: 1,
      Tue: 2,
      Wed: 3,
      Thu: 4,
      Fri: 5,
      Sat: 6,
    };
    return map[dowStr] ?? 0;
  }

  if (digestFrequency === "daily") {
    const target = todayAtTime();
    if (target.getTime() <= now.getTime()) {
      target.setDate(target.getDate() + 1);
    }
    return target.getTime();
  }

  if (digestFrequency === "weekly") {
    const dayMap: Record<string, number> = {
      sunday: 0,
      monday: 1,
      tuesday: 2,
      wednesday: 3,
      thursday: 4,
      friday: 5,
      saturday: 6,
    };
    const targetDow = dayMap[(digestDay || "monday").toLowerCase()] ?? 1;
    const target = todayAtTime();

    const nowDow = currentDow();
    let daysUntil = targetDow - nowDow;
    if (daysUntil < 0) daysUntil += 7;
    if (daysUntil === 0 && target.getTime() <= now.getTime()) daysUntil = 7;

    target.setDate(target.getDate() + daysUntil);
    return target.getTime();
  }

  if (digestFrequency === "monthly") {
    const target = todayAtTime();
    // Schedule for the 1st of next month at the specified time
    const tzMonth = Number(
      new Intl.DateTimeFormat("en-CA", {
        timeZone: tz,
        month: "2-digit",
      }).format(now),
    );
    const tzYear = Number(
      new Intl.DateTimeFormat("en-CA", {
        timeZone: tz,
        year: "numeric",
      }).format(now),
    );
    // Move to 1st of next month
    const nextMonth = tzMonth === 12 ? 1 : tzMonth + 1;
    const nextYear = tzMonth === 12 ? tzYear + 1 : tzYear;
    const localStr = `${nextYear}-${String(nextMonth).padStart(2, "0")}-01T${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}:00`;
    const utcGuess = new Date(localStr + "Z");
    const inTz = new Date(utcGuess.toLocaleString("en-US", { timeZone: tz }));
    const offsetMs = inTz.getTime() - utcGuess.getTime();
    return utcGuess.getTime() - offsetMs;
  }

  return undefined;
}

export const mailRoutes = new Hono();

// GET /mail - Health check for the mail endpoint
mailRoutes.get("/", (c) => {
  return c.json({ status: "ok", endpoint: "mail" });
});

// POST /mail - Receive inbound email from Postmark
mailRoutes.post("/", async (c) => {
  let payload: PostmarkInbound;

  try {
    payload = await c.req.json();
  } catch {
    // Postmark may send empty requests for webhook verification
    return c.json({ status: "ok" }, 200);
  }

  if (!payload || !payload.To) {
    return c.json({ status: "ok" }, 200);
  }

  // Extract the username from the To field
  // e.g., "user1@inbox.holdmymail.app"
  const toMatch = payload.To.match(/^([^@]+)@/);
  if (!toMatch) {
    return c.json({ error: "Invalid recipient address" }, 400);
  }

  const username = toMatch[1];

  // Find the user by their username
  const user = await convex.query(api.users.getByUsername, { username });
  if (!user) {
    return c.json({ error: "Unknown recipient" }, 404);
  }

  // Check if sender exists, create if not
  let sender = await convex.query(api.senders.getByUserAndEmail, {
    userId: user._id,
    email: payload.From,
  });

  let senderId: Id<"senders"> | undefined;
  if (!sender) {
    // Auto-create sender
    const newSender = await convex.mutation(api.senders.create, {
      userId: user._id,
      email: payload.From,
      name: payload.FromName || payload.From,
    });
    senderId = newSender?._id;
  } else {
    senderId = sender._id;
  }

  // Compute scheduledFor: sender prefs take priority, then user prefs
  const senderPrefs = sender
    ? {
        digestFrequency: sender.digestFrequency,
        digestDay: sender.digestDay,
        digestTime: sender.digestTime,
      }
    : null;

  const userPrefs = {
    digestFrequency: user.digestFrequency,
    digestDay: user.digestDay,
    digestTime: user.digestTime,
    timezone: user.timezone,
  };

  // Use sender-level prefs if they have a frequency set, otherwise fall back to user prefs
  const activePrefs = senderPrefs?.digestFrequency ? senderPrefs : userPrefs;
  const scheduledFor = computeScheduledFor({
    ...activePrefs,
    timezone: user.timezone, // always use user's timezone
  });

  // Store the email
  const email = await convex.mutation(api.emails.create, {
    userId: user._id,
    senderId,
    fromEmail: payload.From,
    fromName: payload.FromName || "",
    to: payload.To,
    subject: payload.Subject,
    textBody: payload.TextBody || "",
    htmlBody: payload.HtmlBody || "",
    date: payload.Date,
    messageId: payload.MessageID,
    ...(scheduledFor !== undefined ? { scheduledFor } : {}),
  });

  return c.json({ success: true, emailId: email?._id });
});
