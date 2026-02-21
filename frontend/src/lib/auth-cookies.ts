import { browser } from "$app/environment";

export const AUTH_TOKEN_COOKIE = "hmm_token";
export const AUTH_USER_ID_COOKIE = "hmm_user_id";
export const AUTH_EMAIL_COOKIE = "hmm_email";
export const AUTH_USERNAME_COOKIE = "hmm_username";
export const AUTH_TIMEZONE_COOKIE = "hmm_timezone";
export const AUTH_COOKIE_MAX_AGE_SECONDS = 60 * 60 * 24 * 30;

function shouldUseSecureCookie(): boolean {
  return browser && window.location.protocol === "https:";
}

function encodeCookieValue(value: string): string {
  return encodeURIComponent(value);
}

export function readCookie(name: string): string | null {
  if (!browser) return null;

  const token = `${name}=`;
  const found = document.cookie
    .split(";")
    .map((part) => part.trim())
    .find((part) => part.startsWith(token));

  return found ? decodeURIComponent(found.slice(token.length)) : null;
}

export function writeCookie(
  name: string,
  value: string,
  maxAge = AUTH_COOKIE_MAX_AGE_SECONDS,
) {
  if (!browser) return;
  const secure = shouldUseSecureCookie() ? "; Secure" : "";
  document.cookie = `${name}=${encodeCookieValue(value)}; Path=/; Max-Age=${maxAge}; SameSite=Lax${secure}`;
}

export function clearCookie(name: string) {
  if (!browser) return;
  const secure = shouldUseSecureCookie() ? "; Secure" : "";
  document.cookie = `${name}=; Path=/; Max-Age=0; SameSite=Lax${secure}`;
}
