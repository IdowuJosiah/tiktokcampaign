import { AppShell } from "@/app/components/AppShell";
import { requireRole } from "@/lib/auth";

type PayoutState = "processing" | "complete" | "failed";

const STATE_STYLES: Record<PayoutState, React.CSSProperties> = {
  processing: { fontSize: 12, color: "#ff8904", background: "rgba(255,137,4,0.1)", border: "1px solid rgba(255,137,4,0.3)", borderRadius: 999, padding: "3px 10px", whiteSpace: "nowrap" },
  complete: { fontSize: 12, color: "#00d9a3", background: "rgba(0,217,163,0.1)", border: "1px solid rgba(0,217,163,0.3)", borderRadius: 999, padding: "3px 10px", whiteSpace: "nowrap" },
  failed: { fontSize: 12, color: "#ff6b6b", background: "rgba(255,107,107,0.1)", border: "1px solid rgba(255,107,107,0.3)", borderRadius: 999, padding: "3px 10px", whiteSpace: "nowrap" },
};

const PAYOUT_QUEUE = [
  { initials: "KE", handle: "@kemi.vibes", amount: "₦30,000", method: "Bank · GTBank •••• 4471", ref: "TRF_9f2a · 2m ago", state: "processing" as PayoutState, stateLabel: "Processing" },
  { initials: "BL", handle: "@bella.live", amount: "₦12,500", method: "Gift card · Jumia", ref: "GC_44c1 · 8m ago", state: "complete" as PayoutState, stateLabel: "Complete" },
  { initials: "CH", handle: "@chidi.clips", amount: "₦8,000", method: "Bank · Access •••• 0192", ref: "TRF_7b3e · failed", state: "failed" as PayoutState, stateLabel: "Failed — retry" },
];

const headerCell: React.CSSProperties = { fontSize: 12, color: "#6a7282", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.4px" };

export default async function AdminWalletPage() {
  await requireRole("admin");

  return (
    <AppShell>
      <div style={{ marginBottom: 22 }}>
        <h1 style={{ fontFamily: "var(--font-heading)", fontWeight: 600, fontSize: 26, margin: 0 }}>Wallet Ledger &amp; Payouts</h1>
        <p style={{ color: "#99a1af", fontSize: 15, margin: "6px 0 0" }}>Platform-wide financial oversight</p>
      </div>

      {/* Stat cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 20, marginBottom: 24 }}>
        <div style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 14, padding: 20 }}>
          <div style={{ color: "#99a1af", fontSize: 13 }}>Brand deposits (MTD)</div>
          <div style={{ fontSize: 22, fontWeight: 700, marginTop: 8 }}>₦41.2M</div>
        </div>
        <div style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 14, padding: 20 }}>
          <div style={{ color: "#99a1af", fontSize: 13 }}>Paid to creators (MTD)</div>
          <div style={{ fontSize: 22, fontWeight: 700, marginTop: 8 }}>₦26.8M</div>
        </div>
        <div style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 14, padding: 20 }}>
          <div style={{ color: "#99a1af", fontSize: 13 }}>Platform fees (MTD)</div>
          <div style={{ fontSize: 22, fontWeight: 700, marginTop: 8, color: "#00d9a3" }}>₦8.2M</div>
        </div>
        <div style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 14, padding: 20 }}>
          <div style={{ color: "#99a1af", fontSize: 13 }}>Float (unspent)</div>
          <div style={{ fontSize: 22, fontWeight: 700, marginTop: 8 }}>₦14.4M</div>
        </div>
      </div>

      {/* Payout queue */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
        <div style={{ fontSize: 16, fontWeight: 700 }}>Payout queue</div>
        <button
          style={{ height: 36, padding: "0 14px", fontFamily: "inherit", fontSize: 13, fontWeight: 700, color: "#ff8904", background: "rgba(255,137,4,0.1)", border: "1px solid rgba(255,137,4,0.3)", borderRadius: 8, cursor: "pointer" }}
        >
          Retry all failed
        </button>
      </div>

      <div style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 14, overflow: "hidden" }}>
        <div style={{ display: "grid", gridTemplateColumns: "1.6fr 1fr 1.6fr 1.4fr auto", gap: 16, padding: "13px 22px", borderBottom: "1px solid rgba(255,255,255,0.08)" }}>
          <span style={headerCell}>Creator</span>
          <span style={headerCell}>Amount</span>
          <span style={headerCell}>Method</span>
          <span style={headerCell}>Reference</span>
          <span style={headerCell}>State</span>
        </div>
        {PAYOUT_QUEUE.map((p, i) => (
          <div
            key={p.ref}
            style={{ display: "grid", gridTemplateColumns: "1.6fr 1fr 1.6fr 1.4fr auto", gap: 16, padding: "15px 22px", borderBottom: i < PAYOUT_QUEUE.length - 1 ? "1px solid rgba(255,255,255,0.05)" : "none", alignItems: "center" }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <div style={{ width: 34, height: 34, borderRadius: "50%", background: "rgba(0,217,163,0.15)", display: "flex", alignItems: "center", justifyContent: "center", color: "#00d9a3", fontSize: 12, fontWeight: 700, flexShrink: 0 }}>
                {p.initials}
              </div>
              <span style={{ fontSize: 14, color: "#fff" }}>{p.handle}</span>
            </div>
            <span style={{ fontSize: 14, fontWeight: 700, color: "#fff" }}>{p.amount}</span>
            <span style={{ fontSize: 13, color: "#d1d5dc" }}>{p.method}</span>
            <span style={{ fontSize: 13, color: "#99a1af" }}>{p.ref}</span>
            <span style={STATE_STYLES[p.state]}>{p.stateLabel}</span>
          </div>
        ))}
      </div>
    </AppShell>
  );
}
