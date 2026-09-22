import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

type ParamValue = string | number | undefined;

function buildHref(basePath: string, params: Record<string, ParamValue>, page: number): string {
  const sp = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined && value !== "" && key !== "page") sp.set(key, String(value));
  }
  if (page > 1) sp.set("page", String(page));
  const qs = sp.toString();
  return qs ? `${basePath}?${qs}` : basePath;
}

/** Build a compact page window: 1 … 4 5 [6] 7 8 … 20 */
function pageWindow(current: number, total: number): (number | "…")[] {
  const delta = 1;
  const range: (number | "…")[] = [];
  const left = Math.max(2, current - delta);
  const right = Math.min(total - 1, current + delta);

  range.push(1);
  if (left > 2) range.push("…");
  for (let i = left; i <= right; i++) range.push(i);
  if (right < total - 1) range.push("…");
  if (total > 1) range.push(total);
  return range;
}

export function Pagination({
  page,
  totalPages,
  basePath,
  params = {},
}: {
  page: number;
  totalPages: number;
  basePath: string;
  params?: Record<string, ParamValue>;
}) {
  if (totalPages <= 1) return null;

  const linkClass =
    "flex h-10 min-w-10 items-center justify-center rounded-md border border-[var(--color-border)] px-3 text-sm font-medium transition-colors hover:border-[var(--color-primary)] hover:text-[var(--color-primary)]";

  return (
    <nav aria-label="Pagination" className="mt-12 flex items-center justify-center gap-2">
      {page > 1 ? (
        <Link href={buildHref(basePath, params, page - 1)} className={linkClass} aria-label="Previous page">
          <ChevronLeft className="h-4 w-4" />
        </Link>
      ) : (
        <span className={cn(linkClass, "cursor-not-allowed opacity-40")} aria-disabled>
          <ChevronLeft className="h-4 w-4" />
        </span>
      )}

      {pageWindow(page, totalPages).map((p, i) =>
        p === "…" ? (
          <span key={`e${i}`} className="px-1 text-[var(--color-muted-foreground)]">
            …
          </span>
        ) : (
          <Link
            key={p}
            href={buildHref(basePath, params, p)}
            aria-current={p === page ? "page" : undefined}
            className={cn(
              linkClass,
              p === page &&
                "border-[var(--color-primary)] bg-[var(--color-primary)] text-[var(--color-primary-foreground)] hover:text-[var(--color-primary-foreground)]",
            )}
          >
            {p}
          </Link>
        ),
      )}

      {page < totalPages ? (
        <Link href={buildHref(basePath, params, page + 1)} className={linkClass} aria-label="Next page">
          <ChevronRight className="h-4 w-4" />
        </Link>
      ) : (
        <span className={cn(linkClass, "cursor-not-allowed opacity-40")} aria-disabled>
          <ChevronRight className="h-4 w-4" />
        </span>
      )}
    </nav>
  );
}
