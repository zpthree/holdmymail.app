import { emails, users, senders, tags, links, digests } from "../db";
import { buildDigestHtml, type DigestLink } from "../emails/digest";

let digestQueue: Promise<unknown> = Promise.resolve();

export function deliverDueEmails(): Promise<{
  due: number;
  delivered: number;
}> {
  const run = digestQueue.then(
    () => deliverDueEmailsInner(),
    () => deliverDueEmailsInner(),
  );
  digestQueue = run;
  return run;
}

async function deliverDueEmailsInner(): Promise<{
  due: number;
  delivered: number;
}> {
  const due = await emails.getDueEmails();
  if (due.length === 0) return { due: 0, delivered: 0 };

  const byUser = new Map<string, typeof due>();
  for (const email of due) {
    if (email.delivered) continue;
    if (!byUser.has(email.userId)) byUser.set(email.userId, []);
    byUser.get(email.userId)!.push(email);
  }

  const postmarkToken = process.env.POSTMARK_SERVER_TOKEN;
  if (!postmarkToken) {
    throw new Error("POSTMARK_SERVER_TOKEN environment variable is required");
  }

  let totalDelivered = 0;

  for (const [userId, userEmails] of byUser) {
    const user = await users.getById(userId);
    if (!user) continue;

    const to = user.deliveryEmail || user.email;
    console.log(
      `[digest] sending ${userEmails.length} email(s) for user ${userId} to ${to}`,
    );

    const senderIds = [
      ...new Set(userEmails.map((e) => e.senderId).filter(Boolean)),
    ] as string[];
    const senderTagMap = new Map<string, string[]>();

    for (const senderId of senderIds) {
      const sender = await senders.getById(senderId);
      if (!sender?.tagIds?.length) continue;
      const tagNames: string[] = [];
      for (const tagId of sender.tagIds) {
        const tag = await tags.getById(tagId);
        if (tag) tagNames.push(tag.name);
      }
      if (tagNames.length > 0) senderTagMap.set(senderId, tagNames);
    }

    const digestEmails = userEmails.map((e) => ({
      _id: e._id,
      subject: e.subject,
      fromName: e.fromName,
      fromEmail: e.fromEmail,
      date: e.date,
      tags: e.senderId ? (senderTagMap.get(e.senderId) ?? []) : [],
    }));

    const lastDigest = await digests.getLatestByUser(userId);
    const sinceTime = lastDigest?.sentAt ?? 0;
    const recentLinks = await links.listByUserSince(userId, sinceTime);
    const digestLinks: DigestLink[] = recentLinks.map((l) => ({
      _id: l._id,
      url: l.url,
      title: l.title,
      ogTitle: l.ogTitle,
      ogSiteName: l.ogSiteName,
      favicon: l.favicon,
      createdAt: l._creationTime,
    }));

    const freq = user.digestFrequency || "";
    const freqCap =
      freq && freq !== "none"
        ? freq.charAt(0).toUpperCase() + freq.slice(1) + " "
        : "";

    const subject = `Your ${freqCap}Hold My Mail Digest – ${userEmails.length} email${userEmails.length === 1 ? "" : "s"} waiting`;

    const digest = await digests.create({
      userId,
      emailIds: userEmails.map((e) => e._id),
      subject,
      htmlBody: "",
      emailCount: userEmails.length,
    });

    if (!digest?._id) {
      throw new Error("Failed to create digest record");
    }

    const html = buildDigestHtml(
      digestEmails,
      new Date(),
      digest._id,
      freq,
      digestLinks,
    );

    const postmarkRes = await fetch("https://api.postmarkapp.com/email", {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        "X-Postmark-Server-Token": postmarkToken,
      },
      body: JSON.stringify({
        From: "Hold My Mail <digest@holdmymail.app>",
        To: to,
        Subject: subject,
        HtmlBody: html,
        MessageStream: "outbound",
      }),
    });

    if (!postmarkRes.ok) {
      const body = await postmarkRes.text();
      throw new Error(`Postmark send failed (${postmarkRes.status}): ${body}`);
    }

    await digests.updateHtmlBody(digest._id, html);
    await emails.markEmailsDelivered(userEmails.map((e) => e._id));
    totalDelivered += userEmails.length;
  }

  return { due: due.length, delivered: totalDelivered };
}
