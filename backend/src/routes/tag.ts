import { Hono } from "hono";
import { convex, api } from "../convex";
import { authMiddleware } from "../middleware/auth";
import type { Id } from "../../convex/_generated/dataModel";

type Env = {
  Variables: {
    userId: string;
  };
};

export const tagRoutes = new Hono<Env>();

tagRoutes.use("*", authMiddleware);

// GET /tag - List all tags for the user
tagRoutes.get("/", async (c) => {
  const userId = c.get("userId") as Id<"users">;
  const tags = await convex.query(api.tags.listByUser, { userId });
  return c.json(tags);
});

// POST /tag - Create a new tag
tagRoutes.post("/", async (c) => {
  const userId = c.get("userId") as Id<"users">;
  const { name, color } = await c.req.json();

  if (!name?.trim()) {
    return c.json({ error: "Tag name is required" }, 400);
  }

  const tag = await convex.mutation(api.tags.create, {
    userId,
    name: name.trim(),
    color,
  });

  return c.json(tag, 201);
});

// PUT /tag/:id - Update a tag
tagRoutes.put("/:id", async (c) => {
  const userId = c.get("userId") as Id<"users">;
  const id = c.req.param("id") as Id<"tags">;

  try {
    const existing = await convex.query(api.tags.getById, { id });
    if (!existing || existing.userId !== userId) {
      return c.json({ error: "Tag not found" }, 404);
    }

    const body = await c.req.json();
    const tag = await convex.mutation(api.tags.update, {
      id,
      name: body.name,
      color: body.color,
    });

    return c.json(tag);
  } catch {
    return c.json({ error: "Tag not found" }, 404);
  }
});

// DELETE /tag/:id - Delete a tag
tagRoutes.delete("/:id", async (c) => {
  const userId = c.get("userId") as Id<"users">;
  const id = c.req.param("id") as Id<"tags">;

  try {
    const existing = await convex.query(api.tags.getById, { id });
    if (!existing || existing.userId !== userId) {
      return c.json({ error: "Tag not found" }, 404);
    }

    await convex.mutation(api.tags.remove, { id });
    return c.json({ message: "Tag deleted" });
  } catch {
    return c.json({ error: "Tag not found" }, 404);
  }
});
