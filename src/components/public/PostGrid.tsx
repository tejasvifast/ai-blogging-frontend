import { PostCard } from "./PostCard";
import { cn } from "@/lib/utils";
import type { Post } from "@/types";

/** Responsive 1/2/3-column grid of post cards. */
export function PostGrid({
  posts,
  priorityCount = 0,
  className,
}: {
  posts: Post[];
  /** How many leading cards should eager-load their cover (above the fold). */
  priorityCount?: number;
  className?: string;
}) {
  return (
    <div className={cn("grid gap-6 sm:grid-cols-2 lg:grid-cols-3", className)}>
      {posts.map((post, i) => (
        <PostCard key={post.id} post={post} priority={i < priorityCount} />
      ))}
    </div>
  );
}
