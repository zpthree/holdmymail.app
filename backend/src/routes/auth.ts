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

const FRONTEND_URL = process.env.FRONTEND_URL || "http://localhost:5173";

async function sendVerificationEmail(email: string, token: string) {
  const postmarkToken = process.env.POSTMARK_SERVER_TOKEN;
  if (!postmarkToken) {
    console.error(
      "POSTMARK_SERVER_TOKEN not set — skipping verification email",
    );
    return;
  }

  const verifyUrl = `${FRONTEND_URL}/auth/verify-email?token=${token}`;

  await fetch("https://api.postmarkapp.com/email", {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
      "X-Postmark-Server-Token": postmarkToken,
    },
    body: JSON.stringify({
      From: "Hold My Mail <noreply@holdmymail.app>",
      To: email,
      Subject: "Verify your Hold My Mail account",
      HtmlBody: `
        <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 480px; margin: 0 auto; padding: 2rem;">
          <h1 style="font-size: 1.5rem; margin-bottom: 1rem;">Welcome to Hold My Mail!</h1>
          <p style="color: #333; line-height: 1.6;">Click the button below to verify your email address and activate your account.</p>
          <a href="${verifyUrl}" style="display: inline-block; margin: 1.5rem 0; padding: 0.75rem 2rem; background: #000; color: #fff; text-decoration: none; border-radius: 9999px; font-weight: 500;">Verify Email</a>
          <p style="color: #666; font-size: 0.875rem; line-height: 1.5;">If the button doesn't work, copy and paste this link into your browser:</p>
          <p style="color: #666; font-size: 0.875rem; word-break: break-all;">${verifyUrl}</p>
          <p style="color: #999; font-size: 0.8rem; margin-top: 2rem;">This link expires in 24 hours. If you didn't create an account, you can ignore this email.</p>
        </div>
      `,
      MessageStream: "outbound",
    }),
  });
}

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

    // Create verification token and send email
    const verificationToken = crypto.randomUUID();
    await convex.mutation(api.users.createVerificationToken, {
      token: verificationToken,
      userId: user.id as Id<"users">,
      expiresAt: Date.now() + 24 * 60 * 60 * 1000, // 24 hours
    });

    await sendVerificationEmail(email, verificationToken);

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

  if (!user.emailVerified) {
    return c.json(
      {
        error:
          "Please verify your email before logging in. Check your inbox for the verification link.",
      },
      403,
    );
  }

  const token = crypto.randomUUID();
  await convex.mutation(api.users.createToken, {
    token,
    userId: user._id,
    expiresAt: Date.now() + 30 * 24 * 60 * 60 * 1000, // 30 days
  });

  return c.json({ token, userId: user._id });
});

// POST /auth/verify-email
authRoutes.post("/verify-email", async (c) => {
  const { token } = await c.req.json();

  if (!token) {
    return c.json({ error: "Token is required" }, 400);
  }

  const verificationToken = await convex.query(api.users.getVerificationToken, {
    token,
  });

  if (!verificationToken) {
    return c.json({ error: "Invalid or expired verification link" }, 400);
  }

  if (verificationToken.expiresAt < Date.now()) {
    await convex.mutation(api.users.deleteVerificationToken, { token });
    return c.json(
      { error: "Verification link has expired. Please request a new one." },
      400,
    );
  }

  await convex.mutation(api.users.verifyEmail, {
    userId: verificationToken.userId,
  });
  await convex.mutation(api.users.deleteVerificationToken, { token });

  return c.json({ message: "Email verified successfully" });
});

// POST /auth/resend-verification
authRoutes.post("/resend-verification", async (c) => {
  const { email } = await c.req.json();

  if (!email) {
    return c.json({ error: "Email is required" }, 400);
  }

  const user = await convex.query(api.users.getByEmail, { email });

  if (!user) {
    // Don't reveal whether the email exists
    return c.json({
      message:
        "If an account with that email exists, a verification link has been sent.",
    });
  }

  if (user.emailVerified) {
    return c.json({
      message:
        "If an account with that email exists, a verification link has been sent.",
    });
  }

  const verificationToken = crypto.randomUUID();
  await convex.mutation(api.users.createVerificationToken, {
    token: verificationToken,
    userId: user._id,
    expiresAt: Date.now() + 24 * 60 * 60 * 1000, // 24 hours
  });

  await sendVerificationEmail(user.email, verificationToken);

  return c.json({
    message:
      "If an account with that email exists, a verification link has been sent.",
  });
});

// POST /auth/forgot-password
authRoutes.post("/forgot-password", async (c) => {
  const { email } = await c.req.json();

  if (!email) {
    return c.json({ error: "Email is required" }, 400);
  }

  // Always return success to avoid revealing whether the email exists
  const successMsg =
    "If an account with that email exists, a password reset link has been sent.";

  const user = await convex.query(api.users.getByEmail, { email });
  if (!user) {
    return c.json({ message: successMsg });
  }

  const resetToken = crypto.randomUUID();
  await convex.mutation(api.users.createPasswordResetToken, {
    token: resetToken,
    userId: user._id,
    expiresAt: Date.now() + 60 * 60 * 1000, // 1 hour
  });

  const postmarkToken = process.env.POSTMARK_SERVER_TOKEN;
  if (postmarkToken) {
    const resetUrl = `${FRONTEND_URL}/auth/reset-password?token=${resetToken}`;
    await fetch("https://api.postmarkapp.com/email", {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        "X-Postmark-Server-Token": postmarkToken,
      },
      body: JSON.stringify({
        From: "Hold My Mail <noreply@holdmymail.app>",
        To: user.email,
        Subject: "Reset your Hold My Mail password",
        HtmlBody: `
          <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 480px; margin: 0 auto; padding: 2rem;">
            <h1 style="font-size: 1.5rem; margin-bottom: 1rem;">Reset your password</h1>
            <p style="color: #333; line-height: 1.6;">We received a request to reset your password. Click the button below to choose a new one.</p>
            <a href="${resetUrl}" style="display: inline-block; margin: 1.5rem 0; padding: 0.75rem 2rem; background: #000; color: #fff; text-decoration: none; border-radius: 9999px; font-weight: 500;">Reset Password</a>
            <p style="color: #666; font-size: 0.875rem; line-height: 1.5;">If the button doesn't work, copy and paste this link into your browser:</p>
            <p style="color: #666; font-size: 0.875rem; word-break: break-all;">${resetUrl}</p>
            <p style="color: #999; font-size: 0.8rem; margin-top: 2rem;">This link expires in 1 hour. If you didn't request a password reset, you can ignore this email.</p>
          </div>
        `,
        MessageStream: "outbound",
      }),
    });
  }

  return c.json({ message: successMsg });
});

// POST /auth/reset-password
authRoutes.post("/reset-password", async (c) => {
  const { token, password } = await c.req.json();

  if (!token || !password) {
    return c.json({ error: "Token and password are required" }, 400);
  }

  if (password.length < 8) {
    return c.json({ error: "Password must be at least 8 characters" }, 400);
  }

  const resetToken = await convex.query(api.users.getPasswordResetToken, {
    token,
  });

  if (!resetToken) {
    return c.json({ error: "Invalid or expired reset link" }, 400);
  }

  if (resetToken.expiresAt < Date.now()) {
    await convex.mutation(api.users.deletePasswordResetToken, { token });
    return c.json(
      { error: "Reset link has expired. Please request a new one." },
      400,
    );
  }

  const passwordHash = await Bun.password.hash(password);
  await convex.mutation(api.users.updatePassword, {
    userId: resetToken.userId,
    passwordHash,
  });
  await convex.mutation(api.users.deletePasswordResetToken, { token });

  return c.json({ message: "Password has been reset successfully" });
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
    if (body.password) {
      if (!body.currentPassword) {
        return c.json({ error: "Current password is required" }, 400);
      }
      const user = await convex.query(api.users.getById, { id });
      if (!user) {
        return c.json({ error: "User not found" }, 404);
      }
      const valid = await Bun.password.verify(
        body.currentPassword,
        user.passwordHash,
      );
      if (!valid) {
        return c.json({ error: "Current password is incorrect" }, 403);
      }
      updates.passwordHash = await Bun.password.hash(body.password);
    }
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
