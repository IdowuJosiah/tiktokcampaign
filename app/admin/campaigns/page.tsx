import Link from "next/link";
import { AppShell } from "@/app/components/AppShell";
import { requireRole } from "@/lib/auth";
import { listMissions } from "@/lib/repository";
import type { Mission } from "@/lib/data";

const STATUS_STYLES: Record<Mission["status"], { color: string; bg: string; border: string }> = {
  Live: { color: "#00d9a3", bg: "rgba(0,217,163,0.1)", border: "rgba(0,217,163,0.3)" },
  Draft: { color: "#ff8904", bg: "rgba(255,137,4,0.1)", border: "rgba(255,137,4,0.3)" },
  Rejected: { color: "#ff6467", bg: "rgba(255,100,103,0.1)", border: "rgba(255,100,103,0.3)" },
  Closed: { color: "#99a1af", bg: "rgba(255,255,255,0.06)", border: "rgba(255,255,255,0.1)" },
};

function CampaignList({ missions, emptyLabel }: { missions: Mission[]; emptyLabel: string }) {
  if (missions.length === 0) {
    return <div style={{ padding: 32, textAlign: "center", color: "#99a1af" }}>{emptyLabel}</div>;
  }

  return (
    <>
      {missions.map((m, i) => {
        const style = STATUS_STYLES[m.status];
        return (
          <Link
            key={m.id}
            href={`/admin/campaigns/${m.id}`}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 16,
              padding: "16px 22px",
              borderBottom: i < missions.length - 1 ? "1px solid rgba(255,255,255,0.05)" : "none",
              textDecoration: "none",
              color: "inherit",
            }}
          >
            <div style={{ width: 40, height: 40, borderRadius: 10, background: "rgba(0,217,163,0.1)", border: "1px solid rgba(0,217,163,0.2)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#00d9a3" strokeWidth="1.8"><path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"/><path d="M19 10v2a7 7 0 0 1-14 0v-2"/></svg>
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 15, fontWeight: 700 }}>{m.title}</div>
              <div style={{ color: "#99a1af", fontSize: 13, marginTop: 2 }}>{m.brand} · {m.deadline}</div>
            </div>
            <div style={{ fontSize: 14, color: "#fff", marginRight: 8, flexShrink: 0 }}>{m.rewardPool}</div>
            <span
              style={{
                fontSize: 12,
                color: style.color,
                background: style.bg,
                border: `1px solid ${style.border}`,
                borderRadius: 999,
                padding: "4px 10px",
                whiteSpace: "nowrap",
                flexShrink: 0,
              }}
            >
              {m.status}
            </span>
          </Link>
        );
      })}
    </>
  );
}

export default async function AdminCampaignsPage() {
  await requireRole("admin");
  const missions = await listMissions();

  const pending = missions.filter((m) => m.status === "Draft");
  const live = missions.filter((m) => m.status === "Live");
  const closed = missions.filter((m) => m.status === "Closed");
  const rejected = missions.filter((m) => m.status === "Rejected");
  const active = missions.filter((m) => m.status !== "Rejected");

  return (
    <AppShell>
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ fontFamily: "var(--font-heading)", fontWeight: 600, fontSize: 26, margin: 0 }}>Campaign Approvals</h1>
        <p style={{ color: "#99a1af", fontSize: 15, margin: "6px 0 0" }}>Review submitted campaigns and approve them for creators</p>
      </div>

      {/* Stats */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, minmax(0, 1fr))", gap: 12, marginBottom: 28 }}>
        {[
          { label: "Pending approval", count: pending.length, style: STATUS_STYLES.Draft },
          { label: "Live", count: live.length, style: STATUS_STYLES.Live },
          { label: "Closed", count: closed.length, style: STATUS_STYLES.Closed },
          { label: "Rejected", count: rejected.length, style: STATUS_STYLES.Rejected },
        ].map((s) => (
          <div key={s.label} style={{ background: s.style.bg, border: `1px solid ${s.style.border}`, borderRadius: 12, padding: "14px 18px", display: "flex", alignItems: "center", gap: 10 }}>
            <span style={{ fontSize: 22, fontWeight: 700, color: s.style.color }}>{s.count}</span>
            <span style={{ fontSize: 13, color: "#99a1af" }}>{s.label}</span>
          </div>
        ))}
      </div>

      {/* Active campaigns */}
      <div style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 14, overflow: "hidden", marginBottom: 28 }}>
        <div style={{ padding: "18px 22px", borderBottom: "1px solid rgba(255,255,255,0.08)", fontSize: 15, fontWeight: 700 }}>
          Active campaigns ({active.length})
        </div>
        <CampaignList missions={active} emptyLabel="No active campaigns yet." />
      </div>

      {/* Rejected campaigns */}
      {rejected.length > 0 && (
        <div style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,100,103,0.2)", borderRadius: 14, overflow: "hidden" }}>
          <div style={{ padding: "18px 22px", borderBottom: "1px solid rgba(255,255,255,0.08)", fontSize: 15, fontWeight: 700, color: "#ff6467" }}>
            Rejected campaigns ({rejected.length})
          </div>
          <CampaignList missions={rejected} emptyLabel="No rejected campaigns." />
        </div>
      )}
    </AppShell>
  );
}
