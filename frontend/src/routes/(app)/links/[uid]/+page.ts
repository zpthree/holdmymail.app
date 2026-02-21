import { linkApi, type Link } from "$lib/api";
import type { PageLoad } from "./$types";

export const load: PageLoad = async ({ params, parent }) => {
  const { token } = await parent();
  if (!token) return { link: null as Link | null };

  const link = await linkApi.get(params.uid, token);
  return { link };
};
