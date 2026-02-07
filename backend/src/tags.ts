import { convex, api } from "./convex";
import type { Id } from "../convex/_generated/dataModel";

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
  userId: Id<"users">,
  tagNames: string[],
): Promise<Id<"tags">[]> {
  const ids = await convex.mutation(api.tags.resolveNames, {
    userId,
    names: tagNames,
  });
  return ids as Id<"tags">[];
}

/**
 * Hydrate an array of tag IDs into full tag objects.
 */
export async function hydrateTags(
  tagIds: Id<"tags">[] | undefined,
): Promise<HydratedTag[]> {
  if (!tagIds || tagIds.length === 0) return [];

  const tags = await Promise.all(
    tagIds.map((id) => convex.query(api.tags.getById, { id })),
  );

  return tags
    .filter(Boolean)
    .map((t) => ({ _id: t!._id, name: t!.name, color: t!.color }));
}

/**
 * Take a raw sender/link doc and replace tagIds with hydrated tags array.
 */
export async function hydrateItem<T extends { tagIds?: Id<"tags">[] }>(
  item: T,
): Promise<Omit<T, "tagIds"> & { tags: HydratedTag[] }> {
  const tags = await hydrateTags(item.tagIds);
  const { tagIds, ...rest } = item;
  return { ...rest, tags } as Omit<T, "tagIds"> & { tags: HydratedTag[] };
}

/**
 * Hydrate an array of items.
 */
export async function hydrateItems<T extends { tagIds?: Id<"tags">[] }>(
  items: T[],
): Promise<(Omit<T, "tagIds"> & { tags: HydratedTag[] })[]> {
  return Promise.all(items.map(hydrateItem));
}
