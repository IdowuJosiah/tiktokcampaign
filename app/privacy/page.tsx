import { AppShell } from "@/app/components/AppShell";

const updatedAt = "June 4, 2026";

export default function PrivacyPage() {
  return (
    <AppShell>
      <main className="legal-page">
        <header className="page-header">
          <div>
            <p className="eyebrow">Legal</p>
            <h1>Privacy Policy</h1>
            <p>Last updated: {updatedAt}</p>
          </div>
        </header>

        <section className="panel">
          <div className="legal-section">
            <h2>1. Information We Collect</h2>
            <ul>
              <li>Account details, such as name, email address, role, and login provider.</li>
              <li>Creator profile details, such as TikTok account information, submitted TikTok links, campaign participation, and submission status.</li>
              <li>Brand details, such as company name, campaign briefs, reward pool settings, deposit references, and review activity.</li>
              <li>Payout and verification details, such as bank name, account number, resolved account name, NIN, and verification status.</li>
              <li>Technical data, such as device, browser, server logs, authentication events, and usage activity.</li>
            </ul>
          </div>

          <div className="legal-section">
            <h2>2. TikTok Data</h2>
            <p>
              If you connect TikTok, CreatorLink may request TikTok-approved permissions to access basic profile
              information and public video information needed to verify submissions. This may include your TikTok user
              identity, display information, public videos, video links, captions, view counts, and engagement metrics
              where TikTok makes that data available through its developer APIs.
            </p>
          </div>

          <div className="legal-section">
            <h2>3. How We Use Information</h2>
            <ul>
              <li>To create and manage CreatorLink accounts.</li>
              <li>To link creator TikTok accounts and verify campaign submissions.</li>
              <li>To show eligible campaigns, process reviews, and calculate rewards.</li>
              <li>To resolve bank account names, prepare payouts, and support compliance checks.</li>
              <li>To prevent fraud, abuse, duplicate submissions, and unsafe platform activity.</li>
              <li>To operate, troubleshoot, secure, and improve CreatorLink.</li>
            </ul>
          </div>

          <div className="legal-section">
            <h2>4. Sharing Information</h2>
            <p>
              We do not sell personal information. We may share information with service providers that help us operate
              CreatorLink, including hosting, database, authentication, analytics, payment, payout, identity verification,
              and communication providers. We may also share information when required by law or necessary to protect
              users, brands, CreatorLink, or the public.
            </p>
          </div>

          <div className="legal-section">
            <h2>5. Retention</h2>
            <p>
              We keep account, campaign, submission, payout, and verification records for as long as needed to provide
              the service, resolve disputes, prevent fraud, meet legal obligations, and maintain business records. TikTok
              access tokens are stored only for as long as needed to support connected-account functionality and may be
              deleted when you disconnect TikTok or delete your account.
            </p>
          </div>

          <div className="legal-section">
            <h2>6. Your Choices</h2>
            <ul>
              <li>You may disconnect TikTok from your CreatorLink profile when supported in the product.</li>
              <li>You may request account deletion or correction of inaccurate information.</li>
              <li>You may decline to provide payout or identity information, but withdrawals may be unavailable.</li>
            </ul>
          </div>

          <div className="legal-section">
            <h2>7. Security</h2>
            <p>
              We use reasonable technical and organizational safeguards to protect user information. No online service is
              completely secure, so users should keep login credentials private and report suspected account misuse.
            </p>
          </div>

          <div className="legal-section">
            <h2>8. Children</h2>
            <p>
              CreatorLink is not intended for children. Users must be old enough to enter into these terms and comply
              with applicable TikTok, payment, payout, and local legal requirements.
            </p>
          </div>

          <div className="legal-section">
            <h2>9. Contact</h2>
            <p>For privacy requests or questions, contact CreatorLink at privacy@creatorlink.app.</p>
          </div>
        </section>
      </main>
    </AppShell>
  );
}
