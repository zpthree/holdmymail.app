import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  users: defineTable({
    email: v.string(),
    passwordHash: v.string(),
    username: v.string(), // e.g., "user1" for user1@inbox.holdmymail.app
    emailVerified: v.optional(v.boolean()),
    deliveryEmail: v.optional(v.string()),
    digestFrequency: v.optional(v.string()), // "daily" | "weekly" | "none"
    digestDay: v.optional(v.string()), // "monday" .. "sunday" (for weekly)
    digestTime: v.optional(v.string()), // "09:00" HH:MM format
    timezone: v.optional(v.string()), // IANA timezone e.g. "America/New_York"
  })
    .index("by_email", ["email"])
    .index("by_username", ["username"]),

  tokens: defineTable({
    token: v.string(),
    userId: v.id("users"),
    expiresAt: v.number(),
  }).index("by_token", ["token"]),

  verificationTokens: defineTable({
    token: v.string(),
    userId: v.id("users"),
    expiresAt: v.number(),
  }).index("by_token", ["token"]),

  passwordResetTokens: defineTable({
    token: v.string(),
    userId: v.id("users"),
    expiresAt: v.number(),
  }).index("by_token", ["token"]),

  tags: defineTable({
    userId: v.id("users"),
    name: v.string(),
    color: v.optional(v.string()),
  })
    .index("by_user", ["userId"])
    .index("by_user_name", ["userId", "name"]),

  senders: defineTable({
    userId: v.id("users"),
    email: v.string(),
    name: v.string(),
    color: v.optional(v.string()),
    tagIds: v.optional(v.array(v.id("tags"))),
    digestFrequency: v.optional(v.string()), // "realtime" | "daily" | "weekly" | "monthly"
    digestDay: v.optional(v.string()), // "monday" .. "sunday" (for weekly)
    digestTime: v.optional(v.string()), // "09:00" HH:MM format
  })
    .index("by_user", ["userId"])
    .index("by_user_email", ["userId", "email"]),

  emails: defineTable({
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
    read: v.optional(v.boolean()),
    scheduledFor: v.optional(v.number()),
    delivered: v.boolean(),
  })
    .index("by_user", ["userId"])
    .index("by_sender", ["senderId"]),

  digests: defineTable({
    userId: v.id("users"),
    emailIds: v.array(v.id("emails")),
    subject: v.string(),
    htmlBody: v.string(),
    sentAt: v.number(),
    emailCount: v.number(),
  }).index("by_user", ["userId"]),

  links: defineTable({
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
  }).index("by_user", ["userId"]),
});
