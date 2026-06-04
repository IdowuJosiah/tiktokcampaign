import Link from "next/link";
import { AppShell } from "@/app/components/AppShell";
import { requireRole } from "@/lib/auth";
import { listMissions } from "@/lib/repository";

export default async function AdminCampaignsPage() {
  await requireRole("admin");
  const missions = await listMissions();

  return (
    <AppShell>
      <header className="page-header">
        <div>
          <p className="eyebrow">Admin</p>
          <h1>Campaign approval</h1>
          <p>Open submitted campaigns, confirm their funding details, then approve them for creators.</p>
        </div>
      </header>

      <section className="panel">
        <div className="admin-table">
          {missions.map((mission) => (
            <Link className="admin-row admin-link-row" href={`/admin/campaigns/${mission.id}`} key={mission.id}>
              <div>
                <strong>{mission.title}</strong>
                <span>{mission.brand}</span>
              </div>
              <div>
                <strong>{mission.rewardPool}</strong>
                <span>{mission.fundingStatus}</span>
              </div>
              <div className="checks">
                <span>{mission.status}</span>
                <span>{mission.depositReference ? "Deposit ref" : "No deposit ref"}</span>
              </div>
              <span className="row-button">Review</span>
            </Link>
          ))}
        </div>
      </section>
    </AppShell>
  );
}
