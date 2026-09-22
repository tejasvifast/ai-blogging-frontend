"use client";

import { useSession } from "next-auth/react";

/**
 * Convenience wrapper over Auth.js `useSession` exposing role helpers.
 * Sign-in / sign-out flows live in the login page and header (step 3/4).
 */
export function useAuth() {
  const { data: session, status } = useSession();

  const role = session?.user?.role;

  return {
    session,
    user: session?.user,
    accessToken: session?.accessToken,
    role,
    isAuthenticated: status === "authenticated",
    isLoading: status === "loading",
    isAdmin: role === "ADMIN",
    isEditor: role === "EDITOR" || role === "ADMIN",
  };
}
