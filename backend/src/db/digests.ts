import { col, paginateByUser, serialize, serializeMany, toId } from "./mongo";
import type { DigestDoc } from "./types";

const digests = () => col<DigestDoc>("digests");

export async function getLatestByUser(userId: string) {
  const doc = await digests().find({ userId }).sort({ sentAt: -1 }).limit(1).next();
  return serialize(doc);
}

export async function create(args: {
  userId: string;
  emailIds: string[];
  subject: string;
  htmlBody: string;
  emailCount: number;
}) {
  const sentAt = Date.now();
  const result = await digests().insertOne({
    ...args,
    sentAt,
    _creationTime: sentAt,
  });
  return serialize(await digests().findOne({ _id: result.insertedId }));
}

export async function updateHtmlBody(id: string, htmlBody: string) {
  const oid = toId(id);
  if (!oid) return null;
  await digests().updateOne({ _id: oid }, { $set: { htmlBody } });
  return serialize(await digests().findOne({ _id: oid }));
}

export async function listByUser(userId: string) {
  const docs = await digests().find({ userId }).sort({ sentAt: -1 }).toArray();
  return serializeMany(docs);
}

export async function paginatedListByUser(
  userId: string,
  numItems: number,
  cursor: string | null,
) {
  return paginateByUser(digests(), userId, numItems, cursor);
}

export async function getById(id: string) {
  const oid = toId(id);
  if (!oid) return null;
  return serialize(await digests().findOne({ _id: oid }));
}
