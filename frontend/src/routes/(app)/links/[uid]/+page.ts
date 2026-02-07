import { browser } from "$app/environment";
import { linkApi, type Link } from "$lib/api";
import type { PageLoad } from "./$types";

export const load: PageLoad = async ({ params }) => {
  if (!browser) return { link: null as Link | null };

  const token = localStorage.getItem("token");
  if (!token) return { link: null as Link | null };

  const link = await linkApi.get(params.uid, token);
  return { link };
};
