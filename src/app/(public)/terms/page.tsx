import type { Metadata } from "next";
import Link from "next/link";
import { ProsePage } from "@/components/public/ProsePage";
import { TemplateNotice } from "@/components/public/TemplateNotice";
import { buildPageMetadata } from "@/lib/seo";
import { CONTACT_EMAIL, SITE_NAME } from "@/lib/constants";

export const metadata: Metadata = buildPageMetadata({
  title: "Terms of Service",
  description: `The terms governing your use of ${SITE_NAME}.`,
  path: "/terms",
});

export default function TermsPage() {
  return (
    <ProsePage title="Terms of Service" updated="July 23, 2026">
      <TemplateNotice />

      <p>
        These Terms of Service (&ldquo;Terms&rdquo;) govern your access to and use of {SITE_NAME}{" "}
        (the &ldquo;Site&rdquo;). By using the Site, you agree to these Terms. If you do not agree,
        please do not use the Site.
      </p>

      <h2>Use of the Site</h2>
      <p>
        You may access and read our content for personal, non-commercial use. You agree not to
        misuse the Site, including by attempting to disrupt it, scrape it at scale, or access it
        through automated means without permission.
      </p>

      <h2>Intellectual property</h2>
      <p>
        All content on the Site — text, graphics, logos, and design — is owned by or licensed to{" "}
        {SITE_NAME} and is protected by applicable intellectual property laws. You may share links
        to our articles, but you may not republish substantial portions without written consent.
      </p>

      <h2>User submissions</h2>
      <p>
        If you send us feedback, suggestions, or other materials, you grant us a non-exclusive,
        royalty-free right to use them without obligation to you.
      </p>

      <h2>Third-party content &amp; ads</h2>
      <p>
        The Site displays third-party advertising and may link to third-party websites. We are not
        responsible for the content, products, or practices of third parties.
      </p>

      <h2>Disclaimer of warranties</h2>
      <p>
        The Site is provided &ldquo;as is&rdquo; without warranties of any kind. See our{" "}
        <Link href="/disclaimer">Disclaimer</Link> for more detail.
      </p>

      <h2>Limitation of liability</h2>
      <p>
        To the fullest extent permitted by law, {SITE_NAME} shall not be liable for any indirect,
        incidental, or consequential damages arising from your use of the Site.
      </p>

      <h2>Changes to these Terms</h2>
      <p>
        We may revise these Terms at any time. Continued use of the Site after changes are posted
        constitutes acceptance of the revised Terms.
      </p>

      <h2>Contact</h2>
      <p>
        Questions about these Terms? Email{" "}
        <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a>.
      </p>
    </ProsePage>
  );
}
