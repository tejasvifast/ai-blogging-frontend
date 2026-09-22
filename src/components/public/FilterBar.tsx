"use client";

import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import type { PostSort } from "@/types";
import { cn } from "@/lib/utils";

const SORTS: { value: PostSort; label: string }[] = [
  { value: "newest", label: "Newest" },
  { value: "oldest", label: "Oldest" },
  { value: "popular", label: "Popular" },
];

export interface FilterCategory {
  name: string;
  slug: string;
}

/**
 * Category pills + sort selector for the blog listing. Category pills are plain
 * links (crawlable, preserve sort/search); the sort control pushes an updated
 * URL and resets pagination.
 */
export function FilterBar({
  categories,
  activeCategory,
  activeSort = "newest",
}: {
  categories: FilterCategory[];
  activeCategory?: string;
  activeSort?: PostSort;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  function hrefWithCategory(slug?: string): string {
    const sp = new URLSearchParams(searchParams.toString());
    sp.delete("page");
    if (slug) sp.set("category", slug);
    else sp.delete("category");
    const qs = sp.toString();
    return qs ? `${pathname}?${qs}` : pathname;
  }

  function onSortChange(value: string) {
    const sp = new URLSearchParams(searchParams.toString());
    sp.set("sort", value);
    sp.delete("page");
    router.push(`${pathname}?${sp.toString()}`);
  }

  const pill = (active: boolean) =>
    cn(
      "whitespace-nowrap rounded-full border px-4 py-1.5 text-sm font-medium transition-colors",
      active
        ? "border-[var(--color-primary)] bg-[var(--color-primary)] text-[var(--color-primary-foreground)]"
        : "border-[var(--color-border)] text-[var(--color-muted-foreground)] hover:border-[var(--color-primary)] hover:text-[var(--color-foreground)]",
    );

  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex gap-2 overflow-x-auto pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        <Link href={hrefWithCategory()} className={pill(!activeCategory)}>
          All
        </Link>
        {categories.map((c) => (
          <Link key={c.slug} href={hrefWithCategory(c.slug)} className={pill(activeCategory === c.slug)}>
            {c.name}
          </Link>
        ))}
      </div>

      <div className="flex shrink-0 items-center gap-2">
        <label htmlFor="sort" className="text-sm text-[var(--color-muted-foreground)]">
          Sort
        </label>
        <select
          id="sort"
          value={activeSort}
          onChange={(e) => onSortChange(e.target.value)}
          className="h-9 rounded-md border border-[var(--color-border)] bg-[var(--color-background)] px-2 text-sm"
        >
          {SORTS.map((s) => (
            <option key={s.value} value={s.value}>
              {s.label}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}
