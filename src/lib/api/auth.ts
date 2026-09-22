import axios, { type AxiosResponse } from "axios";
import { API_URL } from "@/lib/constants";
import type {
  ApiSuccess,
  AuthPayload,
  GoogleInput,
  LoginInput,
  MePayload,
  RegisterInput,
} from "@/types";
import { toApiError } from "./errors";

/**
 * Dedicated Axios instance for /auth/* that deliberately BYPASSES the shared
 * client's interceptors: a 401 from /auth/login means "bad credentials" (show
 * an error) — it must NOT trigger the global signOut redirect. Works both
 * server-side (inside the Auth.js config) and client-side (register form).
 */
const authClient = axios.create({
  baseURL: API_URL,
  timeout: 15_000,
  withCredentials: true,
  headers: { "Content-Type": "application/json" },
});

async function unwrapAuth<T>(p: Promise<AxiosResponse<ApiSuccess<T>>>): Promise<T> {
  try {
    return (await p).data.data;
  } catch (err) {
    throw toApiError(err);
  }
}

export const authApi = {
  login: (input: LoginInput) =>
    unwrapAuth<AuthPayload>(authClient.post<ApiSuccess<AuthPayload>>("/auth/login", input)),

  register: (input: RegisterInput) =>
    unwrapAuth<AuthPayload>(authClient.post<ApiSuccess<AuthPayload>>("/auth/register", input)),

  /** Exchange a Google ID token for a backend JWT (audience = GOOGLE_CLIENT_ID). */
  google: (input: GoogleInput) =>
    unwrapAuth<AuthPayload>(authClient.post<ApiSuccess<AuthPayload>>("/auth/google", input)),

  /** Fetch the current user with an explicit Bearer token (used server-side). */
  me: (accessToken: string) =>
    unwrapAuth<MePayload>(
      authClient.get<ApiSuccess<MePayload>>("/auth/me", {
        headers: { Authorization: `Bearer ${accessToken}` },
      }),
    ),
};
