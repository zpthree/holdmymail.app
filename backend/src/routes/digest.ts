import { Hono } from "hono";
import { digests } from "../db";
import { authMiddleware } from "../middleware/auth";

type Env = {
  Variables: {
    userId: string;
  };
};

export const digestRoutes = new Hono<Env>();

digestRoutes.use("*", authMiddleware);

digestRoutes.get("/", async (c) => {
  const userId = c.get("userId");
  const limitParam = c.req.query("limit");

  if (limitParam) {
    const numItems = Math.min(parseInt(limitParam) || 25, 100);
    const cursor = c.req.query("cursor") || null;
    const result = await digests.paginatedListByUser(userId, numItems, cursor);
    return c.json({
      items: result.page,
      cursor: result.continueCursor,
      hasMore: !result.isDone,
    });
  }

  return c.json(await digests.listByUser(userId));
});

digestRoutes.get("/:id", async (c) => {
  const userId = c.get("userId");
  const id = c.req.param("id");

  const digest = await digests.getById(id);

  if (!digest || digest.userId !== userId) {
    return c.json({ error: "Digest not found" }, 404);
  }

  return c.json(digest);
});
