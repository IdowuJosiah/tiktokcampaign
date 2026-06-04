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
      <header className="page-header">
        <div>
          <p className="eyebrow">Creator</p>
          <h1>Wallet</h1>
          <p>Track pending rewards, available balance, and payout history.</p>
        </div>
        <button className="primary-button" type="button">Request payout</button>
      </header>

      <section className="stats-grid three" aria-label="Wallet metrics">
        <article>
          <span>Available</span>
          <strong>{wallet.availableLabel}</strong>
          <small>Ready for payout</small>
        </article>
        <article>
          <span>Pending</span>
          <strong>{wallet.pendingLabel}</strong>
          <small>In review window</small>
        </article>
        <article>
          <span>Paid out</span>
          <strong>{wallet.paidLabel}</strong>
          <small>Lifetime</small>
        </article>
      </section>

      <section className="panel">
        <div className="transaction-list">
          {walletTransactions.map((transaction) => (
            <article className="transaction-row" key={transaction.id}>
              <div>
                <strong>{transaction.label}</strong>
                <span>{transaction.status}</span>
              </div>
              <b>{transaction.amount}</b>
            </article>
          ))}
        </div>
      </section>
    </AppShell>
  );
}
