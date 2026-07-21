import Link from "next/link";
import { AppShell } from "@/app/components/AppShell";
import { FormStatus } from "@/app/components/FormStatus";
import { initiateBrandDeposit } from "@/app/actions";
import { requireRole } from "@/lib/auth";
import { getBrandWalletBalance, listMissions, listSubmissions } from "@/lib/repository";

export default async function BrandDashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; success?: string }>;
}) {
  const { error, success } = await searchParams;
  const session = await requireRole("brand");
  const [campaigns, submissions, walletBalance] = await Promise.all([
    listMissions(session.id),
    listSubmissions(),
    getBrandWalletBalance(session.id),
  ]);

  const liveCampaigns = campaigns.filter((c) => c.status === "Live");
  const pendingSubs = submissions.filter((s) => s.status === "Pending");

  return (
    <AppShell>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 28 }}>
        <div>
          <h1 style={{ fontFamily: "var(--font-heading)", fontWeight: 600, fontSize: 26, margin: 0 }}>Brand Dashboard</h1>
          <p style={{ color: "var(--muted)", fontSize: 15, margin: "6px 0 0" }}>Manage your campaigns and track performance</p>
        </div>
        <Link href="/brand/missions/new" style={{ height: 42, padding: "0 20px", fontFamily: "inherit", fontSize: 14, fontWeight: 700, color: "#000", background: "#00d9a3", border: "none", borderRadius: 8, cursor: "pointer", display: "inline-flex", alignItems: "center", gap: 8, textDecoration: "none" }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#000" strokeWidth="2.5"><path d="M12 5v14M5 12h14"/></svg>
          Create Campaign
        </Link>
      </div>

      <FormStatus error={error} success={success} />

      {/* Wallet */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 20, background: "var(--panel)", border: "1px solid var(--line)", borderRadius: 14, padding: 22, marginBottom: 28, flexWrap: "wrap" }}>
        <div>
          <div style={{ color: "var(--muted)", fontSize: 13, marginBottom: 8 }}>Wallet balance</div>
          <div style={{ fontSize: 26, fontWeight: 700, color: "#00d9a3" }}>{walletBalance}</div>
          <p style={{ color: "var(--muted)", fontSize: 13, margin: "6px 0 0" }}>Reward pools are funded from this balance automatically when you create a campaign.</p>
        </div>
        <form action={initiateBrandDeposit} style={{ display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap" }}>
          <input
            name="amount"
            required
            type="number"
            min="1"
            step="0.01"
            placeholder="Amount (₦)"
            style={{ flex: 1, minWidth: 140, height: 44, padding: "0 14px", fontSize: 14, color: "var(--foreground)", background: "var(--surface)", border: "1px solid var(--line)", borderRadius: 8, outline: "none", fontFamily: "inherit" }}
          />
          <button type="submit" style={{ height: 44, padding: "0 20px", fontFamily: "inherit", fontSize: 14, fontWeight: 700, color: "#000", background: "#00d9a3", border: "none", borderRadius: 8, cursor: "pointer" }}>
            Add funds
          </button>
        </form>
      </div>

      {/* Stat cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 20, marginBottom: 28 }}>
        <div style={{ background: "var(--panel)", border: "1px solid var(--line)", borderRadius: 14, padding: 22, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div>
            <div style={{ color: "var(--muted)", fontSize: 13, marginBottom: 10 }}>Total Campaigns</div>
            <div style={{ fontSize: 24, fontWeight: 700 }}>{campaigns.length}</div>
          </div>
          <div style={{ width: 42, height: 42, borderRadius: 10, background: "rgba(0,217,163,0.12)", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#00d9a3" strokeWidth="2"><path d="M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 0 0-2.91 0z"/><path d="M12 15l-3-3a22 22 0 0 1 2-3.95A12.88 12.88 0 0 1 22 2c0 2.72-.78 7.5-6 11a22.35 22.35 0 0 1-4 2z"/></svg>
          </div>
        </div>

        <div style={{ background: "var(--panel)", border: "1px solid var(--line)", borderRadius: 14, padding: 22, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div>
            <div style={{ color: "var(--muted)", fontSize: 13, marginBottom: 10 }}>Live Campaigns</div>
            <div style={{ fontSize: 24, fontWeight: 700 }}>{liveCampaigns.length}</div>
            <div style={{ color: "#00d9a3", fontSize: 12, marginTop: 4 }}>Creator visible</div>
          </div>
          <div style={{ width: 42, height: 42, borderRadius: 10, background: "rgba(55,113,200,0.15)", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#5b8cff" strokeWidth="2"><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></svg>
          </div>
        </div>

        <div style={{ background: "var(--panel)", border: "1px solid var(--line)", borderRadius: 14, padding: 22, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div>
            <div style={{ color: "var(--muted)", fontSize: 13, marginBottom: 10 }}>Total Submissions</div>
            <div style={{ fontSize: 24, fontWeight: 700 }}>{submissions.length}</div>
          </div>
          <div style={{ width: 42, height: 42, borderRadius: 10, background: "rgba(255,137,4,0.12)", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#ff8904" strokeWidth="2"><path d="M9 11l3 3L22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/></svg>
          </div>
        </div>

        <div style={{ background: "var(--panel)", border: "1px solid var(--line)", borderRadius: 14, padding: 22, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div>
            <div style={{ color: "var(--muted)", fontSize: 13, marginBottom: 10 }}>Pending Review</div>
            <div style={{ fontSize: 24, fontWeight: 700 }}>{pendingSubs.length}</div>
          </div>
          <div style={{ width: 42, height: 42, borderRadius: 10, background: "rgba(124,58,237,0.18)", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#a78bfa" strokeWidth="2"><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></svg>
          </div>
        </div>
      </div>

      {/* Campaign list */}
      <h2 style={{ fontFamily: "var(--font-heading)", fontSize: 18, fontWeight: 600, margin: "0 0 20px" }}>Your Campaigns</h2>

      <div style={{ background: "var(--panel)", border: "1px solid var(--line)", borderRadius: 14, overflow: "hidden" }}>
        {campaigns.length === 0 ? (
          <div style={{ padding: 32, textAlign: "center", color: "var(--muted)" }}>
            No campaigns yet. <Link href="/brand/missions/new" style={{ color: "#00d9a3", textDecoration: "none", fontWeight: 700 }}>Create your first campaign →</Link>
          </div>
        ) : (
          campaigns.map((c, i) => (
            <Link key={c.id} href={`/brand/missions/${c.id}`} style={{ display: "flex", alignItems: "center", gap: 16, padding: "16px 22px", borderBottom: i < campaigns.length - 1 ? "1px solid var(--line)" : "none", textDecoration: "none", color: "inherit" }}>
              <div style={{ width: 40, height: 40, borderRadius: 10, background: "rgba(0,217,163,0.1)", border: "1px solid rgba(0,217,163,0.2)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#00d9a3" strokeWidth="1.8"><path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"/><path d="M19 10v2a7 7 0 0 1-14 0v-2"/></svg>
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 15, fontWeight: 700 }}>{c.title}</div>
                <div style={{ color: "var(--muted)", fontSize: 13, marginTop: 2 }}>{c.brand}</div>
              </div>
              <span style={{ fontSize: 12, color: c.status === "Live" ? "#00d9a3" : "var(--muted)", background: c.status === "Live" ? "rgba(0,217,163,0.1)" : "var(--surface)", border: `1px solid ${c.status === "Live" ? "rgba(0,217,163,0.3)" : "var(--line)"}`, borderRadius: 999, padding: "4px 10px" }}>
                {c.status}
              </span>
              <div style={{ fontSize: 16, fontWeight: 700, color: "#00d9a3", minWidth: 90, textAlign: "right" }}>{c.rewardPool}</div>
            </Link>
          ))
        )}
      </div>
    </AppShell>
  );
}
