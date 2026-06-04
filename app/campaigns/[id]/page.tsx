import Link from "next/link";
import { notFound } from "next/navigation";
import { AppShell } from "@/app/components/AppShell";
import { getAppSession } from "@/lib/auth";
import { findMission } from "@/lib/repository";

export default async function CampaignBriefPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [session, campaign] = await Promise.all([getAppSession(), findMission(id)]);

  if (!campaign || campaign.status !== "Live") {
    notFound();
  }

  return (
    <AppShell>
      <header className="page-header">
        <div>
          <p className="eyebrow">{campaign.brand}</p>
          <h1>{campaign.title}</h1>
          <p>{campaign.brief}</p>
        </div>
        {session?.role === "creator" ? <Link className="primary-button" href="/submit">Submit a Video</Link> : null}
      </header>

      <section className="stats-grid three" aria-label="Campaign details">
        <article>
          <span>Reward pool</span>
          <strong>{campaign.rewardPool}</strong>
          <small>{campaign.fundingStatus ?? "Funded"}</small>
        </article>
        <article>
          <span>Payment batch</span>
          <strong>{campaign.payoutPerFiveSubmissions}</strong>
          <small>Per 5 approved submissions</small>
        </article>
        <article>
          <span>Views per submission</span>
          <strong>{campaign.viewsPerSubmission}</strong>
          <small>Required to qualify</small>
        </article>
      </section>

      <section className="panel">
        <div className="section-title">
          <div>
            <p className="eyebrow">Brief</p>
            <h2>What to make.</h2>
          </div>
        </div>
        <div className="mission-detail-grid">
          <article>
            <span>Required hashtag</span>
            <strong>{campaign.requiredHashtag}</strong>
          </article>
          <article>
            <span>Required sound</span>
            <strong>{campaign.requiredSound}</strong>
          </article>
          <article>
            <span>Deadline</span>
            <strong>{campaign.deadline}</strong>
          </article>
        </div>
        <ul className="detail-list">
          {campaign.requirements.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      </section>
    </AppShell>
  );
}
