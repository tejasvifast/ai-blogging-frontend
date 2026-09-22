"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import type { PostSort } from "@/types";

const SORTS: { value: PostSort; label: string }[] = [
  { value: "newest", label: "Newest" },
  { value: "oldest", label: "Oldest" },
  { value: "popular", label: "Popular" },
];

/** Sort selector that pushes `?sort=` on the current path and resets pagination. */
export function SortSelect({ activeSort = "newest" }: { activeSort?: PostSort }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  function onChange(value: string) {
    const sp = new URLSearchParams(searchParams.toString());
    sp.set("sort", value);
    sp.delete("page");
    router.push(`${pathname}?${sp.toString()}`);
  }

  return (
    <div className="flex items-center gap-2">
      <label htmlFor="sort" className="text-sm text-[var(--color-muted-foreground)]">
        Sort
      </label>
      <select
        id="sort"
        value={activeSort}
        onChange={(e) => onChange(e.target.value)}
        className="h-9 rounded-md border border-[var(--color-border)] bg-[var(--color-background)] px-2 text-sm"
      >
        {SORTS.map((s) => (
          <option key={s.value} value={s.value}>
            {s.label}
          </option>
        ))}
      </select>
    </div>
  );
}
