import { AppShell } from "@/app/components/AppShell";

const updatedAt = "July 8, 2026";

export default function PrivacyPage() {
  return (
    <AppShell>
      <main className="legal-page">
        <header className="page-header">
          <div>
            <div className="legal-brand">
              <img alt="VoiceRank app icon" src="/voicerank-icon.png" />
              <strong>VoiceRank</strong>
            </div>
            <p className="eyebrow">Legal</p>
            <h1>VoiceRank Privacy Policy</h1>
            <p>Last updated: {updatedAt}</p>
          </div>
        </header>

        <section className="panel">
          <div className="legal-section">
            <h2>1. Introduction</h2>
            <p>
              This Privacy Policy explains how VoiceRank (&quot;we&quot;, &quot;us&quot;, or &quot;our&quot;)
              collects, uses, discloses, and protects personal data when you access or use our platform,
              including our website and services (the &quot;Platform&quot;). VoiceRank connects brands running
              TikTok campaigns with creators who submit and are rewarded for qualifying videos.
            </p>
            <p>
              We are committed to safeguarding your personal data and to processing it in line with the Nigeria
              Data Protection Act (NDPA) and other applicable data protection laws. By accessing or using the
              Platform, you acknowledge that you have read and understood this Privacy Policy.
            </p>
          </div>

          <div className="legal-section">
            <h2>2. Information We Collect</h2>
            <p>We collect and process the following categories of personal data:</p>
            <ul>
              <li>Account details, such as name, email address, role, and login provider.</li>
              <li>Creator profile details, such as TikTok account information, submitted TikTok links, campaign participation, and submission status.</li>
              <li>Brand details, such as company name, campaign briefs, reward pool settings, deposit references, and review activity.</li>
              <li>Payout and verification details, such as bank name, account number, resolved account name, National Identification Number (NIN), and verification status.</li>
              <li>Technical data, such as IP address, device type, browser type and version, operating system, server logs, authentication events, and usage activity relating to your interaction with the Platform.</li>
            </ul>
            <p>
              We collect this data through direct interactions (such as account registration, forms, and
              communications), automated technologies such as cookies, and third-party service providers and
              integrations you choose to connect.
            </p>
          </div>

          <div className="legal-section">
            <h2>3. TikTok Data</h2>
            <p>
              If you connect TikTok, VoiceRank may request TikTok-approved permissions to access basic profile
              information and public video information needed to verify submissions. This may include your TikTok user
              identity, display information, public videos, video links, captions, view counts, and engagement metrics
              where TikTok makes that data available through its developer APIs. TikTok access tokens are stored only
              for as long as needed to support connected-account functionality.
            </p>
          </div>

          <div className="legal-section">
            <h2>4. How We Use Information</h2>
            <ul>
              <li>To create, operate, and manage VoiceRank accounts.</li>
              <li>To link creator TikTok accounts and verify campaign submissions.</li>
              <li>To show eligible campaigns, process reviews, rank and score submissions, and calculate rewards.</li>
              <li>To resolve bank account names, prepare payouts, and support compliance and identity checks.</li>
              <li>To prevent fraud, abuse, duplicate submissions, and unsafe platform activity.</li>
              <li>To communicate with users and brands about their accounts and activity.</li>
              <li>To operate, troubleshoot, secure, and improve VoiceRank, and to comply with legal obligations.</li>
            </ul>
          </div>

          <div className="legal-section">
            <h2>5. Legal Basis for Processing</h2>
            <p>We process personal data under the Nigeria Data Protection Act on the following legal bases:</p>
            <ul>
              <li>Your consent, where required (for example, connecting TikTok or submitting identity information).</li>
              <li>Performance of a contract, to provide the campaigns, reviews, and payouts you request.</li>
              <li>Compliance with legal, regulatory, and reporting obligations.</li>
              <li>Our legitimate business interests, provided these do not override your fundamental rights and freedoms.</li>
            </ul>
          </div>

          <div className="legal-section">
            <h2>6. Sharing &amp; Disclosure</h2>
            <p>
              We do not sell personal information. We may share information with service providers that help us
              operate VoiceRank, including hosting, database, authentication, analytics, payment, payout, identity
              verification, and communication providers. We may also share information with regulatory, governmental,
              or law enforcement authorities, and with professional advisers, where required by law or necessary to
              protect users, brands, VoiceRank, or the public. All third parties are required to keep your data
              confidential and to process it only for specified purposes.
            </p>
          </div>

          <div className="legal-section">
            <h2>7. International Data Transfers</h2>
            <p>
              Some of our service providers (including hosting, database, payment, and verification partners) may
              process data outside Nigeria. Where personal data is transferred outside Nigeria, we take steps to
              ensure such transfers are made to jurisdictions with adequate data protection standards, or are subject
              to appropriate safeguards such as contractual data protection clauses.
            </p>
          </div>

          <div className="legal-section">
            <h2>8. Data Retention</h2>
            <p>
              We keep account, campaign, submission, payout, and verification records for as long as needed to
              provide the service, resolve disputes, prevent fraud, meet legal obligations, and maintain business
              records. TikTok access tokens are stored only for as long as needed to support connected-account
              functionality and may be deleted when you disconnect TikTok or delete your account. Where retention is
              not required by law, data may be deleted upon request or upon account deletion.
            </p>
          </div>

          <div className="legal-section">
            <h2>9. Data Security</h2>
            <p>
              We use reasonable technical and organizational safeguards to protect personal data against unauthorized
              access, loss, theft, alteration, and unauthorized disclosure. These measures are reviewed and updated in
              line with industry best practices. No online service is completely secure, so users should keep login
              credentials private and report suspected account misuse.
            </p>
          </div>

          <div className="legal-section">
            <h2>10. Your Rights</h2>
            <p>Under the Nigeria Data Protection Act, you have the right to:</p>
            <ul>
              <li>Request access to your personal data.</li>
              <li>Request correction of inaccurate or incomplete data.</li>
              <li>Request deletion of your data.</li>
              <li>Withdraw consent at any time.</li>
              <li>Object to processing of your data.</li>
              <li>Request restriction of processing.</li>
            </ul>
            <p>
              You may disconnect TikTok from your VoiceRank profile where supported in the product. You may decline to
              provide payout or identity information, but withdrawals may be unavailable. To exercise any of these
              rights, contact us at privacy@voicerank.vercel.app.
            </p>
          </div>

          <div className="legal-section">
            <h2>11. Cookies &amp; Tracking</h2>
            <p>
              We use cookies and similar technologies to keep you signed in, secure your session, enable essential
              Platform functionality, and understand usage patterns. Some of our providers (such as our authentication
              and payment partners) may set their own cookies. You can manage your cookie preferences through your
              browser settings, though disabling essential cookies may prevent you from signing in.
            </p>
          </div>

          <div className="legal-section">
            <h2>12. Third-Party Links</h2>
            <p>
              The Platform may contain links to third-party websites or services, including TikTok and our payment
              provider. We are not responsible for the privacy practices of those third parties, and we encourage you
              to review their privacy policies.
            </p>
          </div>

          <div className="legal-section">
            <h2>13. Data Breach Notification</h2>
            <p>
              In the event of a personal data breach, we will notify affected users where required and report the
              breach to the relevant regulatory authority, including the Nigeria Data Protection Commission, in
              accordance with applicable laws.
            </p>
          </div>

          <div className="legal-section">
            <h2>14. Children</h2>
            <p>
              VoiceRank is not intended for children. Users must be old enough to enter into these terms and comply
              with applicable TikTok, payment, payout, and local legal requirements.
            </p>
          </div>

          <div className="legal-section">
            <h2>15. Changes to This Policy</h2>
            <p>
              We may update this Privacy Policy from time to time. Any changes will be posted on this page with an
              updated revision date. Continued use of the Platform after changes are posted constitutes acceptance of
              the updated policy.
            </p>
          </div>

          <div className="legal-section">
            <h2>16. Contact Us</h2>
            <p>
              If you have questions, concerns, or requests regarding this Privacy Policy or your personal data,
              contact VoiceRank at privacy@voicerank.vercel.app.
            </p>
          </div>
        </section>
      </main>
    </AppShell>
  );
}
