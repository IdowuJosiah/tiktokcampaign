import { AppShell } from "@/app/components/AppShell";
import { createMission } from "@/app/actions";
import { FormStatus } from "@/app/components/FormStatus";
import { requireRole } from "@/lib/auth";

export default async function NewMissionPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;
  await requireRole("brand");

  return (
    <AppShell>
      <header className="page-header">
        <div>
          <p className="eyebrow">Brand</p>
          <h1>Create mission</h1>
          <p>Define the brief, required hashtag, sound, view minimum, budget, and deadline.</p>
        </div>
      </header>

      <section className="panel form-panel">
        <FormStatus error={error} />
        <form action={createMission} className="submission-form">
          <label>
            Brand name
            <input name="brandName" required type="text" placeholder="Kuda" />
          </label>
          <label>
            Mission title
            <input name="title" required type="text" placeholder="Show your real split-bill routine" />
          </label>
          <label>
            Creator brief
            <textarea name="brief" required placeholder="Tell creators what to show, what to avoid, and what counts as valid proof." />
          </label>
          <div className="form-grid">
            <label>
              Reward pool
              <input min="1" name="rewardPool" required type="number" placeholder="5000000" />
            </label>
            <label>
              Payment per 5 submissions
              <input min="1" name="payoutPerFiveSubmissions" required type="number" placeholder="250000" />
            </label>
          </div>
          <div className="form-grid">
            <label>
              Views per submission
              <input min="0" name="viewsPerSubmission" required type="number" placeholder="1000" />
            </label>
            <label>
              Maximum payout batches
              <input disabled type="number" placeholder="Calculated after save" />
            </label>
          </div>
          <div className="form-grid">
            <label>
              Required hashtag
              <input name="requiredHashtag" required type="text" placeholder="#KudaSplit" />
            </label>
            <label>
              Required sound
              <input name="requiredSound" type="text" placeholder="TikTok sound URL or sound name" />
            </label>
          </div>
          <label>
            Rules
            <textarea name="rules" placeholder={"One rule per line\nUse #KudaSplit\nShow app screen or receipt\nAdd paid partnership disclosure"} />
          </label>
          <label>
            Deadline
            <input name="deadline" required type="date" />
          </label>
          <div className="deposit-box">
            <p className="eyebrow">Reward pool deposit</p>
            <h2>Fund before approval.</h2>
            <p>Your mission stays in draft until the reward pool deposit is confirmed by CreatorLink. Admin approval changes the mission to live.</p>
            <label>
              Deposit reference
              <input name="depositReference" required type="text" placeholder="Bank transfer or payment reference" />
            </label>
          </div>
          <button className="primary-button full" type="submit">Submit mission for approval</button>
        </form>
      </section>
    </AppShell>
  );
}
