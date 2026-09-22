/** Centralized runtime configuration + shared constants. */

function required(value: string | undefined, name: string, fallback?: string): string {
  if (value && value.length > 0) return value;
  if (fallback !== undefined) return fallback;
  // Don't hard-throw at import time in the browser; surface a clear console error instead.
  if (typeof window === "undefined") {
    console.warn(`[config] Missing env var ${name}`);
  }
  return "";
}

/** Backend base URL — NO /api/v1 prefix (routers mount at root). */
export const API_URL = required(
  process.env.NEXT_PUBLIC_API_URL,
  "NEXT_PUBLIC_API_URL",
  "http://localhost:4000",
);

/** Server-only base URL for RSC/ISR fetches (falls back to public URL). */
export const API_INTERNAL_URL =
  process.env.API_INTERNAL_URL && process.env.API_INTERNAL_URL.length > 0
    ? process.env.API_INTERNAL_URL
    : API_URL;

export const SITE_URL = required(
  process.env.NEXT_PUBLIC_SITE_URL,
  "NEXT_PUBLIC_SITE_URL",
  "http://localhost:3000",
);

export const SITE_NAME = process.env.NEXT_PUBLIC_SITE_NAME ?? "YourBlog";
export const SITE_DESCRIPTION =
  process.env.NEXT_PUBLIC_SITE_DESCRIPTION ??
  "Fresh, AI-curated writing on the things that matter.";

export const GA_ID = process.env.NEXT_PUBLIC_GA_ID ?? "";
export const ADSENSE_CLIENT = process.env.NEXT_PUBLIC_ADSENSE_CLIENT ?? "";

/** Public contact email (used on the contact page + legal pages). */
export const CONTACT_EMAIL =
  process.env.NEXT_PUBLIC_CONTACT_EMAIL ??
  (() => {
    try {
      return `hello@${new URL(SITE_URL).hostname.replace(/^www\./, "")}`;
    } catch {
      return "hello@example.com";
    }
  })();

/** ISR revalidation window for public content (seconds). */
export const ISR_REVALIDATE = 3600;

/** Default page size for public listings. */
export const DEFAULT_PAGE_SIZE = 12;

/** Cache tags for on-demand revalidation via /api/revalidate. */
export const CACHE_TAGS = {
  posts: "posts",
  post: (slug: string) => `post:${slug}`,
  categories: "categories",
  tags: "tags",
} as const;
