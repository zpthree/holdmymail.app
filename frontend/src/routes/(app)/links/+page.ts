import { browser } from "$app/environment";
import { linkApi, type Link } from "$lib/api";
import type { PageLoad } from "./$types";

export const load: PageLoad = async () => {
  if (!browser) return { links: [] as Link[] };

  const token = localStorage.getItem("token");
  if (!token) return { links: [] as Link[] };

  const links = await linkApi.list(token);
  return { links };
};
