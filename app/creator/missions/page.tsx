import Link from "next/link";
import { AppShell } from "@/app/components/AppShell";
import { MissionCard } from "@/app/components/MissionCard";
import { listLiveMissions } from "@/lib/repository";

export default async function CreatorMissionsPage() {
  const missions = await listLiveMissions();

  return (
    <AppShell>
      <header className="page-header">
        <div>
          <p className="eyebrow">Creator</p>
          <h1>Available missions</h1>
          <p>Pick a mission, post on TikTok with the required rules, then submit your video link.</p>
        </div>
        <Link className="primary-button" href="/creator/submit">Submit video</Link>
      </header>

      <section className="mission-list full">
        {missions.map((mission) => (
          <MissionCard mission={mission} key={mission.id} />
        ))}
      </section>
    </AppShell>
  );
}
