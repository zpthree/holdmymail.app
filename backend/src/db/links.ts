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

export async function paginatedListByUser(
  userId: string,
  numItems: number,
  cursor: string | null,
) {
  return paginateByUser(links(), userId, numItems, cursor);
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
