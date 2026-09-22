"use client";

import { useState } from "react";
import Link from "next/link";
import { toast } from "sonner";
import { Plus, Pencil, Trash2, Send, Eye, Search, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { StatusBadge } from "./StatusBadge";
import { ConfirmDialog } from "./ConfirmDialog";
import { AdminPageHeader } from "./AdminPageHeader";
import { useAdminPosts, useDeletePost, usePublishPost } from "@/hooks/usePosts";
import { useDebounce } from "@/hooks/useDebounce";
import { ApiError } from "@/lib/api/errors";
import type { Post, PostStatus } from "@/types";

const PAGE_SIZE = 15;
const STATUS_OPTIONS: (PostStatus | "ALL")[] = [
  "ALL",
  "PUBLISHED",
  "DRAFT",
  "SCHEDULED",
  "ARCHIVED",
];

export function PostsListClient() {
  const [page, setPage] = useState(1);
  const [status, setStatus] = useState<PostStatus | "ALL">("ALL");
  const [searchInput, setSearchInput] = useState("");
  const search = useDebounce(searchInput, 350);

  const { data, isLoading, isError, error } = useAdminPosts({
    page,
    limit: PAGE_SIZE,
    ...(status !== "ALL" ? { status } : {}),
    ...(search ? { search } : {}),
  });

  const publishPost = usePublishPost();
  const deletePost = useDeletePost();
  const [toDelete, setToDelete] = useState<Post | null>(null);

  async function handlePublish(post: Post) {
    try {
      await publishPost.mutateAsync(post.id);
      toast.success(`“${post.title}” published`);
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Failed to publish");
    }
  }

  async function handleDelete() {
    if (!toDelete) return;
    try {
      await deletePost.mutateAsync(toDelete.id);
      toast.success("Post deleted");
      setToDelete(null);
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Failed to delete");
    }
  }

  const posts = data?.items ?? [];
  const meta = data?.meta;
  const totalPages = meta?.totalPages ?? 1;

  return (
    <div>
      <AdminPageHeader
        title="Posts"
        description="Create, edit, publish, and manage all articles."
        actions={
          <Button asChild>
            <Link href="/admin/posts/new">
              <Plus className="size-4" /> New Post
            </Link>
          </Button>
        }
      />

      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-[var(--color-muted-foreground)]" />
          <Input
            className="pl-9"
            placeholder="Search posts…"
            value={searchInput}
            onChange={(e) => {
              setSearchInput(e.target.value);
              setPage(1);
            }}
          />
        </div>
        <Select
          className="sm:w-48"
          value={status}
          onChange={(e) => {
            setStatus(e.target.value as PostStatus | "ALL");
            setPage(1);
          }}
        >
          {STATUS_OPTIONS.map((s) => (
            <option key={s} value={s}>
              {s === "ALL" ? "All statuses" : s.charAt(0) + s.slice(1).toLowerCase()}
            </option>
          ))}
        </Select>
      </div>

      <Card>
        {isLoading ? (
          <div className="space-y-3 p-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} className="h-12 w-full" />
            ))}
          </div>
        ) : isError ? (
          <div className="p-8 text-center text-sm text-red-500">
            {error instanceof ApiError ? error.message : "Failed to load posts."}
          </div>
        ) : posts.length === 0 ? (
          <div className="p-12 text-center">
            <p className="text-[var(--color-muted-foreground)]">No posts found.</p>
            <Button asChild className="mt-4">
              <Link href="/admin/posts/new">
                <Plus className="size-4" /> Create your first post
              </Link>
            </Button>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Title</TableHead>
                <TableHead className="w-28">Status</TableHead>
                <TableHead className="hidden md:table-cell">Category</TableHead>
                <TableHead className="hidden w-20 lg:table-cell">Views</TableHead>
                <TableHead className="w-40 text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {posts.map((post) => (
                <TableRow key={post.id}>
                  <TableCell>
                    <div className="font-medium">{post.title}</div>
                    <div className="text-xs text-[var(--color-muted-foreground)]">
                      {post.isAIGenerated ? "AI-generated · " : ""}
                      {new Date(post.updatedAt).toLocaleDateString()}
                    </div>
                  </TableCell>
                  <TableCell>
                    <StatusBadge status={post.status} />
                  </TableCell>
                  <TableCell className="hidden md:table-cell">{post.category?.name ?? "—"}</TableCell>
                  <TableCell className="hidden lg:table-cell">{post.views}</TableCell>
                  <TableCell>
                    <div className="flex items-center justify-end gap-1">
                      {post.status === "PUBLISHED" && (
                        <Button asChild variant="ghost" size="icon" title="View">
                          <Link href={`/blog/${post.slug}`} target="_blank">
                            <Eye className="size-4" />
                          </Link>
                        </Button>
                      )}
                      {post.status !== "PUBLISHED" && (
                        <Button
                          variant="ghost"
                          size="icon"
                          title="Publish"
                          disabled={publishPost.isPending}
                          onClick={() => handlePublish(post)}
                        >
                          {publishPost.isPending && publishPost.variables === post.id ? (
                            <Loader2 className="size-4 animate-spin" />
                          ) : (
                            <Send className="size-4" />
                          )}
                        </Button>
                      )}
                      <Button asChild variant="ghost" size="icon" title="Edit">
                        <Link href={`/admin/posts/${post.id}/edit`}>
                          <Pencil className="size-4" />
                        </Link>
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        title="Delete"
                        className="text-red-500 hover:text-red-600"
                        onClick={() => setToDelete(post)}
                      >
                        <Trash2 className="size-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </Card>

      {meta && totalPages > 1 && (
        <div className="mt-4 flex items-center justify-between">
          <p className="text-sm text-[var(--color-muted-foreground)]">
            Page {meta.page} of {totalPages} · {meta.total} posts
          </p>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={page >= totalPages}
              onClick={() => setPage((p) => p + 1)}
            >
              Next
            </Button>
          </div>
        </div>
      )}

      <ConfirmDialog
        open={Boolean(toDelete)}
        onOpenChange={(o) => !o && setToDelete(null)}
        title="Delete post?"
        description={toDelete ? `“${toDelete.title}” will be permanently deleted.` : ""}
        confirmLabel="Delete"
        destructive
        loading={deletePost.isPending}
        onConfirm={handleDelete}
      />
    </div>
  );
}
