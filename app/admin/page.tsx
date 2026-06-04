import Link from "next/link";
import { AppShell } from "@/app/components/AppShell";
import { requireRole } from "@/lib/auth";
import { listMissions, listSubmissions } from "@/lib/repository";

export default async function AdminOverviewPage() {
  await requireRole("admin");
  const [campaigns, submissions] = await Promise.all([listMissions(), listSubmissions()]);

  return (
    <AppShell>
      <header className="page-header">
        <div>
          <p className="eyebrow">Admin overview</p>
          <h1>Platform operations.</h1>
          <p>Monitor campaign approvals, creator submissions, and operational queues.</p>
        </div>
      </header>

      <section className="stats-grid three">
        <article><span>Campaigns awaiting review</span><strong>{campaigns.filter((campaign) => campaign.status !== "Live").length}</strong><small>Open queue</small></article>
        <article><span>Submissions</span><strong>{submissions.length}</strong><small>Total</small></article>
        <article><span>Live campaigns</span><strong>{campaigns.filter((campaign) => campaign.status === "Live").length}</strong><small>Creator visible</small></article>
      </section>

      <section className="panel">
        <div className="section-title">
          <div>
            <p className="eyebrow">Quick actions</p>
            <h2>Admin queues.</h2>
          </div>
        </div>
        <div className="hero-actions">
          <Link className="primary-button" href="/admin/campaigns">Campaign Queue</Link>
        </div>
      </section>
    </AppShell>
  );
}
