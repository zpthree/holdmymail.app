import { v } from "convex/values";
import { internalQuery, mutation, query } from "./_generated/server";

export const create = mutation({
  args: {
    userId: v.id("users"),
    name: v.string(),
    color: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    // Check for duplicate tag name per user
    const existing = await ctx.db
      .query("tags")
      .withIndex("by_user_name", (q) =>
        q.eq("userId", args.userId).eq("name", args.name),
      )
      .first();

    if (existing) return existing;

    const id = await ctx.db.insert("tags", args);
    return await ctx.db.get(id);
  },
});

export const listByUser = query({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("tags")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .collect();
  },
});

export const getById = query({
  args: { id: v.id("tags") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.id);
  },
});

export const getByIdInternal = internalQuery({
  args: { id: v.id("tags") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.id);
  },
});

export const getByUserAndName = query({
  args: { userId: v.id("users"), name: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("tags")
      .withIndex("by_user_name", (q) =>
        q.eq("userId", args.userId).eq("name", args.name),
      )
      .first();
  },
});

export const update = mutation({
  args: {
    id: v.id("tags"),
    name: v.optional(v.string()),
    color: v.optional(v.string()),
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
  args: { id: v.id("tags") },
  handler: async (ctx, args) => {
    await ctx.db.delete(args.id);
  },
});

/**
 * Resolve an array of tag names to tag IDs for a user.
 * Creates any tags that don't exist yet.
 */
export const resolveNames = mutation({
  args: {
    userId: v.id("users"),
    names: v.array(v.string()),
  },
  handler: async (ctx, args) => {
    const tagIds: string[] = [];
    for (const name of args.names) {
      const trimmed = name.trim();
      if (!trimmed) continue;

      let tag = await ctx.db
        .query("tags")
        .withIndex("by_user_name", (q) =>
          q.eq("userId", args.userId).eq("name", trimmed),
        )
        .first();

      if (!tag) {
        const id = await ctx.db.insert("tags", {
          userId: args.userId,
          name: trimmed,
        });
        tag = await ctx.db.get(id);
      }

      if (tag) tagIds.push(tag._id);
    }
    return tagIds;
  },
});
