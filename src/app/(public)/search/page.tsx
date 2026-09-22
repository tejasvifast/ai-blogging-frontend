import type { Metadata } from "next";
import { Container } from "@/components/public/Container";
import { SearchClient } from "@/components/public/SearchClient";
import { buildPageMetadata } from "@/lib/seo";

export const metadata: Metadata = buildPageMetadata({
  title: "Search",
  description: "Search the archive.",
  path: "/search",
  noIndex: true, // search result pages shouldn't be indexed
});

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { q } = await searchParams;

  return (
    <Container className="py-12 sm:py-16">
      <h1 className="mb-8 text-center font-serif text-4xl font-bold sm:text-5xl">Search</h1>
      <SearchClient initialQuery={q ?? ""} />
    </Container>
  );
}
