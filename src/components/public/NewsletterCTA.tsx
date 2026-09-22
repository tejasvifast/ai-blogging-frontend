"use client";

import { useState } from "react";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Container } from "./Container";
import { newsletterApi } from "@/lib/api/newsletter";
import { ApiError } from "@/lib/api/errors";
import { cn } from "@/lib/utils";

/** Newsletter opt-in band. `bare` renders just the form (e.g. inside a post). */
export function NewsletterCTA({ bare = false }: { bare?: boolean }) {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email) return;
    setLoading(true);
    try {
      const res = await newsletterApi.subscribe(email);
      toast.success(res.message ?? "Thanks for subscribing! Check your inbox to confirm.");
      setEmail("");
    } catch (err) {
      const msg =
        err instanceof ApiError ? err.message : "Could not subscribe. Please try again.";
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  }

  const form = (
    <form onSubmit={onSubmit} className="flex w-full max-w-md flex-col gap-3 sm:flex-row">
      <Input
        type="email"
        required
        placeholder="you@example.com"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        aria-label="Email address"
        className="h-11 flex-1 bg-[var(--color-background)]"
      />
      <Button type="submit" size="lg" disabled={loading}>
        {loading && <Loader2 className="animate-spin" />}
        Subscribe
      </Button>
    </form>
  );

  if (bare) return form;

  return (
    <section className="bg-[var(--color-muted)]">
      <Container className="py-16">
        <div className="flex flex-col items-center gap-6 text-center">
          <div className="max-w-2xl">
            <h2 className="font-serif text-3xl font-bold sm:text-4xl">
              Never miss a post
            </h2>
            <p className="mt-3 text-[var(--color-muted-foreground)]">
              Get the latest articles delivered straight to your inbox. No spam, unsubscribe
              anytime.
            </p>
          </div>
          <div className={cn("flex w-full justify-center")}>{form}</div>
        </div>
      </Container>
    </section>
  );
}
