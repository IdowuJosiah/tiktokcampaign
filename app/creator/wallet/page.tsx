import { AppShell } from "@/app/components/AppShell";
import { requireRole } from "@/lib/auth";
import { getCreatorWalletSummary, listCreatorWalletTransactions } from "@/lib/repository";

export default async function CreatorWalletPage() {
  const session = await requireRole("creator");
  const [walletTransactions, wallet] = await Promise.all([
    listCreatorWalletTransactions(session.id),
    getCreatorWalletSummary(session.id),
  ]);

  return (
    <AppShell>
      <div style={{ maxWidth: 980 }}>
        <div style={{ marginBottom: 24 }}>
          <h1 style={{ fontFamily: "var(--font-heading)", fontWeight: 600, fontSize: 26, margin: 0 }}>Wallet</h1>
          <p style={{ color: "#99a1af", fontSize: 15, margin: "6px 0 0" }}>Hold your earnings and cash out</p>
        </div>

        {/* Balance cards */}
        <div style={{ display: "grid", gridTemplateColumns: "1.3fr 1fr", gap: 20, marginBottom: 24 }}>
          <div style={{ background: "linear-gradient(135deg,rgba(0,217,163,0.12),rgba(0,217,163,0.03))", border: "1px solid rgba(0,217,163,0.3)", borderRadius: 16, padding: 26 }}>
            <div style={{ color: "#99a1af", fontSize: 14 }}>Confirmed balance</div>
            <div style={{ fontSize: 44, fontWeight: 700, color: "#00d9a3", lineHeight: 1.1, marginTop: 6 }}>{wallet.availableLabel}</div>
            {wallet.available > 0 ? (
              <a
                href={`mailto:support@voicerank.vercel.app?subject=${encodeURIComponent("Withdrawal request")}&body=${encodeURIComponent(`Hi VoiceRank team,\n\nI'd like to withdraw my confirmed balance of ${wallet.availableLabel}.\n\nMy account: ${session.email}`)}`}
                style={{ marginTop: 18, height: 44, padding: "0 24px", fontFamily: "inherit", fontSize: 15, fontWeight: 700, color: "#000", background: "#00d9a3", border: "none", borderRadius: 8, cursor: "pointer", display: "inline-flex", alignItems: "center", textDecoration: "none" }}
              >
                Request withdrawal
              </a>
            ) : (
              <div style={{ marginTop: 18, fontSize: 13, color: "#99a1af" }}>Approved rewards will appear here as your confirmed balance.</div>
            )}
          </div>
          <div style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 16, padding: 26, display: "flex", flexDirection: "column", justifyContent: "center" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, color: "#99a1af", fontSize: 14 }}>
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#99a1af" strokeWidth="2"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
              Pending balance
            </div>
            <div style={{ fontSize: 32, fontWeight: 700, marginTop: 6 }}>{wallet.pendingLabel}</div>
            <div style={{ color: "#ff8904", fontSize: 13, marginTop: 6 }}>In review window</div>
          </div>
        </div>

        {/* Lifetime paid */}
        <div style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 14, padding: "16px 22px", marginBottom: 24, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ color: "#99a1af", fontSize: 14 }}>Lifetime paid out</div>
          <div style={{ fontSize: 22, fontWeight: 700 }}>{wallet.paidLabel}</div>
        </div>

        {/* Transaction history */}
        <div style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 14, overflow: "hidden" }}>
          <div style={{ padding: "18px 22px", borderBottom: "1px solid rgba(255,255,255,0.08)", fontSize: 15, fontWeight: 700 }}>Transaction history</div>
          {walletTransactions.length === 0 ? (
            <div style={{ padding: 32, textAlign: "center", color: "#99a1af" }}>No transactions yet.</div>
          ) : (
            walletTransactions.map((t) => (
              <div key={t.id} style={{ display: "flex", alignItems: "center", gap: 16, padding: "16px 22px", borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
                <div style={{ width: 40, height: 40, borderRadius: 10, background: "rgba(0,217,163,0.1)", border: "1px solid rgba(0,217,163,0.2)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#00d9a3" strokeWidth="2"><path d="M22 7l-8.5 8.5-5-5L2 17"/></svg>
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 14, color: "#fff" }}>{t.label}</div>
                  <div style={{ fontSize: 13, color: "#99a1af", marginTop: 2 }}>{t.status}</div>
                </div>
                <div style={{ fontSize: 16, fontWeight: 700, color: "#00d9a3", minWidth: 100, textAlign: "right" }}>{t.amount}</div>
              </div>
            ))
          )}
        </div>

        <div style={{ marginTop: 24, padding: "16px 20px", background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 12 }}>
          <p style={{ fontSize: 13, color: "#99a1af", margin: 0 }}>Withdrawal requests are handled manually by the VoiceRank team and paid out to the bank account on your profile. Minimum withdrawal: ₦2,000.</p>
        </div>
      </div>
    </AppShell>
  );
}
