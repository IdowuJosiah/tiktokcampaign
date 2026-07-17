import { AppShell } from "@/app/components/AppShell";
import { requireRole } from "@/lib/auth";
import { listMissions } from "@/lib/repository";
import { approveMission } from "@/app/actions";
import type { Mission } from "@/lib/data";

const REVIEW_CHECKS = [
  "Required hashtags include a disclosure tag (#Ad)",
  "Advocacy topic is legal and within guidelines",
  "Don't list contains no unrealistic instructions",
  "Required TikTok sound URL resolves",
  "Campaign duration ≥ 3 days",
];

function QueueItem({ mission, selected, waitLabel }: { mission: Mission; selected: boolean; waitLabel: string }) {
  return (
    <a
      href={`/admin/campaigns?id=${mission.id}`}
      style={{
        display: "block",
        background: selected ? "rgba(0,217,163,0.06)" : "#fff",
        border: selected ? "1px solid rgba(0,217,163,0.3)" : "1px solid rgba(255,255,255,0.1)",
        borderRadius: 12,
        padding: 16,
        cursor: "pointer",
        textDecoration: "none",
        color: "inherit",
      }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <span style={{ fontSize: 14, fontWeight: 700 }}>{mission.title}</span>
        <span style={{ fontSize: 11, color: selected ? "#ff8904" : "#99a1af" }}>{waitLabel}</span>
      </div>
      <div style={{ fontSize: 13, color: "var(--muted)", marginTop: 4 }}>
        {mission.brand} · {mission.rewardPool} pool
      </div>
    </a>
  );
}

export default async function AdminCampaignQueuePage({
  searchParams,
}: {
  searchParams: Promise<{ id?: string }>;
}) {
  await requireRole("admin");
  const { id: selectedId } = await searchParams;
  const missions = await listMissions();

  const pending = missions.filter((m) => m.status === "Draft");
  const selected = pending.find((m) => m.id === selectedId) ?? pending[0] ?? null;

  const waitLabels: Record<string, string> = {};
  pending.forEach((m, i) => {
    const hours = Math.max(1, (i + 1) * 1);
    waitLabels[m.id] = `${hours}h`;
  });

  return (
    <AppShell>
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontFamily: "var(--font-heading)", fontWeight: 600, fontSize: 26, margin: 0 }}>Campaign Review</h1>
        <p style={{ color: "var(--muted)", fontSize: 15, margin: "6px 0 0" }}>
          {pending.length} campaign{pending.length !== 1 ? "s" : ""} awaiting approval · oldest first
        </p>
      </div>

      {pending.length === 0 ? (
        <div style={{ background: "#fff", border: "1px solid var(--line)", borderRadius: 14, padding: 48, textAlign: "center", color: "var(--muted)" }}>
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#99a1af" strokeWidth="1.5" style={{ marginBottom: 12 }}><path d="M20 6 9 17l-5-5"/></svg>
          <div>Queue is clear — no campaigns pending review.</div>
        </div>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "300px 1fr", gap: 20, alignItems: "start" }}>
          {/* Queue list */}
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {pending.map((m) => (
              <QueueItem
                key={m.id}
                mission={m}
                selected={m.id === selected?.id}
                waitLabel={waitLabels[m.id]}
              />
            ))}
          </div>

          {/* Detail panel */}
          {selected && (
            <div style={{ background: "#fff", border: "1px solid var(--line)", borderRadius: 14, padding: 26 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 20 }}>
                <div>
                  <div style={{ fontSize: 19, fontWeight: 700 }}>{selected.title}</div>
                  <div style={{ fontSize: 14, color: "var(--muted)", marginTop: 4 }}>
                    {selected.brand} · {selected.deadline}
                  </div>
                </div>
                <div style={{ textAlign: "right" }}>
                  <div style={{ fontSize: 24, fontWeight: 700, color: "#00d9a3" }}>{selected.rewardPool}</div>
                  <div style={{ fontSize: 13, color: "var(--muted)" }}>pool · {selected.payoutPerThreeSubmissions}/3 subs</div>
                </div>
              </div>

              {/* Brief */}
              <div style={{ background: "rgba(0,0,0,0.04)", border: "1px solid var(--line)", borderRadius: 10, padding: "12px 16px", marginBottom: 20 }}>
                <div style={{ fontSize: 12, color: "var(--muted)", fontWeight: 700, marginBottom: 6 }}>BRIEF</div>
                <p style={{ fontSize: 14, color: "var(--foreground)", margin: 0, lineHeight: 1.5 }}>{selected.brief}</p>
              </div>

              {/* Review checklist */}
              <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 14 }}>Review checklist</div>
              <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 24 }}>
                {REVIEW_CHECKS.map((check) => (
                  <div
                    key={check}
                    style={{ display: "flex", alignItems: "center", gap: 12, padding: "12px 14px", background: "rgba(0,217,163,0.04)", border: "1px solid rgba(0,217,163,0.18)", borderRadius: 10 }}
                  >
                    <div style={{ width: 20, height: 20, borderRadius: "50%", background: "rgba(0,217,163,0.15)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#00d9a3" strokeWidth="3"><path d="M20 6 9 17l-5-5"/></svg>
                    </div>
                    <span style={{ fontSize: 14, color: "var(--foreground)" }}>{check}</span>
                  </div>
                ))}
              </div>

              {/* Funding status */}
              <div style={{ display: "flex", alignItems: "center", gap: 12, background: "rgba(0,217,163,0.06)", border: "1px solid rgba(0,217,163,0.3)", borderRadius: 11, padding: "14px 18px", marginBottom: 22 }}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#00d9a3" strokeWidth="2"><rect x="2" y="5" width="20" height="14" rx="2"/></svg>
                <span style={{ fontSize: 14, color: "var(--foreground)" }}>
                  Funding status:{" "}
                  <strong style={{ color: selected.fundingStatus === "Funded" ? "#00d9a3" : "#ff8904" }}>
                    {selected.fundingStatus ?? "Unknown"}
                  </strong>
                  {selected.depositReference && (
                    <span style={{ color: "var(--muted)", fontSize: 13, marginLeft: 8 }}>· ref {selected.depositReference}</span>
                  )}
                </span>
              </div>

              {/* Action buttons */}
              <div style={{ display: "flex", gap: 12 }}>
                <form action={approveMission} style={{ flex: 1 }}>
                  <input name="missionId" type="hidden" value={selected.id} />
                  <button
                    type="submit"
                    style={{ width: "100%", height: 46, fontFamily: "inherit", fontSize: 15, fontWeight: 700, color: "#000", background: "#00d9a3", border: "none", borderRadius: 9, cursor: "pointer" }}
                  >
                    Approve &amp; publish
                  </button>
                </form>
                <a
                  href={`/admin/campaigns/${selected.id}`}
                  style={{ height: 46, padding: "0 20px", fontFamily: "inherit", fontSize: 15, fontWeight: 700, color: "#ff8904", background: "rgba(255,137,4,0.1)", border: "1px solid rgba(255,137,4,0.3)", borderRadius: 9, cursor: "pointer", display: "flex", alignItems: "center", textDecoration: "none", whiteSpace: "nowrap" }}
                >
                  Request edits
                </a>
                <a
                  href={`/admin/campaigns/${selected.id}`}
                  style={{ height: 46, padding: "0 20px", fontFamily: "inherit", fontSize: 15, fontWeight: 700, color: "#ff6b6b", background: "rgba(255,107,107,0.08)", border: "1px solid rgba(255,107,107,0.3)", borderRadius: 9, cursor: "pointer", display: "flex", alignItems: "center", textDecoration: "none", whiteSpace: "nowrap" }}
                >
                  Reject
                </a>
              </div>
            </div>
          )}
        </div>
      )}
    </AppShell>
  );
}
