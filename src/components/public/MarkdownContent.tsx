import Markdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeRaw from "rehype-raw";
import rehypeSlug from "rehype-slug";
import rehypeHighlight from "rehype-highlight";
import type { Components } from "react-markdown";
import { CodeBlock } from "./CodeBlock";
import { AdSlot } from "@/components/shared/AdSlot";

/** Rough count of top-level paragraphs to place the mid-article ad. */
function countParagraphs(md: string): number {
  let inFence = false;
  let count = 0;
  for (const block of md.split(/\n{2,}/)) {
    const t = block.trim();
    if (/^(```|~~~)/.test(t)) {
      inFence = !inFence;
      continue;
    }
    if (inFence) continue;
    if (t && !/^([#>\-*+]|\d+\.|\||!\[|\[)/.test(t)) count += 1;
  }
  return count;
}

/**
 * Renders post markdown as a SINGLE tree (so `rehype-slug` ids match the TOC's
 * github-slugger output), while injecting in-article ads after the 2nd and the
 * middle paragraph via a counting `p` renderer.
 *
 * Security: raw HTML is rendered via rehype-raw. Content is trusted because the
 * backend sanitizes it (isomorphic-dompurify) before storage.
 */
export function MarkdownContent({ content }: { content: string }) {
  const total = countParagraphs(content);
  const adAfter = new Set<number>([2]);
  if (total >= 6) adAfter.add(Math.floor(total / 2));

  let pIndex = 0;

  const components: Components = {
    pre: (props) => {
      const { node: _node, ...rest } = props as typeof props & { node?: unknown };
      return <CodeBlock {...rest} />;
    },
    p: (props) => {
      const { node: _node, ...rest } = props as typeof props & { node?: unknown };
      pIndex += 1;
      const showAd = adAfter.has(pIndex);
      return (
        <>
          <p {...rest} />
          {showAd && (
            <AdSlot slot="in-article" reserveHeight={280} className="not-prose my-8" />
          )}
        </>
      );
    },
    a: (props) => {
      const { node: _node, href, ...rest } = props as typeof props & { node?: unknown };
      const external = href?.startsWith("http");
      return (
        <a
          href={href}
          {...rest}
          {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
        />
      );
    },
  };

  return (
    <div className="article-body prose prose-lg max-w-none dark:prose-invert">
      <Markdown
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[rehypeRaw, rehypeSlug, rehypeHighlight]}
        components={components}
      >
        {content}
      </Markdown>
    </div>
  );
}
