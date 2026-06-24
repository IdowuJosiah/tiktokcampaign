import Link from "next/link";
import { AppShell } from "@/app/components/AppShell";
import { MissionCard } from "@/app/components/MissionCard";
import { requireRole } from "@/lib/auth";
import { listMissions } from "@/lib/repository";

export default async function BrandMissionsPage() {
  const session = await requireRole("brand");
  const missions = await listMissions(session.id);

  return (
    <AppShell>
      <header className="page-header">
        <div>
          <p className="eyebrow">Brand</p>
          <h1>Missions</h1>
          <p>Create TikTok campaign instructions that become submission review rules.</p>
        </div>
        <Link className="primary-button" href="/brand/missions/new">New mission</Link>
      </header>

      <section className="mission-list full">
        {missions.map((mission) => (
          <MissionCard href={`/brand/missions/${mission.id}`} mission={mission} key={mission.id} />
        ))}
      </section>
    </AppShell>
  );
}
