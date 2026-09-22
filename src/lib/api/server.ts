import "server-only";

import { API_INTERNAL_URL, ISR_REVALIDATE } from "@/lib/constants";
import type { ApiErrorBody, ApiSuccess, PaginationMeta } from "@/types";
import { ApiError } from "./errors";

type QueryValue = string | number | boolean | undefined | null;

interface ServerFetchOptions {
  /** Query params — undefined/null values are dropped. */
  params?: Record<string, QueryValue>;
  /** ISR window in seconds. Default: ISR_REVALIDATE. Pass 0 for no-store. */
  revalidate?: number;
  /** Cache tags for on-demand revalidation. */
  tags?: string[];
  init?: RequestInit;
}

function buildUrl(path: string, params?: Record<string, QueryValue>): string {
  const url = new URL(path.replace(/^\//, ""), `${API_INTERNAL_URL}/`);
  if (params) {
    for (const [key, value] of Object.entries(params)) {
      if (value !== undefined && value !== null && value !== "") {
        url.searchParams.set(key, String(value));
      }
    }
  }
  return url.toString();
}

/**
 * Server-side fetch for PUBLIC backend endpoints, integrated with Next's data
 * cache (ISR + tag revalidation). Returns the full envelope so callers can read
 * both `data` and pagination `meta`. Throws `ApiError` on non-2xx.
 */
export async function serverFetch<T>(
  path: string,
  { params, revalidate = ISR_REVALIDATE, tags, init }: ServerFetchOptions = {},
): Promise<ApiSuccess<T>> {
  const url = buildUrl(path, params);

  const res = await fetch(url, {
    ...init,
    headers: { Accept: "application/json", ...(init?.headers ?? {}) },
    next: revalidate === 0 ? undefined : { revalidate, tags },
    cache: revalidate === 0 ? "no-store" : undefined,
  });

  const json = (await res.json().catch(() => null)) as
    | ApiSuccess<T>
    | ApiErrorBody
    | null;

  if (!res.ok || !json || json.success === false) {
    const body = json as ApiErrorBody | null;
    throw new ApiError(
      body?.error?.message ?? `Request to ${path} failed (${res.status})`,
      body?.error?.code ?? "UNKNOWN",
      res.status,
      body?.error?.details,
    );
  }

  return json;
}

/** Like serverFetch but returns just `data`, or `null` on 404 (for notFound() flows). */
export async function serverFetchOrNull<T>(
  path: string,
  opts?: ServerFetchOptions,
): Promise<T | null> {
  try {
    return (await serverFetch<T>(path, opts)).data;
  } catch (err) {
    if (err instanceof ApiError && err.status === 404) return null;
    throw err;
  }
}

/** Convenience for paginated list endpoints. */
export async function serverFetchList<T>(
  path: string,
  opts?: ServerFetchOptions,
): Promise<{ items: T[]; meta: PaginationMeta | undefined }> {
  const res = await serverFetch<T[]>(path, opts);
  return { items: res.data, meta: res.meta };
}
