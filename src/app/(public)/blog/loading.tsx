import { Container } from "@/components/public/Container";
import { PostGridSkeleton } from "@/components/public/PostCardSkeleton";

export default function BlogLoading() {
  return (
    <Container className="py-10 sm:py-14">
      <div className="mb-8">
        <div className="h-12 w-64 animate-pulse rounded bg-[var(--color-muted)]" />
        <div className="mt-3 h-5 w-96 max-w-full animate-pulse rounded bg-[var(--color-muted)]" />
      </div>
      <div className="mb-10 flex gap-2">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="h-8 w-20 animate-pulse rounded-full bg-[var(--color-muted)]" />
        ))}
      </div>
      <PostGridSkeleton count={6} />
    </Container>
  );
}
