import Link from "next/link";
import { AppShell } from "@/app/components/AppShell";
import { SubmissionRow } from "@/app/components/SubmissionRow";
import { requireRole } from "@/lib/auth";
import { listLiveMissions, listSubmissions } from "@/lib/repository";

export default async function CreatorDashboardPage() {
  await requireRole("creator");
  const [campaigns, submissions] = await Promise.all([listLiveMissions(), listSubmissions()]);

  return (
    <AppShell>
      <header className="page-header">
        <div>
          <p className="eyebrow">Creator dashboard</p>
          <h1>You are ready to earn.</h1>
          <p>Track active campaigns, recent submissions, and wallet progress from one place.</p>
        </div>
        <Link className="primary-button" href="/campaigns">Browse Campaigns</Link>
      </header>

      <section className="stats-grid">
        <article><span>Confirmed balance</span><strong>$240</strong><small>Available</small></article>
        <article><span>Pending balance</span><strong>$90</strong><small>In review</small></article>
        <article><span>Active submissions</span><strong>{submissions.length}</strong><small>Across campaigns</small></article>
        <article><span>Open campaigns</span><strong>{campaigns.length}</strong><small>Approved</small></article>
      </section>

      <section className="panel">
        <div className="section-title">
          <div>
            <p className="eyebrow">Recent submissions</p>
            <h2>Your latest activity.</h2>
          </div>
          <Link className="ghost-button" href="/submit">Submit a Video</Link>
        </div>
        <div className="submission-table">
          {submissions.slice(0, 5).map((submission) => (
            <SubmissionRow submission={submission} key={submission.id} />
          ))}
        </div>
      </section>
    </AppShell>
  );
}
