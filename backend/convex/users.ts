import { v } from "convex/values";
import { internalQuery, mutation, query } from "./_generated/server";

export const register = mutation({
  args: { email: v.string(), passwordHash: v.string(), username: v.string() },
  handler: async (ctx, args) => {
    const existingEmail = await ctx.db
      .query("users")
      .withIndex("by_email", (q) => q.eq("email", args.email))
      .first();

    if (existingEmail) {
      throw new Error("Email already exists");
    }

    const existingUsername = await ctx.db
      .query("users")
      .withIndex("by_username", (q) => q.eq("username", args.username))
      .first();

    if (existingUsername) {
      throw new Error("Username already taken");
    }

    const userId = await ctx.db.insert("users", {
      email: args.email,
      passwordHash: args.passwordHash,
      username: args.username,
    });

    return { id: userId, email: args.email, username: args.username };
  },
});

export const getByEmail = query({
  args: { email: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("users")
      .withIndex("by_email", (q) => q.eq("email", args.email))
      .first();
  },
});

export const getByUsername = query({
  args: { username: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("users")
      .withIndex("by_username", (q) => q.eq("username", args.username))
      .first();
  },
});

// Seed user for testing
export const seedUser = mutation({
  args: { username: v.string(), email: v.string() },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("users")
      .withIndex("by_username", (q) => q.eq("username", args.username))
      .first();

    if (existing) {
      return existing;
    }

    const userId = await ctx.db.insert("users", {
      email: args.email,
      passwordHash: "", // No password for seeded users
      username: args.username,
    });

    return await ctx.db.get(userId);
  },
});

export const getById = query({
  args: { id: v.id("users") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.id);
  },
});

export const getByIdInternal = internalQuery({
  args: { id: v.id("users") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.id);
  },
});

export const update = mutation({
  args: {
    id: v.id("users"),
    email: v.optional(v.string()),
    passwordHash: v.optional(v.string()),
    deliveryEmail: v.optional(v.string()),
    digestFrequency: v.optional(v.string()),
    digestDay: v.optional(v.string()),
    digestTime: v.optional(v.string()),
    timezone: v.optional(v.string()),
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
  args: { id: v.id("users") },
  handler: async (ctx, args) => {
    await ctx.db.delete(args.id);
  },
});

// Token management
export const createToken = mutation({
  args: { token: v.string(), userId: v.id("users"), expiresAt: v.number() },
  handler: async (ctx, args) => {
    await ctx.db.insert("tokens", args);
  },
});

export const getToken = query({
  args: { token: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("tokens")
      .withIndex("by_token", (q) => q.eq("token", args.token))
      .first();
  },
});

export const deleteToken = mutation({
  args: { token: v.string() },
  handler: async (ctx, args) => {
    const tokenDoc = await ctx.db
      .query("tokens")
      .withIndex("by_token", (q) => q.eq("token", args.token))
      .first();
    if (tokenDoc) {
      await ctx.db.delete(tokenDoc._id);
    }
  },
});
