export interface User {
  id: string;
  email: string;
  passwordHash: string;
  createdAt: Date;
}

export interface Sender {
  id: string;
  userId: string;
  email: string;
  name: string;
  tags: string[];
  createdAt: Date;
}

export interface Email {
  id: string;
  userId: string;
  senderId: string;
  subject: string;
  body: string;
  receivedAt: Date;
  scheduledFor?: Date;
  delivered: boolean;
}

export interface AuthToken {
  token: string;
  userId: string;
  expiresAt: Date;
}
