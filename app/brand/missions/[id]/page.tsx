import Link from "next/link";
import { notFound } from "next/navigation";
import { AppShell } from "@/app/components/AppShell";
import { SubmissionRow } from "@/app/components/SubmissionRow";
import { requireRole } from "@/lib/auth";
import { findMissionForOps, listMissionSubmissions } from "@/lib/repository";

export default async function BrandMissionDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requireRole("brand");
  const { id } = await params;
  const [mission, submissions] = await Promise.all([findMissionForOps(id), listMissionSubmissions(id)]);

  if (!mission) {
    notFound();
  }

  return (
    <AppShell>
      <header className="page-header">
        <div>
          <p className="eyebrow">{mission.brand}</p>
          <h1>{mission.title}</h1>
          <p>{mission.brief}</p>
        </div>
        <Link className="ghost-button" href="/brand/missions">Back to campaigns</Link>
      </header>

      <section className="stats-grid">
        <article>
          <span>Status</span>
          <strong>{mission.status}</strong>
          <small>{mission.approvedAt ? "Approved by admin" : "Awaiting admin approval"}</small>
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
          <span>Submissions</span>
          <strong>{submissions.length}</strong>
          <small>Inside this campaign</small>
        </article>
      </section>

      <section className="panel">
        <div className="section-title">
          <div>
            <p className="eyebrow">Campaign setup</p>
            <h2>Instructions and qualification rules.</h2>
          </div>
        </div>
        <div className="mission-detail-grid">
          <article>
            <span>Required hashtag</span>
            <strong>{mission.requiredHashtag}</strong>
          </article>
          <article>
            <span>Required sound</span>
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

      <section className="panel">
        <div className="section-title">
          <div>
            <p className="eyebrow">Review queue</p>
            <h2>Submissions for this campaign.</h2>
          </div>
        </div>
        {submissions.length > 0 ? (
          <div className="submission-table">
            {submissions.map((submission) => (
              <SubmissionRow
                href={`/submissions/${submission.id}`}
                submission={submission}
                key={submission.id}
              />
            ))}
          </div>
        ) : (
          <div className="empty-state">
            <h2>No submissions yet.</h2>
            <p>Creator submissions will appear here after this campaign is approved and creators begin sending TikTok links.</p>
          </div>
        )}
      </section>
    </AppShell>
  );
}
