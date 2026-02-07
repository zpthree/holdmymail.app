import { v } from "convex/values";
import { internalMutation, mutation, query } from "./_generated/server";

export const create = internalMutation({
  args: {
    userId: v.id("users"),
    emailIds: v.array(v.id("emails")),
    subject: v.string(),
    htmlBody: v.string(),
    emailCount: v.number(),
  },
  handler: async (ctx, args) => {
    const id = await ctx.db.insert("digests", {
      ...args,
      sentAt: Date.now(),
    });
    return await ctx.db.get(id);
  },
});

export const listByUser = query({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("digests")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .order("desc")
      .collect();
  },
});

export const getById = query({
  args: { id: v.id("digests") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.id);
  },
});
