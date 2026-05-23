import Link from "next/link";
import { AppShell } from "@/app/components/AppShell";
import { requireRole } from "@/lib/auth";
import { listMissions, listSubmissions } from "@/lib/repository";

export default async function BrandDashboardPage() {
  await requireRole("brand");
  const [campaigns, submissions] = await Promise.all([listMissions(), listSubmissions()]);

  return (
    <AppShell>
      <header className="page-header">
        <div>
          <p className="eyebrow">Brand dashboard</p>
          <h1>Manage campaign performance.</h1>
          <p>Create campaigns, track submissions, and watch pool spend as creators submit TikTok videos.</p>
        </div>
        <Link className="primary-button" href="/brand/missions/new">Create Campaign</Link>
      </header>

      <section className="stats-grid">
        <article><span>Campaigns</span><strong>{campaigns.length}</strong><small>All statuses</small></article>
        <article><span>Live</span><strong>{campaigns.filter((campaign) => campaign.status === "Live").length}</strong><small>Creator visible</small></article>
        <article><span>Submissions</span><strong>{submissions.length}</strong><small>Received</small></article>
        <article><span>Wallet balance</span><strong>$0</strong><small>Paystack later</small></article>
      </section>
    </AppShell>
  );
}
