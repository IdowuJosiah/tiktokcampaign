import Link from "next/link";
import { AppShell } from "@/app/components/AppShell";
import { MissionCard } from "@/app/components/MissionCard";
import { SubmissionRow } from "@/app/components/SubmissionRow";
import { listDashboardStats, listLiveMissions, listScoreRules, listSubmissions } from "@/lib/repository";

export default async function Home() {
  const [stats, missions, scoreRules, submissions] = await Promise.all([
    listDashboardStats(),
    listLiveMissions(),
    listScoreRules(),
    listSubmissions(),
  ]);

  return (
    <AppShell>
      <header className="hero">
        <div>
          <p className="eyebrow">Phase 1 command center</p>
          <h1>Run TikTok missions from brief to submission review.</h1>
        </div>
        <div className="hero-actions">
          <Link className="ghost-button" href="/creator/submit">Submit video</Link>
          <Link className="primary-button" href="/brand/missions/new">Create mission</Link>
        </div>
      </header>

      <section className="stats-grid" aria-label="Campaign metrics">
        {stats.map((stat) => (
          <article key={stat.label}>
            <span>{stat.label}</span>
            <strong>{stat.value}</strong>
            <small>{stat.detail}</small>
          </article>
        ))}
      </section>

      <section className="grid-two">
        <div className="panel wide">
          <div className="section-title">
            <div>
              <p className="eyebrow">Live Missions</p>
              <h2>Campaigns creators can join now.</h2>
            </div>
            <Link className="ghost-button" href="/brand/missions">View all</Link>
          </div>
          <div className="mission-list">
            {missions.slice(0, 2).map((mission) => (
              <MissionCard mission={mission} key={mission.id} />
            ))}
          </div>
        </div>

        <div className="panel">
          <p className="eyebrow">Reward Score</p>
          <h2>Phase 1 scoring rules</h2>
          <div className="score-stack">
            {scoreRules.map((rule) => (
              <div className="score-rule" key={rule.label}>
                <div>
                  <strong>{rule.label}</strong>
                  <span>{rule.value}%</span>
                </div>
                <p>{rule.detail}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="panel">
        <div className="section-title">
          <div>
            <p className="eyebrow">Review Queue</p>
            <h2>Latest creator submissions.</h2>
          </div>
          <Link className="ghost-button" href="/brand/review">Open review</Link>
        </div>
        <div className="submission-table">
          {submissions.map((submission) => (
            <SubmissionRow submission={submission} key={submission.id} />
          ))}
        </div>
      </section>
    </AppShell>
  );
}
