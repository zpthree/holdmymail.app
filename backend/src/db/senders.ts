import { col, serialize, serializeMany, toId } from "./mongo";
import { removeBySender } from "./emails";
import type { SenderDoc } from "./types";

const senders = () => col<SenderDoc>("senders");

export async function create(args: {
  userId: string;
  email: string;
  name: string;
  color?: string;
  tagIds?: string[];
  digestFrequency?: string;
  digestDay?: string;
  digestTime?: string;
}) {
  const result = await senders().insertOne({
    ...args,
    color: args.color ?? "#0066cc",
    _creationTime: Date.now(),
  });
  return serialize(await senders().findOne({ _id: result.insertedId }));
}

export async function listByUser(userId: string) {
  return serializeMany(await senders().find({ userId }).toArray());
}

export async function getById(id: string) {
  const oid = toId(id);
  if (!oid) return null;
  return serialize(await senders().findOne({ _id: oid }));
}

export async function getByUserAndEmail(userId: string, email: string) {
  return serialize(await senders().findOne({ userId, email }));
}

export async function update(
  id: string,
  updates: Partial<
    Pick<
      SenderDoc,
      | "email"
      | "name"
      | "color"
      | "tagIds"
      | "digestFrequency"
      | "digestDay"
      | "digestTime"
    >
  >,
) {
  const oid = toId(id);
  if (!oid) return null;
  const existing = await senders().findOne({ _id: oid });
  const filtered = Object.fromEntries(
    Object.entries(updates).filter(([, v]) => v !== undefined),
  );
  if (existing && !existing.color && !filtered.color) {
    filtered.color = "#0066cc";
  }
  if (Object.keys(filtered).length > 0) {
    await senders().updateOne({ _id: oid }, { $set: filtered });
  }
  return serialize(await senders().findOne({ _id: oid }));
}

export async function remove(id: string) {
  await removeBySender(id);
  const oid = toId(id);
  if (!oid) return;
  await senders().deleteOne({ _id: oid });
}
