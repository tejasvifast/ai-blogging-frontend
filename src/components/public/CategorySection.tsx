import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { PostGrid } from "./PostGrid";
import type { Category, Post } from "@/types";

/** A category heading with a "view all" link and a small grid of its posts. */
export function CategorySection({
  category,
  posts,
}: {
  category: Category;
  posts: Post[];
}) {
  if (posts.length === 0) return null;

  return (
    <section aria-labelledby={`cat-${category.slug}`}>
      <div className="mb-6 flex items-end justify-between gap-4">
        <div>
          <h2 id={`cat-${category.slug}`} className="font-serif text-2xl font-bold sm:text-3xl">
            {category.name}
          </h2>
          {category.description && (
            <p className="mt-1 text-sm text-[var(--color-muted-foreground)]">
              {category.description}
            </p>
          )}
        </div>
        <Link
          href={`/category/${category.slug}`}
          className="flex shrink-0 items-center gap-1 text-sm font-medium text-[var(--color-primary)] hover:underline"
        >
          View all
          <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
      <PostGrid posts={posts.slice(0, 3)} />
    </section>
  );
}
