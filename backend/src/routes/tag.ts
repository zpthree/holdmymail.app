import { Hono } from "hono";
import { tags } from "../db";
import { authMiddleware } from "../middleware/auth";

type Env = {
  Variables: {
    userId: string;
  };
};

export const tagRoutes = new Hono<Env>();

tagRoutes.use("*", authMiddleware);

tagRoutes.get("/", async (c) => {
  const userId = c.get("userId");
  return c.json(await tags.listByUser(userId));
});

tagRoutes.post("/", async (c) => {
  const userId = c.get("userId");
  const { name, color } = await c.req.json();

  if (!name?.trim()) {
    return c.json({ error: "Tag name is required" }, 400);
  }

  const tag = await tags.create({
    userId,
    name: name.trim(),
    color,
  });

  return c.json(tag, 201);
});

tagRoutes.put("/:id", async (c) => {
  const userId = c.get("userId");
  const id = c.req.param("id");

  const existing = await tags.getById(id);
  if (!existing || existing.userId !== userId) {
    return c.json({ error: "Tag not found" }, 404);
  }

  const body = await c.req.json();
  const tag = await tags.update(id, {
    name: body.name,
    color: body.color,
  });

  return c.json(tag);
});

tagRoutes.delete("/:id", async (c) => {
  const userId = c.get("userId");
  const id = c.req.param("id");

  const existing = await tags.getById(id);
  if (!existing || existing.userId !== userId) {
    return c.json({ error: "Tag not found" }, 404);
  }

  await tags.remove(id);
  return c.json({ message: "Tag deleted" });
});
