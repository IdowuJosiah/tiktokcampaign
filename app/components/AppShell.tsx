import Link from "next/link";

const navItems = [
  { href: "/", label: "Overview" },
  { href: "/brand/missions", label: "Brand missions" },
  { href: "/brand/review", label: "Review queue" },
  { href: "/creator/missions", label: "Creator missions" },
  { href: "/creator/submit", label: "Submit video" },
  { href: "/creator/wallet", label: "Wallet" },
  { href: "/admin/submissions", label: "Admin" },
];

export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <main className="app-shell">
      <aside className="sidebar">
        <Link className="logo-block" href="/">
          <span>VR</span>
          <div>
            <strong>VoiceRank</strong>
            <small>TikTok missions</small>
          </div>
        </Link>

        <nav aria-label="Product sections">
          {navItems.map((item) => (
            <Link href={item.href} key={item.href}>
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="side-note">
          <small>Phase 1</small>
          <strong>Manual verification</strong>
          <p>Creators submit TikTok links. Brands review compliance, metrics, and rewards before payout.</p>
        </div>
      </aside>

      <section className="workspace">{children}</section>
    </main>
  );
}
