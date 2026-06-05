import { AppShell } from "@/app/components/AppShell";
import { FormStatus } from "@/app/components/FormStatus";
import { PayoutSetupForm } from "@/app/components/profile/PayoutSetupForm";
import { markTikTokVerified, saveIdentityVerification, saveTikTokProfile } from "@/app/actions";
import { requireRole } from "@/lib/auth";
import { getCreatorPayoutReadiness, getCreatorProfile, listCreatorSubmissions } from "@/lib/repository";
import { SubmissionRow } from "@/app/components/SubmissionRow";

export default async function CreatorProfilePage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;
  const session = await requireRole("creator");
  const [creator, submissions, payout] = await Promise.all([
    getCreatorProfile(session.id),
    listCreatorSubmissions(session.id),
    getCreatorPayoutReadiness(session.id),
  ]);

  return (
    <AppShell>
      <header className="page-header">
        <div>
          <p className="eyebrow">Creator profile</p>
          <h1>Link TikTok.</h1>
          <p>Connect your TikTok presence, place your VoiceRank code in your TikTok bio, then confirm once it is visible.</p>
        </div>
      </header>

      <section className="profile-grid">
        <article className="panel profile-card">
          <FormStatus error={error} />
          <div className="section-title">
            <div>
              <p className="eyebrow">Social account</p>
              <h2>TikTok connection.</h2>
            </div>
          </div>
          <form action={saveTikTokProfile} className="submission-form">
            <label>
              Display name
              <input name="displayName" required type="text" defaultValue={creator?.displayName ?? ""} placeholder="Tomi Ade" />
            </label>
            <label>
              TikTok profile
              <input name="tiktokHandle" required type="text" defaultValue={creator?.tiktokHandle ?? ""} placeholder="@yourhandle" />
            </label>
            <button className="primary-button full" type="submit">Link TikTok</button>
          </form>
        </article>

        <article className="panel profile-card">
          <div className="section-title">
            <div>
              <p className="eyebrow">Payout setup</p>
              <h2>Bank account.</h2>
            </div>
          </div>
          {creator ? (
            <PayoutSetupForm
              defaultAccountName={payout.accountName}
              defaultAccountNumber={payout.accountNumber}
              defaultBankName={payout.bankName}
            />
          ) : (
            <div className="empty-state">
              <h2>Link TikTok first.</h2>
              <p>Your payout profile is attached to your creator account, so TikTok needs to be linked before bank details can be saved.</p>
            </div>
          )}
        </article>
      </section>

      {creator?.verificationCode ? (
        <section className="panel">
          <div className="verification-card">
            <p className="eyebrow">Verification code</p>
            <h2>{creator.verificationCode}</h2>
            <p>Add this code to your TikTok bio temporarily. Once it is visible, confirm below.</p>
            <form action={markTikTokVerified}>
              <button className="primary-button full" type="submit">
                {creator.verifiedAt ? "Verified" : "I added the code"}
              </button>
            </form>
          </div>
        </section>
      ) : null}

      <section className="panel profile-card">
        <div className="section-title">
          <div>
            <p className="eyebrow">Identity verification</p>
            <h2>NIN verification.</h2>
          </div>
        </div>
        <form action={saveIdentityVerification} className="submission-form">
          <label>
            Legal name
            <input name="legalName" required type="text" defaultValue={payout.legalName ?? ""} placeholder="Tomi Ade" />
          </label>
          <label>
            NIN
            <input inputMode="numeric" name="nin" required type="text" placeholder="12345678901" />
          </label>
          <button className="primary-button full" type="submit">
            {payout.identityStatus === "not_started" ? "Submit NIN" : `Status: ${payout.identityStatus}`}
          </button>
        </form>
      </section>

      <section className="panel">
        <div className="section-title">
          <div>
            <p className="eyebrow">Campaign history</p>
            <h2>Submissions and status.</h2>
          </div>
        </div>
        <div className="submission-table">
          {submissions.map((submission) => (
            <SubmissionRow submission={submission} key={submission.id} />
          ))}
        </div>
      </section>
    </AppShell>
  );
}
