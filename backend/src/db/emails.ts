import { col, paginateByUser, serialize, serializeMany, toId } from "./mongo";
import type { EmailDoc } from "./types";

const emails = () => col<EmailDoc>("emails");

export async function create(
  args: Omit<EmailDoc, "read" | "delivered" | "_creationTime"> & {
    scheduledFor?: number;
  },
) {
  const result = await emails().insertOne({
    ...args,
    read: false,
    delivered: false,
    _creationTime: Date.now(),
  });
  return serialize(await emails().findOne({ _id: result.insertedId }));
}

export async function countUnread(userId: string): Promise<number> {
  return emails().countDocuments({
    userId,
    read: { $ne: true },
    subject: { $regex: "confirm", $options: "i" },
  });
}

export async function listByUser(userId: string) {
  const docs = await emails().find({ userId }).sort({ _id: -1 }).toArray();
  return serializeMany(docs);
}

export async function paginatedListByUser(
  userId: string,
  numItems: number,
  cursor: string | null,
) {
  return paginateByUser(emails(), userId, numItems, cursor);
}

export async function getById(id: string) {
  const oid = toId(id);
  if (!oid) return null;
  return serialize(await emails().findOne({ _id: oid }));
}

export async function schedule(
  emailIds: string[],
  scheduledFor: number,
  userId: string,
) {
  const updated = [];
  for (const emailId of emailIds) {
    const email = await getById(emailId);
    if (email && email.userId === userId) {
      const oid = toId(emailId)!;
      await emails().updateOne({ _id: oid }, { $set: { scheduledFor } });
      updated.push(await getById(emailId));
    }
  }
  return updated.filter(Boolean);
}

export async function remove(id: string) {
  const oid = toId(id);
  if (!oid) return;
  await emails().deleteOne({ _id: oid });
}

export async function markRead(id: string) {
  const email = await getById(id);
  if (!email) return null;

  const oid = toId(id)!;
  const update: { $set: { read: boolean }; $unset?: { scheduledFor: "" } } = {
    $set: { read: true },
  };
  if (/confirm/i.test(email.subject || "")) {
    update.$unset = { scheduledFor: "" };
  }
  await emails().updateOne({ _id: oid }, update);
  return getById(id);
}

export async function getDueEmails() {
  const now = Date.now();
  const docs = await emails()
    .find({
      delivered: false,
      scheduledFor: { $exists: true, $ne: null, $lte: now },
    })
    .toArray();
  return serializeMany(docs);
}

export async function markEmailsDelivered(emailIds: string[]) {
  const oids = emailIds.map(toId).filter((id): id is NonNullable<typeof id> => !!id);
  if (oids.length === 0) return;
  await emails().updateMany({ _id: { $in: oids } }, { $set: { delivered: true } });
}

export async function removeBySender(senderId: string) {
  await emails().deleteMany({ senderId });
}
