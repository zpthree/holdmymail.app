import { Hono } from "hono";
import { convex, api } from "../convex";
import { authMiddleware } from "../middleware/auth";
import { resolveTagNames, hydrateItem, hydrateItems } from "../tags";
import type { Id } from "../../convex/_generated/dataModel";

type Env = {
  Variables: {
    userId: string;
  };
};

export const linkRoutes = new Hono<Env>();

linkRoutes.use("*", authMiddleware);

interface OgMetadata {
  ogTitle?: string;
  ogDescription?: string;
  ogImage?: string;
  ogSiteName?: string;
  favicon?: string;
}

async function fetchOgMetadata(url: string): Promise<OgMetadata> {
  try {
    const res = await fetch(url, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (compatible; HoldMyLinkBot/1.0; +https://holdmylink.app)",
        Accept: "text/html",
      },
      redirect: "follow",
      signal: AbortSignal.timeout(8000),
    });

    if (!res.ok) return {};

    const html = await res.text();
    const meta: OgMetadata = {};

    const decodeEntities = (str: string) =>
      str
        .replace(/&#(\d+);/g, (_, n) => String.fromCharCode(Number(n)))
        .replace(/&#x([0-9a-fA-F]+);/g, (_, n) =>
          String.fromCharCode(parseInt(n, 16)),
        )
        .replace(/&amp;/g, "&")
        .replace(/&lt;/g, "<")
        .replace(/&gt;/g, ">")
        .replace(/&quot;/g, '"')
        .replace(/&apos;/g, "'")
        .replace(/&#039;/g, "'");

    // Parse og: meta tags
    const ogMatches = html.matchAll(
      /<meta\s+(?:[^>]*?\s)?(?:property|name)\s*=\s*["'](og:[^"']+)["']\s+(?:[^>]*?\s)?content\s*=\s*["']([^"']*)["'][^>]*>/gi,
    );
    for (const m of ogMatches) {
      const prop = m[1].toLowerCase();
      const content = decodeEntities(m[2]);
      if (prop === "og:title") meta.ogTitle = content;
      else if (prop === "og:description") meta.ogDescription = content;
      else if (prop === "og:image") meta.ogImage = content;
      else if (prop === "og:site_name") meta.ogSiteName = content;
    }

    // Also check content-first attribute order
    const ogMatchesReverse = html.matchAll(
      /<meta\s+(?:[^>]*?\s)?content\s*=\s*["']([^"']*)["']\s+(?:[^>]*?\s)?(?:property|name)\s*=\s*["'](og:[^"']+)["'][^>]*>/gi,
    );
    for (const m of ogMatchesReverse) {
      const content = decodeEntities(m[1]);
      const prop = m[2].toLowerCase();
      if (prop === "og:title" && !meta.ogTitle) meta.ogTitle = content;
      else if (prop === "og:description" && !meta.ogDescription)
        meta.ogDescription = content;
      else if (prop === "og:image" && !meta.ogImage) meta.ogImage = content;
      else if (prop === "og:site_name" && !meta.ogSiteName)
        meta.ogSiteName = content;
    }

    // Fallback: meta description
    if (!meta.ogDescription) {
      const descMatch = html.match(
        /<meta\s+(?:[^>]*?\s)?name\s*=\s*["']description["']\s+(?:[^>]*?\s)?content\s*=\s*["']([^"']*)["'][^>]*>/i,
      );
      if (descMatch) meta.ogDescription = decodeEntities(descMatch[1]);
    }

    // Favicon
    const iconMatch = html.match(
      /<link\s+[^>]*?rel\s*=\s*["'](?:icon|shortcut icon)["'][^>]*?href\s*=\s*["']([^"']+)["'][^>]*>/i,
    );
    if (iconMatch) {
      const href = iconMatch[1];
      if (href.startsWith("http")) {
        meta.favicon = href;
      } else {
        const base = new URL(url);
        meta.favicon = new URL(href, base.origin).toString();
      }
    } else {
      // Default favicon path
      const base = new URL(url);
      meta.favicon = `${base.origin}/favicon.ico`;
    }

    // Make relative og:image absolute
    if (meta.ogImage && !meta.ogImage.startsWith("http")) {
      const base = new URL(url);
      meta.ogImage = new URL(meta.ogImage, base.origin).toString();
    }

    return meta;
  } catch {
    return {};
  }
}

// POST /link - Create a new link
linkRoutes.post("/", async (c) => {
  const userId = c.get("userId") as Id<"users">;
  const { url, title, description, tags = [] } = await c.req.json();

  if (!url) {
    return c.json({ error: "URL is required" }, 400);
  }

  // Fetch OG metadata from the URL
  const metadata = await fetchOgMetadata(url);

  // Resolve tag names to IDs
  const tagIds =
    tags.length > 0 ? await resolveTagNames(userId, tags) : undefined;

  const link = await convex.mutation(api.links.create, {
    userId,
    url,
    title: title || metadata.ogTitle,
    description: description || metadata.ogDescription,
    tagIds,
    ...metadata,
  });

  return c.json(link ? await hydrateItem(link) : null, 201);
});

// GET /link - List all links for the user
linkRoutes.get("/", async (c) => {
  const userId = c.get("userId") as Id<"users">;
  const limitParam = c.req.query("limit");

  if (limitParam) {
    const numItems = Math.min(parseInt(limitParam) || 25, 100);
    const cursor = c.req.query("cursor") || null;
    const result = await convex.query(api.links.paginatedListByUser, {
      userId,
      paginationOpts: { numItems, cursor },
    });
    return c.json({
      items: await hydrateItems(result.page),
      cursor: result.continueCursor,
      hasMore: !result.isDone,
    });
  }

  const links = await convex.query(api.links.listByUser, { userId });
  return c.json(await hydrateItems(links));
});

// GET /link/:id - Get a specific link
linkRoutes.get("/:id", async (c) => {
  const userId = c.get("userId") as Id<"users">;
  const id = c.req.param("id") as Id<"links">;

  try {
    const link = await convex.query(api.links.getById, { id });

    if (!link || link.userId !== userId) {
      return c.json({ error: "Link not found" }, 404);
    }

    return c.json(await hydrateItem(link));
  } catch {
    return c.json({ error: "Link not found" }, 404);
  }
});

// PUT /link/:id - Update a link
linkRoutes.put("/:id", async (c) => {
  const userId = c.get("userId") as Id<"users">;
  const id = c.req.param("id") as Id<"links">;

  try {
    const existing = await convex.query(api.links.getById, { id });

    if (!existing || existing.userId !== userId) {
      return c.json({ error: "Link not found" }, 404);
    }

    const body = await c.req.json();

    // Resolve tag names to IDs if provided
    const tagIds = body.tags
      ? await resolveTagNames(userId, body.tags)
      : undefined;

    const link = await convex.mutation(api.links.update, {
      id,
      url: body.url,
      title: body.title,
      description: body.description,
      tagIds,
    });

    return c.json(link ? await hydrateItem(link) : null);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Link not found";
    return c.json({ error: message }, 404);
  }
});

// DELETE /link/bulk - Bulk delete links
linkRoutes.delete("/bulk", async (c) => {
  const userId = c.get("userId") as Id<"users">;
  const { ids } = await c.req.json();

  if (!ids || !Array.isArray(ids) || ids.length === 0) {
    return c.json({ error: "ids array is required" }, 400);
  }

  let deleted = 0;
  for (const id of ids) {
    try {
      const link = await convex.query(api.links.getById, {
        id: id as Id<"links">,
      });
      if (link && link.userId === userId) {
        await convex.mutation(api.links.remove, { id: id as Id<"links"> });
        deleted++;
      }
    } catch {
      // skip invalid ids
    }
  }

  return c.json({ deleted });
});

// DELETE /link/:id - Delete a link
linkRoutes.delete("/:id", async (c) => {
  const userId = c.get("userId") as Id<"users">;
  const id = c.req.param("id") as Id<"links">;

  try {
    const link = await convex.query(api.links.getById, { id });

    if (!link || link.userId !== userId) {
      return c.json({ error: "Link not found" }, 404);
    }

    await convex.mutation(api.links.remove, { id });
    return c.json({ message: "Link deleted" });
  } catch {
    return c.json({ error: "Link not found" }, 404);
  }
});
