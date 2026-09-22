import type { NextAuthConfig } from "next-auth";
import Google from "next-auth/providers/google";
import type { Role } from "@/types/models";

/**
 * Edge-safe Auth.js config — imported by `middleware.ts`. Contains NO Node-only
 * dependencies (no axios / bcrypt). The Credentials provider and the Google
 * id-token → backend-JWT exchange live in `auth.ts`, which runs in the Node
 * route handler. This split keeps the middleware bundle edge-compatible.
 */
export const authConfig = {
  trustHost: true,
  session: { strategy: "jwt" },
  pages: { signIn: "/login" },
  providers: [
    Google({
      clientId: process.env.AUTH_GOOGLE_ID,
      clientSecret: process.env.AUTH_GOOGLE_SECRET,
      authorization: {
        params: { prompt: "select_account", access_type: "offline" },
      },
    }),
  ],
  callbacks: {
    /** Route protection — runs in middleware for every matched request. */
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = Boolean(auth?.user);
      const isOnAdmin = nextUrl.pathname.startsWith("/admin");
      if (isOnAdmin) return isLoggedIn; // false → redirect to signIn page
      return true;
    },
    /** Map the (already-populated) JWT onto the client session. */
    session({ session, token }) {
      session.accessToken = token.accessToken as string | undefined;
      if (session.user) {
        session.user.id = (token.id as string | undefined) ?? session.user.id;
        session.user.role = (token.role as Role | undefined) ?? "EDITOR";
      }
      return session;
    },
  },
} satisfies NextAuthConfig;
