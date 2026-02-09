import { v } from "convex/values";
import { paginationOptsValidator } from "convex/server";
import {
  internalMutation,
  internalQuery,
  mutation,
  query,
} from "./_generated/server";

export const getLatestByUser = internalQuery({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("digests")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .order("desc")
      .first();
  },
});

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

export const paginatedListByUser = query({
  args: { userId: v.id("users"), paginationOpts: paginationOptsValidator },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("digests")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .order("desc")
      .paginate(args.paginationOpts);
  },
});

export const getById = query({
  args: { id: v.id("digests") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.id);
  },
});
