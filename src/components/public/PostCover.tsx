import Image from "next/image";
import { cn } from "@/lib/utils";

/**
 * Cover image with a deterministic gradient fallback when a post has none.
 * The gradient hue is derived from the seed so each post looks consistent.
 */
export function PostCover({
  src,
  alt,
  seed,
  priority = false,
  sizes,
  className,
}: {
  src: string | null;
  alt: string;
  seed: string;
  priority?: boolean;
  sizes?: string;
  className?: string;
}) {
  if (src) {
    return (
      <Image
        src={src}
        alt={alt}
        fill
        priority={priority}
        sizes={sizes ?? "(max-width: 768px) 100vw, 33vw"}
        className={cn("object-cover", className)}
      />
    );
  }

  const hue = [...seed].reduce((acc, ch) => acc + ch.charCodeAt(0), 0) % 360;
  return (
    <div
      aria-hidden
      className={cn("flex items-center justify-center", className)}
      style={{
        background: `linear-gradient(135deg, hsl(${hue} 70% 55%), hsl(${(hue + 40) % 360} 70% 45%))`,
      }}
    >
      <span className="font-serif text-5xl font-bold text-white/90">
        {seed.charAt(0).toUpperCase()}
      </span>
    </div>
  );
}
