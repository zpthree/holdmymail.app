import { v } from "convex/values";
import { paginationOptsValidator } from "convex/server";
import {
  internalAction,
  internalMutation,
  internalQuery,
  mutation,
  query,
} from "./_generated/server";
import { internal } from "./_generated/api";
import type { Id } from "./_generated/dataModel";
import { buildDigestHtml, type DigestLink } from "./digestTemplate";

export const create = mutation({
  args: {
    userId: v.id("users"),
    senderId: v.optional(v.id("senders")),
    fromEmail: v.string(),
    fromName: v.string(),
    to: v.string(),
    subject: v.string(),
    textBody: v.string(),
    htmlBody: v.string(),
    date: v.string(),
    messageId: v.string(),
    scheduledFor: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const id = await ctx.db.insert("emails", {
      ...args,
      read: false,
      delivered: false,
    });
    return await ctx.db.get(id);
  },
});

export const listByUser = query({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("emails")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .order("desc")
      .collect();
  },
});

export const paginatedListByUser = query({
  args: { userId: v.id("users"), paginationOpts: paginationOptsValidator },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("emails")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .order("desc")
      .paginate(args.paginationOpts);
  },
});

export const getById = query({
  args: { id: v.id("emails") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.id);
  },
});

export const schedule = mutation({
  args: {
    emailIds: v.array(v.id("emails")),
    scheduledFor: v.number(),
    userId: v.id("users"),
  },
  handler: async (ctx, args) => {
    const updated = [];
    for (const emailId of args.emailIds) {
      const email = await ctx.db.get(emailId);
      if (email && email.userId === args.userId) {
        await ctx.db.patch(emailId, { scheduledFor: args.scheduledFor });
        updated.push(await ctx.db.get(emailId));
      }
    }
    return updated;
  },
});

export const remove = mutation({
  args: { id: v.id("emails") },
  handler: async (ctx, args) => {
    await ctx.db.delete(args.id);
  },
});

export const markRead = mutation({
  args: { id: v.id("emails") },
  handler: async (ctx, args) => {
    const email = await ctx.db.get(args.id);
    if (!email) return null;

    const patch: { read: boolean; scheduledFor?: undefined } = { read: true };

    // If it's a confirmation email, remove from scheduled digest
    // so it won't be re-delivered (user already read it)
    if (/confirm/i.test(email.subject || "")) {
      patch.scheduledFor = undefined;
    }

    await ctx.db.patch(args.id, patch);
    return await ctx.db.get(args.id);
  },
});

export const getDueEmails = internalQuery({
  handler: async (ctx) => {
    const now = Date.now();
    const allEmails = await ctx.db.query("emails").collect();
    return allEmails.filter(
      (e) =>
        e.scheduledFor !== undefined && e.scheduledFor <= now && !e.delivered,
    );
  },
});

export const markEmailsDelivered = internalMutation({
  args: { emailIds: v.array(v.id("emails")) },
  handler: async (ctx, args) => {
    for (const id of args.emailIds) {
      await ctx.db.patch(id, { delivered: true });
    }
  },
});

export const deliverDueEmails = internalAction({
  handler: async (ctx) => {
    const due = await ctx.runQuery(internal.emails.getDueEmails);
    if (due.length === 0) return { delivered: 0 };

    // Group emails by userId
    const byUser = new Map<string, typeof due>();
    for (const email of due) {
      const userId = email.userId;
      if (!byUser.has(userId)) byUser.set(userId, []);
      byUser.get(userId)!.push(email);
    }

    const postmarkToken = process.env.POSTMARK_SERVER_TOKEN;
    if (!postmarkToken) {
      throw new Error("POSTMARK_SERVER_TOKEN environment variable is required");
    }

    let totalDelivered = 0;

    for (const [userId, emails] of byUser) {
      // Look up user to get their email
      const user = await ctx.runQuery(internal.users.getByIdInternal, {
        id: userId as Id<"users">,
      });
      if (!user) continue;

      // Build digest — resolve sender tags
      const senderIds = [
        ...new Set(emails.map((e) => e.senderId).filter(Boolean)),
      ] as Id<"senders">[];
      const senderTagMap = new Map<string, string[]>();

      for (const senderId of senderIds) {
        const sender = await ctx.runQuery(internal.senders.getByIdInternal, {
          id: senderId,
        });
        if (!sender?.tagIds?.length) continue;
        const tagNames: string[] = [];
        for (const tagId of sender.tagIds) {
          const tag = await ctx.runQuery(internal.tags.getByIdInternal, {
            id: tagId as Id<"tags">,
          });
          if (tag) tagNames.push(tag.name);
        }
        if (tagNames.length > 0) senderTagMap.set(senderId, tagNames);
      }

      const digestEmails = emails.map((e) => ({
        _id: e._id,
        subject: e.subject,
        fromName: e.fromName,
        fromEmail: e.fromEmail,
        date: e.date,
        tags: e.senderId ? (senderTagMap.get(e.senderId) ?? []) : [],
      }));

      // Fetch links created since the last digest
      const lastDigest = await ctx.runQuery(internal.digests.getLatestByUser, {
        userId: userId as Id<"users">,
      });
      const sinceTime = lastDigest?.sentAt ?? 0;
      const recentLinks = await ctx.runQuery(internal.links.listByUserSince, {
        userId: userId as Id<"users">,
        since: sinceTime,
      });
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
      const html = buildDigestHtml(digestEmails, new Date(), freq, digestLinks);

      const subject = `Your ${freqCap}Hold My Mail Digest – ${emails.length} email${emails.length === 1 ? "" : "s"} waiting`;

      // Send via Postmark
      await fetch("https://api.postmarkapp.com/email", {
        method: "POST",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
          "X-Postmark-Server-Token": postmarkToken,
        },
        body: JSON.stringify({
          From: "Hold My Mail <digest@holdmymail.app>",
          To: user.email,
          Subject: subject,
          HtmlBody: html,
          MessageStream: "outbound",
        }),
      });

      // Save digest to database
      await ctx.runMutation(internal.digests.create, {
        userId: userId as Id<"users">,
        emailIds: emails.map((e) => e._id),
        subject,
        htmlBody: html,
        emailCount: emails.length,
      });

      // Mark all as delivered
      await ctx.runMutation(internal.emails.markEmailsDelivered, {
        emailIds: emails.map((e) => e._id),
      });

      totalDelivered += emails.length;
    }

    return { delivered: totalDelivered };
  },
});
