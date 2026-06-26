import { notFound } from "next/navigation";
import { approveMission, rejectMission } from "@/app/actions";
import { AppShell } from "@/app/components/AppShell";
import { FormStatus } from "@/app/components/FormStatus";
import { SubmissionRow } from "@/app/components/SubmissionRow";
import { requireRole } from "@/lib/auth";
import { findMissionForOps, listMissionSubmissions } from "@/lib/repository";

export default async function InternalMissionDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ error?: string }>;
}) {
  await requireRole("admin");
  const { id } = await params;
  const { error } = await searchParams;
  const [mission, submissions] = await Promise.all([findMissionForOps(id), listMissionSubmissions(id)]);

  if (!mission) {
    notFound();
  }

  const isRejected = mission.status === "Rejected";
  const isLive = mission.status === "Live";

  return (
    <AppShell>
      <header className="page-header">
        <div>
          <p className="eyebrow">{mission.brand}</p>
          <h1>{mission.title}</h1>
          <p>{mission.brief}</p>
        </div>
      </header>

      <section className="stats-grid three" aria-label="Mission approval details">
        <article>
          <span>Status</span>
          <strong>{mission.status}</strong>
          <small>{mission.approvedAt ? "Approved" : "Awaiting approval"}</small>
        </article>
        <article>
          <span>Reward pool</span>
          <strong>{mission.rewardPool}</strong>
          <small>{mission.fundingStatus}</small>
        </article>
        <article>
          <span>Payment batch</span>
          <strong>{mission.payoutPerFiveSubmissions}</strong>
          <small>Per 5 approved submissions</small>
        </article>
        <article>
          <span>Funding source</span>
          <strong>Brand wallet</strong>
          <small>{mission.fundingStatus === "Funded" ? "Reward pool deducted on creation" : "Awaiting wallet debit"}</small>
        </article>
      </section>

      <section className="panel">
        <div className="section-title">
          <div>
            <p className="eyebrow">Campaign rules</p>
            <h2>Review before publishing.</h2>
          </div>
        </div>
        <div className="mission-detail-grid">
          <article>
            <span>Hashtag</span>
            <strong>{mission.requiredHashtag}</strong>
          </article>
          <article>
            <span>Sound</span>
            <strong>{mission.requiredSound}</strong>
          </article>
          <article>
            <span>Views per submission</span>
            <strong>{mission.viewsPerSubmission}</strong>
          </article>
          <article>
            <span>Deadline</span>
            <strong>{mission.deadline}</strong>
          </article>
        </div>
        <ul className="detail-list">
          {mission.requirements.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      </section>

      <FormStatus error={error} />

      {isRejected && mission.rejectionReason ? (
        <section className="panel" style={{ borderColor: "rgba(255,100,103,0.4)" }}>
          <p className="eyebrow">Rejected</p>
          <p>{mission.rejectionReason}</p>
        </section>
      ) : null}

      <section className="panel form-panel">
        <form action={approveMission} className="submission-form">
          <input name="missionId" type="hidden" value={mission.id} />
          <button className="primary-button full" disabled={isLive || isRejected} type="submit">
            {isLive ? "Mission approved" : isRejected ? "Rejected — resubmission required" : "Approve and publish mission"}
          </button>
          {isRejected ? (
            <small>This campaign was rejected and can't be approved as-is. The brand needs to create a new campaign with the feedback applied.</small>
          ) : null}
        </form>

        {!isLive && !isRejected ? (
          <form action={rejectMission} className="submission-form" style={{ marginTop: 16 }}>
            <input name="missionId" type="hidden" value={mission.id} />
            <label>
              Rejection reason
              <textarea name="reason" placeholder="Explain what needs to change before this campaign can be approved" required rows={3} />
            </label>
            <button className="ghost-button full" type="submit">
              Reject campaign
            </button>
          </form>
        ) : null}
      </section>

      <section className="panel">
        <div className="section-title">
          <div>
            <p className="eyebrow">Campaign submissions</p>
            <h2>{mission.status === "Live" ? "Review creator videos." : "Submissions appear after approval."}</h2>
          </div>
        </div>
        {mission.status === "Live" && submissions.length > 0 ? (
          <div className="submission-table">
            {submissions.map((submission) => (
              <SubmissionRow
                href={`/admin/submissions/${submission.id}`}
                submission={submission}
                key={submission.id}
              />
            ))}
          </div>
        ) : (
          <div className="empty-state">
            <h2>{mission.status === "Live" ? "No submissions yet." : "Approve this campaign first."}</h2>
            <p>
              {mission.status === "Live"
                ? "Creator submissions for this campaign will show here when they arrive."
                : "Once the campaign is live, creators can submit videos and admin review happens from this page."}
            </p>
          </div>
        )}
      </section>
    </AppShell>
  );
}
