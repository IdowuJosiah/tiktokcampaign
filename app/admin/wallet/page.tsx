import { AppShell } from "@/app/components/AppShell";
import { requireRole } from "@/lib/auth";
import { getPlatformWalletStats, listPlatformPayoutQueue, listWithdrawalRequests } from "@/lib/repository";
import { markWithdrawalPaid } from "@/app/actions";

type PayoutState = "processing" | "complete" | "failed";

const STATE_STYLES: Record<PayoutState, React.CSSProperties> = {
  processing: { fontSize: 12, color: "#ff8904", background: "rgba(255,137,4,0.1)", border: "1px solid rgba(255,137,4,0.3)", borderRadius: 999, padding: "3px 10px", whiteSpace: "nowrap" },
  complete: { fontSize: 12, color: "#00d9a3", background: "rgba(0,217,163,0.1)", border: "1px solid rgba(0,217,163,0.3)", borderRadius: 999, padding: "3px 10px", whiteSpace: "nowrap" },
  failed: { fontSize: 12, color: "#ff6b6b", background: "rgba(255,107,107,0.1)", border: "1px solid rgba(255,107,107,0.3)", borderRadius: 999, padding: "3px 10px", whiteSpace: "nowrap" },
};

const headerCell: React.CSSProperties = { fontSize: 12, color: "var(--muted)", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.4px" };

export default async function AdminWalletPage() {
  await requireRole("admin");
  const [walletStats, payoutQueue, withdrawals] = await Promise.all([
    getPlatformWalletStats(),
    listPlatformPayoutQueue(),
    listWithdrawalRequests(),
  ]);

  return (
    <AppShell>
      <div style={{ marginBottom: 22 }}>
        <h1 style={{ fontFamily: "var(--font-heading)", fontWeight: 600, fontSize: 26, margin: 0 }}>Wallet Ledger &amp; Payouts</h1>
        <p style={{ color: "var(--muted)", fontSize: 15, margin: "6px 0 0" }}>Platform-wide financial oversight · month-to-date</p>
      </div>

      {/* Stat cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 20, marginBottom: 24 }}>
        <div style={{ background: "#fff", border: "1px solid var(--line)", borderRadius: 14, padding: 20 }}>
          <div style={{ color: "var(--muted)", fontSize: 13 }}>Brand deposits (MTD)</div>
          <div style={{ fontSize: 22, fontWeight: 700, marginTop: 8 }}>{walletStats.depositsLabel}</div>
        </div>
        <div style={{ background: "#fff", border: "1px solid var(--line)", borderRadius: 14, padding: 20 }}>
          <div style={{ color: "var(--muted)", fontSize: 13 }}>Paid to creators (MTD)</div>
          <div style={{ fontSize: 22, fontWeight: 700, marginTop: 8 }}>{walletStats.paidToCreatorsLabel}</div>
        </div>
        <div style={{ background: "#fff", border: "1px solid var(--line)", borderRadius: 14, padding: 20 }}>
          <div style={{ color: "var(--muted)", fontSize: 13 }}>Float (unspent balance)</div>
          <div style={{ fontSize: 22, fontWeight: 700, marginTop: 8 }}>{walletStats.floatLabel}</div>
        </div>
      </div>

      {/* Withdrawal requests */}
      {withdrawals.length > 0 && (
        <div style={{ marginBottom: 28 }}>
          <div style={{ fontSize: 16, fontWeight: 700, marginBottom: 14 }}>Withdrawal requests</div>
          <div style={{ background: "rgba(255,137,4,0.04)", border: "1px solid rgba(255,137,4,0.25)", borderRadius: 14, overflow: "hidden" }}>
            <div style={{ display: "grid", gridTemplateColumns: "1.4fr 0.8fr 2fr auto", gap: 16, padding: "13px 22px", borderBottom: "1px solid var(--line)" }}>
              <span style={headerCell}>Creator</span>
              <span style={headerCell}>Amount</span>
              <span style={headerCell}>Bank details</span>
              <span style={headerCell}>Action</span>
            </div>
            {withdrawals.map((w, i) => (
              <div
                key={w.creatorId}
                style={{ display: "grid", gridTemplateColumns: "1.4fr 0.8fr 2fr auto", gap: 16, padding: "15px 22px", borderBottom: i < withdrawals.length - 1 ? "1px solid var(--line)" : "none", alignItems: "center" }}
              >
                <div>
                  <div style={{ fontSize: 14, color: "var(--foreground)" }}>{w.name}</div>
                  <div style={{ fontSize: 12, color: "var(--muted)" }}>{w.handle}</div>
                </div>
                <span style={{ fontSize: 15, fontWeight: 700, color: "#ff8904" }}>{w.amountLabel}</span>
                <div style={{ fontSize: 13, color: "var(--foreground)" }}>
                  {w.accountName} · {w.accountNumber}
                  <div style={{ fontSize: 12, color: "var(--muted)" }}>{w.bankName}</div>
                </div>
                <form action={markWithdrawalPaid}>
                  <input type="hidden" name="creatorId" value={w.creatorId} />
                  <button type="submit" style={{ height: 38, padding: "0 16px", fontFamily: "inherit", fontSize: 14, fontWeight: 700, color: "#000", background: "#00d9a3", border: "none", borderRadius: 8, cursor: "pointer", whiteSpace: "nowrap" }}>
                    Mark as paid
                  </button>
                </form>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Payout queue */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
        <div style={{ fontSize: 16, fontWeight: 700 }}>Creator reward queue</div>
      </div>

      <div style={{ background: "#fff", border: "1px solid var(--line)", borderRadius: 14, overflow: "hidden" }}>
        {payoutQueue.length === 0 ? (
          <div style={{ padding: 48, textAlign: "center", color: "var(--muted)" }}>
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="var(--muted)" strokeWidth="1.5" style={{ marginBottom: 12 }}><path d="M20 6 9 17l-5-5"/></svg>
            <div>No pending payouts.</div>
          </div>
        ) : (
          <>
            <div style={{ display: "grid", gridTemplateColumns: "1.6fr 1fr 1.6fr 1.4fr auto", gap: 16, padding: "13px 22px", borderBottom: "1px solid var(--line)" }}>
              <span style={headerCell}>Creator</span>
              <span style={headerCell}>Amount</span>
              <span style={headerCell}>Label</span>
              <span style={headerCell}>Handle</span>
              <span style={headerCell}>State</span>
            </div>
            {payoutQueue.map((p, i) => (
              <div
                key={p.id}
                style={{ display: "grid", gridTemplateColumns: "1.6fr 1fr 1.6fr 1.4fr auto", gap: 16, padding: "15px 22px", borderBottom: i < payoutQueue.length - 1 ? "1px solid var(--line)" : "none", alignItems: "center" }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  <div style={{ width: 34, height: 34, borderRadius: "50%", background: "rgba(0,217,163,0.15)", display: "flex", alignItems: "center", justifyContent: "center", color: "#00d9a3", fontSize: 12, fontWeight: 700, flexShrink: 0 }}>
                    {p.name.slice(0, 2).toUpperCase()}
                  </div>
                  <span style={{ fontSize: 14, color: "var(--foreground)" }}>{p.name}</span>
                </div>
                <span style={{ fontSize: 14, fontWeight: 700, color: "var(--foreground)" }}>{p.amount}</span>
                <span style={{ fontSize: 13, color: "var(--foreground)" }}>{p.label}</span>
                <span style={{ fontSize: 13, color: "var(--muted)" }}>{p.handle}</span>
                <span style={STATE_STYLES[p.state]}>{p.stateLabel}</span>
              </div>
            ))}
          </>
        )}
      </div>
    </AppShell>
  );
}
