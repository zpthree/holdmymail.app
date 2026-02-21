import { digestApi, type Digest } from "$lib/api";
import { PAGE_SIZE } from "$lib/constants";
import type { PageLoad } from "./$types";

export const load: PageLoad = async ({ parent }) => {
  const { token } = await parent();
  if (!token)
    return {
      digests: [] as Digest[],
      cursor: null as string | null,
      hasMore: false,
    };

  const result = await digestApi.listPaginated(token, PAGE_SIZE);
  return {
    digests: result.items,
    cursor: result.hasMore ? result.cursor : null,
    hasMore: result.hasMore,
  };
};
