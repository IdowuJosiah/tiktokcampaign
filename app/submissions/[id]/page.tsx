import Link from "next/link";
import { notFound } from "next/navigation";
import { AppShell } from "@/app/components/AppShell";
import { requireRole } from "@/lib/auth";
import { findSubmission, getCreatorPayoutReadiness, missionTitle } from "@/lib/repository";

export default async function SubmissionDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await requireRole("creator");
  const { id } = await params;
  const [submission, payout] = await Promise.all([
    findSubmission(id),
    getCreatorPayoutReadiness(session.id),
  ]);

  if (!submission) {
    notFound();
  }

  const campaignName = await missionTitle(submission.missionId);
  const canWithdraw = submission.status === "Approved";
  const payoutReady = payout.bankReady && payout.identityReady;

  return (
    <AppShell>
      <header className="page-header">
        <div>
          <p className="eyebrow">Submission status</p>
          <h1>{campaignName}</h1>
          <p>{submission.link}</p>
        </div>
        <Link className={canWithdraw && payoutReady ? "primary-button" : "ghost-button"} href={canWithdraw && payoutReady ? "/creator/wallet" : "/creator/profile"}>
          {canWithdraw && payoutReady ? "Withdraw" : canWithdraw ? "Complete payout setup" : "View status"}
        </Link>
      </header>

      <section className="stats-grid three">
        <article>
          <span>Status</span>
          <strong>{submission.status}</strong>
          <small>{canWithdraw ? "Reward approved" : "Still under review"}</small>
        </article>
        <article>
          <span>Score</span>
          <strong>{submission.score}</strong>
          <small>Composite</small>
        </article>
        <article>
          <span>Reward</span>
          <strong>{submission.reward}</strong>
          <small>{canWithdraw ? "Available" : "Pending"}</small>
        </article>
      </section>

      <section className="panel">
        <div className="mission-detail-grid">
          <article>
            <span>Views</span>
            <strong>{submission.views}</strong>
          </article>
          <article>
            <span>Engagement</span>
            <strong>{submission.engagement}</strong>
          </article>
          <article>
            <span>Hashtag</span>
            <strong>{submission.checks.hashtag ? "Passed" : "Needs review"}</strong>
          </article>
          <article>
            <span>Disclosure</span>
            <strong>{submission.checks.disclosure ? "Passed" : "Needs review"}</strong>
          </article>
        </div>
      </section>
    </AppShell>
  );
}
