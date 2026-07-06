import Link from "next/link";
import { AppShell } from "@/app/components/AppShell";
import { requireRole } from "@/lib/auth";
import { listMissions, listSubmissions, getAdminSignupStats, getPlatformWalletStats } from "@/lib/repository";

export default async function AdminOverviewPage() {
  await requireRole("admin");
  const [campaigns, submissions, signupStats, walletStats] = await Promise.all([
    listMissions(),
    listSubmissions(),
    getAdminSignupStats(),
    getPlatformWalletStats(),
  ]);

  const pendingReview = campaigns.filter((c) => c.status === "Draft").length;
  const openDisputes = submissions.filter((s) => s.status === "Rejected").length;
  const totalSubs = submissions.length;

  return (
    <AppShell>
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ fontFamily: "var(--font-heading)", fontWeight: 600, fontSize: 26, margin: 0 }}>Platform Overview</h1>
        <p style={{ color: "#99a1af", fontSize: 15, margin: "6px 0 0" }}>Live health, today&apos;s activity and pending actions</p>
      </div>

      {/* Stat cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 20, marginBottom: 24 }}>
        <div style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 14, padding: 22 }}>
          <div style={{ color: "#99a1af", fontSize: 13, marginBottom: 8 }}>Brand deposits (MTD)</div>
          <div style={{ fontSize: 24, fontWeight: 700 }}>{walletStats.depositsLabel}</div>
          <div style={{ fontSize: 12, color: "#99a1af", marginTop: 6 }}>via Paystack</div>
        </div>
        <div style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 14, padding: 22 }}>
          <div style={{ color: "#99a1af", fontSize: 13, marginBottom: 8 }}>Submissions scored</div>
          <div style={{ fontSize: 24, fontWeight: 700 }}>{totalSubs.toLocaleString()}</div>
          <div style={{ fontSize: 12, color: "#99a1af", marginTop: 6 }}>Pipeline: healthy</div>
        </div>
        <div style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 14, padding: 22 }}>
          <div style={{ color: "#99a1af", fontSize: 13, marginBottom: 8 }}>Total signups</div>
          <div style={{ fontSize: 24, fontWeight: 700 }}>{signupStats.total.toLocaleString()}</div>
          <div style={{ fontSize: 12, color: "#99a1af", marginTop: 6 }}>{signupStats.creatorCount} creators · {signupStats.brandCount} brands</div>
        </div>
        <div style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 14, padding: 22 }}>
          <div style={{ color: "#99a1af", fontSize: 13, marginBottom: 8 }}>Float (unspent balance)</div>
          <div style={{ fontSize: 24, fontWeight: 700 }}>{walletStats.floatLabel}</div>
          <div style={{ fontSize: 12, color: "#99a1af", marginTop: 6 }}>brand wallet balance</div>
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

            <Link href="/admin/disputes" style={{ display: "flex", alignItems: "center", gap: 14, padding: 14, border: "1px solid rgba(255,255,255,0.08)", borderRadius: 11, cursor: "pointer", textDecoration: "none", color: "inherit" }}>
              <div style={{ width: 40, height: 40, borderRadius: 10, background: "rgba(255,137,4,0.12)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#ff8904" strokeWidth="2"><path d="M14 9V5a3 3 0 0 0-6 0v4"/><rect x="2" y="9" width="20" height="12" rx="2"/></svg>
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 14, fontWeight: 700 }}>Rejected submissions</div>
                <div style={{ fontSize: 13, color: "#99a1af" }}>48h SLA for appeal review</div>
              </div>
              <span style={{ fontSize: 20, fontWeight: 700, color: "#ff8904" }}>{openDisputes}</span>
            </Link>

            <Link href="/admin/submissions" style={{ display: "flex", alignItems: "center", gap: 14, padding: 14, border: "1px solid rgba(255,255,255,0.08)", borderRadius: 11, cursor: "pointer", textDecoration: "none", color: "inherit" }}>
              <div style={{ width: 40, height: 40, borderRadius: 10, background: "rgba(255,255,255,0.05)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#99a1af" strokeWidth="2"><path d="M9 11l3 3L22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/></svg>
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 14, fontWeight: 700 }}>All submissions</div>
                <div style={{ fontSize: 13, color: "#99a1af" }}>Review queue</div>
              </div>
              <span style={{ fontSize: 20, fontWeight: 700, color: "#d1d5dc" }}>{totalSubs}</span>
            </Link>
          </div>
        </div>

        {/* Fraud alerts */}
        <div style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 14, padding: 24 }}>
          <div style={{ fontSize: 16, fontWeight: 700, marginBottom: 18 }}>System status</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            <div style={{ display: "flex", gap: 12, padding: 13, background: "rgba(0,217,163,0.04)", border: "1px solid rgba(0,217,163,0.2)", borderRadius: 11 }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#00d9a3" strokeWidth="2" style={{ flexShrink: 0, marginTop: 1 }}><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><path d="M22 4 12 14.01l-3-3"/></svg>
              <div>
                <div style={{ fontSize: 13, color: "#fff", fontWeight: 700 }}>Paystack API</div>
                <div style={{ fontSize: 12, color: "#99a1af", marginTop: 2 }}>Deposit and payout endpoints nominal</div>
              </div>
            </div>
            <div style={{ display: "flex", gap: 12, padding: 13, background: "rgba(0,217,163,0.04)", border: "1px solid rgba(0,217,163,0.2)", borderRadius: 11 }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#00d9a3" strokeWidth="2" style={{ flexShrink: 0, marginTop: 1 }}><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><path d="M22 4 12 14.01l-3-3"/></svg>
              <div>
                <div style={{ fontSize: 13, color: "#fff", fontWeight: 700 }}>TikTok API</div>
                <div style={{ fontSize: 12, color: "#99a1af", marginTop: 2 }}>Video verification pipeline healthy</div>
              </div>
            </div>
            <div style={{ display: "flex", gap: 12, padding: 13, background: "rgba(0,217,163,0.04)", border: "1px solid rgba(0,217,163,0.2)", borderRadius: 11 }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#00d9a3" strokeWidth="2" style={{ flexShrink: 0, marginTop: 1 }}><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><path d="M22 4 12 14.01l-3-3"/></svg>
              <div>
                <div style={{ fontSize: 13, color: "#fff", fontWeight: 700 }}>Scoring pipeline</div>
                <div style={{ fontSize: 12, color: "#99a1af", marginTop: 2 }}>All systems operational</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
