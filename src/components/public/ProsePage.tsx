import { Container } from "./Container";

/** Shared shell for text-heavy static/legal pages. */
export function ProsePage({
  title,
  intro,
  updated,
  children,
}: {
  title: string;
  intro?: string;
  updated?: string;
  children: React.ReactNode;
}) {
  return (
    <Container className="py-12 sm:py-16">
      <div className="mx-auto max-w-[720px]">
        <header className="mb-10">
          <h1 className="font-serif text-4xl font-bold sm:text-5xl">{title}</h1>
          {intro && (
            <p className="mt-4 text-lg text-[var(--color-muted-foreground)]">{intro}</p>
          )}
          {updated && (
            <p className="mt-3 text-sm text-[var(--color-muted-foreground)]">
              Last updated: {updated}
            </p>
          )}
        </header>
        <div className="doc-prose prose prose-lg max-w-none dark:prose-invert">{children}</div>
      </div>
    </Container>
  );
}
