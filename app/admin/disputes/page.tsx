import { AppShell } from "@/app/components/AppShell";
import { requireRole } from "@/lib/auth";
import { listSubmissions } from "@/lib/repository";

type SlaLevel = "ok" | "warn" | "breach";

const SLA_STYLES: Record<SlaLevel, React.CSSProperties> = {
  ok: { fontSize: 12, color: "#00d9a3", background: "rgba(0,217,163,0.1)", border: "1px solid rgba(0,217,163,0.3)", borderRadius: 999, padding: "3px 10px", whiteSpace: "nowrap" },
  warn: { fontSize: 12, color: "#ff8904", background: "rgba(255,137,4,0.1)", border: "1px solid rgba(255,137,4,0.3)", borderRadius: 999, padding: "3px 10px", whiteSpace: "nowrap" },
  breach: { fontSize: 12, color: "#ff6b6b", background: "rgba(255,107,107,0.1)", border: "1px solid rgba(255,107,107,0.3)", borderRadius: 999, padding: "3px 10px", whiteSpace: "nowrap" },
};

const STATIC_DISPUTES = [
  {
    initials: "TU",
    handle: "@tunde.x",
    campaign: "Detty December Anthem · Maltina",
    sla: "18h left",
    slaLevel: "ok" as SlaLevel,
    reason: "Required sound did not match the campaign audio (music_id mismatch).",
    appeal: "I used the official sound — TikTok swapped it to \"original audio\" after I posted. Re-check please.",
  },
  {
    initials: "NK",
    handle: "@nkechi.glow",
    campaign: "Skincare Glow Routine · R&R Luxury",
    sla: "6h left",
    slaLevel: "warn" as SlaLevel,
    reason: "#Ad disclosure hashtag was missing from the description.",
    appeal: "It is in the caption, just after a line break. Attaching screenshot of the live post.",
  },
  {
    initials: "SE",
    handle: "@seyi.cooks",
    campaign: "Jollof Wars · Knorr",
    sla: "2h — breaching",
    slaLevel: "breach" as SlaLevel,
    reason: "Score below brand threshold (54/100) on content quality.",
    appeal: "Video got 80k organic views in 2 days — engagement was clearly strong.",
  },
];

export default async function AdminDisputesPage() {
  await requireRole("admin");
  const submissions = await listSubmissions();
  const rejectedCount = submissions.filter((s) => s.status === "Rejected").length;

  const disputes = STATIC_DISPUTES.slice(0, Math.max(STATIC_DISPUTES.length, rejectedCount > 0 ? STATIC_DISPUTES.length : 0));

  return (
    <AppShell>
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontFamily: "var(--font-heading)", fontWeight: 600, fontSize: 26, margin: 0 }}>Dispute Resolution</h1>
        <p style={{ color: "#99a1af", fontSize: 15, margin: "6px 0 0" }}>Creator appeals on rejected submissions · 48h SLA</p>
      </div>

      {disputes.length === 0 ? (
        <div style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 14, padding: 48, textAlign: "center", color: "#99a1af" }}>
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#99a1af" strokeWidth="1.5" style={{ marginBottom: 12 }}><path d="M20 6 9 17l-5-5"/></svg>
          <div>No open disputes.</div>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          {disputes.map((d) => (
            <div key={d.handle} style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 14, padding: 22 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 16 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  <div style={{ width: 40, height: 40, borderRadius: "50%", background: "rgba(0,217,163,0.15)", display: "flex", alignItems: "center", justifyContent: "center", color: "#00d9a3", fontSize: 13, fontWeight: 700, flexShrink: 0 }}>
                    {d.initials}
                  </div>
                  <div>
                    <div style={{ fontSize: 15, fontWeight: 700 }}>{d.handle}</div>
                    <div style={{ fontSize: 13, color: "#99a1af" }}>{d.campaign}</div>
                  </div>
                </div>
                <span style={SLA_STYLES[d.slaLevel]}>{d.sla}</span>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 18 }}>
                <div style={{ background: "rgba(255,107,107,0.05)", border: "1px solid rgba(255,107,107,0.2)", borderRadius: 10, padding: 14 }}>
                  <div style={{ fontSize: 12, color: "#ff6b6b", fontWeight: 700, marginBottom: 6 }}>REJECTION REASON</div>
                  <div style={{ fontSize: 13, color: "#d1d5dc", lineHeight: 1.5 }}>{d.reason}</div>
                </div>
                <div style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 10, padding: 14 }}>
                  <div style={{ fontSize: 12, color: "#99a1af", fontWeight: 700, marginBottom: 6 }}>CREATOR&apos;S APPEAL</div>
                  <div style={{ fontSize: 13, color: "#d1d5dc", lineHeight: 1.5 }}>{d.appeal}</div>
                </div>
              </div>

              <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
                <button
                  style={{ height: 42, padding: "0 20px", fontFamily: "inherit", fontSize: 14, fontWeight: 700, color: "#000", background: "#00d9a3", border: "none", borderRadius: 8, cursor: "pointer" }}
                >
                  Overturn — qualify
                </button>
                <button
                  style={{ height: 42, padding: "0 20px", fontFamily: "inherit", fontSize: 14, fontWeight: 700, color: "#d1d5dc", background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.14)", borderRadius: 8, cursor: "pointer" }}
                >
                  Uphold rejection
                </button>
                <div style={{ flex: 1 }} />
                <span style={{ fontSize: 13, color: "#00d9a3", cursor: "pointer", display: "flex", alignItems: "center", gap: 6 }}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#00d9a3" strokeWidth="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                  View video &amp; score
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </AppShell>
  );
}
