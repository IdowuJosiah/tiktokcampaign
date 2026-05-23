import { notFound } from "next/navigation";
import { approveMission } from "@/app/actions";
import { AppShell } from "@/app/components/AppShell";
import { requireRole } from "@/lib/auth";
import { findMissionForOps } from "@/lib/repository";

export default async function InternalMissionDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requireRole("admin");
  const { id } = await params;
  const mission = await findMissionForOps(id);

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
      </header>

      <section className="stats-grid three" aria-label="Mission approval details">
        <article>
          <span>Status</span>
          <strong>{mission.status}</strong>
          <small>{mission.approvedAt ? "Approved" : "Awaiting approval"}</small>
        </article>
        <article>
          <span>Reward pool</span>
          <strong>{mission.rewardPool}</strong>
          <small>{mission.fundingStatus}</small>
        </article>
        <article>
          <span>Deposit reference</span>
          <strong>{mission.depositReference || "Missing"}</strong>
          <small>Confirm before approval</small>
        </article>
      </section>

      <section className="panel">
        <div className="section-title">
          <div>
            <p className="eyebrow">Campaign rules</p>
            <h2>Review before publishing.</h2>
          </div>
        </div>
        <div className="mission-detail-grid">
          <article>
            <span>Hashtag</span>
            <strong>{mission.requiredHashtag}</strong>
          </article>
          <article>
            <span>Sound</span>
            <strong>{mission.requiredSound}</strong>
          </article>
          <article>
            <span>Minimum views</span>
            <strong>{mission.minimumViews}</strong>
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

      <section className="panel form-panel">
        <form action={approveMission} className="submission-form">
          <input name="missionId" type="hidden" value={mission.id} />
          <button className="primary-button full" disabled={mission.status === "Live"} type="submit">
            {mission.status === "Live" ? "Mission approved" : "Approve and publish mission"}
          </button>
        </form>
      </section>
    </AppShell>
  );
}
