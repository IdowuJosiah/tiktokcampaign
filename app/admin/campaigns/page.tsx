import Link from "next/link";
import { AppShell } from "@/app/components/AppShell";
import { requireRole } from "@/lib/auth";
import { listMissions } from "@/lib/repository";

export default async function AdminCampaignsPage() {
  await requireRole("admin");
  const missions = await listMissions();

  const pending = missions.filter((m) => m.status === "Draft");
  const live = missions.filter((m) => m.status === "Live");
  const closed = missions.filter((m) => m.status === "Closed");

  return (
    <AppShell>
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ fontFamily: "var(--font-heading)", fontWeight: 600, fontSize: 26, margin: 0 }}>Campaign Approvals</h1>
        <p style={{ color: "#99a1af", fontSize: 15, margin: "6px 0 0" }}>Review submitted campaigns and approve them for creators</p>
      </div>

      {/* Stats */}
      <div style={{ display: "flex", gap: 12, marginBottom: 24 }}>
        {[
          { label: "Pending approval", count: pending.length, color: "#ff8904", bg: "rgba(255,137,4,0.1)", border: "rgba(255,137,4,0.3)" },
          { label: "Live", count: live.length, color: "#00d9a3", bg: "rgba(0,217,163,0.1)", border: "rgba(0,217,163,0.3)" },
          { label: "Closed", count: closed.length, color: "#99a1af", bg: "rgba(255,255,255,0.05)", border: "rgba(255,255,255,0.1)" },
        ].map((s) => (
          <div key={s.label} style={{ background: s.bg, border: `1px solid ${s.border}`, borderRadius: 12, padding: "12px 18px", display: "flex", alignItems: "center", gap: 10 }}>
            <span style={{ fontSize: 22, fontWeight: 700, color: s.color }}>{s.count}</span>
            <span style={{ fontSize: 13, color: "#99a1af" }}>{s.label}</span>
          </div>
        ))}
      </div>

      {/* Campaign list */}
      <div style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 14, overflow: "hidden" }}>
        <div style={{ padding: "18px 22px", borderBottom: "1px solid rgba(255,255,255,0.08)", fontSize: 15, fontWeight: 700 }}>
          All campaigns ({missions.length})
        </div>
        {missions.length === 0 ? (
          <div style={{ padding: 32, textAlign: "center", color: "#99a1af" }}>No campaigns yet.</div>
        ) : (
          missions.map((m, i) => (
            <Link key={m.id} href={`/admin/campaigns/${m.id}`} style={{ display: "flex", alignItems: "center", gap: 16, padding: "16px 22px", borderBottom: i < missions.length - 1 ? "1px solid rgba(255,255,255,0.05)" : "none", textDecoration: "none", color: "inherit" }}>
              <div style={{ width: 40, height: 40, borderRadius: 10, background: "rgba(0,217,163,0.1)", border: "1px solid rgba(0,217,163,0.2)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#00d9a3" strokeWidth="1.8"><path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"/><path d="M19 10v2a7 7 0 0 1-14 0v-2"/></svg>
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 15, fontWeight: 700 }}>{m.title}</div>
                <div style={{ color: "#99a1af", fontSize: 13, marginTop: 2 }}>{m.brand} · {m.deadline}</div>
              </div>
              <div style={{ fontSize: 14, color: "#fff", marginRight: 8 }}>{m.rewardPool}</div>
              <span style={{ fontSize: 12, color: m.status === "Live" ? "#00d9a3" : m.status === "Draft" ? "#ff8904" : "#99a1af", background: m.status === "Live" ? "rgba(0,217,163,0.1)" : m.status === "Draft" ? "rgba(255,137,4,0.1)" : "rgba(255,255,255,0.06)", border: `1px solid ${m.status === "Live" ? "rgba(0,217,163,0.3)" : m.status === "Draft" ? "rgba(255,137,4,0.3)" : "rgba(255,255,255,0.1)"}`, borderRadius: 999, padding: "4px 10px", whiteSpace: "nowrap" }}>
                {m.status}
              </span>
            </Link>
          ))
        )}
      </div>
    </AppShell>
  );
}
