import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center px-4 text-center">
      <p className="font-mono text-sm font-medium text-[var(--color-primary)]">404</p>
      <h1 className="mt-4 font-serif text-4xl font-bold sm:text-5xl">Page not found</h1>
      <p className="mt-4 max-w-md text-[var(--color-muted-foreground)]">
        The page you&rsquo;re looking for doesn&rsquo;t exist or may have been moved.
      </p>
      <div className="mt-8 flex gap-3">
        <Button asChild>
          <Link href="/">Back home</Link>
        </Button>
        <Button asChild variant="outline">
          <Link href="/blog">Browse the blog</Link>
        </Button>
      </div>
    </main>
  );
}
