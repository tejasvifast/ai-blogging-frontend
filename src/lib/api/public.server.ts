import "server-only";

import { serverFetch, serverFetchList, serverFetchOrNull } from "./server";
import { CACHE_TAGS } from "@/lib/constants";
import type { Category, Post, PostListParams, Tag } from "@/types";

/** Serialize PostListParams into query values for the backend. */
function postParams(params: PostListParams = {}): Record<string, string | number | boolean> {
  const out: Record<string, string | number | boolean> = {};
  if (params.page) out.page = params.page;
  if (params.limit) out.limit = params.limit;
  if (params.search) out.search = params.search;
  if (params.category) out.category = params.category;
  if (params.tag) out.tag = params.tag;
  if (params.sort) out.sort = params.sort;
  if (params.featured !== undefined) out.featured = params.featured;
  return out;
}

/** Public, cached data-access for Server Components / ISR / sitemap. */
export const publicApi = {
  listPosts: (params?: PostListParams) =>
    serverFetchList<Post>("/posts", { params: postParams(params), tags: [CACHE_TAGS.posts] }),

  getPost: (slug: string) =>
    serverFetchOrNull<Post>(`/posts/${slug}`, {
      tags: [CACHE_TAGS.posts, CACHE_TAGS.post(slug)],
    }),

  featured: (limit = 5) =>
    serverFetchList<Post>("/posts", {
      params: { featured: true, limit, sort: "newest" },
      tags: [CACHE_TAGS.posts],
    }),

  popular: (limit = 5) =>
    serverFetchList<Post>("/posts", {
      params: { sort: "popular", limit },
      tags: [CACHE_TAGS.posts],
    }),

  categories: () =>
    serverFetch<Category[]>("/categories", { tags: [CACHE_TAGS.categories] }).then((r) => r.data),

  getCategory: (slug: string) =>
    serverFetchOrNull<Category>(`/categories/${slug}`, { tags: [CACHE_TAGS.categories] }),

  tags: () => serverFetch<Tag[]>("/tags", { tags: [CACHE_TAGS.tags] }).then((r) => r.data),

  getTag: (slug: string) =>
    serverFetchOrNull<Tag>(`/tags/${slug}`, { tags: [CACHE_TAGS.tags] }),
};
