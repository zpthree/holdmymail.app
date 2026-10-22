import { col, paginateByUser, serialize, serializeMany, toId } from "./mongo";
import type { LinkDoc } from "./types";

const links = () => col<LinkDoc>("links");

export async function listByUserSince(userId: string, since: number) {
  const docs = await links()
    .find({ userId, _creationTime: { $gt: since } })
    .sort({ _id: -1 })
    .toArray();
  return serializeMany(docs);
}

export async function create(args: Omit<LinkDoc, "_creationTime">) {
  const result = await links().insertOne({
    ...args,
    _creationTime: Date.now(),
  });
  return serialize(await links().findOne({ _id: result.insertedId }));
}

export async function listByUser(userId: string) {
  const docs = await links().find({ userId }).sort({ _id: -1 }).toArray();
  return serializeMany(docs);
}

export interface LinkListFilter {
  /** Only include links tagged with at least one of these tag IDs */
  tagIds?: string[];
  /** Exclude links hidden from the public feed */
  publicOnly?: boolean;
}

function buildFilter({ tagIds, publicOnly }: LinkListFilter = {}) {
  const filter: Record<string, unknown> = {};
  if (tagIds) filter.tagIds = { $in: tagIds };
  if (publicOnly) filter.hidden = { $ne: true };
  return filter;
}

export async function paginatedListByUser(
  userId: string,
  numItems: number,
  cursor: string | null,
  listFilter: LinkListFilter = {},
) {
  return paginateByUser(
    links(),
    userId,
    numItems,
    cursor,
    buildFilter(listFilter),
  );
}

/** Distinct tag IDs used across a user's links */
export async function distinctTagIds(
  userId: string,
  listFilter: LinkListFilter = {},
): Promise<string[]> {
  const ids = await links().distinct("tagIds", {
    ...buildFilter(listFilter),
    userId,
  });
  return ids.filter((id): id is string => typeof id === "string");
}

export async function setHidden(userId: string, ids: string[], hidden: boolean) {
  const oids = ids
    .map(toId)
    .filter((id): id is NonNullable<typeof id> => !!id);
  if (oids.length === 0) return 0;
  const result = await links().updateMany(
    { _id: { $in: oids }, userId },
    { $set: { hidden } },
  );
  return result.matchedCount;
}

export async function getById(id: string) {
  const oid = toId(id);
  if (!oid) return null;
  return serialize(await links().findOne({ _id: oid }));
}

export async function update(
  id: string,
  updates: Partial<
    Pick<
      LinkDoc,
      | "url"
      | "title"
      | "description"
      | "tagIds"
      | "ogTitle"
      | "ogDescription"
      | "ogImage"
      | "ogSiteName"
      | "favicon"
      | "hidden"
    >
  >,
) {
  const oid = toId(id);
  if (!oid) return null;
  const filtered = Object.fromEntries(
    Object.entries(updates).filter(([, v]) => v !== undefined),
  );
  if (Object.keys(filtered).length > 0) {
    await links().updateOne({ _id: oid }, { $set: filtered });
  }
  return serialize(await links().findOne({ _id: oid }));
}

export async function remove(id: string) {
  const oid = toId(id);
  if (!oid) return;
  await links().deleteOne({ _id: oid });
}
