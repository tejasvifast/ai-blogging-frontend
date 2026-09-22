import type { Metadata } from "next";
import { SITE_NAME, SITE_URL } from "./constants";
import type { Post } from "@/types";

export function absoluteUrl(path: string): string {
  return new URL(path, SITE_URL).toString();
}

/** Dynamic OG image URL (served by /api/og — step 9). */
export function ogImageUrl(title: string, extra?: { category?: string }): string {
  const params = new URLSearchParams({ title });
  if (extra?.category) params.set("category", extra.category);
  return absoluteUrl(`/api/og?${params.toString()}`);
}

/** Build Next Metadata for a single post. */
export function buildPostMetadata(post: Post): Metadata {
  const url = absoluteUrl(`/blog/${post.slug}`);
  const title = post.metaTitle ?? post.title;
  const description = post.metaDescription ?? post.excerpt ?? undefined;
  const image = post.coverImage ?? ogImageUrl(post.title, { category: post.category.name });
  const published = post.publishedAt ?? post.createdAt;

  return {
    title,
    description,
    keywords: post.keywords.length ? post.keywords : undefined,
    alternates: { canonical: url },
    authors: [{ name: post.author.name }],
    openGraph: {
      type: "article",
      url,
      title,
      description,
      siteName: SITE_NAME,
      publishedTime: published,
      modifiedTime: post.updatedAt,
      authors: [post.author.name],
      section: post.category.name,
      tags: post.tags.map((t) => t.name),
      images: [{ url: image, width: 1200, height: 630, alt: post.coverImageAlt ?? post.title }],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [image],
    },
  };
}

/** Generic metadata builder for listing/static pages. */
export function buildPageMetadata(opts: {
  title: string;
  description?: string;
  path: string;
  noIndex?: boolean;
}): Metadata {
  const url = absoluteUrl(opts.path);
  return {
    title: opts.title,
    description: opts.description,
    alternates: { canonical: url },
    robots: opts.noIndex ? { index: false, follow: false } : undefined,
    openGraph: {
      title: opts.title,
      description: opts.description,
      url,
      siteName: SITE_NAME,
      images: [{ url: ogImageUrl(opts.title), width: 1200, height: 630 }],
    },
    twitter: { card: "summary_large_image", title: opts.title, description: opts.description },
  };
}
