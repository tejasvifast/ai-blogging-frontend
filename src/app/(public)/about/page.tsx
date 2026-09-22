import type { Metadata } from "next";
import Link from "next/link";
import { ProsePage } from "@/components/public/ProsePage";
import { NewsletterCTA } from "@/components/public/NewsletterCTA";
import { buildPageMetadata } from "@/lib/seo";
import { CONTACT_EMAIL, SITE_NAME } from "@/lib/constants";

export const metadata: Metadata = buildPageMetadata({
  title: "About",
  description: `Learn more about ${SITE_NAME} — what we write about and why.`,
  path: "/about",
});

export default function AboutPage() {
  return (
    <>
      <ProsePage
        title={`About ${SITE_NAME}`}
        intro="Curious, useful writing — published often, edited carefully."
      >
        <p>
          {SITE_NAME} is a modern publication covering the ideas, tools, and stories worth your
          time. We combine editorial judgment with AI-assisted research to publish clear,
          well-structured articles at a steady cadence.
        </p>

        <h2>What we cover</h2>
        <p>
          Our writing spans technology, culture, and practical how-tos. Every piece is organized
          into categories and tags so you can follow the threads that interest you most — browse
          the <Link href="/blog">full archive</Link> to get a feel for the range.
        </p>

        <h2>Our editorial approach</h2>
        <p>
          Drafts may be generated with the help of large language models, but each article is
          reviewed for accuracy, clarity, and usefulness before publication. Where a post is
          AI-assisted, our aim is always the same: to save you time and tell you something true.
        </p>

        <h2>Get in touch</h2>
        <p>
          Have a question, correction, or idea? We&rsquo;d love to hear from you. Reach us at{" "}
          <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a> or through our{" "}
          <Link href="/contact">contact page</Link>.
        </p>
      </ProsePage>
      <div className="mt-8">
        <NewsletterCTA />
      </div>
    </>
  );
}
