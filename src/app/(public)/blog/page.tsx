import type { Metadata } from "next";
import { Search } from "lucide-react";
import { Container } from "@/components/public/Container";
import { FilterBar } from "@/components/public/FilterBar";
import { PostGrid } from "@/components/public/PostGrid";
import { Pagination } from "@/components/public/Pagination";
import { publicApi } from "@/lib/api/public.server";
import { buildPageMetadata } from "@/lib/seo";
import { DEFAULT_PAGE_SIZE } from "@/lib/constants";
import type { Category, Post, PostSort } from "@/types";

export const revalidate = 3600;

export const metadata: Metadata = buildPageMetadata({
  title: "Blog",
  description: "Browse all articles, filter by category, and search the archive.",
  path: "/blog",
});

type SearchParams = {
  page?: string;
  sort?: string;
  category?: string;
  search?: string;
};

function parseSort(value?: string): PostSort {
  return value === "oldest" || value === "popular" ? value : "newest";
}

export default async function BlogPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const sp = await searchParams;
  const page = Math.max(1, Number(sp.page) || 1);
  const sort = parseSort(sp.sort);
  const category = sp.category;
  const search = sp.search?.trim() || undefined;

  const [listing, categories] = await Promise.all([
    publicApi
      .listPosts({ page, limit: DEFAULT_PAGE_SIZE, sort, category, search })
      .catch(() => ({ items: [] as Post[], meta: undefined })),
    publicApi.categories().catch(() => [] as Category[]),
  ]);

  const totalPages = listing.meta?.totalPages ?? 1;

  return (
    <Container className="py-10 sm:py-14">
      <header className="mb-8">
        <h1 className="font-serif text-4xl font-bold sm:text-5xl">
          {search ? "Search results" : "The Blog"}
        </h1>
        <p className="mt-3 text-[var(--color-muted-foreground)]">
          {search
            ? `Showing results for “${search}”`
            : "Ideas, guides, and stories — fresh from the archive."}
        </p>
      </header>

      {/* No-JS-friendly search (GET form) — preserves active sort/category */}
      <form action="/blog" method="get" className="mb-6">
        <div className="relative max-w-md">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--color-muted-foreground)]" />
          <input
            type="search"
            name="search"
            defaultValue={search ?? ""}
            placeholder="Search articles…"
            className="h-10 w-full rounded-md border border-[var(--color-border)] bg-transparent pl-9 pr-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-ring)]"
          />
          {sort !== "newest" && <input type="hidden" name="sort" value={sort} />}
          {category && <input type="hidden" name="category" value={category} />}
        </div>
      </form>

      <FilterBar
        categories={categories.map((c) => ({ name: c.name, slug: c.slug }))}
        activeCategory={category}
        activeSort={sort}
      />

      <div className="mt-10">
        {listing.items.length === 0 ? (
          <div className="py-20 text-center">
            <p className="font-serif text-2xl font-bold">No posts found</p>
            <p className="mt-2 text-[var(--color-muted-foreground)]">
              Try adjusting your filters or search.
            </p>
          </div>
        ) : (
          <PostGrid posts={listing.items} priorityCount={2} />
        )}
      </div>

      <Pagination
        page={page}
        totalPages={totalPages}
        basePath="/blog"
        params={{ sort: sort !== "newest" ? sort : undefined, category, search }}
      />
    </Container>
  );
}
