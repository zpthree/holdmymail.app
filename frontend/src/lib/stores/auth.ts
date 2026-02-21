import { writable } from "svelte/store";
import { browser } from "$app/environment";
import {
  AUTH_EMAIL_COOKIE,
  AUTH_TIMEZONE_COOKIE,
  AUTH_TOKEN_COOKIE,
  AUTH_USER_ID_COOKIE,
  AUTH_USERNAME_COOKIE,
  clearCookie,
  readCookie,
  writeCookie,
} from "$lib/auth-cookies";

interface User {
  id: string;
  email: string;
  username: string;
  timezone: string;
}

interface AuthState {
  user: User | null;
  token: string | null;
  loading: boolean;
}

const initialState: AuthState = {
  user: null,
  token: browser ? readCookie(AUTH_TOKEN_COOKIE) : null,
  loading: true,
};

export const auth = writable<AuthState>(initialState);

export function setAuth(user: User | null, token: string | null) {
  if (browser) {
    if (token && user) {
      writeCookie(AUTH_TOKEN_COOKIE, token);
      writeCookie(AUTH_USER_ID_COOKIE, user.id);
      writeCookie(AUTH_EMAIL_COOKIE, user.email);
      writeCookie(AUTH_USERNAME_COOKIE, user.username);
      writeCookie(AUTH_TIMEZONE_COOKIE, user.timezone || "");
    } else {
      clearCookie(AUTH_TOKEN_COOKIE);
      clearCookie(AUTH_USER_ID_COOKIE);
      clearCookie(AUTH_EMAIL_COOKIE);
      clearCookie(AUTH_USERNAME_COOKIE);
      clearCookie(AUTH_TIMEZONE_COOKIE);

      // Legacy cleanup for localStorage-based sessions.
      localStorage.removeItem("token");
      localStorage.removeItem("userId");
      localStorage.removeItem("email");
      localStorage.removeItem("username");
      localStorage.removeItem("gravatarUrl");
    }
  }
  auth.set({ user, token, loading: false });
}

export function clearAuth() {
  if (browser) {
    clearCookie(AUTH_TOKEN_COOKIE);
    clearCookie(AUTH_USER_ID_COOKIE);
    clearCookie(AUTH_EMAIL_COOKIE);
    clearCookie(AUTH_USERNAME_COOKIE);
    clearCookie(AUTH_TIMEZONE_COOKIE);

    // Legacy cleanup for localStorage-based sessions.
    localStorage.removeItem("token");
    localStorage.removeItem("userId");
    localStorage.removeItem("email");
    localStorage.removeItem("username");
    localStorage.removeItem("timezone");
    localStorage.removeItem("gravatarUrl");
  }
  auth.set({ user: null, token: null, loading: false });
}
