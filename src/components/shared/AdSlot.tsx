"use client";

import { useEffect, useRef, useState } from "react";
import { ADSENSE_CLIENT } from "@/lib/constants";
import { cn } from "@/lib/utils";

declare global {
  interface Window {
    adsbygoogle?: unknown[];
  }
}

/**
 * CLS-safe AdSense slot. Reserves exact height so ads never shift layout, and
 * lazy-loads when scrolled near the viewport.
 *
 * NOTE: consent gating (GDPR) is layered on in step 14 — until the cookie
 * banner grants consent, `AdSense` script isn't loaded, so this renders the
 * reserved placeholder only.
 */
export function AdSlot({
  slot,
  format = "auto",
  reserveHeight = 280,
  lazyLoad = true,
  className,
}: {
  slot: string;
  format?: string;
  reserveHeight?: number;
  lazyLoad?: boolean;
  className?: string;
}) {
  const ref = useRef<HTMLModElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [inView, setInView] = useState(!lazyLoad);
  const [pushed, setPushed] = useState(false);

  // Lazy reveal.
  useEffect(() => {
    if (!lazyLoad || inView || !containerRef.current) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting) {
          setInView(true);
          observer.disconnect();
        }
      },
      { rootMargin: "200px" },
    );
    observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, [lazyLoad, inView]);

  // Request the ad once visible + script present.
  useEffect(() => {
    if (!inView || pushed || !ADSENSE_CLIENT) return;
    if (typeof window !== "undefined" && Array.isArray(window.adsbygoogle)) {
      try {
        window.adsbygoogle.push({});
        setPushed(true);
      } catch {
        /* adsbygoogle not ready yet */
      }
    }
  }, [inView, pushed]);

  return (
    <div
      ref={containerRef}
      className={cn(
        "mx-auto flex w-full items-center justify-center overflow-hidden",
        className,
      )}
      style={{ minHeight: reserveHeight }}
      aria-hidden
    >
      {ADSENSE_CLIENT ? (
        <ins
          ref={ref}
          className="adsbygoogle block w-full"
          style={{ display: "block", minHeight: reserveHeight }}
          data-ad-client={ADSENSE_CLIENT}
          data-ad-slot={slot}
          data-ad-format={format}
          data-full-width-responsive="true"
        />
      ) : (
        <div className="flex h-full w-full items-center justify-center rounded-lg border border-dashed border-[var(--color-border)] text-xs uppercase tracking-widest text-[var(--color-muted-foreground)]">
          Advertisement
        </div>
      )}
    </div>
  );
}
