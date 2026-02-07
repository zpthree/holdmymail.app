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

  // mark email as read, if it hasn't been read yet
  if (email && !email.read) {
    emailApi.markRead(params.uid, token).catch(() => {});
  }

  // get "from" query parameter - used to make back link dynamic
  const from = url.searchParams.get("from");

  return { email, from };
};
