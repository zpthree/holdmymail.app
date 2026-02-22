import { fail, redirect } from "@sveltejs/kit";
import type { Actions } from "./$types";
import { authApi } from "$lib/api";
import type { Cookies } from "@sveltejs/kit";
import {
  AUTH_COOKIE_MAX_AGE_SECONDS,
  AUTH_EMAIL_COOKIE,
  AUTH_TIMEZONE_COOKIE,
  AUTH_TOKEN_COOKIE,
  AUTH_USER_ID_COOKIE,
  AUTH_USERNAME_COOKIE,
} from "$lib/auth-cookies";

function setAuthCookies(
  cookies: Cookies,
  values: {
    token: string;
    userId: string;
    email: string;
    username: string;
    timezone: string;
  },
) {
  const opts = {
    path: "/",
    sameSite: "lax" as const,
    maxAge: AUTH_COOKIE_MAX_AGE_SECONDS,
    httpOnly: false,
  };

  cookies.set(AUTH_TOKEN_COOKIE, values.token, opts);
  cookies.set(AUTH_USER_ID_COOKIE, values.userId, opts);
  cookies.set(AUTH_EMAIL_COOKIE, values.email, opts);
  cookies.set(AUTH_USERNAME_COOKIE, values.username, opts);
  cookies.set(AUTH_TIMEZONE_COOKIE, values.timezone, opts);
}

export const actions: Actions = {
  login: async ({ request, url, cookies }) => {
    const formData = await request.formData();
    const email = String(formData.get("email") || "").trim();
    const password = String(formData.get("password") || "");
    const nextFromForm = String(formData.get("next") || "").trim();
    const nextFromQuery = url.searchParams.get("next") || "";
    const nextCandidate = nextFromForm || nextFromQuery;
    const safeNext =
      nextCandidate.startsWith("/") && !nextCandidate.startsWith("//")
        ? nextCandidate
        : "/";

    if (!email || !password) {
      return fail(400, {
        error: "Email and password are required",
        email,
        next: nextCandidate,
      });
    }

    let token: string;
    let userId: string;

    try {
      const loginResult = await authApi.login(email, password);
      token = loginResult.token;
      userId = loginResult.userId;
      const user = await authApi.getUser(userId, token);

      setAuthCookies(cookies, {
        token,
        userId: user.id,
        email: user.email,
        username: user.username,
        timezone: user.timezone || "UTC",
      });
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Login failed";

      return fail(400, {
        error: msg,
        email,
        next: nextCandidate,
        unverified: msg.toLowerCase().includes("verify your email"),
      });
    }

    throw redirect(303, safeNext);
  },
  resendVerification: async ({ request }) => {
    const formData = await request.formData();
    const email = String(formData.get("email") || "").trim();
    const next = String(formData.get("next") || "").trim();

    if (!email) {
      return fail(400, {
        error: "Enter your email first",
        unverified: true,
        next,
      });
    }

    try {
      await authApi.resendVerification(email);
      return {
        resent: true,
        unverified: true,
        email,
        next,
      };
    } catch {
      return fail(400, {
        error: "Could not resend verification email",
        unverified: true,
        email,
        next,
      });
    }
  },
};
