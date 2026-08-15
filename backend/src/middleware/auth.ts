import { createMiddleware } from "hono/factory";
import { users } from "../db";

type Env = {
  Variables: {
    userId: string;
  };
};

export const authMiddleware = createMiddleware<Env>(async (c, next) => {
  const authHeader = c.req.header("Authorization");
  if (!authHeader) {
    return c.json({ error: "Unauthorized" }, 401);
  }

  const token = authHeader.replace("Bearer ", "");
  const authToken = await users.getToken(token);

  if (!authToken) {
    return c.json({ error: "Unauthorized" }, 401);
  }

  if (authToken.expiresAt < Date.now()) {
    await users.deleteToken(token);
    return c.json({ error: "Token expired" }, 401);
  }

  c.set("userId", authToken.userId);
  await next();
});
