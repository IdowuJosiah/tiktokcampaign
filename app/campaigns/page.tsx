import Link from "next/link";
import { AppShell } from "@/app/components/AppShell";
import { getAppSession } from "@/lib/auth";
import { listLiveMissions } from "@/lib/repository";

export default async function CampaignsPage() {
  const [session, campaigns] = await Promise.all([getAppSession(), listLiveMissions()]);

  return (
    <AppShell>
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontFamily: "var(--font-heading)", fontWeight: 600, fontSize: 26, margin: 0 }}>Browse Campaigns</h1>
        <p style={{ color: "var(--muted)", fontSize: 15, margin: "6px 0 0" }}>Campaigns matched to your niches</p>
      </div>

      {/* Filters */}
      <div style={{ display: "flex", gap: 12, alignItems: "center", marginBottom: 24, flexWrap: "wrap" }}>
        <div style={{ display: "flex", gap: 8 }}>
          {["All niches", "Beauty", "Tech", "Food", "Fashion"].map((filter, i) => (
            <span key={filter} style={{ fontSize: 13, color: i === 0 ? "#00d9a3" : "var(--foreground)", background: i === 0 ? "rgba(0,217,163,0.1)" : "rgba(0,0,0,0.04)", border: `1px solid ${i === 0 ? "rgba(0,217,163,0.3)" : "var(--line)"}`, borderRadius: 8, padding: "7px 13px", cursor: "pointer" }}>
              {filter}
            </span>
          ))}
        </div>
        <div style={{ flex: 1 }} />
        <span style={{ fontSize: 13, color: "var(--muted)", background: "rgba(0,0,0,0.04)", border: "1px solid var(--line)", borderRadius: 8, padding: "7px 13px", display: "flex", alignItems: "center", gap: 7 }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--muted)" strokeWidth="2"><path d="M3 6h18M6 12h12M10 18h4"/></svg>
          Sort: Highest reward
        </span>
      </div>

      {/* Campaign grid */}
      {campaigns.length === 0 ? (
        <div style={{ padding: 48, textAlign: "center", color: "var(--muted)", background: "#fff", border: "1px solid var(--line)", borderRadius: 14 }}>
          No live campaigns at the moment. Check back soon.
        </div>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
          {campaigns.map((c) => (
            <Link key={c.id} href={`/campaigns/${c.id}`} style={{ background: "#fff", border: "1px solid var(--line)", borderRadius: 14, padding: 22, cursor: "pointer", textDecoration: "none", color: "inherit", display: "block" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 14 }}>
                <div style={{ display: "flex", gap: 14, alignItems: "center" }}>
                  <div style={{ width: 48, height: 48, borderRadius: 12, background: "rgba(0,217,163,0.1)", border: "1px solid rgba(0,217,163,0.3)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#00d9a3" strokeWidth="1.8"><path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"/><path d="M19 10v2a7 7 0 0 1-14 0v-2"/></svg>
                  </div>
                  <div>
                    <div style={{ fontSize: 15, fontWeight: 700 }}>{c.title}</div>
                    <div style={{ color: "var(--muted)", fontSize: 13, marginTop: 2 }}>{c.brand}</div>
                  </div>
                </div>
                <span style={{ fontSize: 12, color: "#00d9a3", background: "rgba(0,217,163,0.1)", border: "1px solid rgba(0,217,163,0.25)", borderRadius: 999, padding: "4px 10px" }}>Live</span>
              </div>
              <p style={{ color: "var(--foreground)", fontSize: 13, lineHeight: 1.5, margin: "0 0 14px" }}>{c.brief}</p>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", paddingTop: 14, borderTop: "1px solid var(--line)" }}>
                <div>
                  <span style={{ fontSize: 22, fontWeight: 700, color: "#00d9a3" }}>{c.rewardPool}</span>
                  <span style={{ color: "var(--muted)", fontSize: 12, marginLeft: 6 }}>pool</span>
                </div>
                <span style={{ color: "var(--muted)", fontSize: 13, display: "flex", alignItems: "center", gap: 6 }}>
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="var(--muted)" strokeWidth="2"><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></svg>
                  {c.deadline ?? "Open"}
                </span>
              </div>
            </Link>
          ))}
        </div>
      )}

      {session?.role === "creator" && campaigns.length > 0 && (
        <div style={{ marginTop: 32, textAlign: "center" }}>
          <Link href="/creator/submit" style={{ fontSize: 15, fontWeight: 700, color: "#000", background: "#00d9a3", border: "none", borderRadius: 10, padding: "13px 28px", textDecoration: "none", display: "inline-flex", alignItems: "center" }}>Submit a video →</Link>
        </div>
      )}
    </AppShell>
  );
}
