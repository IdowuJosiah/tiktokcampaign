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
          <small>{isRejected ? "Rejected" : mission.approvedAt ? "Approved" : "Awaiting approval"}</small>
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

      <FormStatus error={isRejected ? undefined : error} />

      <section className="panel form-panel compact">
        <div className="section-title">
          <div>
            <p className="eyebrow">Decision</p>
            <h2>{isLive ? "This campaign is live." : isRejected ? "This campaign was rejected." : "Approve or reject this campaign."}</h2>
          </div>
        </div>

        {isRejected ? (
          <p className="muted-copy">
            Reason: {mission.rejectionReason || "No reason recorded."}
            <br />
            The brand needs to create a new campaign with this feedback applied — this one can&apos;t be approved as-is.
          </p>
        ) : isLive ? (
          <p className="muted-copy">Approved and visible to creators.</p>
        ) : (
          <form action={approveMission} className="submission-form">
            <input name="missionId" type="hidden" value={mission.id} />
            <label>
              Rejection reason (only required if rejecting)
              <textarea name="reason" placeholder="Explain what needs to change before this campaign can be approved" rows={3} />
            </label>
            <div className="decision-actions">
              <button className="primary-button full" formAction={approveMission} type="submit">
                Approve and publish
              </button>
              <button className="ghost-button full" formAction={rejectMission} type="submit">
                Reject
              </button>
            </div>
          </form>
        )}
      </section>

      {isLive ? (
        <section className="panel compact">
          <div className="section-title">
            <div>
              <p className="eyebrow">Campaign submissions</p>
              <h2>Review creator videos.</h2>
            </div>
          </div>
          {submissions.length > 0 ? (
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
            <p className="muted-copy">No submissions yet.</p>
          )}
        </section>
      ) : null}
    </AppShell>
  );
}
