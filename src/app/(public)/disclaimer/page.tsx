import type { Metadata } from "next";
import Link from "next/link";
import { ProsePage } from "@/components/public/ProsePage";
import { TemplateNotice } from "@/components/public/TemplateNotice";
import { buildPageMetadata } from "@/lib/seo";
import { CONTACT_EMAIL, SITE_NAME } from "@/lib/constants";

export const metadata: Metadata = buildPageMetadata({
  title: "Disclaimer",
  description: `Content and liability disclaimer for ${SITE_NAME}.`,
  path: "/disclaimer",
});

export default function DisclaimerPage() {
  return (
    <ProsePage title="Disclaimer" updated="July 23, 2026">
      <TemplateNotice />

      <p>
        The information provided by {SITE_NAME} (the &ldquo;Site&rdquo;) is for general
        informational purposes only. All information is provided in good faith; however, we make no
        representation or warranty of any kind regarding the accuracy, adequacy, validity,
        reliability, or completeness of any information on the Site.
      </p>

      <h2>AI-assisted content</h2>
      <p>
        Some articles on the Site are drafted with the assistance of artificial intelligence and
        then reviewed by our team. Despite this review, content may contain errors or become
        outdated. Always verify critical information against primary sources.
      </p>

      <h2>No professional advice</h2>
      <p>
        The Site does not provide professional advice (legal, financial, medical, or otherwise).
        Any reliance you place on our content is strictly at your own risk. Consult a qualified
        professional before acting on anything you read here.
      </p>

      <h2>External links</h2>
      <p>
        The Site may contain links to external websites. We do not warrant, endorse, or assume
        responsibility for the accuracy or reliability of information offered by third-party sites.
      </p>

      <h2>Affiliate &amp; advertising disclosure</h2>
      <p>
        The Site is supported by advertising and may contain affiliate links. We may earn a
        commission on qualifying purchases at no additional cost to you. Advertisements are served
        by third parties and do not constitute an endorsement.
      </p>

      <h2>Contact</h2>
      <p>
        Questions about this disclaimer? Email{" "}
        <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a> or visit our{" "}
        <Link href="/contact">contact page</Link>.
      </p>
    </ProsePage>
  );
}
