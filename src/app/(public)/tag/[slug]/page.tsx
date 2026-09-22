import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Container } from "@/components/public/Container";
import { Breadcrumbs } from "@/components/public/Breadcrumbs";
import { PostGrid } from "@/components/public/PostGrid";
import { Pagination } from "@/components/public/Pagination";
import { SortSelect } from "@/components/public/SortSelect";
import { JsonLd } from "@/components/shared/JsonLd";
import { publicApi } from "@/lib/api/public.server";
import { buildPageMetadata } from "@/lib/seo";
import { breadcrumbJsonLd } from "@/lib/jsonld";
import { DEFAULT_PAGE_SIZE } from "@/lib/constants";
import type { Post, PostSort } from "@/types";

export const revalidate = 3600;

type Params = { slug: string };
type SP = { page?: string; sort?: string };

function parseSort(v?: string): PostSort {
  return v === "oldest" || v === "popular" ? v : "newest";
}

export async function generateMetadata({
  params,
}: {
  params: Promise<Params>;
}): Promise<Metadata> {
  const { slug } = await params;
  const tag = await publicApi.getTag(slug).catch(() => null);
  const name = tag?.name ?? slug;
  return buildPageMetadata({
    title: `#${name}`,
    description: `Articles tagged “${name}”.`,
    path: `/tag/${slug}`,
  });
}

export default async function TagPage({
  params,
  searchParams,
}: {
  params: Promise<Params>;
  searchParams: Promise<SP>;
}) {
  const { slug } = await params;
  const { page: pageParam, sort: sortParam } = await searchParams;

  const tag = await publicApi.getTag(slug).catch(() => null);
  if (!tag) notFound();

  const page = Math.max(1, Number(pageParam) || 1);
  const sort = parseSort(sortParam);

  const listing = await publicApi
    .listPosts({ tag: slug, page, limit: DEFAULT_PAGE_SIZE, sort })
    .catch(() => ({ items: [] as Post[], meta: undefined }));

  const crumbs = [
    { name: "Home", href: "/" },
    { name: "Blog", href: "/blog" },
    { name: `#${tag.name}`, href: `/tag/${tag.slug}` },
  ];

  return (
    <Container className="py-10 sm:py-14">
      <JsonLd data={breadcrumbJsonLd(crumbs)} />
      <Breadcrumbs items={crumbs} />

      <header className="mb-8 mt-6 flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-sm font-medium uppercase tracking-wider text-[var(--color-primary)]">
            Tag
          </p>
          <h1 className="mt-1 font-serif text-4xl font-bold sm:text-5xl">#{tag.name}</h1>
        </div>
        <SortSelect activeSort={sort} />
      </header>

      {listing.items.length === 0 ? (
        <p className="py-20 text-center text-[var(--color-muted-foreground)]">
          No posts with this tag yet.
        </p>
      ) : (
        <PostGrid posts={listing.items} priorityCount={2} />
      )}

      <Pagination
        page={page}
        totalPages={listing.meta?.totalPages ?? 1}
        basePath={`/tag/${tag.slug}`}
        params={{ sort: sort !== "newest" ? sort : undefined }}
      />
    </Container>
  );
}
