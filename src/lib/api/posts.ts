import { apiClient, unwrap, unwrapList } from "./client";
import type {
  AdminPostListParams,
  ApiSuccess,
  CreatePostInput,
  Post,
  PostListParams,
  UpdatePostInput,
} from "@/types";

/**
 * Client-side Post API (Axios + Auth.js session). Public reads here are used by
 * interactive client components (search, infinite scroll); server-rendered pages
 * should use `lib/api/public.server.ts` for ISR caching + SEO.
 */
export const postsApi = {
  // ── Public ──
  list: (params?: PostListParams) =>
    unwrapList<Post>(apiClient.get<ApiSuccess<Post[]>>("/posts", { params })),

  getBySlug: (slug: string) =>
    unwrap<Post>(apiClient.get<ApiSuccess<Post>>(`/posts/${slug}`)),

  // ── Admin (require Bearer) ──
  adminList: (params?: AdminPostListParams) =>
    unwrapList<Post>(apiClient.get<ApiSuccess<Post[]>>("/admin/posts", { params })),

  adminGet: (id: string) =>
    unwrap<Post>(apiClient.get<ApiSuccess<Post>>(`/admin/posts/${id}`)),

  create: (input: CreatePostInput) =>
    unwrap<Post>(apiClient.post<ApiSuccess<Post>>("/admin/posts", input)),

  update: (id: string, input: UpdatePostInput) =>
    unwrap<Post>(apiClient.patch<ApiSuccess<Post>>(`/admin/posts/${id}`, input)),

  publish: (id: string) =>
    unwrap<Post>(apiClient.post<ApiSuccess<Post>>(`/admin/posts/${id}/publish`)),

  remove: (id: string) => apiClient.delete(`/admin/posts/${id}`).then(() => undefined),
};
