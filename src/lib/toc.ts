import GithubSlugger from "github-slugger";

export interface TocItem {
  id: string;
  text: string;
  level: 2 | 3;
}

/**
 * Extract h2/h3 headings from markdown and slug them with github-slugger — the
 * SAME algorithm `rehype-slug` uses when rendering, so anchor ids match the TOC.
 * Skips headings inside fenced code blocks.
 */
export function extractToc(markdown: string): TocItem[] {
  const slugger = new GithubSlugger();
  const items: TocItem[] = [];
  let inFence = false;

  for (const rawLine of markdown.split("\n")) {
    const line = rawLine.trimEnd();
    if (/^(```|~~~)/.test(line.trim())) {
      inFence = !inFence;
      continue;
    }
    if (inFence) continue;

    const match = /^(#{2,3})\s+(.+?)\s*#*\s*$/.exec(line);
    if (!match) continue;

    const level = match[1]!.length as 2 | 3;
    // Strip inline markdown (links, emphasis, code) for the display text.
    const text = match[2]!
      .replace(/\[([^\]]+)\]\([^)]*\)/g, "$1")
      .replace(/[*_`~]/g, "")
      .trim();
    if (!text) continue;

    items.push({ id: slugger.slug(text), text, level });
  }

  return items;
}
