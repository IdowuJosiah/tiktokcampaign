import Link from "next/link";
import { AppShell } from "@/app/components/AppShell";
import { MissionCard } from "@/app/components/MissionCard";
import { getAppSession } from "@/lib/auth";
import { listLiveMissions } from "@/lib/repository";

export default async function CampaignsPage() {
  const [session, campaigns] = await Promise.all([getAppSession(), listLiveMissions()]);

  return (
    <AppShell>
      <header className="page-header">
        <div>
          <p className="eyebrow">Campaign discovery</p>
          <h1>Find campaigns ready for submissions.</h1>
          <p>Only admin-approved, live campaigns appear here. Open a brief, follow the requirements, then submit your TikTok video.</p>
        </div>
        {session?.role === "creator" ? <Link className="primary-button" href="/submit">Submit a Video</Link> : null}
      </header>

      <section className="mission-list full">
        {campaigns.map((campaign) => (
          <MissionCard mission={campaign} key={campaign.id} />
        ))}
      </section>
    </AppShell>
  );
}
