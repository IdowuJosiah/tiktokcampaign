import Link from "next/link";
import { AppShell } from "@/app/components/AppShell";
import { requireRole } from "@/lib/auth";
import { listMissions, listSubmissions } from "@/lib/repository";

export default async function AdminOverviewPage() {
  await requireRole("admin");
  const [campaigns, submissions] = await Promise.all([listMissions(), listSubmissions()]);

  const pendingReview = campaigns.filter((c) => c.status !== "Live" && c.status !== "Closed").length;
  const liveCampaigns = campaigns.filter((c) => c.status === "Live").length;
  const pendingSubs = submissions.filter((s) => s.status === "Pending").length;
  const approvedSubs = submissions.filter((s) => s.status === "Approved").length;

  return (
    <AppShell>
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ fontFamily: "var(--font-heading)", fontWeight: 600, fontSize: 26, margin: 0 }}>Platform Overview</h1>
        <p style={{ color: "#99a1af", fontSize: 15, margin: "6px 0 0" }}>Live health, today&apos;s activity and pending actions</p>
      </div>

      {/* Stat cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 20, marginBottom: 32 }}>
        <div style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 14, padding: 22, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div>
            <div style={{ color: "#99a1af", fontSize: 13, marginBottom: 10 }}>Pending Review</div>
            <div style={{ fontSize: 24, fontWeight: 700 }}>{pendingReview}</div>
            <div style={{ color: "#ff8904", fontSize: 12, marginTop: 4 }}>Campaigns</div>
          </div>
          <div style={{ width: 42, height: 42, borderRadius: 10, background: "rgba(255,137,4,0.12)", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#ff8904" strokeWidth="2"><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></svg>
          </div>
        </div>

        <div style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 14, padding: 22, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div>
            <div style={{ color: "#99a1af", fontSize: 13, marginBottom: 10 }}>Live Campaigns</div>
            <div style={{ fontSize: 24, fontWeight: 700 }}>{liveCampaigns}</div>
            <div style={{ color: "#00d9a3", fontSize: 12, marginTop: 4 }}>Creator visible</div>
          </div>
          <div style={{ width: 42, height: 42, borderRadius: 10, background: "rgba(0,217,163,0.12)", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#00d9a3" strokeWidth="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><path d="M22 4 12 14.01l-3-3"/></svg>
          </div>
        </div>

        <div style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 14, padding: 22, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div>
            <div style={{ color: "#99a1af", fontSize: 13, marginBottom: 10 }}>Submissions Queue</div>
            <div style={{ fontSize: 24, fontWeight: 700 }}>{pendingSubs}</div>
            <div style={{ color: "#ff8904", fontSize: 12, marginTop: 4 }}>Awaiting review</div>
          </div>
          <div style={{ width: 42, height: 42, borderRadius: 10, background: "rgba(55,113,200,0.15)", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#5b8cff" strokeWidth="2"><path d="M9 11l3 3L22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/></svg>
          </div>
        </div>

        <div style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 14, padding: 22, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div>
            <div style={{ color: "#99a1af", fontSize: 13, marginBottom: 10 }}>Approved</div>
            <div style={{ fontSize: 24, fontWeight: 700 }}>{approvedSubs}</div>
            <div style={{ color: "#00d9a3", fontSize: 12, marginTop: 4 }}>Submissions</div>
          </div>
          <div style={{ width: 42, height: 42, borderRadius: 10, background: "rgba(124,58,237,0.18)", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#a78bfa" strokeWidth="2"><path d="M22 7l-8.5 8.5-5-5L2 17"/></svg>
          </div>
        </div>
      </div>

      {/* Bottom two-column panel */}
      <div style={{ display: "grid", gridTemplateColumns: "1.3fr 1fr", gap: 20 }}>
        {/* Pending actions */}
        <div style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 14, padding: 24 }}>
          <div style={{ fontSize: 16, fontWeight: 700, marginBottom: 18 }}>Pending actions</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            <Link href="/admin/campaigns" style={{ display: "flex", alignItems: "center", gap: 14, padding: 14, border: "1px solid rgba(255,255,255,0.08)", borderRadius: 11, cursor: "pointer", textDecoration: "none", color: "inherit" }}>
              <div style={{ width: 40, height: 40, borderRadius: 10, background: "rgba(0,217,163,0.12)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#00d9a3" strokeWidth="2"><path d="M9 11l3 3L22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/></svg>
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 14, fontWeight: 700 }}>Campaigns awaiting review</div>
                <div style={{ fontSize: 13, color: "#99a1af" }}>24h SLA</div>
              </div>
              <span style={{ fontSize: 20, fontWeight: 700, color: "#00d9a3" }}>{pendingReview}</span>
            </Link>

            <Link href="/admin/submissions" style={{ display: "flex", alignItems: "center", gap: 14, padding: 14, border: "1px solid rgba(255,255,255,0.08)", borderRadius: 11, cursor: "pointer", textDecoration: "none", color: "inherit" }}>
              <div style={{ width: 40, height: 40, borderRadius: 10, background: "rgba(255,137,4,0.12)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#ff8904" strokeWidth="2"><path d="M14 9V5a3 3 0 0 0-6 0v4"/><rect x="2" y="9" width="20" height="12" rx="2"/></svg>
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 14, fontWeight: 700 }}>Submissions queue</div>
                <div style={{ fontSize: 13, color: "#99a1af" }}>Pending review</div>
              </div>
              <span style={{ fontSize: 20, fontWeight: 700, color: "#ff8904" }}>{pendingSubs}</span>
            </Link>

            <div style={{ display: "flex", alignItems: "center", gap: 14, padding: 14, border: "1px solid rgba(255,255,255,0.08)", borderRadius: 11 }}>
              <div style={{ width: 40, height: 40, borderRadius: 10, background: "rgba(255,255,255,0.05)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#99a1af" strokeWidth="2"><path d="M1 4v6h6M23 20v-6h-6"/><path d="M20.49 9A9 9 0 0 0 5.64 5.64L1 10m22 4-4.64 4.36A9 9 0 0 1 3.51 15"/></svg>
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 14, fontWeight: 700 }}>Failed payouts to retry</div>
                <div style={{ fontSize: 13, color: "#99a1af" }}>Auto-retry scheduled</div>
              </div>
              <span style={{ fontSize: 20, fontWeight: 700, color: "#d1d5dc" }}>0</span>
            </div>
          </div>
        </div>

        {/* Fraud alerts */}
        <div style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 14, padding: 24 }}>
          <div style={{ fontSize: 16, fontWeight: 700, marginBottom: 18 }}>Fraud alerts</div>
          <div style={{ padding: "12px 14px", background: "rgba(255,107,107,0.06)", border: "1px solid rgba(255,107,107,0.2)", borderRadius: 10, marginBottom: 12 }}>
            <div style={{ fontSize: 12, fontWeight: 700, color: "#ff6b6b", marginBottom: 6 }}>VELOCITY SPIKE</div>
            <div style={{ fontSize: 13, color: "#d1d5dc", lineHeight: 1.5 }}>Monitor for unusually high submission rates from single creators</div>
          </div>
          <div style={{ padding: "12px 14px", background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 10 }}>
            <div style={{ fontSize: 12, fontWeight: 700, color: "#99a1af", marginBottom: 6 }}>DUPLICATE DETECTION</div>
            <div style={{ fontSize: 13, color: "#d1d5dc", lineHeight: 1.5 }}>No duplicate video links detected in the last 24h</div>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
