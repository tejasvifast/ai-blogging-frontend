import NextAuth from "next-auth";
import { authConfig } from "@/lib/auth.config";

// Build an edge-safe instance for route protection (uses only authConfig —
// no axios/bcrypt). The `authorized` callback gates /admin.
export const { auth: middleware } = NextAuth(authConfig);

export default middleware;

export const config = {
  // Run on everything except static assets and the auth API itself.
  matcher: ["/admin/:path*"],
};
