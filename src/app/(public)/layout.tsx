import { Header, type NavCategory } from "@/components/public/Header";
import { Footer } from "@/components/public/Footer";
import { publicApi } from "@/lib/api/public.server";

/**
 * Public shell — fetches categories for the nav/footer (cached via ISR).
 * Resilient: if the backend is unreachable the chrome still renders with an
 * empty category list rather than crashing the whole site.
 */
async function getNavCategories(): Promise<NavCategory[]> {
  try {
    const categories = await publicApi.categories();
    return categories.map((c) => ({ name: c.name, slug: c.slug }));
  } catch {
    return [];
  }
}

export default async function PublicLayout({ children }: { children: React.ReactNode }) {
  const categories = await getNavCategories();

  return (
    <div className="flex min-h-screen flex-col">
      <Header categories={categories} />
      <main className="flex-1">{children}</main>
      <Footer categories={categories} />
    </div>
  );
}
