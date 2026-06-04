import Link from "next/link";
import type { Mission } from "@/lib/data";

export function MissionCard({
  mission,
  href,
}: {
  mission: Mission;
  href?: string;
}) {
  return (
    <Link className="mission-card" href={href ?? `/campaigns/${mission.id}`}>
      <div className="item-icon">◫</div>
      <div className="mission-header">
        <div>
          <h3>{mission.title}</h3>
          <span>{mission.brand} · {mission.viewsPerSubmission} views per submission</span>
        </div>
        <b className={mission.status === "Live" ? "badge live" : "badge"}>{mission.status}</b>
      </div>
      <p>{mission.brief}</p>
      <div className="mission-meta">
        <strong>{mission.rewardPool} pool</strong>
        <span>{mission.payoutPerFiveSubmissions} per 5 submissions · {mission.deadline}</span>
      </div>
      {mission.fundingStatus ? <span className="funding-status">{mission.fundingStatus}</span> : null}
      <ul className="tag-list">
        {mission.requirements.map((item) => (
          <li key={item}>{item}</li>
        ))}
      </ul>
    </Link>
  );
}
