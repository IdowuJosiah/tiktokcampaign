import Link from "next/link";
import { notFound } from "next/navigation";
import { reviewSubmission } from "@/app/actions";
import { AppShell } from "@/app/components/AppShell";
import { FormStatus } from "@/app/components/FormStatus";
import { requireRole } from "@/lib/auth";
import { findSubmissionForAdmin, findMissionForOps } from "@/lib/repository";

export default async function AdminSubmissionDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ error?: string }>;
}) {
  await requireRole("admin");
  const [{ id }, query] = await Promise.all([params, searchParams]);
  const submission = await findSubmissionForAdmin(id);

  if (!submission) {
    notFound();
  }

  const mission = await findMissionForOps(submission.missionId);
  const campaignName = mission?.title ?? "Campaign";
  const payoutPerThree = mission?.payoutPerThreeSubmissions ?? "—";

  return (
    <AppShell>
      <header className="page-header">
        <div>
          <p className="eyebrow">Submission review</p>
          <h1>{submission.creator}</h1>
          <p>{campaignName}</p>
        </div>
        <Link className="ghost-button" href={`/admin/campaigns/${submission.missionId}`}>Back to campaign</Link>
      </header>

      <FormStatus error={query.error} />

      <section className="stats-grid three">
        <article>
          <span>Status</span>
          <strong>{submission.status}</strong>
          <small>{submission.handle}</small>
        </article>
        <article>
          <span>Reach</span>
          <strong>{submission.views}</strong>
          <small>{submission.engagement} engagement</small>
        </article>
        <article>
          <span>Payout</span>
          <strong>{payoutPerThree}</strong>
          <small>Per 3 approved · set by the brand</small>
        </article>
      </section>

      <section className="panel">
        <div className="section-title">
          <div>
            <p className="eyebrow">Video link</p>
            <h2>Check the submitted TikTok.</h2>
          </div>
          <a className="ghost-button" href={submission.link} rel="noreferrer" target="_blank">Open TikTok</a>
        </div>
        <p className="muted-copy">{submission.link}</p>
        <div className="mission-detail-grid">
          <article>
            <span>Hashtag</span>
            <strong>{submission.checks.hashtag ? "Passed" : "Needs review"}</strong>
          </article>
          <article>
            <span>Sound</span>
            <strong>{submission.checks.sound ? "Passed" : "Needs review"}</strong>
          </article>
          <article>
            <span>Disclosure</span>
            <strong>{submission.checks.disclosure ? "Passed" : "Needs review"}</strong>
          </article>
          <article>
            <span>Deadline</span>
            <strong>{submission.checks.deadline ? "Passed" : "Needs review"}</strong>
          </article>
        </div>
      </section>

      <section className="panel form-panel">
        <div className="section-title">
          <div>
            <p className="eyebrow">Decision</p>
            <h2>Approve, request fixes, or reject.</h2>
          </div>
        </div>
        <form action={reviewSubmission} className="submission-form">
          <input name="submissionId" type="hidden" value={submission.id} />
          <label>
            Decision
            <select name="decision" required>
              <option value="approve">Approve</option>
              <option value="request_fix">Needs fix</option>
              <option value="reject">Reject</option>
            </select>
          </label>
          <p className="muted-copy" style={{ margin: 0 }}>
            The creator is paid {payoutPerThree} automatically for every 3 approved submissions on this
            campaign — no manual amount needed.
          </p>
          <label>
            Review note
            <textarea name="reason" placeholder="Short reason shown in admin history later." />
          </label>
          <button className="primary-button full" type="submit">Save review</button>
        </form>
      </section>
    </AppShell>
  );
}
