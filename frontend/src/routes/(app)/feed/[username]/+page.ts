import { error } from "@sveltejs/kit";
import { publicApi } from "$lib/api";
import { PAGE_SIZE } from "$lib/constants";
import type { PageLoad } from "./$types";

export const load: PageLoad = async ({ params, url }) => {
  const selectedTags = url.searchParams.getAll("tag");

  try {
    const [feed, result] = await Promise.all([
      publicApi.getFeed(params.username),
      publicApi.listLinks(params.username, PAGE_SIZE, undefined, selectedTags),
    ]);
    return {
      username: feed.username,
      tags: feed.tags,
      selectedTags,
      links: result.items,
      cursor: result.hasMore ? result.cursor : null,
      hasMore: result.hasMore,
    };
  } catch {
    throw error(404, "Feed not found");
  }
};
