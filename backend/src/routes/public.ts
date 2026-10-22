import { Hono } from "hono";
import { links, tags, users } from "../db";
import { hydrateItems, hydrateTags } from "../tags";

// Unauthenticated routes for users who have made their links feed public.
export const publicRoutes = new Hono();

async function getPublicUser(username: string) {
  const user = await users.getByUsername(username);
  return user?.linksPublic ? user : null;
}

// GET /public/:username - Public profile for a shared links feed
publicRoutes.get("/:username", async (c) => {
  const user = await getPublicUser(c.req.param("username"));
  if (!user) {
    return c.json({ error: "Feed not found" }, 404);
  }

  const tagIds = await links.distinctTagIds(user._id, { publicOnly: true });
  const used = await hydrateTags(tagIds);

  return c.json({
    username: user.username,
    tags: used.sort((a, b) => a.name.localeCompare(b.name)),
  });
});

// GET /public/:username/links - Paginated public links, `?tag=name` filters
publicRoutes.get("/:username/links", async (c) => {
  const user = await getPublicUser(c.req.param("username"));
  if (!user) {
    return c.json({ error: "Feed not found" }, 404);
  }

  const numItems = Math.min(parseInt(c.req.query("limit") || "") || 25, 100);
  const cursor = c.req.query("cursor") || null;
  const tagNames = c.req.queries("tag");
  const tagIds = tagNames?.length
    ? await tags.findIdsByNames(user._id, tagNames)
    : undefined;

  const result = await links.paginatedListByUser(user._id, numItems, cursor, {
    tagIds,
    publicOnly: true,
  });

  const items = (await hydrateItems(result.page)).map(
    ({ userId, hidden, ...link }) => link,
  );

  return c.json({
    items,
    cursor: result.continueCursor,
    hasMore: !result.isDone,
  });
});
