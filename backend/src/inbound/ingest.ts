import { users, senders, emails } from "../db";
import { sanitizeEmailHtml } from "../emails/sanitizeEmailHtml";

export interface InboundPayload {
  From: string;
  FromName?: string;
  OriginalRecipient: string;
  Subject?: string;
  TextBody?: string;
  HtmlBody?: string;
  Date?: string;
  MessageID: string;
}

export type IngestResult =
  | { status: "stored"; emailId: string }
  | { status: "duplicate"; emailId: string }
  | { status: "unknown_recipient"; username: string }
  | { status: "invalid"; reason: string };

/**
 * Compute the next scheduledFor timestamp based on digest preferences.
 * Returns undefined if frequency is "realtime" or not set.
 * All scheduling is done in the user's timezone so "09:00" means 9 AM local.
 */
export function computeScheduledFor(
  prefs: {
    digestFrequency?: string;
    digestDay?: string;
    digestTime?: string;
    timezone?: string;
  },
  options: { ifPast?: "next" | "now" } = {},
): number | undefined {
  const { digestFrequency, digestDay, digestTime, timezone } = prefs;
  const ifPast = options.ifPast ?? "next";

  if (
    !digestFrequency ||
    digestFrequency === "realtime" ||
    digestFrequency === "none"
  ) {
    return undefined;
  }

  const tz = timezone || "UTC";
  const [hours, minutes] = (digestTime || "09:00").split(":").map(Number);

  const now = new Date();

  function todayAtTime(): Date {
    const parts = new Intl.DateTimeFormat("en-CA", {
      timeZone: tz,
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    }).formatToParts(now);
    const y = parts.find((p) => p.type === "year")!.value;
    const m = parts.find((p) => p.type === "month")!.value;
    const d = parts.find((p) => p.type === "day")!.value;

    const localStr = `${y}-${m}-${d}T${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}:00`;

    const utcGuess = new Date(localStr + "Z");
    const inTz = new Date(utcGuess.toLocaleString("en-US", { timeZone: tz }));
    const offsetMs = inTz.getTime() - utcGuess.getTime();
    return new Date(utcGuess.getTime() - offsetMs);
  }

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
      if (ifPast === "now") return Date.now();
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
    if (daysUntil === 0 && target.getTime() <= now.getTime()) {
      if (ifPast === "now") return Date.now();
      daysUntil = 7;
    }

    target.setDate(target.getDate() + daysUntil);
    return target.getTime();
  }

  if (digestFrequency === "monthly") {
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

type DigestPrefSource = {
  digestFrequency?: string;
  digestDay?: string;
  digestTime?: string;
  timezone?: string;
};

function prefsForEmail(
  user: DigestPrefSource,
  sender?: DigestPrefSource | null,
) {
  if (sender?.digestFrequency) {
    return {
      digestFrequency: sender.digestFrequency,
      digestDay: sender.digestDay,
      digestTime: sender.digestTime,
      timezone: user.timezone,
    };
  }
  return {
    digestFrequency: user.digestFrequency,
    digestDay: user.digestDay,
    digestTime: user.digestTime,
    timezone: user.timezone,
  };
}

export async function rescheduleUndeliveredForUser(userId: string) {
  const user = await users.getById(userId);
  if (!user) return 0;

  const undelivered = await emails.listUndeliveredByUser(userId);
  if (undelivered.length === 0) return 0;

  const senderList = await senders.listByUser(userId);
  const senderMap = new Map(senderList.map((s) => [s._id, s]));

  const dueNow = Date.now();
  const groups = new Map<number | "unset", string[]>();
  for (const email of undelivered) {
    if (email.delivered) continue;
    const sender = email.senderId ? senderMap.get(email.senderId) : undefined;
    let scheduledFor = computeScheduledFor(prefsForEmail(user, sender), {
      ifPast: "now",
    });
    if (scheduledFor !== undefined && scheduledFor <= dueNow) {
      scheduledFor = dueNow;
    }
    const key = scheduledFor === undefined ? "unset" : scheduledFor;
    const ids = groups.get(key) ?? [];
    ids.push(email._id);
    groups.set(key, ids);
  }

  for (const [key, ids] of groups) {
    await emails.setScheduledFor(ids, key === "unset" ? undefined : key);
  }

  const earliest = [...groups.keys()]
    .filter((key): key is number => key !== "unset")
    .sort((a, b) => a - b)[0];
  console.log(
    `[digest] rescheduled ${undelivered.length} undelivered email(s) for user ${userId}` +
      (earliest !== undefined
        ? `, earliest=${new Date(earliest).toISOString()}`
        : ", none scheduled"),
  );

  return undelivered.length;
}

export async function ingestInboundEmail(
  payload: InboundPayload,
): Promise<IngestResult> {
  if (!payload?.OriginalRecipient || !payload?.MessageID) {
    return { status: "invalid", reason: "OriginalRecipient and MessageID required" };
  }

  const existing = await emails.getByMessageId(payload.MessageID);
  if (existing) {
    return { status: "duplicate", emailId: existing._id };
  }

  const toMatch = payload.OriginalRecipient.match(/^([^@]+)@/);
  if (!toMatch) {
    return { status: "invalid", reason: "Invalid recipient address" };
  }

  const username = toMatch[1];
  const user = await users.getByUsername(username);
  if (!user) {
    return { status: "unknown_recipient", username };
  }

  let sender = await senders.getByUserAndEmail(user._id, payload.From);
  let senderId: string | undefined;
  if (!sender) {
    const newSender = await senders.create({
      userId: user._id,
      email: payload.From,
      name: payload.FromName || payload.From,
    });
    senderId = newSender?._id;
  } else {
    senderId = sender._id;
  }

  const scheduledFor = computeScheduledFor(
    prefsForEmail(user, sender ?? undefined),
  );

  let sanitizedHtmlBody = payload.HtmlBody || "";
  if (sanitizedHtmlBody) {
    try {
      sanitizedHtmlBody = sanitizeEmailHtml(sanitizedHtmlBody);
    } catch {
      sanitizedHtmlBody = payload.HtmlBody || "";
    }
  }

  const email = await emails.create({
    userId: user._id,
    senderId,
    fromEmail: payload.From,
    fromName: payload.FromName || "",
    to: payload.OriginalRecipient,
    subject: payload.Subject || "",
    textBody: payload.TextBody || "",
    htmlBody: sanitizedHtmlBody,
    date: payload.Date || new Date().toISOString(),
    messageId: payload.MessageID,
    ...(scheduledFor !== undefined ? { scheduledFor } : {}),
  });

  return { status: "stored", emailId: email?._id || "" };
}
