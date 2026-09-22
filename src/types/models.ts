/**
 * Domain models — mirror `../ai-blogging-backend/prisma/schema.prisma` and the
 * shapes actually serialized by the API (relations included, dates as ISO strings).
 */

export type Role = "ADMIN" | "EDITOR";
export type Provider = "CREDENTIALS" | "GOOGLE";
export type PostStatus = "DRAFT" | "SCHEDULED" | "PUBLISHED" | "ARCHIVED";

/** ISO-8601 timestamp string (dates serialize as strings over JSON). */
export type ISODateString = string;

/** Full user minus password — returned by /auth/* endpoints. */
export interface User {
  id: string;
  email: string;
  name: string;
  avatar: string | null;
  bio: string | null;
  role: Role;
  provider: Provider;
  googleId: string | null;
  emailVerified: boolean;
  createdAt: ISODateString;
  updatedAt: ISODateString;
}

/** Public-safe author subset embedded in Post responses (no email/role). */
export interface PublicAuthor {
  id: string;
  name: string;
  avatar: string | null;
  bio: string | null;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  icon: string | null;
  color: string | null;
  createdAt: ISODateString;
  /** Present on list/detail endpoints — count of PUBLISHED posts only. */
  _count?: { posts: number };
}

export interface Tag {
  id: string;
  name: string;
  slug: string;
  _count?: { posts: number };
}

export interface Post {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  content: string;
  coverImage: string | null;
  coverImageAlt: string | null;
  metaTitle: string | null;
  metaDescription: string | null;
  keywords: string[];
  status: PostStatus;
  isFeatured: boolean;
  isAIGenerated: boolean;
  aiProvider: string | null;
  aiModel: string | null;
  authorId: string;
  categoryId: string;
  views: number;
  readingTime: number | null;
  publishedAt: ISODateString | null;
  scheduledFor: ISODateString | null;
  createdAt: ISODateString;
  updatedAt: ISODateString;
  // Relations (always included by the API):
  author: PublicAuthor;
  category: Category;
  tags: Tag[];
}

export interface CronJob {
  id: string;
  name: string;
  description: string | null;
  cronExpression: string;
  enabled: boolean;
  config: CronJobConfig;
  lastRunAt: ISODateString | null;
  lastRunStatus: string | null;
  nextRunAt: ISODateString | null;
  runCount: number;
  createdAt: ISODateString;
  updatedAt: ISODateString;
}

export interface CronJobConfig {
  topic?: string;
  topics?: string[];
  categoryId: string;
  tagIds?: string[];
  provider?: AiProvider;
  contentModel?: string;
  autoPublish?: boolean;
}

export type AiProvider = "anthropic" | "openai";

export interface GenerationLog {
  id: string;
  postId: string | null;
  cronJobId: string | null;
  status: string;
  provider: string;
  model: string;
  promptTokens: number | null;
  completionTokens: number | null;
  totalTokens: number | null;
  cost: number | null;
  durationMs: number | null;
  error: string | null;
  metadata: Record<string, unknown> | null;
  createdAt: ISODateString;
}
