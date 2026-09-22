import { cn } from "@/lib/utils";

export function PostCardSkeleton() {
  return (
    <div className="flex flex-col overflow-hidden rounded-xl border border-[var(--color-border)] bg-[var(--color-card)]">
      <div className="aspect-video animate-pulse bg-[var(--color-muted)]" />
      <div className="flex flex-1 flex-col gap-3 p-5">
        <div className="h-5 w-20 animate-pulse rounded-full bg-[var(--color-muted)]" />
        <div className="h-6 w-full animate-pulse rounded bg-[var(--color-muted)]" />
        <div className="h-6 w-3/4 animate-pulse rounded bg-[var(--color-muted)]" />
        <div className="mt-auto flex items-center gap-2 pt-3">
          <div className="h-7 w-7 animate-pulse rounded-full bg-[var(--color-muted)]" />
          <div className="h-4 w-32 animate-pulse rounded bg-[var(--color-muted)]" />
        </div>
      </div>
    </div>
  );
}

export function PostGridSkeleton({
  count = 6,
  className,
}: {
  count?: number;
  className?: string;
}) {
  return (
    <div className={cn("grid gap-6 sm:grid-cols-2 lg:grid-cols-3", className)}>
      {Array.from({ length: count }).map((_, i) => (
        <PostCardSkeleton key={i} />
      ))}
    </div>
  );
}
