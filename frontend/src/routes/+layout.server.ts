import { authApi } from "$lib/api";
import {
  AUTH_EMAIL_COOKIE,
  AUTH_TIMEZONE_COOKIE,
  AUTH_TOKEN_COOKIE,
  AUTH_USER_ID_COOKIE,
  AUTH_USERNAME_COOKIE,
} from "$lib/auth-cookies";
import type { Cookies } from "@sveltejs/kit";
import type { LayoutServerLoad } from "./$types";

function clearAllAuthCookies(cookies: Cookies) {
  cookies.delete(AUTH_TOKEN_COOKIE, { path: "/" });
  cookies.delete(AUTH_USER_ID_COOKIE, { path: "/" });
  cookies.delete(AUTH_EMAIL_COOKIE, { path: "/" });
  cookies.delete(AUTH_USERNAME_COOKIE, { path: "/" });
  cookies.delete(AUTH_TIMEZONE_COOKIE, { path: "/" });
}

export const load: LayoutServerLoad = async ({ cookies }) => {
  const token = cookies.get(AUTH_TOKEN_COOKIE);
  const userId = cookies.get(AUTH_USER_ID_COOKIE);

  if (!token || !userId) {
    clearAllAuthCookies(cookies);
    return { token: null, user: null };
  }

  try {
    const user = await authApi.getUser(userId, token);
    return {
      token,
      user: {
        id: user.id,
        email: user.email,
        username: user.username,
        timezone:
          user.timezone || cookies.get(AUTH_TIMEZONE_COOKIE) || "UTC",
      },
    };
  } catch {
    clearAllAuthCookies(cookies);
    return { token: null, user: null };
  }
};
