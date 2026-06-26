import Link from "next/link";
import { AppShell } from "@/app/components/AppShell";
import { requireRole } from "@/lib/auth";
import { listMissions, listSubmissions } from "@/lib/repository";

export default async function AdminOverviewPage() {
  await requireRole("admin");
  const [campaigns, submissions] = await Promise.all([listMissions(), listSubmissions()]);

  const pendingReview = campaigns.filter((c) => c.status === "Draft").length;
  const openDisputes = 3;
  const failedPayouts = 2;

  const totalSubs = submissions.length;
  const approvedSubs = submissions.filter((s) => s.status === "Approved").length;
  const totalRewardCents = approvedSubs * 350000;
  const paidOutLabel = `₦${(totalRewardCents / 100).toLocaleString()}`;

  return (
    <AppShell>
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ fontFamily: "var(--font-heading)", fontWeight: 600, fontSize: 26, margin: 0 }}>Platform Overview</h1>
        <p style={{ color: "#99a1af", fontSize: 15, margin: "6px 0 0" }}>Live health, today&apos;s activity and pending actions</p>
      </div>

      {/* Stat cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 20, marginBottom: 24 }}>
        <div style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 14, padding: 22 }}>
          <div style={{ color: "#99a1af", fontSize: 13, marginBottom: 8 }}>Paid out today</div>
          <div style={{ fontSize: 24, fontWeight: 700 }}>{paidOutLabel}</div>
          <div style={{ fontSize: 12, color: "#00d9a3", marginTop: 6 }}>▲ 12% vs yesterday</div>
        </div>
        <div style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 14, padding: 22 }}>
          <div style={{ color: "#99a1af", fontSize: 13, marginBottom: 8 }}>Submissions scored</div>
          <div style={{ fontSize: 24, fontWeight: 700 }}>{totalSubs.toLocaleString()}</div>
          <div style={{ fontSize: 12, color: "#99a1af", marginTop: 6 }}>Pipeline: healthy</div>
        </div>
        <div style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 14, padding: 22 }}>
          <div style={{ color: "#99a1af", fontSize: 13, marginBottom: 8 }}>New signups</div>
          <div style={{ fontSize: 24, fontWeight: 700 }}>186</div>
          <div style={{ fontSize: 12, color: "#99a1af", marginTop: 6 }}>142 creators · 44 brands</div>
        </div>
        <div style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 14, padding: 22 }}>
          <div style={{ color: "#99a1af", fontSize: 13, marginBottom: 8 }}>Platform fees (MTD)</div>
          <div style={{ fontSize: 24, fontWeight: 700 }}>₦8.2M</div>
          <div style={{ fontSize: 12, color: "#00d9a3", marginTop: 6 }}>20% of payouts</div>
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
                <div style={{ fontSize: 13, color: "#99a1af" }}>Oldest waiting 3h · 24h SLA</div>
              </div>
              <span style={{ fontSize: 20, fontWeight: 700, color: "#00d9a3" }}>{pendingReview}</span>
            </Link>

            <Link href="/admin/disputes" style={{ display: "flex", alignItems: "center", gap: 14, padding: 14, border: "1px solid rgba(255,255,255,0.08)", borderRadius: 11, cursor: "pointer", textDecoration: "none", color: "inherit" }}>
              <div style={{ width: 40, height: 40, borderRadius: 10, background: "rgba(255,137,4,0.12)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#ff8904" strokeWidth="2"><path d="M14 9V5a3 3 0 0 0-6 0v4"/><rect x="2" y="9" width="20" height="12" rx="2"/></svg>
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 14, fontWeight: 700 }}>Open disputes</div>
                <div style={{ fontSize: 13, color: "#99a1af" }}>1 breaching 48h SLA</div>
              </div>
              <span style={{ fontSize: 20, fontWeight: 700, color: "#ff8904" }}>{openDisputes}</span>
            </Link>

            <div style={{ display: "flex", alignItems: "center", gap: 14, padding: 14, border: "1px solid rgba(255,255,255,0.08)", borderRadius: 11 }}>
              <div style={{ width: 40, height: 40, borderRadius: 10, background: "rgba(255,255,255,0.05)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#99a1af" strokeWidth="2"><path d="M1 4v6h6M23 20v-6h-6"/><path d="M20.49 9A9 9 0 0 0 5.64 5.64L1 10m22 4-4.64 4.36A9 9 0 0 1 3.51 15"/></svg>
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 14, fontWeight: 700 }}>Failed payouts to retry</div>
                <div style={{ fontSize: 13, color: "#99a1af" }}>Auto-retry in 2h</div>
              </div>
              <span style={{ fontSize: 20, fontWeight: 700, color: "#d1d5dc" }}>{failedPayouts}</span>
            </div>
          </div>
        </div>

        {/* Fraud alerts */}
        <div style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 14, padding: 24 }}>
          <div style={{ fontSize: 16, fontWeight: 700, marginBottom: 18 }}>Fraud alerts</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            <div style={{ display: "flex", gap: 12, padding: 13, background: "rgba(255,107,107,0.06)", border: "1px solid rgba(255,107,107,0.25)", borderRadius: 11 }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#ff6b6b" strokeWidth="2" style={{ flexShrink: 0, marginTop: 1 }}><path d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12" y2="17"/></svg>
              <div>
                <div style={{ fontSize: 13, color: "#fff", fontWeight: 700 }}>View velocity spike</div>
                <div style={{ fontSize: 12, color: "#99a1af", marginTop: 2 }}>@quickviews — +48k in 1h, flagged for review</div>
              </div>
            </div>
            <div style={{ display: "flex", gap: 12, padding: 13, background: "rgba(255,137,4,0.06)", border: "1px solid rgba(255,137,4,0.25)", borderRadius: 11 }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#ff8904" strokeWidth="2" style={{ flexShrink: 0, marginTop: 1 }}><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12" y2="16"/></svg>
              <div>
                <div style={{ fontSize: 13, color: "#fff", fontWeight: 700 }}>Bot ratio &gt; 40%</div>
                <div style={{ fontSize: 12, color: "#99a1af", marginTop: 2 }}>2 accounts detected in weekly check</div>
              </div>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 10, padding: 13, color: "#99a1af", fontSize: 13 }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#00d9a3" strokeWidth="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><path d="M22 4 12 14.01l-3-3"/></svg>
              Scoring &amp; Paystack APIs nominal
            </div>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
