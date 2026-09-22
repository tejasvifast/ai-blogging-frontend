"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // TODO(step 15): forward to analytics/error tracking.
    console.error(error);
  }, [error]);

  return (
    <main className="flex min-h-screen flex-col items-center justify-center px-4 text-center">
      <p className="font-mono text-sm font-medium text-red-500">Error</p>
      <h1 className="mt-4 font-serif text-4xl font-bold sm:text-5xl">Something went wrong</h1>
      <p className="mt-4 max-w-md text-[var(--color-muted-foreground)]">
        An unexpected error occurred. You can try again, or head back home.
      </p>
      {error.digest && (
        <p className="mt-2 font-mono text-xs text-[var(--color-muted-foreground)]">
          Ref: {error.digest}
        </p>
      )}
      <div className="mt-8 flex gap-3">
        <Button onClick={reset}>Try again</Button>
        <Button variant="outline" onClick={() => (window.location.href = "/")}>
          Back home
        </Button>
      </div>
    </main>
  );
}
