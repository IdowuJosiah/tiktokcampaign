import { AppShell } from "@/app/components/AppShell";
import { FormStatus } from "@/app/components/FormStatus";
import { initiateBrandDeposit } from "@/app/actions";
import { requireRole } from "@/lib/auth";
import { getBrandWalletBalance, listBrandWalletTransactions } from "@/lib/repository";

const TYPE_ICON: Record<string, React.ReactNode> = {
  deposit: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#00d9a3" strokeWidth="2.5">
      <path d="M12 19V5M5 12l7 7 7-7" />
    </svg>
  ),
  allocation: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--muted)" strokeWidth="2.5">
      <path d="M12 5v14M5 12l7-7 7 7" />
    </svg>
  ),
  fee: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--muted)" strokeWidth="2.5">
      <path d="M12 5v14M5 12l7-7 7 7" />
    </svg>
  ),
  payout: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--muted)" strokeWidth="2.5">
      <path d="M12 5v14M5 12l7-7 7 7" />
    </svg>
  ),
};

function txIconBg(type: string) {
  if (type === "deposit") return "rgba(0,217,163,0.12)";
  if (type === "fee") return "rgba(0,0,0,0.04)";
  return "rgba(0,0,0,0.06)";
}

const headerCell: React.CSSProperties = {
  fontSize: 12,
  color: "var(--muted)",
  fontWeight: 700,
  textTransform: "uppercase",
  letterSpacing: "0.4px",
};

export default async function BrandWalletPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; success?: string }>;
}) {
  const { error, success } = await searchParams;
  const session = await requireRole("brand");

  const [balance, transactions] = await Promise.all([
    getBrandWalletBalance(session.id),
    listBrandWalletTransactions(session.id),
  ]);

  return (
    <AppShell>
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ fontFamily: "var(--font-heading)", fontWeight: 600, fontSize: 26, margin: 0 }}>
          Wallet
        </h1>
        <p style={{ color: "var(--muted)", fontSize: 15, margin: "6px 0 0" }}>
          Fund your campaigns and track spending
        </p>
      </div>

      <FormStatus error={error} success={success} />

      {/* Balance + deposit */}
      <div style={{ display: "grid", gridTemplateColumns: "1.4fr 1fr", gap: 20, marginBottom: 28 }}>
        <div
          style={{
            background: "linear-gradient(135deg,rgba(0,217,163,0.12),rgba(0,217,163,0.03))",
            border: "1px solid rgba(0,217,163,0.3)",
            borderRadius: 16,
            padding: 28,
          }}
        >
          <div style={{ color: "var(--muted)", fontSize: 14 }}>Confirmed balance</div>
          <div style={{ fontSize: 44, fontWeight: 700, color: "#00d9a3", lineHeight: 1.1, marginTop: 6 }}>
            {balance}
          </div>
          <p style={{ color: "var(--muted)", fontSize: 13, margin: "10px 0 20px", lineHeight: 1.5 }}>
            Campaigns are funded automatically from this balance.
          </p>
          <form action={initiateBrandDeposit} style={{ display: "flex", gap: 10, alignItems: "center" }}>
            <input
              name="amount"
              required
              type="number"
              min="1"
              step="1"
              placeholder="Amount (₦)"
              style={{
                flex: 1,
                height: 44,
                padding: "0 14px",
                fontSize: 15,
                color: "var(--foreground)",
                background: "rgba(0,0,0,0.06)",
                border: "1px solid rgba(0,217,163,0.35)",
                borderRadius: 9,
                outline: "none",
                fontFamily: "inherit",
              }}
            />
            <button
              type="submit"
              style={{
                height: 44,
                padding: "0 22px",
                fontFamily: "inherit",
                fontSize: 15,
                fontWeight: 700,
                color: "#000",
                background: "#00d9a3",
                border: "none",
                borderRadius: 9,
                cursor: "pointer",
                whiteSpace: "nowrap",
              }}
            >
              Deposit funds →
            </button>
          </form>
        </div>

        <div
          style={{
            background: "#fff",
            border: "1px solid var(--line)",
            borderRadius: 16,
            padding: 28,
          }}
        >
          <div style={{ color: "var(--muted)", fontSize: 14, marginBottom: 6 }}>How deposits work</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 14, marginTop: 16 }}>
            {[
              { step: "1", text: "Enter an amount and click Deposit funds" },
              { step: "2", text: "Complete payment on the Paystack checkout (card, transfer, USSD)" },
              { step: "3", text: "Funds appear in your balance instantly" },
              { step: "4", text: "Create a campaign — the pool is deducted automatically" },
            ].map((s) => (
              <div key={s.step} style={{ display: "flex", gap: 12, alignItems: "flex-start" }}>
                <div
                  style={{
                    width: 24,
                    height: 24,
                    borderRadius: "50%",
                    background: "rgba(0,217,163,0.12)",
                    border: "1px solid rgba(0,217,163,0.3)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: 11,
                    fontWeight: 700,
                    color: "#00d9a3",
                    flexShrink: 0,
                  }}
                >
                  {s.step}
                </div>
                <span style={{ fontSize: 13, color: "var(--foreground)", lineHeight: 1.5, paddingTop: 3 }}>{s.text}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Transaction ledger */}
      <div style={{ fontSize: 16, fontWeight: 700, marginBottom: 16 }}>Transaction history</div>
      <div
        style={{
          background: "#fff",
          border: "1px solid var(--line)",
          borderRadius: 14,
          overflow: "hidden",
        }}
      >
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr auto auto",
            gap: 16,
            padding: "13px 22px",
            borderBottom: "1px solid var(--line)",
          }}
        >
          <span style={headerCell}>Description</span>
          <span style={{ ...headerCell, textAlign: "right" }}>Date</span>
          <span style={{ ...headerCell, textAlign: "right", minWidth: 110 }}>Amount</span>
        </div>

        {transactions.length === 0 ? (
          <div style={{ padding: "40px 22px", textAlign: "center", color: "var(--muted)", fontSize: 14 }}>
            No transactions yet. Deposit funds to get started.
          </div>
        ) : (
          transactions.map((tx, i) => (
            <div
              key={tx.id}
              style={{
                display: "grid",
                gridTemplateColumns: "1fr auto auto",
                gap: 16,
                padding: "16px 22px",
                borderBottom: i < transactions.length - 1 ? "1px solid var(--line)" : "none",
                alignItems: "center",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <div
                  style={{
                    width: 36,
                    height: 36,
                    borderRadius: 9,
                    background: txIconBg(tx.type),
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexShrink: 0,
                  }}
                >
                  {TYPE_ICON[tx.type] ?? TYPE_ICON.allocation}
                </div>
                <div>
                  <div style={{ fontSize: 14, color: "var(--foreground)" }}>{tx.label}</div>
                  <div style={{ fontSize: 12, color: "var(--muted)", marginTop: 2, textTransform: "capitalize" }}>
                    {tx.type}
                  </div>
                </div>
              </div>
              <span style={{ fontSize: 13, color: "var(--muted)", whiteSpace: "nowrap" }}>{tx.date}</span>
              <span
                style={{
                  fontSize: 14,
                  fontWeight: 700,
                  color: tx.positive ? "#00d9a3" : "var(--foreground)",
                  minWidth: 110,
                  textAlign: "right",
                  whiteSpace: "nowrap",
                }}
              >
                {tx.amount}
              </span>
            </div>
          ))
        )}
      </div>
    </AppShell>
  );
}
