export function isAdmin(username?: string | null, email?: string | null): boolean {
  const names = (process.env.ADMIN_USERNAMES || "")
    .split(",")
    .map((value) => value.trim().toLowerCase())
    .filter(Boolean);
  const emails = (process.env.ADMIN_EMAILS || "")
    .split(",")
    .map((value) => value.trim().toLowerCase())
    .filter(Boolean);

  if (username && names.includes(username.toLowerCase())) return true;
  if (email && emails.includes(email.toLowerCase())) return true;
  return false;
}
