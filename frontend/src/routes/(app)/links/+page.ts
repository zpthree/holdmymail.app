import { linkApi, type Link, type LinkTag } from "$lib/api";
import { PAGE_SIZE } from "$lib/constants";
import type { PageLoad } from "./$types";

export const load: PageLoad = async ({ parent, url }) => {
  const { token } = await parent();
  const selectedTags = url.searchParams.getAll("tag");
  if (!token)
    return {
      links: [] as Link[],
      cursor: null as string | null,
      hasMore: false,
      tags: [] as LinkTag[],
      selectedTags,
    };

  const [result, tags] = await Promise.all([
    linkApi.listPaginated(token, PAGE_SIZE, undefined, selectedTags),
    linkApi.listTags(token),
  ]);
  return {
    links: result.items,
    cursor: result.hasMore ? result.cursor : null,
    hasMore: result.hasMore,
    tags,
    selectedTags,
  };
};
