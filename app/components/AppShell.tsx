import Link from "next/link";
import { logOut } from "@/app/actions";
import { getAppSession } from "@/lib/auth";

export async function AppShell({ children }: { children: React.ReactNode }) {
  const session = await getAppSession();
  const dashboardHref =
    session?.role === "brand"
      ? "/dashboard/brand"
      : session?.role === "creator"
        ? "/dashboard/creator"
        : session?.role === "admin"
          ? "/admin"
          : "/";
  const navItems: Array<{ href: string; label: string; icon?: string }> = session
    ? [
        { href: dashboardHref, label: "Dashboard", icon: "▦" },
        ...(session.role === "brand"
          ? [
              { href: "/brand/missions", label: "Campaigns", icon: "◫" },
              { href: "/brand/missions/new", label: "Create Campaign", icon: "+" },
            ]
          : []),
        ...(session.role === "creator"
          ? [
              { href: "/campaigns", label: "Browse Campaigns", icon: "⌕" },
              { href: "/dashboard/creator", label: "My Tasks", icon: "☑" },
              { href: "/creator/wallet", label: "Earnings", icon: "↗" },
              { href: "/creator/wallet", label: "Wallet", icon: "▣" },
              { href: "/creator/profile", label: "Settings", icon: "⚙" },
            ]
          : []),
        ...(session.role === "admin"
          ? [
              { href: "/admin/campaigns", label: "Campaigns", icon: "◫" },
              { href: "/admin", label: "Operations", icon: "☷" },
            ]
          : []),
      ]
    : [
        { href: "/", label: "Home" },
        { href: "/campaigns", label: "Campaigns" },
      ];

  if (session) {
    const initials = session.email.slice(0, 2).toUpperCase();

    return (
      <main className="app-frame">
        <aside className="sidebar">
          <Link className="sidebar-brand" href="/">
            <span>CL</span>
            <div>
              <strong>CreatorLink</strong>
              <small>{session.role === "creator" ? "Creator Portal" : session.role === "brand" ? "Brand Portal" : "Admin Portal"}</small>
            </div>
          </Link>

          <nav className="side-nav" aria-label="Product sections">
            {navItems.map((item, index) => (
              <Link className={index === 0 ? "side-nav-link active" : "side-nav-link"} href={item.href} key={`${item.href}-${item.label}`}>
                <span>{item.icon}</span>
                {item.label}
              </Link>
            ))}
          </nav>

          <div className="sidebar-footer">
            <Link className="side-nav-link compact" href={session.role === "creator" ? "/creator/profile" : dashboardHref}>
              <span>?</span>
              Help & Support
            </Link>
            <form action={logOut}>
              <button className="side-nav-link compact" type="submit">
                <span>↵</span>
                Logout
              </button>
            </form>
          </div>
        </aside>

        <section className="app-content">
          <header className="dashboard-topbar">
            <label className="search-shell">
              <span>⌕</span>
              <input placeholder="Search campaigns..." />
            </label>
            <div className="topbar-user">
              <button className="icon-button" type="button">◦</button>
              <div className="avatar">{initials}</div>
              <div>
                <strong>{session.role === "admin" ? "Admin" : session.role === "brand" ? "Brand account" : "Creator Demo"}</strong>
                <small>{session.email}</small>
              </div>
            </div>
          </header>
          <section className="workspace dashboard-workspace">{children}</section>
        </section>
      </main>
    );
  }

  return (
    <main className="app-shell">
      <header className="top-nav">
        <Link className="logo-block" href="/">
          <strong>CreatorLink</strong>
          <small>Creator campaigns</small>
        </Link>

        <nav aria-label="Product sections">
          {navItems.map((item) => (
            <Link href={item.href} key={item.href}>
              {item.label}
            </Link>
          ))}
          <Link href="/terms">Terms</Link>
          <Link href="/privacy">Privacy</Link>
          {session ? (
            <form action={logOut}>
              <button className="nav-button" type="submit">Logout</button>
            </form>
          ) : (
            <Link href="/login">Login</Link>
          )}
        </nav>

        <span className="phase-pill">Phase 1</span>
      </header>

      <section className="workspace">{children}</section>
    </main>
  );
}
