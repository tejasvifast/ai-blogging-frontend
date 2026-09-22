import type { Role, User } from "./models";

export interface LoginInput {
  email: string;
  password: string;
}

export interface RegisterInput {
  email: string;
  password: string;
  name: string;
}

export interface GoogleInput {
  idToken: string;
}

/** Payload of /auth/login, /auth/register, /auth/google, /auth/refresh (inside `data`). */
export interface AuthPayload {
  user: User;
  accessToken: string;
}

export interface MePayload {
  user: User;
}

/** Fields we thread through the Auth.js JWT/session. */
export interface BackendIdentity {
  accessToken: string;
  role: Role;
}
