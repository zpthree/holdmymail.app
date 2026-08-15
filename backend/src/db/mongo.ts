import {
  MongoClient,
  ObjectId,
  type Collection,
  type Db,
  type Document,
  type WithId,
} from "mongodb";

const MONGODB_URI =
  process.env.MONGODB_URI || "mongodb://mongodb:27017/holdmymail";

let client: MongoClient | null = null;
let db: Db | null = null;

export async function connectMongo(): Promise<Db> {
  if (db) return db;

  client = new MongoClient(MONGODB_URI);
  await client.connect();
  db = client.db();
  await ensureIndexes(db);
  console.log(`Connected to MongoDB (${db.databaseName})`);
  return db;
}

export function getDb(): Db {
  if (!db) {
    throw new Error("MongoDB is not connected. Call connectMongo() first.");
  }
  return db;
}

export function col<T extends Document>(name: string): Collection<T> {
  return getDb().collection<T>(name);
}

export function toId(id: string | ObjectId): ObjectId | null {
  try {
    return typeof id === "string" ? new ObjectId(id) : id;
  } catch {
    return null;
  }
}

function convertValue(value: unknown): unknown {
  if (value instanceof ObjectId) return value.toString();
  if (Array.isArray(value)) return value.map(convertValue);
  if (value && typeof value === "object" && value.constructor === Object) {
    const out: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(value as Record<string, unknown>)) {
      out[k] = convertValue(v);
    }
    return out;
  }
  return value;
}

export type Serialized<T> = T & { _id: string; _creationTime: number };

export function serialize<T extends Document>(
  doc: WithId<T> | null | undefined,
): Serialized<T> | null {
  if (!doc) return null;
  const { _id, ...rest } = doc;
  const converted = convertValue(rest) as T;
  return {
    ...converted,
    _id: _id.toString(),
    _creationTime:
      (doc as { _creationTime?: number })._creationTime ??
      _id.getTimestamp().getTime(),
  };
}

export function serializeMany<T extends Document>(
  docs: WithId<T>[],
): Serialized<T>[] {
  return docs.map((d) => serialize(d)!);
}

export async function paginateByUser<T extends Document>(
  collection: Collection<T>,
  userId: string,
  numItems: number,
  cursor: string | null,
): Promise<{
  page: Serialized<T>[];
  continueCursor: string;
  isDone: boolean;
}> {
  const filter: Record<string, unknown> = { userId };
  if (cursor) {
    const oid = toId(cursor);
    if (oid) filter._id = { $lt: oid };
  }

  const docs = await collection
    .find(filter as Document)
    .sort({ _id: -1 })
    .limit(numItems + 1)
    .toArray();

  const hasMore = docs.length > numItems;
  const pageDocs = hasMore ? docs.slice(0, numItems) : docs;
  const page = serializeMany(pageDocs as WithId<T>[]);
  const continueCursor = page.length ? page[page.length - 1]._id : "";

  return { page, continueCursor, isDone: !hasMore };
}

async function ensureIndexes(database: Db) {
  await database.collection("users").createIndexes([
    { key: { email: 1 }, unique: true },
    { key: { username: 1 }, unique: true },
  ]);
  await database.collection("tokens").createIndex({ token: 1 }, { unique: true });
  await database
    .collection("verificationTokens")
    .createIndex({ token: 1 }, { unique: true });
  await database
    .collection("passwordResetTokens")
    .createIndex({ token: 1 }, { unique: true });
  await database.collection("tags").createIndexes([
    { key: { userId: 1 } },
    { key: { userId: 1, name: 1 }, unique: true },
  ]);
  await database.collection("senders").createIndexes([
    { key: { userId: 1 } },
    { key: { userId: 1, email: 1 } },
  ]);
  await database.collection("emails").createIndexes([
    { key: { userId: 1 } },
    { key: { senderId: 1 } },
    { key: { delivered: 1, scheduledFor: 1 } },
    { key: { messageId: 1 }, unique: true, sparse: true },
  ]);
  await database.collection("digests").createIndex({ userId: 1 });
  await database.collection("links").createIndex({ userId: 1 });
}
