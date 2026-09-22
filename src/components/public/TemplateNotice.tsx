import { Info } from "lucide-react";

/**
 * Renders a clearly-visible notice that a legal page is a starting template,
 * not legal advice. Kept honest: these documents must be reviewed by the site
 * owner (and ideally counsel) before launch.
 */
export function TemplateNotice() {
  return (
    <div className="not-prose mb-8 flex gap-3 rounded-lg border border-amber-500/30 bg-amber-500/10 p-4 text-sm">
      <Info className="mt-0.5 h-5 w-5 shrink-0 text-amber-500" />
      <p className="text-[var(--color-foreground)]">
        <strong>Template — review before publishing.</strong> This document is a starting point
        generated for convenience. Replace the bracketed placeholders and have it reviewed for
        your jurisdiction and business. It is not legal advice.
      </p>
    </div>
  );
}
