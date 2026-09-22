import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { PostCover } from "./PostCover";
import { formatDate, postDate, readingTimeLabel } from "@/lib/format";
import type { Post } from "@/types";

/** Full-bleed hero for the latest featured post. */
export function FeaturedPost({ post }: { post: Post }) {
  return (
    <Link
      href={`/blog/${post.slug}`}
      className="group relative block aspect-[16/10] w-full overflow-hidden rounded-2xl sm:aspect-[2/1]"
    >
      <PostCover
        src={post.coverImage}
        alt={post.coverImageAlt ?? post.title}
        seed={post.title}
        priority
        sizes="(max-width: 1280px) 100vw, 1280px"
        className="h-full w-full transition-transform duration-700 group-hover:scale-105"
      />
      {/* Gradient overlay for text legibility */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />

      <div className="absolute inset-x-0 bottom-0 p-6 sm:p-10">
        <div className="max-w-3xl">
          <Badge className="mb-4">{post.category.name}</Badge>
          <h1 className="font-serif text-3xl font-bold leading-tight text-white sm:text-4xl lg:text-5xl">
            {post.title}
          </h1>
          {post.excerpt && (
            <p className="mt-4 line-clamp-2 max-w-2xl text-base text-white/80 sm:text-lg">
              {post.excerpt}
            </p>
          )}
          <div className="mt-5 flex flex-wrap items-center gap-3 text-sm text-white/70">
            <span className="font-medium text-white">{post.author.name}</span>
            <span aria-hidden>·</span>
            <time dateTime={postDate(post)}>{formatDate(postDate(post))}</time>
            <span aria-hidden>·</span>
            <span>{readingTimeLabel(post)}</span>
          </div>
        </div>
      </div>
    </Link>
  );
}
