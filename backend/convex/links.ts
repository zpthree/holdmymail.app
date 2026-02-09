import { v } from "convex/values";
import { paginationOptsValidator } from "convex/server";
import { internalQuery, mutation, query } from "./_generated/server";

export const listByUserSince = internalQuery({
  args: { userId: v.id("users"), since: v.number() },
  handler: async (ctx, args) => {
    const all = await ctx.db
      .query("links")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .order("desc")
      .collect();
    return all.filter((l) => l._creationTime > args.since);
  },
});

export const create = mutation({
  args: {
    userId: v.id("users"),
    url: v.string(),
    title: v.optional(v.string()),
    description: v.optional(v.string()),
    tagIds: v.optional(v.array(v.id("tags"))),
    ogTitle: v.optional(v.string()),
    ogDescription: v.optional(v.string()),
    ogImage: v.optional(v.string()),
    ogSiteName: v.optional(v.string()),
    favicon: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const id = await ctx.db.insert("links", args);
    return await ctx.db.get(id);
  },
});

export const listByUser = query({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("links")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .order("desc")
      .collect();
  },
});

export const paginatedListByUser = query({
  args: { userId: v.id("users"), paginationOpts: paginationOptsValidator },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("links")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .order("desc")
      .paginate(args.paginationOpts);
  },
});

export const getById = query({
  args: { id: v.id("links") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.id);
  },
});

export const update = mutation({
  args: {
    id: v.id("links"),
    url: v.optional(v.string()),
    title: v.optional(v.string()),
    description: v.optional(v.string()),
    tagIds: v.optional(v.array(v.id("tags"))),
    ogTitle: v.optional(v.string()),
    ogDescription: v.optional(v.string()),
    ogImage: v.optional(v.string()),
    ogSiteName: v.optional(v.string()),
    favicon: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const { id, ...updates } = args;
    const filtered = Object.fromEntries(
      Object.entries(updates).filter(([_, v]) => v !== undefined),
    );
    await ctx.db.patch(id, filtered);
    return await ctx.db.get(id);
  },
});

export const remove = mutation({
  args: { id: v.id("links") },
  handler: async (ctx, args) => {
    await ctx.db.delete(args.id);
  },
});
