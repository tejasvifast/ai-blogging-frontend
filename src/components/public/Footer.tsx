import Link from "next/link";
import { Container } from "./Container";
import { SITE_DESCRIPTION, SITE_NAME } from "@/lib/constants";
import type { NavCategory } from "./Header";

export function Footer({ categories = [] }: { categories?: NavCategory[] }) {
  const year = new Date().getFullYear();

  return (
    <footer className="mt-24 border-t border-[var(--color-border)] bg-[var(--color-background)]">
      <Container className="py-12">
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
          <div className="lg:col-span-2">
            <Link href="/" className="font-serif text-lg font-bold">
              {SITE_NAME}
            </Link>
            <p className="mt-3 max-w-sm text-sm text-[var(--color-muted-foreground)]">
              {SITE_DESCRIPTION}
            </p>
          </div>

          <div>
            <h3 className="text-sm font-semibold">Explore</h3>
            <ul className="mt-3 space-y-2 text-sm text-[var(--color-muted-foreground)]">
              <li>
                <Link href="/blog" className="hover:text-[var(--color-foreground)]">
                  All posts
                </Link>
              </li>
              {categories.slice(0, 5).map((c) => (
                <li key={c.slug}>
                  <Link
                    href={`/category/${c.slug}`}
                    className="hover:text-[var(--color-foreground)]"
                  >
                    {c.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="text-sm font-semibold">Company</h3>
            <ul className="mt-3 space-y-2 text-sm text-[var(--color-muted-foreground)]">
              <li>
                <Link href="/about" className="hover:text-[var(--color-foreground)]">
                  About
                </Link>
              </li>
              <li>
                <Link href="/contact" className="hover:text-[var(--color-foreground)]">
                  Contact
                </Link>
              </li>
              <li>
                <Link href="/privacy-policy" className="hover:text-[var(--color-foreground)]">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link href="/terms" className="hover:text-[var(--color-foreground)]">
                  Terms
                </Link>
              </li>
              <li>
                <Link href="/disclaimer" className="hover:text-[var(--color-foreground)]">
                  Disclaimer
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-10 flex flex-col items-center justify-between gap-3 border-t border-[var(--color-border)] pt-6 text-xs text-[var(--color-muted-foreground)] sm:flex-row">
          <p>
            © {year} {SITE_NAME}. All rights reserved.
          </p>
          <div className="flex items-center gap-4">
            <Link href="/rss.xml" className="hover:text-[var(--color-foreground)]">
              RSS
            </Link>
            <Link href="/sitemap.xml" className="hover:text-[var(--color-foreground)]">
              Sitemap
            </Link>
          </div>
        </div>
      </Container>
    </footer>
  );
}
