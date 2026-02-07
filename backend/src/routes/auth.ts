import { Hono } from "hono";
import { convex, api } from "../convex";
import { authMiddleware } from "../middleware/auth";
import type { Id } from "../../convex/_generated/dataModel";

type Env = {
  Variables: {
    userId: string;
  };
};

export const authRoutes = new Hono<Env>();

// POST /auth/register
authRoutes.post("/register", async (c) => {
  const { email, password, username } = await c.req.json();

  if (!email || !password || !username) {
    return c.json({ error: "Email, password, and username required" }, 400);
  }

  try {
    const passwordHash = await Bun.password.hash(password);
    const user = await convex.mutation(api.users.register, {
      email,
      passwordHash,
      username,
    });
    return c.json(user, 201);
  } catch (e: any) {
    if (
      e.message?.includes("already exists") ||
      e.message?.includes("already taken")
    ) {
      return c.json({ error: e.message }, 409);
    }
    throw e;
  }
});

// POST /auth/login
authRoutes.post("/login", async (c) => {
  const { email, password } = await c.req.json();

  const user = await convex.query(api.users.getByEmail, { email });

  if (!user) {
    return c.json({ error: "Invalid credentials" }, 401);
  }

  const valid = await Bun.password.verify(password, user.passwordHash);
  if (!valid) {
    return c.json({ error: "Invalid credentials" }, 401);
  }

  const token = crypto.randomUUID();
  await convex.mutation(api.users.createToken, {
    token,
    userId: user._id,
    expiresAt: Date.now() + 30 * 24 * 60 * 60 * 1000, // 30 days
  });

  return c.json({ token, userId: user._id });
});

// POST /auth/logout
authRoutes.post("/logout", async (c) => {
  const authHeader = c.req.header("Authorization");
  const token = authHeader?.replace("Bearer ", "");

  if (token) {
    await convex.mutation(api.users.deleteToken, { token });
  }

  return c.json({ message: "Logged out" });
});

// POST /auth/token — mint a new token using an existing valid token
authRoutes.post("/token", async (c) => {
  const authHeader = c.req.header("Authorization");
  if (!authHeader) {
    return c.json({ error: "Unauthorized" }, 401);
  }

  const existingToken = authHeader.replace("Bearer ", "");
  const authToken = await convex.query(api.users.getToken, {
    token: existingToken,
  });

  if (!authToken || authToken.expiresAt < Date.now()) {
    return c.json({ error: "Unauthorized" }, 401);
  }

  const newToken = crypto.randomUUID();
  await convex.mutation(api.users.createToken, {
    token: newToken,
    userId: authToken.userId,
    expiresAt: Date.now() + 30 * 24 * 60 * 60 * 1000, // 30 days
  });

  return c.json({ token: newToken, userId: authToken.userId });
});

// GET /auth/:id
authRoutes.get("/:id", authMiddleware, async (c) => {
  const id = c.req.param("id") as Id<"users">;
  const authenticatedUserId = c.get("userId");

  if (id !== authenticatedUserId) {
    return c.json({ error: "Forbidden" }, 403);
  }

  try {
    const user = await convex.query(api.users.getById, { id });

    if (!user) {
      return c.json({ error: "User not found" }, 404);
    }

    return c.json({
      id: user._id,
      email: user.email,
      username: user.username,
      deliveryEmail: user.deliveryEmail || "",
      digestFrequency: user.digestFrequency || "none",
      digestDay: user.digestDay || "monday",
      digestTime: user.digestTime || "09:00",
      timezone: user.timezone || "",
      createdAt: user._creationTime,
    });
  } catch {
    return c.json({ error: "User not found" }, 404);
  }
});

// PUT /auth/:id
authRoutes.put("/:id", authMiddleware, async (c) => {
  const id = c.req.param("id") as Id<"users">;
  const authenticatedUserId = c.get("userId");

  if (id !== authenticatedUserId) {
    return c.json({ error: "Forbidden" }, 403);
  }

  try {
    const body = await c.req.json();
    const updates: Record<string, string> = {};

    if (body.email) updates.email = body.email;
    if (body.password)
      updates.passwordHash = await Bun.password.hash(body.password);
    if (body.deliveryEmail !== undefined)
      updates.deliveryEmail = body.deliveryEmail;
    if (body.digestFrequency) updates.digestFrequency = body.digestFrequency;
    if (body.digestDay) updates.digestDay = body.digestDay;
    if (body.digestTime) updates.digestTime = body.digestTime;
    if (body.timezone !== undefined) updates.timezone = body.timezone;

    const user = await convex.mutation(api.users.update, {
      id,
      ...updates,
    } as any);

    if (!user) {
      return c.json({ error: "User not found" }, 404);
    }

    return c.json({ id: user._id, email: user.email });
  } catch {
    return c.json({ error: "User not found" }, 404);
  }
});

// DELETE /auth/:id
authRoutes.delete("/:id", authMiddleware, async (c) => {
  const id = c.req.param("id") as Id<"users">;
  const authenticatedUserId = c.get("userId");

  if (id !== authenticatedUserId) {
    return c.json({ error: "Forbidden" }, 403);
  }

  try {
    await convex.mutation(api.users.remove, { id });
    return c.json({ message: "User deleted" });
  } catch {
    return c.json({ error: "User not found" }, 404);
  }
});
