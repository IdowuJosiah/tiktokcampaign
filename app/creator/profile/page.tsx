import { AppShell } from "@/app/components/AppShell";
import { FormStatus } from "@/app/components/FormStatus";
import { PayoutSetupForm } from "@/app/components/profile/PayoutSetupForm";
import { NinVerificationForm } from "@/app/components/profile/NinVerificationForm";
import { saveTikTokProfile } from "@/app/actions";
import { requireRole } from "@/lib/auth";
import { getCreatorPayoutReadiness, getCreatorProfile, listCreatorSubmissions } from "@/lib/repository";
import { SubmissionRow } from "@/app/components/SubmissionRow";

export default async function CreatorProfilePage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; success?: string }>;
}) {
  const { error, success } = await searchParams;
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
          <h1>Profile setup.</h1>
          <p>Add your TikTok handle, bank details, and NIN to start earning.</p>
        </div>
      </header>

      <section className="profile-grid">
        <article className="panel profile-card">
          <FormStatus error={error} success={success} />
          <div className="section-title">
            <div>
              <p className="eyebrow">Social account</p>
              <h2>TikTok profile.</h2>
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
            <button className="primary-button full" type="submit">Save TikTok profile</button>
          </form>
        </article>

        <article className="panel profile-card">
          <div className="section-title">
            <div>
              <p className="eyebrow">Payout setup</p>
              <h2>Bank account.</h2>
            </div>
          </div>
          <PayoutSetupForm
            defaultAccountName={payout.accountName}
            defaultAccountNumber={payout.accountNumber}
            defaultBankName={payout.bankName}
          />
        </article>
      </section>

      <section className="panel profile-card">
        <div className="section-title">
          <div>
            <p className="eyebrow">Identity verification</p>
            <h2>NIN verification.</h2>
          </div>
        </div>
        <NinVerificationForm
          defaultLegalName={payout.legalName}
          defaultNin={payout.nin}
          identityStatus={payout.identityStatus}
        />
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
