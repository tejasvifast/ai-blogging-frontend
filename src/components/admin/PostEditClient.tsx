"use client";

import Link from "next/link";
import { AdminPageHeader } from "./AdminPageHeader";
import { PostForm } from "./PostForm";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { useAdminPost } from "@/hooks/usePosts";
import { ApiError } from "@/lib/api/errors";

export function PostEditClient({ id }: { id: string }) {
  const { data: post, isLoading, isError, error } = useAdminPost(id);

  if (isLoading) {
    return (
      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <Skeleton className="h-40 w-full" />
          <Skeleton className="h-[480px] w-full" />
        </div>
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  if (isError || !post) {
    return (
      <div className="rounded-lg border border-[var(--color-border)] p-12 text-center">
        <p className="text-[var(--color-muted-foreground)]">
          {error instanceof ApiError ? error.message : "Post not found."}
        </p>
        <Button asChild variant="outline" className="mt-4">
          <Link href="/admin/posts">Back to posts</Link>
        </Button>
      </div>
    );
  }

  return (
    <div>
      <AdminPageHeader title="Edit Post" description={post.title} />
      <PostForm post={post} />
    </div>
  );
}
