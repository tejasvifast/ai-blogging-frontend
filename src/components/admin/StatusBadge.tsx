import { cn } from "@/lib/utils";
import type { PostStatus } from "@/types";

const STYLES: Record<PostStatus, string> = {
  PUBLISHED: "bg-green-500/15 text-green-600 dark:text-green-400",
  DRAFT: "bg-slate-500/15 text-slate-600 dark:text-slate-300",
  SCHEDULED: "bg-amber-500/15 text-amber-600 dark:text-amber-400",
  ARCHIVED: "bg-red-500/15 text-red-600 dark:text-red-400",
};

export function StatusBadge({ status, className }: { status: PostStatus; className?: string }) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium capitalize",
        STYLES[status],
        className,
      )}
    >
      {status.toLowerCase()}
    </span>
  );
}
