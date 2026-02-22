const API_URL = import.meta.env.VITE_API_URL || "";
const DEFAULT_DEV_API_URL = "http://localhost:3000";

interface ApiOptions {
  method?: string;
  body?: unknown;
  token?: string | null;
}

export async function api<T>(
  endpoint: string,
  options: ApiOptions = {},
): Promise<T> {
  const baseUrl = API_URL || (import.meta.env.DEV ? DEFAULT_DEV_API_URL : "");
  if (!baseUrl) {
    throw new Error(
      "VITE_API_URL is not set. Configure it in your deployment environment.",
    );
  }

  const { method = "GET", body, token } = options;

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const res = await fetch(`${baseUrl}${endpoint}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });

  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.error || "Something went wrong");
  }

  return data;
}

/** Paginated response shape returned by list endpoints when ?limit= is used */
export interface PaginatedResponse<T> {
  items: T[];
  cursor: string;
  hasMore: boolean;
}

// Auth API
export const authApi = {
  register: (email: string, password: string, username: string) =>
    api<{ id: string; email: string; username: string }>("/auth/register", {
      method: "POST",
      body: { email, password, username },
    }),

  login: (email: string, password: string) =>
    api<{ token: string; userId: string }>("/auth/login", {
      method: "POST",
      body: { email, password },
    }),

  logout: (token: string) =>
    api<{ message: string }>("/auth/logout", {
      method: "POST",
      token,
    }),

  getUser: (id: string, token: string) =>
    api<{
      id: string;
      email: string;
      username: string;
      deliveryEmail: string;
      digestFrequency: string;
      digestDay: string;
      digestTime: string;
      timezone: string;
      createdAt: number;
    }>(`/auth/${id}`, { token }),

  updateUser: (
    id: string,
    data: {
      email?: string;
      password?: string;
      currentPassword?: string;
      deliveryEmail?: string;
      digestFrequency?: string;
      digestDay?: string;
      digestTime?: string;
      timezone?: string;
    },
    token: string,
  ) =>
    api<{ id: string; email: string }>(`/auth/${id}`, {
      method: "PUT",
      body: data,
      token,
    }),

  deleteUser: (id: string, token: string) =>
    api<{ message: string }>(`/auth/${id}`, { method: "DELETE", token }),

  /** Mint a new independent token using an existing valid token */
  mintToken: (token: string) =>
    api<{ token: string; userId: string }>("/auth/token", {
      method: "POST",
      token,
    }),

  verifyEmail: (token: string) =>
    api<{ message: string }>("/auth/verify-email", {
      method: "POST",
      body: { token },
    }),

  resendVerification: (email: string) =>
    api<{ message: string }>("/auth/resend-verification", {
      method: "POST",
      body: { email },
    }),

  forgotPassword: (email: string) =>
    api<{ message: string }>("/auth/forgot-password", {
      method: "POST",
      body: { email },
    }),

  resetPassword: (token: string, password: string) =>
    api<{ message: string }>("/auth/reset-password", {
      method: "POST",
      body: { token, password },
    }),
};

// Email types
export interface Email {
  _id: string;
  userId: string;
  senderId?: string;
  fromEmail: string;
  fromName: string;
  to: string;
  subject: string;
  textBody: string;
  htmlBody: string;
  date: string;
  messageId: string;
  scheduledFor?: number;
  read: boolean;
  delivered: boolean;
  _creationTime: number;
}

// Tag types
export interface Tag {
  _id: string;
  userId: string;
  name: string;
  color?: string;
  _creationTime: number;
}

// Sender types
export interface Sender {
  _id: string;
  userId: string;
  email: string;
  name: string;
  color: string;
  tags: Tag[];
  digestFrequency?: string;
  digestDay?: string;
  digestTime?: string;
  _creationTime: number;
}

// Email API
export const emailApi = {
  list: (token: string) => api<Email[]>("/email", { token }),

  listPaginated: (token: string, limit = 25, cursor?: string) =>
    api<PaginatedResponse<Email>>(
      `/email?limit=${limit}${cursor ? `&cursor=${cursor}` : ""}`,
      { token },
    ),

  get: (id: string, token: string) => api<Email>(`/email/${id}`, { token }),

  delete: (id: string, token: string) =>
    api<{ message: string }>(`/email/${id}`, { method: "DELETE", token }),

  markRead: (id: string, token: string) =>
    api<Email>(`/email/${id}/read`, { method: "PATCH", token }),

  schedule: (emailIds: string[], scheduledFor: string, token: string) =>
    api<{ scheduled: number }>("/email/schedule", {
      method: "POST",
      body: { emailIds, scheduledFor },
      token,
    }),

  bulkDelete: (ids: string[], token: string) =>
    api<{ deleted: number }>("/email/bulk", {
      method: "DELETE",
      body: { ids },
      token,
    }),
};

// Sender API
export const senderApi = {
  list: (token: string) => api<Sender[]>("/sender", { token }),

  get: (id: string, token: string) => api<Sender>(`/sender/${id}`, { token }),

  create: (
    data: { email: string; name: string; tags?: string[] },
    token: string,
  ) => api<Sender>("/sender", { method: "POST", body: data, token }),

  update: (
    id: string,
    data: {
      email?: string;
      name?: string;
      color?: string;
      tags?: string[];
      digestFrequency?: string;
      digestDay?: string;
      digestTime?: string;
    },
    token: string,
  ) => api<Sender>(`/sender/${id}`, { method: "PUT", body: data, token }),

  delete: (id: string, token: string) =>
    api<{ message: string }>(`/sender/${id}`, { method: "DELETE", token }),
};

// Link types
export interface Link {
  _id: string;
  userId: string;
  url: string;
  title?: string;
  description?: string;
  tags: Tag[];
  ogTitle?: string;
  ogDescription?: string;
  ogImage?: string;
  ogSiteName?: string;
  favicon?: string;
  _creationTime: number;
}

// Link API
export const linkApi = {
  list: (token: string) => api<Link[]>("/link", { token }),

  listPaginated: (token: string, limit = 25, cursor?: string) =>
    api<PaginatedResponse<Link>>(
      `/link?limit=${limit}${cursor ? `&cursor=${cursor}` : ""}`,
      { token },
    ),

  get: (id: string, token: string) => api<Link>(`/link/${id}`, { token }),

  create: (
    data: {
      url: string;
      title?: string;
      description?: string;
      tags?: string[];
    },
    token: string,
  ) => api<Link>("/link", { method: "POST", body: data, token }),

  update: (
    id: string,
    data: {
      url?: string;
      title?: string;
      description?: string;
      tags?: string[];
    },
    token: string,
  ) => api<Link>(`/link/${id}`, { method: "PUT", body: data, token }),

  delete: (id: string, token: string) =>
    api<{ message: string }>(`/link/${id}`, { method: "DELETE", token }),

  bulkDelete: (ids: string[], token: string) =>
    api<{ deleted: number }>("/link/bulk", {
      method: "DELETE",
      body: { ids },
      token,
    }),
};

// Tag API
export const tagApi = {
  list: (token: string) => api<Tag[]>("/tag", { token }),

  create: (data: { name: string; color?: string }, token: string) =>
    api<Tag>("/tag", { method: "POST", body: data, token }),

  update: (
    id: string,
    data: Partial<Pick<Tag, "name" | "color">>,
    token: string,
  ) => api<Tag>(`/tag/${id}`, { method: "PUT", body: data, token }),

  delete: (id: string, token: string) =>
    api<{ message: string }>(`/tag/${id}`, { method: "DELETE", token }),
};

// Digest types
export interface Digest {
  _id: string;
  userId: string;
  emailIds: string[];
  subject: string;
  htmlBody: string;
  sentAt: number;
  emailCount: number;
  _creationTime: number;
}

// Digest API
export const digestApi = {
  list: (token: string) => api<Digest[]>("/digest", { token }),

  listPaginated: (token: string, limit = 25, cursor?: string) =>
    api<PaginatedResponse<Digest>>(
      `/digest?limit=${limit}${cursor ? `&cursor=${cursor}` : ""}`,
      { token },
    ),

  get: (id: string, token: string) => api<Digest>(`/digest/${id}`, { token }),
};
