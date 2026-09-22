import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { authConfig } from "./auth.config";
import { authApi } from "./api/auth";
import { loginSchema } from "./validations/auth";

/**
 * Full Auth.js instance (Node runtime). Extends the edge-safe `authConfig` with
 * the Credentials provider and the sign-in/jwt callbacks that talk to the
 * backend over HTTP.
 *
 * Flow:
 *  - Credentials → POST /auth/login, returns { user, accessToken }.
 *  - Google      → NextAuth completes OAuth, then `signIn` forwards the Google
 *    id_token to POST /auth/google for verification + backend JWT issuance.
 * The resulting backend `accessToken` + `role` are threaded through the JWT.
 */
export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  providers: [
    ...authConfig.providers,
    Credentials({
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        const parsed = loginSchema.safeParse(credentials);
        if (!parsed.success) return null;
        try {
          const { user, accessToken } = await authApi.login(parsed.data);
          return {
            id: user.id,
            email: user.email,
            name: user.name,
            image: user.avatar,
            accessToken,
            role: user.role,
          };
        } catch {
          // Returning null surfaces as a CredentialsSignin error on the login page.
          return null;
        }
      },
    }),
  ],
  callbacks: {
    ...authConfig.callbacks,
    async signIn({ user, account }) {
      // Google: exchange the verified id_token for a backend JWT.
      if (account?.provider === "google") {
        if (!account.id_token) return false;
        try {
          const { user: backendUser, accessToken } = await authApi.google({
            idToken: account.id_token,
          });
          // Stash on `user` so the jwt callback (first call) can persist it.
          user.id = backendUser.id;
          user.name = backendUser.name;
          user.email = backendUser.email;
          user.image = backendUser.avatar;
          user.accessToken = accessToken;
          user.role = backendUser.role;
          return true;
        } catch {
          return false; // backend rejected the token (e.g. unverified email)
        }
      }
      // Credentials already validated in authorize().
      return true;
    },
    async jwt({ token, user }) {
      // `user` is present only on initial sign-in (both providers).
      if (user) {
        token.id = user.id;
        token.accessToken = user.accessToken;
        token.role = user.role;
      }
      return token;
    },
  },
});
