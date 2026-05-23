import type { Mission } from "@/lib/data";

export function MissionCard({ mission }: { mission: Mission }) {
  return (
    <article className="mission-card">
      <div className="mission-header">
        <div>
          <span>{mission.brand}</span>
          <h3>{mission.title}</h3>
        </div>
        <b className={mission.status === "Live" ? "badge live" : "badge"}>{mission.status}</b>
      </div>
      <p>{mission.brief}</p>
      <div className="mission-meta">
        <strong>{mission.rewardPool} pool</strong>
        <span>{mission.deadline}</span>
      </div>
      <ul>
        {mission.requirements.map((item) => (
          <li key={item}>{item}</li>
        ))}
      </ul>
    </article>
  );
}
