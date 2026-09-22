"use client";

import axios, {
  type AxiosInstance,
  type AxiosResponse,
  type InternalAxiosRequestConfig,
} from "axios";
import { getSession, signOut } from "next-auth/react";
import { API_URL } from "@/lib/constants";
import type { ApiSuccess, PaginationMeta } from "@/types";
import { toApiError } from "./errors";

/**
 * Client-side Axios instance for authenticated / mutating calls (admin panel,
 * forms, interactive fetches). Public SSR/ISR reads use `lib/api/server.ts`
 * (native fetch + Next cache) instead — Axios does not integrate with Next's
 * fetch cache, so it must not be used inside Server Components.
 *
 * `withCredentials` lets the backend's httpOnly `refreshToken` cookie flow on
 * cross-origin requests (backend CORS sets `credentials: true`).
 */
export const apiClient: AxiosInstance = axios.create({
  baseURL: API_URL,
  timeout: 15_000,
  withCredentials: true,
  headers: { "Content-Type": "application/json" },
});

// Cache the session lookup briefly so we don't hit /api/auth/session on every call.
let cachedToken: { value: string | null; at: number } | null = null;
const TOKEN_TTL = 30_000;

async function getAccessToken(): Promise<string | null> {
  const now = Date.now();
  if (cachedToken && now - cachedToken.at < TOKEN_TTL) return cachedToken.value;
  const session = await getSession();
  const token = session?.accessToken ?? null;
  cachedToken = { value: token, at: now };
  return token;
}

/** Clear the cached token (call after sign-in / sign-out so the next call re-reads). */
export function resetTokenCache() {
  cachedToken = null;
}

// Request interceptor — attach the backend JWT from the Auth.js session.
apiClient.interceptors.request.use(async (config: InternalAxiosRequestConfig) => {
  const token = await getAccessToken();
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Response interceptor — on 401, drop the cached token and sign out.
apiClient.interceptors.response.use(
  (res) => res,
  async (error) => {
    if (error?.response?.status === 401) {
      resetTokenCache();
      // Avoid redirect loops on the login page itself.
      if (typeof window !== "undefined" && !window.location.pathname.startsWith("/login")) {
        await signOut({ callbackUrl: "/login" });
      }
    }
    return Promise.reject(error);
  },
);

/** Await an Axios request, unwrap `data.data`, and normalize errors to ApiError. */
export async function unwrap<T>(p: Promise<AxiosResponse<ApiSuccess<T>>>): Promise<T> {
  try {
    return (await p).data.data;
  } catch (err) {
    throw toApiError(err);
  }
}

/** Like unwrap but also returns pagination `meta` for list endpoints. */
export async function unwrapList<T>(
  p: Promise<AxiosResponse<ApiSuccess<T[]>>>,
): Promise<{ items: T[]; meta: PaginationMeta | undefined }> {
  try {
    const res = await p;
    return { items: res.data.data, meta: res.data.meta };
  } catch (err) {
    throw toApiError(err);
  }
}
