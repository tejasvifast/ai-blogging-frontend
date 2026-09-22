/**
 * API envelope + request DTOs — mirror `../ai-blogging-backend/src/utils/apiResponse.ts`
 * and the module validators.
 */
import type { AiProvider, PostStatus } from "./models";

/** Pagination block returned in the sibling `meta` of list responses. */
export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface ApiSuccess<T> {
  success: true;
  data: T;
  meta?: PaginationMeta;
}

export interface ApiErrorBody {
  success: false;
  error: {
    code: ApiErrorCode;
    message: string;
    details?: unknown; // e.g. Zod .flatten(): { formErrors, fieldErrors }
    stack?: string; // non-production only
  };
}

export type ApiErrorCode =
  | "BAD_REQUEST"
  | "VALIDATION_ERROR"
  | "UNAUTHORIZED"
  | "FORBIDDEN"
  | "NOT_FOUND"
  | "CONFLICT"
  | "RATE_LIMITED"
  | "SERVICE_UNAVAILABLE"
  | "INTERNAL_ERROR"
  | "DB_ERROR"
  | "DB_VALIDATION_ERROR";

/** Convenience: a list payload together with its pagination meta. */
export interface Paginated<T> {
  items: T[];
  meta: PaginationMeta;
}

// ─── Sort / query params ────────────────────────────────────────────────
export type PostSort = "newest" | "oldest" | "popular";

export interface PostListParams {
  page?: number;
  limit?: number;
  search?: string;
  category?: string; // slug
  tag?: string; // slug
  sort?: PostSort;
  featured?: boolean;
}

export interface AdminPostListParams extends PostListParams {
  status?: PostStatus;
}

// ─── Post write DTOs (createPostSchema / updatePostSchema) ───────────────
export interface CreatePostInput {
  title: string;
  content: string;
  excerpt?: string;
  slug?: string;
  coverImage?: string;
  coverImageAlt?: string;
  metaTitle?: string;
  metaDescription?: string;
  keywords?: string[];
  categoryId: string;
  tagIds?: string[];
  status?: PostStatus;
  isFeatured?: boolean;
  scheduledFor?: string; // ISO date; must be future when status=SCHEDULED
}

export type UpdatePostInput = Partial<CreatePostInput>;

// ─── Category / Tag write DTOs ───────────────────────────────────────────
export interface CreateCategoryInput {
  name: string;
  description?: string;
  icon?: string;
  color?: string; // hex
  slug?: string;
}
export type UpdateCategoryInput = Partial<CreateCategoryInput>;

export interface CreateTagInput {
  name: string;
  slug?: string;
}
export type UpdateTagInput = Partial<CreateTagInput>;

// ─── AI generation (generateArticleSchema) ──────────────────────────────
export interface GenerateArticleInput {
  topic: string;
  categoryId: string;
  tagIds?: string[];
  provider?: AiProvider;
  contentModel?: string;
  autoPublish?: boolean;
}

export interface EnqueuedJob {
  jobId: string;
  status: "queued";
}

export type JobState = "waiting" | "active" | "completed" | "failed" | "delayed";

export interface AiJobStatus {
  jobId: string;
  state: JobState;
  progress: number | Record<string, unknown>;
  attemptsMade: number;
  result: { postId: string; slug: string; status: string } | null;
  failedReason: string | null;
}

export interface GenerationLogListParams {
  page?: number;
  limit?: number;
  status?: "SUCCESS" | "FAILED";
}

// ─── Scheduler / cron write DTOs ─────────────────────────────────────────
export interface CreateCronJobInput {
  name: string;
  description?: string;
  cronExpression: string;
  enabled?: boolean;
  config: {
    topic?: string;
    topics?: string[];
    categoryId: string;
    tagIds?: string[];
    provider?: AiProvider;
    contentModel?: string;
    autoPublish?: boolean;
  };
}
export type UpdateCronJobInput = Partial<CreateCronJobInput>;
export type MaintenanceTask = "publish-scheduled" | "cleanup-drafts";

// ─── Newsletter ──────────────────────────────────────────────────────────
export interface NewsletterSubscribeResponse {
  message: string;
  status: string; // 'verified' if already subscribed, else pending
}
