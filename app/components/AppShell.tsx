import Link from "next/link";
import { logOut } from "@/app/actions";
import { getAppSession } from "@/lib/auth";

export async function AppShell({ children }: { children: React.ReactNode }) {
  const session = await getAppSession();
  const navItems = session
    ? [
        { href: "/", label: "Overview" },
        ...(session.role === "brand"
          ? [
              { href: "/brand/missions", label: "Missions" },
              { href: "/brand/review", label: "Review" },
            ]
          : []),
        ...(session.role === "creator"
          ? [
              { href: "/creator/missions", label: "Missions" },
              { href: "/creator/profile", label: "Profile" },
              { href: "/creator/submit", label: "Submit" },
              { href: "/creator/wallet", label: "Wallet" },
            ]
          : []),
        ...(session.role === "admin" ? [{ href: "/internal/ops/submissions", label: "Ops" }] : []),
      ]
    : [
        { href: "/", label: "Overview" },
        { href: "/creator/missions", label: "Missions" },
      ];

  return (
    <main className="app-shell">
      <header className="top-nav">
        <Link className="logo-block" href="/">
          <strong>VoiceRank</strong>
          <small>TikTok missions</small>
        </Link>

        <nav aria-label="Product sections">
          {navItems.map((item) => (
            <Link href={item.href} key={item.href}>
              {item.label}
            </Link>
          ))}
          {session ? (
            <form action={logOut}>
              <button className="nav-button" type="submit">Logout</button>
            </form>
          ) : (
            <Link href="/login">Login</Link>
          )}
        </nav>

        <span className="phase-pill">{session ? session.role : "Phase 1"}</span>
      </header>

      <section className="workspace">{children}</section>
    </main>
  );
}
