import Link from "next/link";
import { notFound } from "next/navigation";
import { AppShell } from "@/app/components/AppShell";
import { findMission } from "@/lib/repository";

export default async function MissionDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const mission = await findMission(id);

  if (!mission || mission.status !== "Live") {
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
        <Link className="primary-button" href="/creator/submit">Submit video</Link>
      </header>

      <section className="stats-grid three" aria-label="Mission details">
        <article>
          <span>Reward pool</span>
          <strong>{mission.rewardPool}</strong>
          <small>{mission.fundingStatus ?? "Funded"}</small>
        </article>
        <article>
          <span>Minimum views</span>
          <strong>{mission.minimumViews}</strong>
          <small>Required to qualify</small>
        </article>
        <article>
          <span>Deadline</span>
          <strong>{mission.deadline}</strong>
          <small>Submit before close</small>
        </article>
      </section>

      <section className="panel">
        <div className="section-title">
          <div>
            <p className="eyebrow">Requirements</p>
            <h2>Follow these exactly.</h2>
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
        </div>
        <ul className="detail-list">
          {mission.requirements.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      </section>
    </AppShell>
  );
}
