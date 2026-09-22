import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { Eye } from "lucide-react";
import { Container } from "@/components/public/Container";
import { PostCover } from "@/components/public/PostCover";
import { Badge } from "@/components/ui/badge";
import { Breadcrumbs } from "@/components/public/Breadcrumbs";
import { ReadingProgress } from "@/components/public/ReadingProgress";
import { TableOfContents } from "@/components/public/TableOfContents";
import { SocialShare } from "@/components/public/SocialShare";
import { MarkdownContent } from "@/components/public/MarkdownContent";
import { AuthorBio } from "@/components/public/AuthorBio";
import { RelatedPosts } from "@/components/public/RelatedPosts";
import { NewsletterCTA } from "@/components/public/NewsletterCTA";
import { AdSlot } from "@/components/shared/AdSlot";
import { JsonLd } from "@/components/shared/JsonLd";
import { publicApi } from "@/lib/api/public.server";
import { extractToc } from "@/lib/toc";
import { buildPostMetadata, absoluteUrl } from "@/lib/seo";
import { articleJsonLd, breadcrumbJsonLd } from "@/lib/jsonld";
import { formatDate, formatViews, initials, postDate, readingTimeLabel } from "@/lib/format";
import type { Post } from "@/types";

export const revalidate = 3600;

type Params = { slug: string };

export async function generateMetadata({
  params,
}: {
  params: Promise<Params>;
}): Promise<Metadata> {
  const { slug } = await params;
  const post = await publicApi.getPost(slug).catch(() => null);
  if (!post) return { title: "Post not found", robots: { index: false } };
  return buildPostMetadata(post);
}

async function getRelated(post: Post): Promise<Post[]> {
  try {
    const { items } = await publicApi.listPosts({
      category: post.category.slug,
      limit: 4,
      sort: "newest",
    });
    return items.filter((p) => p.id !== post.id).slice(0, 3);
  } catch {
    return [];
  }
}

export default async function PostPage({ params }: { params: Promise<Params> }) {
  const { slug } = await params;
  const post = await publicApi.getPost(slug).catch(() => null);
  if (!post) notFound();

  const [related, toc] = await Promise.all([getRelated(post), extractToc(post.content)]);
  const url = absoluteUrl(`/blog/${post.slug}`);
  const crumbs = [
    { name: "Home", href: "/" },
    { name: "Blog", href: "/blog" },
    { name: post.category.name, href: `/category/${post.category.slug}` },
    { name: post.title, href: `/blog/${post.slug}` },
  ];

  return (
    <>
      <ReadingProgress />
      <JsonLd data={articleJsonLd(post)} />
      <JsonLd data={breadcrumbJsonLd(crumbs)} />

      <article className="pt-6">
        <Container>
          <Breadcrumbs items={crumbs} />
        </Container>

        <Container className="mt-8">
          <div className="mx-auto grid max-w-[1120px] grid-cols-1 gap-x-10 gap-y-8 lg:grid-cols-[3rem_minmax(0,1fr)_16rem]">
            {/* Left rail — sticky share (desktop) */}
            <div className="hidden lg:block">
              <div className="sticky top-24">
                <SocialShare url={url} title={post.title} orientation="vertical" />
              </div>
            </div>

            {/* Article */}
            <div className="min-w-0">
              <header className="mb-8">
                <Link href={`/category/${post.category.slug}`}>
                  <Badge>{post.category.name}</Badge>
                </Link>
                <h1 className="mt-4 font-serif text-4xl font-bold leading-tight tracking-tight sm:text-5xl">
                  {post.title}
                </h1>
                {post.excerpt && (
                  <p className="mt-4 text-lg text-[var(--color-muted-foreground)]">
                    {post.excerpt}
                  </p>
                )}
                <div className="mt-6 flex flex-wrap items-center gap-3 text-sm text-[var(--color-muted-foreground)]">
                  <AuthorAvatar name={post.author.name} src={post.author.avatar} />
                  <span className="font-medium text-[var(--color-foreground)]">
                    {post.author.name}
                  </span>
                  <span aria-hidden>·</span>
                  <time dateTime={postDate(post)}>{formatDate(postDate(post))}</time>
                  <span aria-hidden>·</span>
                  <span>{readingTimeLabel(post)}</span>
                  <span aria-hidden>·</span>
                  <span className="inline-flex items-center gap-1">
                    <Eye className="h-4 w-4" />
                    {formatViews(post.views)}
                  </span>
                </div>
              </header>

              <div className="relative mb-10 aspect-video overflow-hidden rounded-2xl">
                <PostCover
                  src={post.coverImage}
                  alt={post.coverImageAlt ?? post.title}
                  seed={post.title}
                  priority
                  sizes="(max-width: 1120px) 100vw, 680px"
                  className="h-full w-full"
                />
              </div>

              <MarkdownContent content={post.content} />

              {post.tags.length > 0 && (
                <div className="mt-10 flex flex-wrap gap-2">
                  {post.tags.map((tag) => (
                    <Link key={tag.id} href={`/tag/${tag.slug}`}>
                      <Badge variant="outline">#{tag.name}</Badge>
                    </Link>
                  ))}
                </div>
              )}

              <div className="mt-8 border-y border-[var(--color-border)] py-4">
                <SocialShare url={url} title={post.title} orientation="horizontal" />
              </div>

              <div className="mt-10">
                <AuthorBio author={post.author} />
              </div>
            </div>

            {/* Right rail — sticky TOC (desktop) */}
            <aside className="hidden lg:block">
              <div className="sticky top-24 max-h-[calc(100vh-8rem)] overflow-y-auto">
                <TableOfContents items={toc} />
              </div>
            </aside>
          </div>
        </Container>

        <Container className="mt-16">
          <AdSlot slot="before-related" reserveHeight={280} className="mb-16" />
          <RelatedPosts posts={related} />
        </Container>
      </article>

      <div className="mt-20">
        <NewsletterCTA />
      </div>
    </>
  );
}

function AuthorAvatar({ name, src }: { name: string; src: string | null }) {
  if (src) {
    // eslint-disable-next-line @next/next/no-img-element
    return <img src={src} alt="" className="h-9 w-9 rounded-full object-cover" />;
  }
  return (
    <span className="flex h-9 w-9 items-center justify-center rounded-full bg-[var(--color-muted)] text-xs font-semibold">
      {initials(name)}
    </span>
  );
}
