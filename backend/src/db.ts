import type { User, Sender, Email, AuthToken } from "./types";

// In-memory storage (replace with a real database later)
export const users = new Map<string, User>();
export const senders = new Map<string, Sender>();
export const emails = new Map<string, Email>();
export const tokens = new Map<string, AuthToken>();
