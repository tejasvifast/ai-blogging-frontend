"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { Search as SearchIcon, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { PostGrid } from "./PostGrid";
import { PostGridSkeleton } from "./PostCardSkeleton";
import { usePosts } from "@/hooks/usePosts";
import { useDebounce } from "@/hooks/useDebounce";

export function SearchClient({ initialQuery = "" }: { initialQuery?: string }) {
  const router = useRouter();
  const pathname = usePathname();
  const [query, setQuery] = useState(initialQuery);
  const debounced = useDebounce(query.trim(), 400);

  // Keep the URL in sync (shareable) without spamming history.
  useEffect(() => {
    const qs = debounced ? `?q=${encodeURIComponent(debounced)}` : "";
    router.replace(`${pathname}${qs}`, { scroll: false });
  }, [debounced, pathname, router]);

  const enabled = debounced.length >= 2;
  const { data, isFetching, isError } = usePosts(
    enabled ? { search: debounced, limit: 12, sort: "newest" } : undefined,
  );

  const results = enabled ? (data?.items ?? []) : [];

  return (
    <div>
      <div className="relative mx-auto max-w-2xl">
        <SearchIcon className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-[var(--color-muted-foreground)]" />
        <Input
          autoFocus
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search articles…"
          aria-label="Search articles"
          className="h-14 rounded-full pl-12 pr-12 text-base"
        />
        {query && (
          <button
            onClick={() => setQuery("")}
            aria-label="Clear search"
            className="absolute right-4 top-1/2 -translate-y-1/2 text-[var(--color-muted-foreground)] hover:text-[var(--color-foreground)]"
          >
            <X className="h-5 w-5" />
          </button>
        )}
      </div>

      <div className="mt-10">
        {!enabled ? (
          <p className="text-center text-[var(--color-muted-foreground)]">
            Type at least 2 characters to search.
          </p>
        ) : isFetching ? (
          <PostGridSkeleton count={6} />
        ) : isError ? (
          <p className="text-center text-red-500">Something went wrong. Please try again.</p>
        ) : results.length === 0 ? (
          <div className="text-center">
            <p className="font-serif text-xl font-bold">No results for “{debounced}”</p>
            <p className="mt-2 text-[var(--color-muted-foreground)]">
              Try different keywords or browse the blog.
            </p>
          </div>
        ) : (
          <>
            <p className="mb-6 text-sm text-[var(--color-muted-foreground)]">
              {results.length} result{results.length === 1 ? "" : "s"} for “{debounced}”
            </p>
            <PostGrid posts={results} />
          </>
        )}
      </div>
    </div>
  );
}
