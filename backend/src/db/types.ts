export interface UserDoc {
  email: string;
  passwordHash: string;
  username: string;
  emailVerified?: boolean;
  deliveryEmail?: string;
  digestFrequency?: string;
  digestDay?: string;
  digestTime?: string;
  timezone?: string;
  _creationTime: number;
}

export interface TokenDoc {
  token: string;
  userId: string;
  expiresAt: number;
  _creationTime: number;
}

export interface TagDoc {
  userId: string;
  name: string;
  color?: string;
  _creationTime: number;
}

export interface SenderDoc {
  userId: string;
  email: string;
  name: string;
  color?: string;
  tagIds?: string[];
  digestFrequency?: string;
  digestDay?: string;
  digestTime?: string;
  _creationTime: number;
}

export interface EmailDoc {
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
  read?: boolean;
  scheduledFor?: number;
  delivered: boolean;
  _creationTime: number;
}

export interface DigestDoc {
  userId: string;
  emailIds: string[];
  subject: string;
  htmlBody: string;
  sentAt: number;
  emailCount: number;
  _creationTime: number;
}

export interface LinkDoc {
  userId: string;
  url: string;
  title?: string;
  description?: string;
  tagIds?: string[];
  ogTitle?: string;
  ogDescription?: string;
  ogImage?: string;
  ogSiteName?: string;
  favicon?: string;
  _creationTime: number;
}
