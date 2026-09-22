import type { DefaultSession } from "next-auth";
import type { Role } from "./models";

/**
 * Module augmentation — thread the backend JWT + role through Auth.js.
 * Wired by the callbacks in `src/lib/auth.ts` (step 3).
 */
declare module "next-auth" {
  interface Session {
    accessToken?: string;
    user: {
      id: string;
      role: Role;
    } & DefaultSession["user"];
  }

  interface User {
    accessToken?: string;
    role?: Role;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id?: string;
    accessToken?: string;
    role?: Role;
  }
}
