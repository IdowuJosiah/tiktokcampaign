import { AppShell } from "@/app/components/AppShell";

const updatedAt = "June 4, 2026";

export default function TermsPage() {
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
            <h1>VoiceRank Terms of Service</h1>
            <p>Last updated: {updatedAt}</p>
          </div>
        </header>

        <section className="panel">
          <div className="legal-section">
            <h2>1. Overview</h2>
            <p>
              VoiceRank is a campaign platform that helps brands create TikTok creator campaigns and helps creators
              submit eligible TikTok videos for review and reward consideration. By using VoiceRank, you agree to
              these Terms of Service.
            </p>
          </div>

          <div className="legal-section">
            <h2>2. Accounts</h2>
            <p>
              You are responsible for the accuracy of the information you provide, including your email address, account
              type, TikTok account, payout details, and identity details when requested. You must not create accounts
              using false, misleading, or unauthorized information.
            </p>
          </div>

          <div className="legal-section">
            <h2>3. Creator Submissions</h2>
            <ul>
              <li>Creators must submit original TikTok videos that they are authorized to share.</li>
              <li>Submitted videos must follow the campaign instructions, including hashtags, sound requirements, disclosure rules, deadlines, and minimum views.</li>
              <li>VoiceRank may reject submissions that are fraudulent, misleading, duplicated, unavailable, private, or inconsistent with campaign rules.</li>
              <li>Submitting a TikTok link does not guarantee approval or payment.</li>
            </ul>
          </div>

          <div className="legal-section">
            <h2>4. Brand Campaigns</h2>
            <p>
              Brands are responsible for providing lawful, accurate, and clear campaign instructions. Campaigns may
              require admin approval before becoming visible to creators. Reward pool funding and Paystack-powered
              deposits may be required before rewards are released.
            </p>
          </div>

          <div className="legal-section">
            <h2>5. Rewards and Payouts</h2>
            <p>
              Rewards are released only after submissions pass review. VoiceRank may delay or withhold payouts where
              fraud, policy violations, invalid payout details, identity mismatch, or compliance concerns are detected.
              Bank and identity details may be required before withdrawals.
            </p>
          </div>

          <div className="legal-section">
            <h2>6. TikTok Integration</h2>
            <p>
              If you connect TikTok, you authorize VoiceRank to use TikTok-approved access to verify your account and
              review public video data relevant to campaign participation. VoiceRank is not affiliated with or endorsed
              by TikTok.
            </p>
          </div>

          <div className="legal-section">
            <h2>7. Prohibited Conduct</h2>
            <ul>
              <li>Submitting fake, purchased, botted, private, stolen, or manipulated content or engagement.</li>
              <li>Impersonating another person, creator, brand, or organization.</li>
              <li>Attempting to bypass review, payout, identity, or platform safety checks.</li>
              <li>Using VoiceRank for unlawful, deceptive, harmful, or abusive activity.</li>
            </ul>
          </div>

          <div className="legal-section">
            <h2>8. Changes and Termination</h2>
            <p>
              VoiceRank may update these terms, suspend access, remove campaigns, reject submissions, or terminate
              accounts where necessary to protect users, brands, platform integrity, or legal compliance.
            </p>
          </div>

          <div className="legal-section">
            <h2>9. Contact</h2>
            <p>For questions about these terms, contact VoiceRank at support@voicerank.vercel.app.</p>
          </div>
        </section>
      </main>
    </AppShell>
  );
}
