import { AppShell } from "@/app/components/AppShell";
import { requireRole } from "@/lib/auth";
import { getPlatformWalletStats, listPlatformPayoutQueue } from "@/lib/repository";

type PayoutState = "processing" | "complete" | "failed";

const STATE_STYLES: Record<PayoutState, React.CSSProperties> = {
  processing: { fontSize: 12, color: "#ff8904", background: "rgba(255,137,4,0.1)", border: "1px solid rgba(255,137,4,0.3)", borderRadius: 999, padding: "3px 10px", whiteSpace: "nowrap" },
  complete: { fontSize: 12, color: "#00d9a3", background: "rgba(0,217,163,0.1)", border: "1px solid rgba(0,217,163,0.3)", borderRadius: 999, padding: "3px 10px", whiteSpace: "nowrap" },
  failed: { fontSize: 12, color: "#ff6b6b", background: "rgba(255,107,107,0.1)", border: "1px solid rgba(255,107,107,0.3)", borderRadius: 999, padding: "3px 10px", whiteSpace: "nowrap" },
};

const headerCell: React.CSSProperties = { fontSize: 12, color: "#6a7282", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.4px" };

export default async function AdminWalletPage() {
  await requireRole("admin");
  const [walletStats, payoutQueue] = await Promise.all([getPlatformWalletStats(), listPlatformPayoutQueue()]);

  return (
    <AppShell>
      <div style={{ marginBottom: 22 }}>
        <h1 style={{ fontFamily: "var(--font-heading)", fontWeight: 600, fontSize: 26, margin: 0 }}>Wallet Ledger &amp; Payouts</h1>
        <p style={{ color: "#99a1af", fontSize: 15, margin: "6px 0 0" }}>Platform-wide financial oversight · month-to-date</p>
      </div>

      {/* Stat cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 20, marginBottom: 24 }}>
        <div style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 14, padding: 20 }}>
          <div style={{ color: "#99a1af", fontSize: 13 }}>Brand deposits (MTD)</div>
          <div style={{ fontSize: 22, fontWeight: 700, marginTop: 8 }}>{walletStats.depositsLabel}</div>
        </div>
        <div style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 14, padding: 20 }}>
          <div style={{ color: "#99a1af", fontSize: 13 }}>Paid to creators (MTD)</div>
          <div style={{ fontSize: 22, fontWeight: 700, marginTop: 8 }}>{walletStats.paidToCreatorsLabel}</div>
        </div>
        <div style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 14, padding: 20 }}>
          <div style={{ color: "#99a1af", fontSize: 13 }}>Float (unspent MTD)</div>
          <div style={{ fontSize: 22, fontWeight: 700, marginTop: 8 }}>{walletStats.floatLabel}</div>
        </div>
      </div>

      {/* Payout queue */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
        <div style={{ fontSize: 16, fontWeight: 700 }}>Creator reward queue</div>
      </div>

      <div style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 14, overflow: "hidden" }}>
        {payoutQueue.length === 0 ? (
          <div style={{ padding: 48, textAlign: "center", color: "#99a1af" }}>
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#99a1af" strokeWidth="1.5" style={{ marginBottom: 12 }}><path d="M20 6 9 17l-5-5"/></svg>
            <div>No pending payouts.</div>
          </div>
        ) : (
          <>
            <div style={{ display: "grid", gridTemplateColumns: "1.6fr 1fr 1.6fr 1.4fr auto", gap: 16, padding: "13px 22px", borderBottom: "1px solid rgba(255,255,255,0.08)" }}>
              <span style={headerCell}>Creator</span>
              <span style={headerCell}>Amount</span>
              <span style={headerCell}>Label</span>
              <span style={headerCell}>Handle</span>
              <span style={headerCell}>State</span>
            </div>
            {payoutQueue.map((p, i) => (
              <div
                key={p.id}
                style={{ display: "grid", gridTemplateColumns: "1.6fr 1fr 1.6fr 1.4fr auto", gap: 16, padding: "15px 22px", borderBottom: i < payoutQueue.length - 1 ? "1px solid rgba(255,255,255,0.05)" : "none", alignItems: "center" }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  <div style={{ width: 34, height: 34, borderRadius: "50%", background: "rgba(0,217,163,0.15)", display: "flex", alignItems: "center", justifyContent: "center", color: "#00d9a3", fontSize: 12, fontWeight: 700, flexShrink: 0 }}>
                    {p.name.slice(0, 2).toUpperCase()}
                  </div>
                  <span style={{ fontSize: 14, color: "#fff" }}>{p.name}</span>
                </div>
                <span style={{ fontSize: 14, fontWeight: 700, color: "#fff" }}>{p.amount}</span>
                <span style={{ fontSize: 13, color: "#d1d5dc" }}>{p.label}</span>
                <span style={{ fontSize: 13, color: "#99a1af" }}>{p.handle}</span>
                <span style={STATE_STYLES[p.state]}>{p.stateLabel}</span>
              </div>
            ))}
          </>
        )}
      </div>
    </AppShell>
  );
}
