import { browser } from "$app/environment";
import { linkApi, type Link } from "$lib/api";
import { PAGE_SIZE } from "$lib/constants";
import type { PageLoad } from "./$types";

export const load: PageLoad = async () => {
  if (!browser)
    return {
      links: [] as Link[],
      cursor: null as string | null,
      hasMore: false,
    };

  const token = localStorage.getItem("token");
  if (!token)
    return {
      links: [] as Link[],
      cursor: null as string | null,
      hasMore: false,
    };

  const result = await linkApi.listPaginated(token, PAGE_SIZE);
  return {
    links: result.items,
    cursor: result.hasMore ? result.cursor : null,
    hasMore: result.hasMore,
  };
};
