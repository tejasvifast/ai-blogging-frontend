"use client";

import {
  keepPreviousData,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { postsApi } from "@/lib/api/posts";
import { queryKeys } from "@/lib/query-keys";
import type {
  AdminPostListParams,
  CreatePostInput,
  PostListParams,
  UpdatePostInput,
} from "@/types";

/** Public post listing (client-side — search, filters, pagination). */
export function usePosts(params?: PostListParams) {
  return useQuery({
    queryKey: queryKeys.posts.list(params),
    queryFn: () => postsApi.list(params),
    placeholderData: keepPreviousData,
  });
}

export function usePost(slug: string, enabled = true) {
  return useQuery({
    queryKey: queryKeys.posts.bySlug(slug),
    queryFn: () => postsApi.getBySlug(slug),
    enabled: enabled && Boolean(slug),
  });
}

// ── Admin ──
export function useAdminPosts(params?: AdminPostListParams) {
  return useQuery({
    queryKey: queryKeys.posts.adminList(params),
    queryFn: () => postsApi.adminList(params),
    placeholderData: keepPreviousData,
  });
}

export function useAdminPost(id: string, enabled = true) {
  return useQuery({
    queryKey: queryKeys.posts.byId(id),
    queryFn: () => postsApi.adminGet(id),
    enabled: enabled && Boolean(id),
  });
}

export function useCreatePost() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: CreatePostInput) => postsApi.create(input),
    onSuccess: () => qc.invalidateQueries({ queryKey: queryKeys.posts.all }),
  });
}

export function useUpdatePost() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: UpdatePostInput }) =>
      postsApi.update(id, input),
    onSuccess: (post) => {
      qc.invalidateQueries({ queryKey: queryKeys.posts.all });
      qc.setQueryData(queryKeys.posts.byId(post.id), post);
    },
  });
}

export function usePublishPost() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => postsApi.publish(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: queryKeys.posts.all }),
  });
}

export function useDeletePost() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => postsApi.remove(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: queryKeys.posts.all }),
  });
}
