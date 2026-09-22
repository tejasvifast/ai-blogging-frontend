import { AxiosError } from "axios";
import type { ApiErrorBody, ApiErrorCode } from "@/types";

/** Normalized error thrown by all API helpers — carries the backend's error code. */
export class ApiError extends Error {
  readonly code: ApiErrorCode | "NETWORK_ERROR" | "UNKNOWN";
  readonly status: number;
  readonly details?: unknown;

  constructor(
    message: string,
    code: ApiError["code"],
    status: number,
    details?: unknown,
  ) {
    super(message);
    this.name = "ApiError";
    this.code = code;
    this.status = status;
    this.details = details;
  }
}

/** Turn any thrown value (axios or otherwise) into a typed ApiError. */
export function toApiError(err: unknown): ApiError {
  if (err instanceof ApiError) return err;

  if (err instanceof AxiosError) {
    const status = err.response?.status ?? 0;
    const body = err.response?.data as ApiErrorBody | undefined;
    if (body && body.success === false && body.error) {
      return new ApiError(body.error.message, body.error.code, status, body.error.details);
    }
    if (status === 0) {
      return new ApiError(
        err.message || "Network error — the API is unreachable.",
        "NETWORK_ERROR",
        0,
      );
    }
    return new ApiError(err.message, "UNKNOWN", status);
  }

  return new ApiError(err instanceof Error ? err.message : "Unknown error", "UNKNOWN", 0);
}

/** Extract field-level validation errors (from Zod .flatten()) if present. */
export function fieldErrors(err: ApiError): Record<string, string[]> {
  const details = err.details as { fieldErrors?: Record<string, string[]> } | undefined;
  return details?.fieldErrors ?? {};
}
