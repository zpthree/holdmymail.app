import { browser } from "$app/environment";
import type { LayoutLoad } from "./$types";

async function sha256(message: string): Promise<string> {
  const msgBuffer = new TextEncoder().encode(message);
  const hashBuffer = await crypto.subtle.digest("SHA-256", msgBuffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
}

async function getGravatarUrl(email: string): Promise<string | null> {
  const hash = await sha256(email.trim().toLowerCase());
  const url = `https://www.gravatar.com/avatar/${hash}?d=404&s=80`;

  try {
    const res = await fetch(url, { method: "HEAD" });
    return res.ok ? url : null;
  } catch {
    return null;
  }
}

export const load: LayoutLoad = async () => {
  if (!browser) return { gravatarUrl: null };

  // Return cached Gravatar URL if available
  const cached = localStorage.getItem("gravatarUrl");
  if (cached) return { gravatarUrl: cached };

  const email = localStorage.getItem("email");
  if (!email) return { gravatarUrl: null };

  const gravatarUrl = await getGravatarUrl(email);

  if (gravatarUrl) {
    localStorage.setItem("gravatarUrl", gravatarUrl);
  }

  return { gravatarUrl };
};
