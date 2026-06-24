import { AppShell } from "@/app/components/AppShell";
import { requireRole } from "@/lib/auth";
import { listMissions, listSubmissions } from "@/lib/repository";
import Link from "next/link";

export default async function InternalSubmissionsPage() {
  await requireRole("admin");
  const [missions, submissions] = await Promise.all([listMissions(), listSubmissions()]);
  const missionTitles = new Map(missions.map((mission) => [mission.id, mission.title]));

  return (
    <AppShell>
      <header className="page-header">
        <div>
          <p className="eyebrow">Internal</p>
          <h1>Operations</h1>
          <p>Approve campaigns, then review creator submissions after they come in.</p>
        </div>
      </header>

      <section className="panel">
        <div className="section-title">
          <div>
            <p className="eyebrow">Campaign approval</p>
            <h2>Click a campaign to inspect and approve.</h2>
          </div>
        </div>
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
                <span>{mission.fundingStatus === "Funded" ? "Wallet funded" : "Awaiting wallet debit"}</span>
              </div>
              <span className="row-button">Open</span>
            </Link>
          ))}
        </div>
      </section>

      <section className="panel">
        <div className="section-title">
          <div>
            <p className="eyebrow">Submissions</p>
            <h2>Creator review queue.</h2>
          </div>
        </div>
        <div className="admin-table">
          {submissions.map((submission) => (
            <Link className="admin-row admin-link-row" href={`/admin/submissions/${submission.id}`} key={submission.id}>
              <div>
                <strong>{submission.creator}</strong>
                <span>{submission.link}</span>
              </div>
              <div>
                <strong>{missionTitles.get(submission.missionId) ?? "Unknown mission"}</strong>
                <span>{submission.status}</span>
              </div>
              <div className="checks">
                <span>{submission.checks.hashtag ? "Hashtag" : "No hashtag"}</span>
                <span>{submission.checks.sound ? "Sound" : "No sound"}</span>
                <span>{submission.checks.disclosure ? "Disclosure" : "No disclosure"}</span>
              </div>
              <span className="row-button">Open</span>
            </Link>
          ))}
        </div>
      </section>
    </AppShell>
  );
}
