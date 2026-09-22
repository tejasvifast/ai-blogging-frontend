import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { PostCover } from "./PostCover";
import { formatDate, initials, postDate, readingTimeLabel } from "@/lib/format";
import { cn } from "@/lib/utils";
import type { Post } from "@/types";

/**
 * Editorial post card. `priority` eager-loads the cover (use for above-the-fold
 * cards only). Lifts on hover.
 */
export function PostCard({
  post,
  priority = false,
  className,
}: {
  post: Post;
  priority?: boolean;
  className?: string;
}) {
  return (
    <article
      className={cn(
        "group relative flex flex-col overflow-hidden rounded-xl border border-[var(--color-border)] bg-[var(--color-card)] transition-all duration-300 hover:-translate-y-1 hover:shadow-lg",
        className,
      )}
    >
      <Link href={`/blog/${post.slug}`} className="relative block aspect-video overflow-hidden">
        <PostCover
          src={post.coverImage}
          alt={post.coverImageAlt ?? post.title}
          seed={post.title}
          priority={priority}
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          className="h-full w-full transition-transform duration-500 group-hover:scale-105"
        />
      </Link>

      <div className="flex flex-1 flex-col p-5">
        <div className="mb-3">
          <Link href={`/category/${post.category.slug}`}>
            <Badge variant="secondary" className="hover:bg-[var(--color-primary)]/10">
              {post.category.name}
            </Badge>
          </Link>
        </div>

        <h3 className="font-serif text-xl font-bold leading-snug tracking-tight">
          <Link
            href={`/blog/${post.slug}`}
            className="transition-colors hover:text-[var(--color-primary)]"
          >
            {post.title}
          </Link>
        </h3>

        {post.excerpt && (
          <p className="mt-2 line-clamp-2 text-sm text-[var(--color-muted-foreground)]">
            {post.excerpt}
          </p>
        )}

        <div className="mt-auto flex items-center gap-3 pt-5 text-sm text-[var(--color-muted-foreground)]">
          <Avatar name={post.author.name} src={post.author.avatar} />
          <span className="font-medium text-[var(--color-foreground)]">{post.author.name}</span>
          <span aria-hidden>·</span>
          <time dateTime={postDate(post)}>{formatDate(postDate(post))}</time>
          <span aria-hidden>·</span>
          <span>{readingTimeLabel(post)}</span>
        </div>
      </div>
    </article>
  );
}

function Avatar({ name, src }: { name: string; src: string | null }) {
  if (src) {
    // eslint-disable-next-line @next/next/no-img-element
    return <img src={src} alt="" className="h-7 w-7 rounded-full object-cover" />;
  }
  return (
    <span className="flex h-7 w-7 items-center justify-center rounded-full bg-[var(--color-muted)] text-xs font-semibold">
      {initials(name)}
    </span>
  );
}
