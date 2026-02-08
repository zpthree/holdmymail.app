import { Hono } from "hono";
import { convex, api } from "../convex";
import { authMiddleware } from "../middleware/auth";
import type { Id } from "../../convex/_generated/dataModel";

type Env = {
  Variables: {
    userId: string;
  };
};

export const digestRoutes = new Hono<Env>();

digestRoutes.use("*", authMiddleware);

// GET /digest - List all digests for the user
digestRoutes.get("/", async (c) => {
  const userId = c.get("userId") as Id<"users">;
  const limitParam = c.req.query("limit");

  if (limitParam) {
    const numItems = Math.min(parseInt(limitParam) || 25, 100);
    const cursor = c.req.query("cursor") || null;
    const result = await convex.query(api.digests.paginatedListByUser, {
      userId,
      paginationOpts: { numItems, cursor },
    });
    return c.json({
      items: result.page,
      cursor: result.continueCursor,
      hasMore: !result.isDone,
    });
  }

  const digests = await convex.query(api.digests.listByUser, { userId });
  return c.json(digests);
});

// GET /digest/:id - Get a specific digest
digestRoutes.get("/:id", async (c) => {
  const userId = c.get("userId") as Id<"users">;
  const id = c.req.param("id") as Id<"digests">;

  try {
    const digest = await convex.query(api.digests.getById, { id });

    if (!digest || digest.userId !== userId) {
      return c.json({ error: "Digest not found" }, 404);
    }

    return c.json(digest);
  } catch {
    return c.json({ error: "Digest not found" }, 404);
  }
});
