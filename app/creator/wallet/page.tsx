import { AppShell } from "@/app/components/AppShell";
import { listWalletTransactions } from "@/lib/repository";

export default async function CreatorWalletPage() {
  const walletTransactions = await listWalletTransactions();

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
          <strong>$240</strong>
          <small>Ready for payout</small>
        </article>
        <article>
          <span>Pending</span>
          <strong>$90</strong>
          <small>In review window</small>
        </article>
        <article>
          <span>Paid out</span>
          <strong>$150</strong>
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
