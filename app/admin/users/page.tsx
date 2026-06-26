import { AppShell } from "@/app/components/AppShell";
import { requireRole } from "@/lib/auth";

type ChipColor = "green" | "orange" | "red" | "gray";

function chip(label: string, color: ChipColor): React.CSSProperties & { _label?: string } {
  const colors: Record<ChipColor, { fg: string; bg: string; border: string }> = {
    green: { fg: "#00d9a3", bg: "rgba(0,217,163,0.1)", border: "rgba(0,217,163,0.3)" },
    orange: { fg: "#ff8904", bg: "rgba(255,137,4,0.1)", border: "rgba(255,137,4,0.3)" },
    red: { fg: "#ff6b6b", bg: "rgba(255,107,107,0.1)", border: "rgba(255,107,107,0.3)" },
    gray: { fg: "#99a1af", bg: "rgba(255,255,255,0.06)", border: "rgba(255,255,255,0.1)" },
  };
  const c = colors[color];
  return { fontSize: 12, color: c.fg, background: c.bg, border: `1px solid ${c.border}`, borderRadius: 999, padding: "3px 10px", whiteSpace: "nowrap" };
}

const CREATORS = [
  { initials: "AO", name: "Ada Obi", handle: "@adaobi.creates", followers: "8.4k", level: "Verified", earned: "₦214,000", kyc: "Verified", kycColor: "green" as ChipColor, status: "Active", statusColor: "green" as ChipColor },
  { initials: "KE", name: "Kemi Adewale", handle: "@kemi.vibes", followers: "21k", level: "Elite", earned: "₦642,000", kyc: "Verified", kycColor: "green" as ChipColor, status: "Active", statusColor: "green" as ChipColor },
  { initials: "QV", name: "Quick Views", handle: "@quickviews", followers: "48k", level: "Rising", earned: "₦18,000", kyc: "Pending", kycColor: "orange" as ChipColor, status: "Flagged", statusColor: "red" as ChipColor },
  { initials: "TU", name: "Tunde Bakare", handle: "@tunde.x", followers: "4.1k", level: "Newcomer", earned: "₦0", kyc: "Not started", kycColor: "gray" as ChipColor, status: "Active", statusColor: "green" as ChipColor },
];

const BRANDS = [
  { initials: "MA", name: "Maltina", industry: "Food & Drink", plan: "Scale", campaigns: "8", paid: "₦4.2M", status: "Active", statusColor: "green" as ChipColor },
  { initials: "TM", name: "Tecno Mobile", industry: "Technology", plan: "Growth", campaigns: "5", paid: "₦2.1M", status: "Active", statusColor: "green" as ChipColor },
  { initials: "RR", name: "R&R Luxury", industry: "Beauty", plan: "Starter", campaigns: "2", paid: "₦612k", status: "Active", statusColor: "green" as ChipColor },
];

const headerCell: React.CSSProperties = { fontSize: 12, color: "#6a7282", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.4px" };

export default async function AdminUsersPage() {
  await requireRole("admin");

  return (
    <AppShell>
      <div style={{ marginBottom: 22 }}>
        <h1 style={{ fontFamily: "var(--font-heading)", fontWeight: 600, fontSize: 26, margin: 0 }}>User Management</h1>
        <p style={{ color: "#99a1af", fontSize: 15, margin: "6px 0 0" }}>Search, verify and moderate creators and brands</p>
      </div>

      {/* Search + filter */}
      <div style={{ display: "flex", gap: 12, alignItems: "center", marginBottom: 22, flexWrap: "wrap" }}>
        <div style={{ position: "relative", flex: 1, minWidth: 260, maxWidth: 380 }}>
          <svg style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)" }} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#99a1af" strokeWidth="2"><circle cx="11" cy="11" r="7"/><path d="m21 21-4.3-4.3"/></svg>
          <input
            placeholder="Search by name, email or @handle"
            style={{ width: "100%", height: 40, padding: "0 12px 0 38px", fontSize: 14, color: "#fff", background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 8, outline: "none", fontFamily: "inherit" }}
          />
        </div>
        <div style={{ display: "inline-flex", gap: 4, padding: 4, background: "rgba(255,255,255,0.05)", borderRadius: 10 }}>
          <span style={{ padding: "6px 14px", borderRadius: 7, background: "#00d9a3", color: "#000", fontSize: 13, fontWeight: 700, cursor: "pointer" }}>Creators</span>
          <span style={{ padding: "6px 14px", borderRadius: 7, color: "#d1d5dc", fontSize: 13, cursor: "pointer" }}>Brands</span>
        </div>
      </div>

      {/* Creators table */}
      <div style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 14, overflow: "hidden", marginBottom: 24 }}>
        <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr 1fr 1.2fr 1fr auto", gap: 16, padding: "13px 22px", borderBottom: "1px solid rgba(255,255,255,0.08)" }}>
          <span style={headerCell}>Creator</span>
          <span style={headerCell}>Followers</span>
          <span style={headerCell}>Level</span>
          <span style={headerCell}>Total earned</span>
          <span style={headerCell}>KYC</span>
          <span style={headerCell}>Status</span>
        </div>
        {CREATORS.map((u, i) => (
          <div
            key={u.handle}
            style={{ display: "grid", gridTemplateColumns: "2fr 1fr 1fr 1.2fr 1fr auto", gap: 16, padding: "15px 22px", borderBottom: i < CREATORS.length - 1 ? "1px solid rgba(255,255,255,0.05)" : "none", alignItems: "center" }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <div style={{ width: 36, height: 36, borderRadius: "50%", background: "rgba(0,217,163,0.15)", display: "flex", alignItems: "center", justifyContent: "center", color: "#00d9a3", fontSize: 12, fontWeight: 700, flexShrink: 0 }}>
                {u.initials}
              </div>
              <div style={{ minWidth: 0 }}>
                <div style={{ fontSize: 14, color: "#fff" }}>{u.name}</div>
                <div style={{ fontSize: 12, color: "#99a1af" }}>{u.handle}</div>
              </div>
            </div>
            <span style={{ fontSize: 14, color: "#d1d5dc" }}>{u.followers}</span>
            <span style={{ fontSize: 13, color: "#d1d5dc" }}>{u.level}</span>
            <span style={{ fontSize: 14, color: "#fff" }}>{u.earned}</span>
            <span style={chip(u.kyc, u.kycColor)}>{u.kyc}</span>
            <span style={chip(u.status, u.statusColor)}>{u.status}</span>
          </div>
        ))}
      </div>

      {/* Brands table */}
      <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 14, color: "#99a1af" }}>Brands</div>
      <div style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 14, overflow: "hidden" }}>
        <div style={{ display: "grid", gridTemplateColumns: "2fr 1.2fr 1fr 1fr 1fr auto", gap: 16, padding: "13px 22px", borderBottom: "1px solid rgba(255,255,255,0.08)" }}>
          <span style={headerCell}>Brand</span>
          <span style={headerCell}>Industry</span>
          <span style={headerCell}>Plan</span>
          <span style={headerCell}>Campaigns</span>
          <span style={headerCell}>Total paid</span>
          <span style={headerCell}>Status</span>
        </div>
        {BRANDS.map((u, i) => (
          <div
            key={u.name}
            style={{ display: "grid", gridTemplateColumns: "2fr 1.2fr 1fr 1fr 1fr auto", gap: 16, padding: "15px 22px", borderBottom: i < BRANDS.length - 1 ? "1px solid rgba(255,255,255,0.05)" : "none", alignItems: "center" }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <div style={{ width: 36, height: 36, borderRadius: 9, background: "rgba(0,217,163,0.15)", display: "flex", alignItems: "center", justifyContent: "center", color: "#00d9a3", fontSize: 12, fontWeight: 700 }}>
                {u.initials}
              </div>
              <div style={{ fontSize: 14, color: "#fff" }}>{u.name}</div>
            </div>
            <span style={{ fontSize: 14, color: "#d1d5dc" }}>{u.industry}</span>
            <span style={{ fontSize: 13, color: "#d1d5dc" }}>{u.plan}</span>
            <span style={{ fontSize: 14, color: "#fff" }}>{u.campaigns}</span>
            <span style={{ fontSize: 14, color: "#00d9a3" }}>{u.paid}</span>
            <span style={chip(u.status, u.statusColor)}>{u.status}</span>
          </div>
        ))}
      </div>
    </AppShell>
  );
}
