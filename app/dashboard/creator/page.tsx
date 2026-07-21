import Link from "next/link";
import { AppShell } from "@/app/components/AppShell";
import { FormStatus } from "@/app/components/FormStatus";
import { requireRole } from "@/lib/auth";
import { getCreatorWalletSummary, listCreatorSubmissions, listLiveMissions } from "@/lib/repository";

export default async function CreatorDashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; success?: string }>;
}) {
  const { error, success } = await searchParams;
  const session = await requireRole("creator");
  const [campaigns, submissions, wallet] = await Promise.all([
    listLiveMissions(),
    listCreatorSubmissions(session.id),
    getCreatorWalletSummary(session.id),
  ]);

  const activeCount = submissions.filter((s) => s.status === "Pending" || s.status === "Approved").length;

  return (
    <AppShell>
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ fontFamily: "var(--font-heading)", fontWeight: 600, fontSize: 26, margin: 0 }}>Creator Dashboard</h1>
        <p style={{ color: "var(--muted)", fontSize: 15, margin: "6px 0 0" }}>Find campaigns and track your earnings</p>
      </div>

      <FormStatus error={error} success={success} />

      {/* Stat cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 20, marginBottom: 28 }}>
        <div style={{ background: "var(--panel)", border: "1px solid var(--line)", borderRadius: 14, padding: 22, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div>
            <div style={{ color: "var(--muted)", fontSize: 13, marginBottom: 10 }}>Wallet Balance</div>
            <div style={{ fontSize: 24, fontWeight: 700 }}>{wallet.availableLabel}</div>
            <div style={{ color: "#00d9a3", fontSize: 12, marginTop: 4 }}>{wallet.pendingLabel} pending</div>
          </div>
          <div style={{ width: 42, height: 42, borderRadius: 10, background: "rgba(0,217,163,0.12)", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#00d9a3" strokeWidth="2"><rect x="2" y="5" width="20" height="14" rx="2"/><path d="M16 12h4"/></svg>
          </div>
        </div>

        <div style={{ background: "var(--panel)", border: "1px solid var(--line)", borderRadius: 14, padding: 22, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div>
            <div style={{ color: "var(--muted)", fontSize: 13, marginBottom: 10 }}>Active Submissions</div>
            <div style={{ fontSize: 24, fontWeight: 700 }}>{activeCount}</div>
          </div>
          <div style={{ width: 42, height: 42, borderRadius: 10, background: "rgba(255,137,4,0.12)", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#ff8904" strokeWidth="2"><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></svg>
          </div>
        </div>

        <div style={{ background: "var(--panel)", border: "1px solid var(--line)", borderRadius: 14, padding: 22, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div>
            <div style={{ color: "var(--muted)", fontSize: 13, marginBottom: 10 }}>Total Earned</div>
            <div style={{ fontSize: 24, fontWeight: 700 }}>{wallet.paidLabel}</div>
          </div>
          <div style={{ width: 42, height: 42, borderRadius: 10, background: "rgba(55,113,200,0.15)", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#5b8cff" strokeWidth="2"><path d="M22 7l-8.5 8.5-5-5L2 17"/><path d="M16 7h6v6"/></svg>
          </div>
        </div>

        <div style={{ background: "var(--panel)", border: "1px solid var(--line)", borderRadius: 14, padding: 22, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div>
            <div style={{ color: "var(--muted)", fontSize: 13, marginBottom: 10 }}>Open Campaigns</div>
            <div style={{ fontSize: 24, fontWeight: 700 }}>{campaigns.length}</div>
          </div>
          <div style={{ width: 42, height: 42, borderRadius: 10, background: "rgba(124,58,237,0.18)", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#a78bfa" strokeWidth="2"><circle cx="12" cy="8" r="6"/><path d="M8.2 13.5 7 22l5-3 5 3-1.2-8.5"/></svg>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display: "inline-flex", gap: 4, padding: 4, background: "var(--surface)", borderRadius: 12, marginBottom: 22 }}>
        <div style={{ padding: "7px 16px", borderRadius: 9, background: "#00d9a3", color: "#000", fontSize: 14, fontWeight: 700 }}>Available Campaigns</div>
        <Link href="/creator/submissions" style={{ padding: "7px 16px", borderRadius: 9, color: "var(--foreground)", fontSize: 14, textDecoration: "none" }}>My Submissions</Link>
      </div>

      {/* Campaign list */}
      <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        {campaigns.length === 0 ? (
          <div style={{ padding: 32, textAlign: "center", color: "var(--muted)", background: "var(--panel)", border: "1px solid var(--line)", borderRadius: 14 }}>
            No campaigns available right now. Check back soon.
          </div>
        ) : (
          campaigns.map((c) => (
            <div key={c.id} style={{ background: "var(--panel)", border: "1px solid var(--line)", borderRadius: 14, padding: 24, display: "flex", gap: 24 }}>
              <div style={{ width: 64, height: 64, flexShrink: 0, borderRadius: 14, background: "rgba(0,217,163,0.1)", border: "1px solid rgba(0,217,163,0.3)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#00d9a3" strokeWidth="1.8"><path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"/><path d="M19 10v2a7 7 0 0 1-14 0v-2"/></svg>
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                  <div>
                    <div style={{ fontSize: 16, fontWeight: 700 }}>{c.title}</div>
                    <div style={{ color: "var(--muted)", fontSize: 14, marginTop: 3 }}>{c.brand}</div>
                  </div>
                  <div style={{ textAlign: "right" }}>
                    <div style={{ fontSize: 28, fontWeight: 700, color: "#00d9a3", lineHeight: 1 }}>{c.rewardPool}</div>
                    <div style={{ color: "var(--muted)", fontSize: 13, marginTop: 2 }}>reward pool</div>
                  </div>
                </div>
                <p style={{ color: "var(--foreground)", fontSize: 14, margin: "14px 0 0" }}>{c.brief}</p>
                <div style={{ display: "flex", gap: 8, marginTop: 14, flexWrap: "wrap" }}>
                  {[c.requiredHashtag, c.requiredSound].filter(Boolean).map((tag) => (
                    <span key={tag} style={{ fontSize: 12, color: "var(--muted)", background: "var(--surface)", border: "1px solid var(--line)", borderRadius: 6, padding: "4px 9px" }}>{tag}</span>
                  ))}
                </div>
                <div style={{ marginTop: 16 }}>
                  <Link href={`/campaigns/${c.id}`} style={{ height: 38, padding: "0 18px", fontFamily: "inherit", fontSize: 14, fontWeight: 700, color: "#000", background: "#00d9a3", border: "none", borderRadius: 8, cursor: "pointer", display: "inline-flex", alignItems: "center", gap: 8, textDecoration: "none" }}>
                    View brief &amp; apply →
                  </Link>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </AppShell>
  );
}
