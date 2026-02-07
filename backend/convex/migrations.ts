import { mutation } from "./_generated/server";

/**
 * One-time migration: Convert `tags: string[]` on senders and links
 * to `tagIds: Id<"tags">[]`, creating tag records as needed.
 *
 * Run via dashboard or: npx convex run migrations:migrateTags
 */
export const migrateTags = mutation({
  args: {},
  handler: async (ctx) => {
    let created = 0;
    let migratedSenders = 0;
    let migratedLinks = 0;

    // Migrate senders
    const senders = await ctx.db.query("senders").collect();
    for (const sender of senders) {
      const doc = sender as any;
      if (!doc.tags || doc.tagIds) continue; // already migrated or no tags

      const tagIds: string[] = [];
      for (const name of doc.tags) {
        const trimmed = name.trim();
        if (!trimmed) continue;

        let tag = await ctx.db
          .query("tags")
          .withIndex("by_user_name", (q) =>
            q.eq("userId", sender.userId).eq("name", trimmed),
          )
          .first();

        if (!tag) {
          const id = await ctx.db.insert("tags", {
            userId: sender.userId,
            name: trimmed,
          });
          tag = (await ctx.db.get(id))!;
          created++;
        }

        tagIds.push(tag._id);
      }

      // Replace tags with tagIds and remove the old field
      await ctx.db.patch(sender._id, {
        tagIds: tagIds.length > 0 ? tagIds : undefined,
        tags: undefined,
      } as any);
      migratedSenders++;
    }

    // Migrate links
    const links = await ctx.db.query("links").collect();
    for (const link of links) {
      const doc = link as any;
      if (!doc.tags && !doc.hasOwnProperty?.("tags")) continue;
      if (doc.tagIds) continue; // already migrated

      const tagIds: string[] = [];
      if (doc.tags && Array.isArray(doc.tags)) {
        for (const name of doc.tags) {
          const trimmed = name.trim();
          if (!trimmed) continue;

          let tag = await ctx.db
            .query("tags")
            .withIndex("by_user_name", (q) =>
              q.eq("userId", link.userId).eq("name", trimmed),
            )
            .first();

          if (!tag) {
            const id = await ctx.db.insert("tags", {
              userId: link.userId,
              name: trimmed,
            });
            tag = (await ctx.db.get(id))!;
            created++;
          }

          tagIds.push(tag._id);
        }
      }

      // Replace tags with tagIds and remove the old field
      await ctx.db.patch(link._id, {
        tagIds: tagIds.length > 0 ? tagIds : undefined,
        tags: undefined,
      } as any);
      migratedLinks++;
    }

    return {
      tagsCreated: created,
      sendersMigrated: migratedSenders,
      linksMigrated: migratedLinks,
    };
  },
});

/**
 * Cleanup: Remove the deprecated `tags` field from all senders and links.
 * `patch({ tags: undefined })` doesn't work because undefined is stripped
 * during serialization. We use `replace()` instead which overwrites the
 * entire document, dropping any fields we omit.
 *
 * Run via: npx convex run migrations:cleanupTagsField
 */
export const cleanupTagsField = mutation({
  args: {},
  handler: async (ctx) => {
    let cleanedSenders = 0;
    let cleanedLinks = 0;

    const senders = await ctx.db.query("senders").collect();
    for (const sender of senders) {
      const { _id, _creationTime, ...rest } = sender as any;
      // Destructure out the deprecated tags field, keep everything else
      const { tags, ...clean } = rest;
      await ctx.db.replace(_id, clean);
      cleanedSenders++;
    }

    const links = await ctx.db.query("links").collect();
    for (const link of links) {
      const { _id, _creationTime, ...rest } = link as any;
      const { tags, ...clean } = rest;
      await ctx.db.replace(_id, clean);
      cleanedLinks++;
    }

    return { cleanedSenders, cleanedLinks };
  },
});
