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

  const found = await tags.getByIds(tagIds);
  const byId = new Map(found.map((t) => [t._id, t]));

  return tagIds
    .map((id) => byId.get(id))
    .filter((t) => t !== undefined)
    .map((t) => ({ _id: t._id, name: t.name, color: t.color }));
}

/**
 * Take a raw sender/link doc and replace tagIds with hydrated tags array.
 */
export async function hydrateItem<T extends { tagIds?: string[] }>(
  item: T,
): Promise<Omit<T, "tagIds"> & { tags: HydratedTag[] }> {
  const [hydrated] = await hydrateItems([item]);
  return hydrated;
}

/**
 * Hydrate an array of items, fetching all referenced tags in a single query.
 */
export async function hydrateItems<T extends { tagIds?: string[] }>(
  items: T[],
): Promise<(Omit<T, "tagIds"> & { tags: HydratedTag[] })[]> {
  const allIds = [...new Set(items.flatMap((item) => item.tagIds ?? []))];
  const found = allIds.length > 0 ? await tags.getByIds(allIds) : [];
  const byId = new Map(
    found.map((t) => [t._id, { _id: t._id, name: t.name, color: t.color }]),
  );

  return items.map((item) => {
    const { tagIds, ...rest } = item;
    const itemTags = (tagIds ?? [])
      .map((id) => byId.get(id))
      .filter((t) => t !== undefined);
    return { ...rest, tags: itemTags } as Omit<T, "tagIds"> & {
      tags: HydratedTag[];
    };
  });
}
