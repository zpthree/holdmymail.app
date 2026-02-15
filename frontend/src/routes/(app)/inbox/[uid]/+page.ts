import { browser } from "$app/environment";
import { emailApi, type Email } from "$lib/api";
import type { PageLoad } from "./$types";

export const load: PageLoad = async ({ params, url }) => {
  if (!browser) {
    return { email: null as Email | null, from: null as string | null };
  }

  const token = localStorage.getItem("token");
  if (!token)
    return { email: null as Email | null, from: null as string | null };

  // get email
  const email = await emailApi.get(params.uid, token);

  // remove <style> tags from email body to prevent them from affecting site styles
  if (email && email.htmlBody) {
    const parser = new DOMParser();
    const doc = parser.parseFromString(email.htmlBody, "text/html");
    const styleTags = doc.querySelectorAll("style");
    styleTags.forEach((tag) => tag.remove());
    email.htmlBody = doc.documentElement.outerHTML;
  }

  // get "from" query parameter - used to make back link dynamic
  const from = url.searchParams.get("from");

  return { email, from };
};
