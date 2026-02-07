import { v } from "convex/values";
import { internalQuery, mutation, query } from "./_generated/server";

export const create = mutation({
  args: {
    userId: v.id("users"),
    email: v.string(),
    name: v.string(),
    color: v.optional(v.string()),
    tagIds: v.optional(v.array(v.id("tags"))),
    digestFrequency: v.optional(v.string()),
    digestDay: v.optional(v.string()),
    digestTime: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const id = await ctx.db.insert("senders", {
      ...args,
      color: args.color ?? "#0066cc",
    });
    return await ctx.db.get(id);
  },
});

export const listByUser = query({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("senders")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .collect();
  },
});

export const getById = query({
  args: { id: v.id("senders") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.id);
  },
});

export const getByIdInternal = internalQuery({
  args: { id: v.id("senders") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.id);
  },
});

export const getByUserAndEmail = query({
  args: { userId: v.id("users"), email: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("senders")
      .withIndex("by_user_email", (q) =>
        q.eq("userId", args.userId).eq("email", args.email),
      )
      .first();
  },
});

export const update = mutation({
  args: {
    id: v.id("senders"),
    email: v.optional(v.string()),
    name: v.optional(v.string()),
    color: v.optional(v.string()),
    tagIds: v.optional(v.array(v.id("tags"))),
    digestFrequency: v.optional(v.string()),
    digestDay: v.optional(v.string()),
    digestTime: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const { id, ...updates } = args;
    const existing = await ctx.db.get(id);
    const filtered = Object.fromEntries(
      Object.entries(updates).filter(([_, v]) => v !== undefined),
    );
    // Ensure old senders without color get a default
    if (existing && !existing.color && !filtered.color) {
      filtered.color = "#0066cc";
    }
    await ctx.db.patch(id, filtered);
    return await ctx.db.get(id);
  },
});

export const remove = mutation({
  args: { id: v.id("senders") },
  handler: async (ctx, args) => {
    // Cascade-delete all emails from this sender
    const emails = await ctx.db
      .query("emails")
      .withIndex("by_sender", (q) => q.eq("senderId", args.id))
      .collect();
    for (const email of emails) {
      await ctx.db.delete(email._id);
    }
    await ctx.db.delete(args.id);
  },
});
