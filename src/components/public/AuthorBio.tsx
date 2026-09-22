import Link from "next/link";
import { initials } from "@/lib/format";
import type { PublicAuthor } from "@/types";

export function AuthorBio({ author }: { author: PublicAuthor }) {
  return (
    <div className="flex items-start gap-4 rounded-xl border border-[var(--color-border)] bg-[var(--color-card)] p-6">
      {author.avatar ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={author.avatar}
          alt={author.name}
          className="h-14 w-14 shrink-0 rounded-full object-cover"
        />
      ) : (
        <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-[var(--color-primary)] text-lg font-semibold text-[var(--color-primary-foreground)]">
          {initials(author.name)}
        </span>
      )}
      <div className="min-w-0">
        <p className="text-xs uppercase tracking-wider text-[var(--color-muted-foreground)]">
          Written by
        </p>
        <Link
          href={`/author/${author.id}`}
          className="font-serif text-lg font-bold hover:text-[var(--color-primary)]"
        >
          {author.name}
        </Link>
        {author.bio && (
          <p className="mt-1 text-sm text-[var(--color-muted-foreground)]">{author.bio}</p>
        )}
      </div>
    </div>
  );
}
