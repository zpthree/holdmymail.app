import { browser } from "$app/environment";
import { emailApi, type Email } from "$lib/api";
import { PAGE_SIZE } from "$lib/constants";
import type { PageLoad } from "./$types";

export const load: PageLoad = async () => {
  if (!browser)
    return {
      emails: [] as Email[],
      cursor: null as string | null,
      hasMore: false,
    };

  const token = localStorage.getItem("token");
  if (!token)
    return {
      emails: [] as Email[],
      cursor: null as string | null,
      hasMore: false,
    };

  const result = await emailApi.listPaginated(token, PAGE_SIZE);
  return {
    emails: result.items,
    cursor: result.hasMore ? result.cursor : null,
    hasMore: result.hasMore,
  };
};
