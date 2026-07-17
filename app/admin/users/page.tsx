import { AppShell } from "@/app/components/AppShell";
import { requireRole } from "@/lib/auth";
import { listAdminCreators, listAdminBrands } from "@/lib/repository";

type ChipColor = "green" | "orange" | "red" | "gray";

function Chip({ label, color }: { label: string; color: ChipColor }) {
  const colors: Record<ChipColor, { fg: string; bg: string; border: string }> = {
    green: { fg: "#00d9a3", bg: "rgba(0,217,163,0.1)", border: "rgba(0,217,163,0.3)" },
    orange: { fg: "#ff8904", bg: "rgba(255,137,4,0.1)", border: "rgba(255,137,4,0.3)" },
    red: { fg: "#ff6b6b", bg: "rgba(255,107,107,0.1)", border: "rgba(255,107,107,0.3)" },
    gray: { fg: "var(--muted)", bg: "rgba(0,0,0,0.05)", border: "var(--line)" },
  };
  const c = colors[color];
  return (
    <span style={{ fontSize: 12, color: c.fg, background: c.bg, border: `1px solid ${c.border}`, borderRadius: 999, padding: "3px 10px", whiteSpace: "nowrap" }}>
      {label}
    </span>
  );
}

const headerCell: React.CSSProperties = { fontSize: 12, color: "var(--muted)", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.4px" };

export default async function AdminUsersPage() {
  await requireRole("admin");
  const [creators, brands] = await Promise.all([listAdminCreators(), listAdminBrands()]);

  return (
    <AppShell>
      <div style={{ marginBottom: 22 }}>
        <h1 style={{ fontFamily: "var(--font-heading)", fontWeight: 600, fontSize: 26, margin: 0 }}>User Management</h1>
        <p style={{ color: "var(--muted)", fontSize: 15, margin: "6px 0 0" }}>Search, verify and moderate creators and brands</p>
      </div>

      {/* Creators table */}
      <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 14, color: "var(--muted)" }}>
        Creators <span style={{ fontWeight: 400, color: "var(--muted)" }}>({creators.length})</span>
      </div>
      <div style={{ background: "#fff", border: "1px solid var(--line)", borderRadius: 14, overflow: "hidden", marginBottom: 24 }}>
        {creators.length === 0 ? (
          <div style={{ padding: 32, textAlign: "center", color: "var(--muted)" }}>No creators yet.</div>
        ) : (
          <>
            <div style={{ display: "grid", gridTemplateColumns: "2fr 1.5fr 1fr auto", gap: 16, padding: "13px 22px", borderBottom: "1px solid var(--line)" }}>
              <span style={headerCell}>Creator</span>
              <span style={headerCell}>TikTok handle</span>
              <span style={headerCell}>TikTok KYC</span>
              <span style={headerCell}>Status</span>
            </div>
            {creators.map((u, i) => (
              <div
                key={u.id}
                style={{ display: "grid", gridTemplateColumns: "2fr 1.5fr 1fr auto", gap: 16, padding: "15px 22px", borderBottom: i < creators.length - 1 ? "1px solid var(--line)" : "none", alignItems: "center" }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  <div style={{ width: 36, height: 36, borderRadius: "50%", background: "rgba(0,217,163,0.15)", display: "flex", alignItems: "center", justifyContent: "center", color: "#00d9a3", fontSize: 12, fontWeight: 700, flexShrink: 0 }}>
                    {u.name.slice(0, 2).toUpperCase()}
                  </div>
                  <span style={{ fontSize: 14, color: "var(--foreground)" }}>{u.name}</span>
                </div>
                <span style={{ fontSize: 13, color: "var(--muted)" }}>{u.handle}</span>
                <Chip label={u.kyc} color={u.kycColor} />
                <Chip label={u.status} color={u.statusColor} />
              </div>
            ))}
          </>
        )}
      </div>

      {/* Brands table */}
      <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 14, color: "var(--muted)" }}>
        Brands <span style={{ fontWeight: 400, color: "var(--muted)" }}>({brands.length})</span>
      </div>
      <div style={{ background: "#fff", border: "1px solid var(--line)", borderRadius: 14, overflow: "hidden" }}>
        {brands.length === 0 ? (
          <div style={{ padding: 32, textAlign: "center", color: "var(--muted)" }}>No brands yet.</div>
        ) : (
          <>
            <div style={{ display: "grid", gridTemplateColumns: "2fr 1.5fr auto", gap: 16, padding: "13px 22px", borderBottom: "1px solid var(--line)" }}>
              <span style={headerCell}>Brand</span>
              <span style={headerCell}>Industry</span>
              <span style={headerCell}>Status</span>
            </div>
            {brands.map((u, i) => (
              <div
                key={u.id}
                style={{ display: "grid", gridTemplateColumns: "2fr 1.5fr auto", gap: 16, padding: "15px 22px", borderBottom: i < brands.length - 1 ? "1px solid var(--line)" : "none", alignItems: "center" }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  <div style={{ width: 36, height: 36, borderRadius: 9, background: "rgba(0,217,163,0.15)", display: "flex", alignItems: "center", justifyContent: "center", color: "#00d9a3", fontSize: 12, fontWeight: 700 }}>
                    {u.name.slice(0, 2).toUpperCase()}
                  </div>
                  <span style={{ fontSize: 14, color: "var(--foreground)" }}>{u.name}</span>
                </div>
                <span style={{ fontSize: 14, color: "var(--foreground)" }}>{u.industry}</span>
                <Chip label={u.status} color={u.statusColor} />
              </div>
            ))}
          </>
        )}
      </div>
    </AppShell>
  );
}
