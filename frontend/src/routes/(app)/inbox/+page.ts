import { browser } from "$app/environment";
import { emailApi, type Email } from "$lib/api";
import type { PageLoad } from "./$types";

export const load: PageLoad = async () => {
  if (!browser) return { emails: [] as Email[] };

  const token = localStorage.getItem("token");
  if (!token) return { emails: [] as Email[] };

  const emails = await emailApi.list(token);
  return { emails };
};
