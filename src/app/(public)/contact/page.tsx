import type { Metadata } from "next";
import { Mail } from "lucide-react";
import { Container } from "@/components/public/Container";
import { ContactForm } from "@/components/public/ContactForm";
import { buildPageMetadata } from "@/lib/seo";
import { CONTACT_EMAIL, SITE_NAME } from "@/lib/constants";

export const metadata: Metadata = buildPageMetadata({
  title: "Contact",
  description: `Get in touch with the ${SITE_NAME} team.`,
  path: "/contact",
});

export default function ContactPage() {
  return (
    <Container className="py-12 sm:py-16">
      <div className="mx-auto grid max-w-4xl gap-12 lg:grid-cols-[1fr_320px]">
        <div>
          <h1 className="font-serif text-4xl font-bold sm:text-5xl">Get in touch</h1>
          <p className="mt-4 text-lg text-[var(--color-muted-foreground)]">
            Questions, feedback, or a correction on a post? Send us a note and we&rsquo;ll get
            back to you.
          </p>
          <div className="mt-8">
            <ContactForm to={CONTACT_EMAIL} />
          </div>
        </div>

        <aside className="space-y-6">
          <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-card)] p-6">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[var(--color-primary)]/10 text-[var(--color-primary)]">
              <Mail className="h-5 w-5" />
            </div>
            <h2 className="mt-4 font-semibold">Email us</h2>
            <p className="mt-1 text-sm text-[var(--color-muted-foreground)]">
              Prefer email? Reach us directly:
            </p>
            <a
              href={`mailto:${CONTACT_EMAIL}`}
              className="mt-2 inline-block text-sm font-medium text-[var(--color-primary)] hover:underline"
            >
              {CONTACT_EMAIL}
            </a>
          </div>
          <p className="px-1 text-xs text-[var(--color-muted-foreground)]">
            We typically respond within a couple of business days.
          </p>
        </aside>
      </div>
    </Container>
  );
}
