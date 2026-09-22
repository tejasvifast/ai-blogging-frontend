import Link from "next/link";
import { formatViews } from "@/lib/format";
import type { Post } from "@/types";

/** Numbered top-N list for the sidebar. */
export function PopularPosts({ posts }: { posts: Post[] }) {
  if (posts.length === 0) return null;

  return (
    <section aria-labelledby="popular-heading">
      <h2 id="popular-heading" className="font-serif text-lg font-bold">
        Popular posts
      </h2>
      <ol className="mt-4 space-y-5">
        {posts.slice(0, 5).map((post, i) => (
          <li key={post.id} className="flex gap-4">
            <span className="font-serif text-2xl font-bold leading-none text-[var(--color-border)]">
              {String(i + 1).padStart(2, "0")}
            </span>
            <div className="min-w-0">
              <h3 className="text-sm font-semibold leading-snug">
                <Link
                  href={`/blog/${post.slug}`}
                  className="line-clamp-2 transition-colors hover:text-[var(--color-primary)]"
                >
                  {post.title}
                </Link>
              </h3>
              <p className="mt-1 text-xs text-[var(--color-muted-foreground)]">
                {post.category.name} · {formatViews(post.views)} views
              </p>
            </div>
          </li>
        ))}
      </ol>
    </section>
  );
}
