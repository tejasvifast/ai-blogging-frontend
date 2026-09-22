import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Container } from "@/components/public/Container";
import { Breadcrumbs } from "@/components/public/Breadcrumbs";
import { PostGrid } from "@/components/public/PostGrid";
import { JsonLd } from "@/components/shared/JsonLd";
import { publicApi } from "@/lib/api/public.server";
import { buildPageMetadata } from "@/lib/seo";
import { breadcrumbJsonLd } from "@/lib/jsonld";
import { initials } from "@/lib/format";
import type { Post, PublicAuthor } from "@/types";

export const revalidate = 3600;

type Params = { id: string };

/**
 * NOTE: the backend exposes no `/authors/:id` endpoint and `/posts` has no
 * author filter, so this derives the author + their posts from the recent feed
 * (best-effort, bounded to the newest 50). If the backend later adds an author
 * endpoint, swap `getAuthorData` to use it.
 */
async function getAuthorData(
  id: string,
): Promise<{ author: PublicAuthor; posts: Post[] } | null> {
  const { items } = await publicApi
    .listPosts({ limit: 50, sort: "newest" })
    .catch(() => ({ items: [] as Post[], meta: undefined }));
  const posts = items.filter((p) => p.author.id === id);
  if (posts.length === 0) return null;
  return { author: posts[0]!.author, posts };
}

export async function generateMetadata({
  params,
}: {
  params: Promise<Params>;
}): Promise<Metadata> {
  const { id } = await params;
  const data = await getAuthorData(id);
  if (!data) return { title: "Author not found", robots: { index: false } };
  return buildPageMetadata({
    title: data.author.name,
    description: data.author.bio ?? `Articles by ${data.author.name}.`,
    path: `/author/${id}`,
  });
}

export default async function AuthorPage({ params }: { params: Promise<Params> }) {
  const { id } = await params;
  const data = await getAuthorData(id);
  if (!data) notFound();

  const { author, posts } = data;
  const crumbs = [
    { name: "Home", href: "/" },
    { name: "Blog", href: "/blog" },
    { name: author.name, href: `/author/${id}` },
  ];

  return (
    <Container className="py-10 sm:py-14">
      <JsonLd data={breadcrumbJsonLd(crumbs)} />
      <Breadcrumbs items={crumbs} />

      <header className="mb-10 mt-8 flex flex-col items-center text-center">
        {author.avatar ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={author.avatar}
            alt={author.name}
            className="h-20 w-20 rounded-full object-cover"
          />
        ) : (
          <span className="flex h-20 w-20 items-center justify-center rounded-full bg-[var(--color-primary)] text-2xl font-semibold text-[var(--color-primary-foreground)]">
            {initials(author.name)}
          </span>
        )}
        <h1 className="mt-4 font-serif text-3xl font-bold sm:text-4xl">{author.name}</h1>
        {author.bio && (
          <p className="mt-3 max-w-xl text-[var(--color-muted-foreground)]">{author.bio}</p>
        )}
        <p className="mt-2 text-sm text-[var(--color-muted-foreground)]">
          {posts.length} article{posts.length === 1 ? "" : "s"}
        </p>
      </header>

      <PostGrid posts={posts} priorityCount={2} />
    </Container>
  );
}
