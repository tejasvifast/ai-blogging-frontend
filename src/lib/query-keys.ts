import type {
  AdminPostListParams,
  GenerationLogListParams,
  PostListParams,
} from "@/types";

/** Centralized, type-safe query key factory for TanStack Query. */
export const queryKeys = {
  posts: {
    all: ["posts"] as const,
    list: (params?: PostListParams) => ["posts", "list", params ?? {}] as const,
    adminList: (params?: AdminPostListParams) => ["posts", "admin", params ?? {}] as const,
    bySlug: (slug: string) => ["posts", "slug", slug] as const,
    byId: (id: string) => ["posts", "id", id] as const,
  },
  categories: {
    all: ["categories"] as const,
    bySlug: (slug: string) => ["categories", slug] as const,
  },
  tags: {
    all: ["tags"] as const,
    bySlug: (slug: string) => ["tags", slug] as const,
  },
  ai: {
    job: (jobId: string) => ["ai", "job", jobId] as const,
    logs: (params?: GenerationLogListParams) => ["ai", "logs", params ?? {}] as const,
  },
  scheduler: {
    all: ["scheduler", "cron-jobs"] as const,
    byId: (id: string) => ["scheduler", "cron-jobs", id] as const,
  },
  auth: {
    me: ["auth", "me"] as const,
  },
} as const;
