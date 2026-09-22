"use client";

import { useRef, useState } from "react";
import { Check, Copy } from "lucide-react";

/** `pre` renderer for markdown — adds a copy button over the code block. */
export function CodeBlock(props: React.HTMLAttributes<HTMLPreElement>) {
  const ref = useRef<HTMLPreElement>(null);
  const [copied, setCopied] = useState(false);

  async function copy() {
    const text = ref.current?.innerText ?? "";
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      /* ignore */
    }
  }

  return (
    <div className="group relative my-6">
      <button
        onClick={copy}
        aria-label="Copy code"
        className="absolute right-3 top-3 z-10 flex h-8 w-8 items-center justify-center rounded-md border border-white/10 bg-black/40 text-white/70 opacity-0 backdrop-blur transition-opacity hover:text-white group-hover:opacity-100"
      >
        {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
      </button>
      <pre ref={ref} {...props} />
    </div>
  );
}
