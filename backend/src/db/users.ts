import { col, serialize, toId, type Serialized } from "./mongo";
import type { TokenDoc, UserDoc } from "./types";

const users = () => col<UserDoc>("users");
const tokens = () => col<TokenDoc>("tokens");
const verificationTokens = () => col<TokenDoc>("verificationTokens");
const passwordResetTokens = () => col<TokenDoc>("passwordResetTokens");

function now() {
  return Date.now();
}

export async function register(args: {
  email: string;
  passwordHash: string;
  username: string;
}): Promise<{ id: string; email: string; username: string }> {
  const existingEmail = await users().findOne({ email: args.email });
  if (existingEmail) throw new Error("Email already exists");

  const existingUsername = await users().findOne({ username: args.username });
  if (existingUsername) throw new Error("Username already taken");

  const result = await users().insertOne({
    email: args.email,
    passwordHash: args.passwordHash,
    username: args.username,
    _creationTime: now(),
  });

  return {
    id: result.insertedId.toString(),
    email: args.email,
    username: args.username,
  };
}

export async function getByEmail(
  email: string,
): Promise<Serialized<UserDoc> | null> {
  return serialize(await users().findOne({ email }));
}

export async function getByUsername(
  username: string,
): Promise<Serialized<UserDoc> | null> {
  return serialize(await users().findOne({ username }));
}

export async function getById(
  id: string,
): Promise<Serialized<UserDoc> | null> {
  const oid = toId(id);
  if (!oid) return null;
  return serialize(await users().findOne({ _id: oid }));
}

export async function update(
  id: string,
  updates: Record<string, unknown>,
): Promise<Serialized<UserDoc> | null> {
  const oid = toId(id);
  if (!oid) return null;
  const filtered = Object.fromEntries(
    Object.entries(updates).filter(([, v]) => v !== undefined),
  );
  if (Object.keys(filtered).length > 0) {
    await users().updateOne({ _id: oid }, { $set: filtered });
  }
  return serialize(await users().findOne({ _id: oid }));
}

export async function remove(id: string): Promise<void> {
  const oid = toId(id);
  if (!oid) return;
  await users().deleteOne({ _id: oid });
}

export async function createToken(args: {
  token: string;
  userId: string;
  expiresAt: number;
}): Promise<void> {
  await tokens().insertOne({ ...args, _creationTime: now() });
}

export async function getToken(
  token: string,
): Promise<Serialized<TokenDoc> | null> {
  return serialize(await tokens().findOne({ token }));
}

export async function deleteToken(token: string): Promise<void> {
  await tokens().deleteOne({ token });
}

export async function createVerificationToken(args: {
  token: string;
  userId: string;
  expiresAt: number;
}): Promise<void> {
  await verificationTokens().insertOne({ ...args, _creationTime: now() });
}

export async function getVerificationToken(
  token: string,
): Promise<Serialized<TokenDoc> | null> {
  return serialize(await verificationTokens().findOne({ token }));
}

export async function deleteVerificationToken(token: string): Promise<void> {
  await verificationTokens().deleteOne({ token });
}

export async function verifyEmail(userId: string): Promise<void> {
  const oid = toId(userId);
  if (!oid) return;
  await users().updateOne({ _id: oid }, { $set: { emailVerified: true } });
}

export async function createPasswordResetToken(args: {
  token: string;
  userId: string;
  expiresAt: number;
}): Promise<void> {
  await passwordResetTokens().insertOne({ ...args, _creationTime: now() });
}

export async function getPasswordResetToken(
  token: string,
): Promise<Serialized<TokenDoc> | null> {
  return serialize(await passwordResetTokens().findOne({ token }));
}

export async function deletePasswordResetToken(token: string): Promise<void> {
  await passwordResetTokens().deleteOne({ token });
}

export async function updatePassword(
  userId: string,
  passwordHash: string,
): Promise<void> {
  const oid = toId(userId);
  if (!oid) return;
  await users().updateOne({ _id: oid }, { $set: { passwordHash } });
}
