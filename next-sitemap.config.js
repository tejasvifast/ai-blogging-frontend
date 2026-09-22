/**
 * next-sitemap runs as a `postbuild` step to generate robots.txt + a static
 * sitemap index for non-dynamic routes. Dynamic post/category/tag URLs are
 * served by the App Router `src/app/sitemap.ts` (fetched from the backend),
 * which this references as an additional sitemap.
 * @type {import('next-sitemap').IConfig}
 */
const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

module.exports = {
  siteUrl,
  generateRobotsTxt: true,
  // The App Router sitemap.ts owns the content URLs; exclude them here.
  exclude: ["/admin", "/admin/*", "/login", "/api/*", "/server-sitemap.xml"],
  robotsTxtOptions: {
    additionalSitemaps: [`${siteUrl}/sitemap.xml`],
    policies: [
      { userAgent: "*", allow: "/", disallow: ["/admin", "/api", "/login"] },
    ],
  },
};
