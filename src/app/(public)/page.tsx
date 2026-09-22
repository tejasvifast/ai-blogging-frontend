import { Container } from "@/components/public/Container";
import { FeaturedPost } from "@/components/public/FeaturedPost";
import { PostGrid } from "@/components/public/PostGrid";
import { PopularPosts } from "@/components/public/PopularPosts";
import { CategorySection } from "@/components/public/CategorySection";
import { NewsletterCTA } from "@/components/public/NewsletterCTA";
import { publicApi } from "@/lib/api/public.server";
import type { Category, Post } from "@/types";

// ISR — must be a static literal for Next's analyzer (mirrors ISR_REVALIDATE).
export const revalidate = 3600;

/** Run a promise, falling back to a default if the backend is unreachable. */
async function safe<T>(p: Promise<T>, fallback: T): Promise<T> {
  try {
    return await p;
  } catch {
    return fallback;
  }
}

async function getHomeData() {
  const [featured, latest, categories, popular] = await Promise.all([
    safe(publicApi.featured(1), { items: [] as Post[], meta: undefined }),
    safe(publicApi.listPosts({ limit: 7, sort: "newest" }), {
      items: [] as Post[],
      meta: undefined,
    }),
    safe(publicApi.categories(), [] as Category[]),
    safe(publicApi.popular(5), { items: [] as Post[], meta: undefined }),
  ]);

  const hero = featured.items[0] ?? latest.items[0] ?? null;
  const latestPosts = latest.items.filter((p) => p.id !== hero?.id).slice(0, 6);

  // Top 3 categories (by published-post count) with a few posts each.
  const topCategories = [...categories]
    .sort((a, b) => (b._count?.posts ?? 0) - (a._count?.posts ?? 0))
    .slice(0, 3);

  const categorySections = await Promise.all(
    topCategories.map(async (category) => {
      const res = await safe(publicApi.listPosts({ category: category.slug, limit: 3 }), {
        items: [] as Post[],
        meta: undefined,
      });
      return { category, posts: res.items };
    }),
  );

  return { hero, latestPosts, popular: popular.items, categorySections };
}

export default async function HomePage() {
  const { hero, latestPosts, popular, categorySections } = await getHomeData();

  // Backend down or no content yet.
  if (!hero && latestPosts.length === 0) {
    return (
      <Container className="flex min-h-[60vh] flex-col items-center justify-center text-center">
        <h1 className="font-serif text-3xl font-bold">Nothing here yet</h1>
        <p className="mt-3 max-w-md text-[var(--color-muted-foreground)]">
          Posts will appear here once they&rsquo;re published. Check back soon.
        </p>
      </Container>
    );
  }

  return (
    <div className="pb-8">
      {hero && (
        <Container className="pt-8">
          <FeaturedPost post={hero} />
        </Container>
      )}

      <Container className="mt-16">
        <div className="grid gap-12 lg:grid-cols-[minmax(0,1fr)_300px]">
          <div>
            <h2 className="mb-6 font-serif text-2xl font-bold sm:text-3xl">Latest posts</h2>
            <PostGrid posts={latestPosts} className="lg:grid-cols-2" priorityCount={2} />
          </div>
          <aside className="lg:sticky lg:top-20 lg:self-start">
            <PopularPosts posts={popular} />
          </aside>
        </div>
      </Container>

      {categorySections.length > 0 && (
        <Container className="mt-20 space-y-20">
          {categorySections.map(({ category, posts }) => (
            <CategorySection key={category.id} category={category} posts={posts} />
          ))}
        </Container>
      )}

      <div className="mt-20">
        <NewsletterCTA />
      </div>
    </div>
  );
}
