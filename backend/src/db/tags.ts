import { col, serialize, serializeMany, toId } from "./mongo";
import type { TagDoc } from "./types";

const tags = () => col<TagDoc>("tags");

export async function create(args: {
  userId: string;
  name: string;
  color?: string;
}) {
  const existing = await tags().findOne({ userId: args.userId, name: args.name });
  if (existing) return serialize(existing);

  const result = await tags().insertOne({
    ...args,
    _creationTime: Date.now(),
  });
  return serialize(await tags().findOne({ _id: result.insertedId }));
}

export async function listByUser(userId: string) {
  return serializeMany(await tags().find({ userId }).toArray());
}

export async function getById(id: string) {
  const oid = toId(id);
  if (!oid) return null;
  return serialize(await tags().findOne({ _id: oid }));
}

export async function update(
  id: string,
  updates: Partial<Pick<TagDoc, "name" | "color">>,
) {
  const oid = toId(id);
  if (!oid) return null;
  const filtered = Object.fromEntries(
    Object.entries(updates).filter(([, v]) => v !== undefined),
  );
  if (Object.keys(filtered).length > 0) {
    await tags().updateOne({ _id: oid }, { $set: filtered });
  }
  return serialize(await tags().findOne({ _id: oid }));
}

export async function remove(id: string) {
  const oid = toId(id);
  if (!oid) return;
  await tags().deleteOne({ _id: oid });
}

export async function resolveNames(
  userId: string,
  names: string[],
): Promise<string[]> {
  const tagIds: string[] = [];
  for (const name of names) {
    const trimmed = name.trim();
    if (!trimmed) continue;

    let tag = await tags().findOne({ userId, name: trimmed });
    if (!tag) {
      const result = await tags().insertOne({
        userId,
        name: trimmed,
        _creationTime: Date.now(),
      });
      tag = await tags().findOne({ _id: result.insertedId });
    }
    if (tag) tagIds.push(tag._id.toString());
  }
  return tagIds;
}
