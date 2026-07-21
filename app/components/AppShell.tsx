import Link from "next/link";
import { logOut } from "@/app/actions";
import { getAppSession } from "@/lib/auth";

const MicIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#00d9a3" strokeWidth="2" strokeLinecap="round"><path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"/><path d="M19 10v2a7 7 0 0 1-14 0v-2"/><line x1="12" y1="19" x2="12" y2="23"/></svg>
);

const icons: Record<string, React.ReactNode> = {
  dashboard: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="7" height="9" rx="1"/><rect x="14" y="3" width="7" height="5" rx="1"/><rect x="14" y="12" width="7" height="9" rx="1"/><rect x="3" y="16" width="7" height="5" rx="1"/></svg>,
  search: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="7"/><path d="m21 21-4.3-4.3"/></svg>,
  submit: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 11l3 3L22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/></svg>,
  wallet: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="2" y="5" width="20" height="14" rx="2"/><path d="M16 12h4"/><path d="M2 10h20"/></svg>,
  profile: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="8" r="4"/><path d="M4 21v-1a6 6 0 0 1 12 0v1"/></svg>,
  campaign: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 0 0-2.91 0z"/><path d="M12 15l-3-3a22 22 0 0 1 2-3.95A12.88 12.88 0 0 1 22 2c0 2.72-.78 7.5-6 11a22.35 22.35 0 0 1-4 2z"/></svg>,
  analytics: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>,
  review: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 11l3 3L22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/></svg>,
  ops: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/></svg>,
  help: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><path d="M9.1 9a3 3 0 0 1 5.8 1c0 2-3 3-3 3"/><line x1="12" y1="17" x2="12" y2="17"/></svg>,
  logout: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>,
  bell: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--muted)" strokeWidth="2"><path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9"/><path d="M10.3 21a1.94 1.94 0 0 0 3.4 0"/></svg>,
  searchbar: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--muted)" strokeWidth="2"><circle cx="11" cy="11" r="7"/><path d="m21 21-4.3-4.3"/></svg>,
};

function NavItem({ href, icon, label, active }: { href: string; icon: React.ReactNode; label: string; active?: boolean }) {
  const style: React.CSSProperties = {
    display: "flex",
    alignItems: "center",
    gap: 12,
    padding: "0 14px",
    height: 46,
    borderRadius: 10,
    color: active ? "#00d9a3" : "var(--muted)",
    background: active ? "rgba(0,217,163,0.08)" : "transparent",
    border: `1px solid ${active ? "rgba(0,217,163,0.3)" : "transparent"}`,
    textDecoration: "none",
    fontSize: 15,
    cursor: "pointer",
  };
  return (
    <Link href={href} style={style}>
      {icon}
      <span style={{ color: "inherit" }}>{label}</span>
    </Link>
  );
}

export async function AppShell({ children }: { children: React.ReactNode }) {
  const session = await getAppSession();

  if (!session) {
    return (
      <main style={{ minHeight: "100vh", background: "var(--background)" }}>
        {children}
      </main>
    );
  }

  const initials = session.email.slice(0, 2).toUpperCase();

  const portalLabel =
    session.role === "creator" ? "Creator Portal"
    : session.role === "brand" ? "Brand Portal"
    : "Admin Console";

  const creatorNav = [
    { href: "/dashboard/creator", icon: icons.dashboard, label: "Dashboard" },
    { href: "/campaigns", icon: icons.search, label: "Browse Campaigns" },
    { href: "/creator/submissions", icon: icons.submit, label: "My Submissions" },
    { href: "/creator/wallet", icon: icons.wallet, label: "Wallet" },
    { href: "/creator/profile", icon: icons.profile, label: "Profile & Setup" },
  ];

  const brandNav = [
    { href: "/dashboard/brand", icon: icons.dashboard, label: "Dashboard" },
    { href: "/brand/missions/new", icon: icons.campaign, label: "Create Campaign" },
    { href: "/brand/missions", icon: icons.analytics, label: "My Campaigns" },
    { href: "/brand/wallet", icon: icons.wallet, label: "Wallet" },
  ];

  const adminNav = [
    { href: "/admin", icon: icons.dashboard, label: "Overview" },
    { href: "/admin/campaigns", icon: icons.review, label: "Campaign Queue" },
    { href: "/admin/submissions", icon: icons.submit, label: "Submissions" },
    { href: "/admin/disputes", icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 9V5a3 3 0 0 0-6 0v4"/><rect x="2" y="9" width="20" height="12" rx="2"/></svg>, label: "Disputes" },
    { href: "/admin/users", icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/></svg>, label: "Users" },
    { href: "/admin/wallet", icon: icons.wallet, label: "Wallet Ledger" },
  ];

  const navItems =
    session.role === "creator" ? creatorNav
    : session.role === "brand" ? brandNav
    : adminNav;

  return (
    <div className="vr-shell" style={{ display: "flex", minHeight: "100vh", background: "var(--background)", color: "var(--foreground)" }}>
      {/* Mobile drawer toggle (CSS-only, keeps this a server component) */}
      <input type="checkbox" id="vr-nav" className="vr-nav-toggle" hidden />
      <label htmlFor="vr-nav" className="vr-overlay" aria-hidden="true" />

      {/* Sidebar */}
      <aside className="vr-sidebar" style={{ width: 256, flexShrink: 0, background: "var(--panel)", borderRight: "1px solid var(--line)", display: "flex", flexDirection: "column", position: "sticky", top: 0, height: "100vh" }}>
        <div style={{ padding: "22px 24px", borderBottom: "1px solid var(--line)" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 9 }}>
            <div style={{ width: 28, height: 28, borderRadius: 8, background: "rgba(0,217,163,0.15)", border: "1px solid rgba(0,217,163,0.35)", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <MicIcon />
            </div>
            <span style={{ fontFamily: "var(--font-heading)", fontWeight: 700, fontSize: 16 }}>VoiceRank</span>
          </div>
          <div style={{ color: "var(--muted)", fontSize: 13, marginTop: 6 }}>{portalLabel}</div>
        </div>

        <nav style={{ padding: 16, display: "flex", flexDirection: "column", gap: 6, flex: 1 }}>
          {navItems.map((item) => (
            <NavItem key={item.href} href={item.href} icon={item.icon} label={item.label} />
          ))}
        </nav>

        <div style={{ padding: 16, borderTop: "1px solid var(--line)", display: "flex", flexDirection: "column", gap: 4 }}>
          <a href="#" style={{ display: "flex", alignItems: "center", gap: 12, padding: "9px 12px", borderRadius: 8, color: "var(--muted)", textDecoration: "none", fontSize: 14 }}>
            {icons.help}
            <span>Help &amp; Support</span>
          </a>
          <form action={logOut}>
            <button type="submit" style={{ width: "100%", display: "flex", alignItems: "center", gap: 12, padding: "9px 12px", borderRadius: 8, color: "var(--muted)", background: "transparent", border: "none", fontSize: 14, cursor: "pointer" }}>
              {icons.logout}
              <span>Logout</span>
            </button>
          </form>
        </div>
      </aside>

      {/* Main content */}
      <div style={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column" }}>
        {/* Topbar */}
        <header className="vr-topbar" style={{ height: 64, flexShrink: 0, borderBottom: "1px solid var(--line)", background: "rgba(248,249,250,0.95)", display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 32px" }}>
          <div style={{ display: "flex", alignItems: "center", minWidth: 0, gap: 12 }}>
            <label htmlFor="vr-nav" className="vr-hamburger" aria-label="Open menu">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/></svg>
            </label>
            {session.role === "admin" ? (
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <span style={{ fontSize: 14, color: "var(--muted)" }}>Platform status</span>
                <span style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 13, color: "#00d9a3" }}>
                  <span style={{ width: 8, height: 8, borderRadius: "50%", background: "#00d9a3", display: "inline-block" }} />
                  All systems operational
                </span>
              </div>
            ) : (
              <div className="vr-search" style={{ position: "relative", width: 420, maxWidth: "45vw" }}>
                <div style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)" }}>{icons.searchbar}</div>
                <input placeholder="Search campaigns..." style={{ width: "100%", height: 36, padding: "0 12px 0 38px", fontSize: 14, color: "var(--foreground)", background: "var(--surface)", border: "1px solid var(--line)", borderRadius: 8, outline: "none", fontFamily: "inherit" }} />
              </div>
            )}
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 18 }}>
            {session.role !== "admin" && (
              <div style={{ position: "relative", width: 36, height: 36, borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}>
                {icons.bell}
              </div>
            )}
            <div style={{ display: "flex", alignItems: "center", gap: 10, paddingLeft: session.role !== "admin" ? 18 : 0, borderLeft: session.role !== "admin" ? "1px solid var(--line)" : "none" }}>
              <div style={{ width: 36, height: 36, borderRadius: "50%", background: session.role === "admin" ? "rgba(124,58,237,0.15)" : "rgba(0,217,163,0.15)", border: `1px solid ${session.role === "admin" ? "rgba(124,58,237,0.3)" : "rgba(0,217,163,0.3)"}`, display: "flex", alignItems: "center", justifyContent: "center", color: session.role === "admin" ? "#7c3aed" : "#00d9a3", fontSize: 13, fontWeight: 700 }}>{initials}</div>
              <div className="vr-user-meta" style={{ lineHeight: 1.2 }}>
                <div style={{ fontSize: 14, color: "var(--foreground)" }}>{session.role === "admin" ? "Admin" : session.email.split("@")[0]}</div>
                <div style={{ fontSize: 12, color: "var(--muted)" }}>{session.email}</div>
              </div>
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="content-stack vr-main" style={{ flex: 1, minWidth: 0, padding: 32 }}>
          {children}
        </main>
      </div>
    </div>
  );
}
