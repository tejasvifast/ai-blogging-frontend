import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { LoginForm } from "@/components/auth/LoginForm";
import { SITE_NAME } from "@/lib/constants";

export const metadata: Metadata = {
  title: "Sign in",
  robots: { index: false, follow: false },
};

/** Only allow same-site relative paths as post-login destinations (no open redirect). */
function safeCallback(url?: string): string {
  const fallback = "/admin/dashboard";
  if (!url || !url.startsWith("/") || url.startsWith("//")) return fallback;
  return url;
}

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ callbackUrl?: string; error?: string }>;
}) {
  const session = await auth();
  const params = await searchParams;
  const callbackUrl = safeCallback(params.callbackUrl);
  const error = params.error;

  // Already signed in → skip the form.
  if (session?.user) redirect(callbackUrl);

  return (
    <main className="flex min-h-screen items-center justify-center bg-[var(--color-background)] px-4 py-12">
      <div className="w-full max-w-sm">
        <div className="mb-8 text-center">
          <Link
            href="/"
            className="font-serif text-2xl font-bold text-[var(--color-foreground)]"
          >
            {SITE_NAME}
          </Link>
          <h1 className="mt-6 font-serif text-2xl font-bold">Welcome back</h1>
          <p className="mt-1 text-sm text-[var(--color-muted-foreground)]">
            Sign in to manage your blog
          </p>
        </div>

        <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-card)] p-6 shadow-sm sm:p-8">
          <LoginForm callbackUrl={callbackUrl} initialError={error} />
        </div>

        <p className="mt-6 text-center text-xs text-[var(--color-muted-foreground)]">
          By continuing you agree to our{" "}
          <Link href="/terms" className="underline hover:text-[var(--color-foreground)]">
            Terms
          </Link>{" "}
          and{" "}
          <Link href="/privacy-policy" className="underline hover:text-[var(--color-foreground)]">
            Privacy Policy
          </Link>
          .
        </p>
      </div>
    </main>
  );
}
