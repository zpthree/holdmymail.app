import { tags } from "./db";

export interface HydratedTag {
  _id: string;
  name: string;
  color?: string;
}

/**
 * Resolve an array of tag names to tag IDs for a user.
 * Creates any tags that don't exist yet.
 */
export async function resolveTagNames(
  userId: string,
  tagNames: string[],
): Promise<string[]> {
  return tags.resolveNames(userId, tagNames);
}

/**
 * Hydrate an array of tag IDs into full tag objects.
 */
export async function hydrateTags(
  tagIds: string[] | undefined,
): Promise<HydratedTag[]> {
  if (!tagIds || tagIds.length === 0) return [];

  const found = await Promise.all(tagIds.map((id) => tags.getById(id)));

  return found
    .filter(Boolean)
    .map((t) => ({ _id: t!._id, name: t!.name, color: t!.color }));
}

/**
 * Take a raw sender/link doc and replace tagIds with hydrated tags array.
 */
export async function hydrateItem<T extends { tagIds?: string[] }>(
  item: T,
): Promise<Omit<T, "tagIds"> & { tags: HydratedTag[] }> {
  const tags = await hydrateTags(item.tagIds);
  const { tagIds, ...rest } = item;
  return { ...rest, tags } as Omit<T, "tagIds"> & { tags: HydratedTag[] };
}

/**
 * Hydrate an array of items.
 */
export async function hydrateItems<T extends { tagIds?: string[] }>(
  items: T[],
): Promise<(Omit<T, "tagIds"> & { tags: HydratedTag[] })[]> {
  return Promise.all(items.map(hydrateItem));
}
