import { format, formatDistanceToNowStrict, parseISO } from "date-fns";
import type { Post } from "@/types";

/** "Jul 22, 2026" */
export function formatDate(iso: string | null | undefined): string {
  if (!iso) return "";
  try {
    return format(parseISO(iso), "MMM d, yyyy");
  } catch {
    return "";
  }
}

/** "3 days ago" */
export function formatRelative(iso: string | null | undefined): string {
  if (!iso) return "";
  try {
    return `${formatDistanceToNowStrict(parseISO(iso))} ago`;
  } catch {
    return "";
  }
}

/** The most meaningful timestamp for a post. */
export function postDate(post: Pick<Post, "publishedAt" | "createdAt">): string {
  return post.publishedAt ?? post.createdAt;
}

/** "5 min read" — uses the backend value or estimates from content length. */
export function readingTimeLabel(post: Pick<Post, "readingTime" | "content">): string {
  const minutes =
    post.readingTime ?? Math.max(1, Math.round((post.content?.split(/\s+/).length ?? 0) / 200));
  return `${minutes} min read`;
}

/** First letter(s) for avatar fallbacks. */
export function initials(name: string | null | undefined): string {
  if (!name) return "?";
  const parts = name.trim().split(/\s+/);
  return (parts[0]?.[0] ?? "").concat(parts[1]?.[0] ?? "").toUpperCase() || "?";
}

/** Compact view count: 1.2k, 3.4M */
export function formatViews(views: number): string {
  if (views < 1000) return String(views);
  if (views < 1_000_000) return `${(views / 1000).toFixed(1).replace(/\.0$/, "")}k`;
  return `${(views / 1_000_000).toFixed(1).replace(/\.0$/, "")}M`;
}
