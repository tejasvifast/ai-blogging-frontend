import type { Metadata } from "next";
import Link from "next/link";
import { ProsePage } from "@/components/public/ProsePage";
import { TemplateNotice } from "@/components/public/TemplateNotice";
import { buildPageMetadata } from "@/lib/seo";
import { CONTACT_EMAIL, SITE_NAME, SITE_URL } from "@/lib/constants";

export const metadata: Metadata = buildPageMetadata({
  title: "Privacy Policy",
  description: `How ${SITE_NAME} collects, uses, and protects your information.`,
  path: "/privacy-policy",
});

export default function PrivacyPolicyPage() {
  return (
    <ProsePage title="Privacy Policy" updated="July 23, 2026">
      <TemplateNotice />

      <p>
        This Privacy Policy explains how {SITE_NAME} (&ldquo;we&rdquo;, &ldquo;us&rdquo;, or
        &ldquo;our&rdquo;) collects, uses, and safeguards information when you visit{" "}
        <a href={SITE_URL}>{SITE_URL}</a> (the &ldquo;Site&rdquo;). By using the Site, you consent
        to the practices described here.
      </p>

      <h2>Information we collect</h2>
      <ul>
        <li>
          <strong>Log &amp; usage data:</strong> your browser type, device, referring pages, and
          the pages you visit, collected automatically by our servers and analytics tools.
        </li>
        <li>
          <strong>Information you provide:</strong> your email address if you subscribe to our
          newsletter, and any details you include when you contact us.
        </li>
        <li>
          <strong>Cookies:</strong> small files stored on your device — see below.
        </li>
      </ul>

      <h2>Cookies and web beacons</h2>
      <p>
        We use cookies to remember your preferences (such as light/dark theme) and to understand
        how the Site is used. You can disable cookies in your browser settings, though some
        features may not function as intended.
      </p>

      <h2>Google AdSense &amp; advertising</h2>
      <p>
        We use third-party advertising, including Google AdSense, to serve ads when you visit the
        Site. These partners may use cookies and web beacons to serve ads based on your prior
        visits to this and other websites.
      </p>
      <ul>
        <li>
          Google, as a third-party vendor, uses cookies (including the DoubleClick DART cookie) to
          serve ads based on your visits to the Site and other sites on the Internet.
        </li>
        <li>
          You may opt out of personalized advertising by visiting{" "}
          <a href="https://www.google.com/settings/ads" target="_blank" rel="noopener noreferrer">
            Google Ads Settings
          </a>
          , or opt out of third-party vendor cookies at{" "}
          <a href="https://www.aboutads.info" target="_blank" rel="noopener noreferrer">
            www.aboutads.info
          </a>
          .
        </li>
        <li>
          Third-party ad networks operate under their own privacy policies; we do not control
          their cookies or technologies.
        </li>
      </ul>

      <h2>Analytics</h2>
      <p>
        We may use analytics services (such as Google Analytics) to collect aggregate, anonymized
        information about Site traffic and usage to improve our content.
      </p>

      <h2>Your rights (GDPR &amp; CCPA)</h2>
      <p>
        Depending on where you live, you may have the right to access, correct, or delete your
        personal data, and to object to or restrict certain processing. Residents of the EEA/UK
        are asked for consent before non-essential cookies (including advertising cookies) are
        set. To exercise any of these rights, contact us at{" "}
        <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a>.
      </p>

      <h2>Children&rsquo;s privacy</h2>
      <p>
        The Site is not directed to children under 13, and we do not knowingly collect personal
        information from them. If you believe a child has provided us information, please contact
        us and we will delete it.
      </p>

      <h2>Third-party links</h2>
      <p>
        Our articles may link to external sites. We are not responsible for the privacy practices
        or content of those sites.
      </p>

      <h2>Changes to this policy</h2>
      <p>
        We may update this policy from time to time. Changes take effect when posted on this page,
        and the &ldquo;Last updated&rdquo; date above will reflect the revision.
      </p>

      <h2>Contact</h2>
      <p>
        Questions about this policy? Email <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a>{" "}
        or use our <Link href="/contact">contact page</Link>.
      </p>
    </ProsePage>
  );
}
