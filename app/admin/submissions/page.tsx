import Link from "next/link";
import { AppShell } from "@/app/components/AppShell";
import { requireRole } from "@/lib/auth";
import { listSubmissions } from "@/lib/repository";

export default async function AdminSubmissionsPage() {
  await requireRole("admin");
  const submissions = await listSubmissions();

  const pending = submissions.filter((s) => s.status === "Pending");
  const reviewed = submissions.filter((s) => s.status !== "Pending");

  return (
    <AppShell>
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ fontFamily: "var(--font-heading)", fontWeight: 600, fontSize: 26, margin: 0 }}>Submission Review</h1>
        <p style={{ color: "var(--muted)", fontSize: 15, margin: "6px 0 0" }}>Review creator submissions and approve or reject them</p>
      </div>

      {/* Pending queue */}
      <div style={{ marginBottom: 24 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16 }}>
          <h2 style={{ fontFamily: "var(--font-heading)", fontSize: 18, fontWeight: 600, margin: 0 }}>Pending review</h2>
          {pending.length > 0 && (
            <span style={{ fontSize: 12, color: "#ff8904", background: "rgba(255,137,4,0.1)", border: "1px solid rgba(255,137,4,0.3)", borderRadius: 999, padding: "3px 9px" }}>{pending.length}</span>
          )}
        </div>
        <div style={{ background: "#fff", border: "1px solid var(--line)", borderRadius: 14, overflow: "hidden" }}>
          {pending.length === 0 ? (
            <div style={{ padding: 32, textAlign: "center", color: "var(--muted)" }}>
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="var(--muted)" strokeWidth="1.5" style={{ marginBottom: 12 }}><path d="M20 6 9 17l-5-5"/></svg>
              <div>Queue is clear — all submissions reviewed.</div>
            </div>
          ) : (
            pending.map((s, i) => (
              <Link key={s.id} href={`/admin/submissions/${s.id}`} style={{ display: "flex", alignItems: "center", gap: 16, padding: "16px 22px", borderBottom: i < pending.length - 1 ? "1px solid var(--line)" : "none", textDecoration: "none", color: "inherit" }}>
                <div style={{ width: 40, height: 40, borderRadius: 10, background: "rgba(255,137,4,0.1)", border: "1px solid rgba(255,137,4,0.2)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#ff8904" strokeWidth="2"><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></svg>
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 15, fontWeight: 700 }}>{s.creator}</div>
                  <div style={{ color: "var(--muted)", fontSize: 13, marginTop: 2, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{s.link}</div>
                </div>
                <div style={{ display: "flex", gap: 8, flexShrink: 0 }}>
                  {s.checks.hashtag && <span style={{ fontSize: 11, color: "#00d9a3", background: "rgba(0,217,163,0.1)", border: "1px solid rgba(0,217,163,0.25)", borderRadius: 6, padding: "3px 7px" }}>#tag ✓</span>}
                  {s.checks.sound && <span style={{ fontSize: 11, color: "#00d9a3", background: "rgba(0,217,163,0.1)", border: "1px solid rgba(0,217,163,0.25)", borderRadius: 6, padding: "3px 7px" }}>sound ✓</span>}
                </div>
                <div style={{ fontSize: 15, fontWeight: 700, color: "#00d9a3", minWidth: 70, textAlign: "right" }}>{s.reward}</div>
                <div style={{ fontSize: 13, color: "var(--muted)", marginLeft: 4 }}>{s.views}</div>
              </Link>
            ))
          )}
        </div>
      </div>

      {/* Reviewed */}
      {reviewed.length > 0 && (
        <div>
          <h2 style={{ fontFamily: "var(--font-heading)", fontSize: 18, fontWeight: 600, margin: "0 0 16px" }}>Recently reviewed</h2>
          <div style={{ background: "#fff", border: "1px solid var(--line)", borderRadius: 14, overflow: "hidden" }}>
            {reviewed.slice(0, 10).map((s, i) => (
              <Link key={s.id} href={`/admin/submissions/${s.id}`} style={{ display: "flex", alignItems: "center", gap: 16, padding: "14px 22px", borderBottom: i < Math.min(reviewed.length, 10) - 1 ? "1px solid var(--line)" : "none", textDecoration: "none", color: "inherit" }}>
                <div style={{ width: 36, height: 36, borderRadius: 8, background: s.status === "Approved" ? "rgba(0,217,163,0.1)" : "rgba(255,107,107,0.1)", border: `1px solid ${s.status === "Approved" ? "rgba(0,217,163,0.2)" : "rgba(255,107,107,0.2)"}`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                  {s.status === "Approved"
                    ? <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#00d9a3" strokeWidth="2.5"><path d="M20 6 9 17l-5-5"/></svg>
                    : <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#ff6b6b" strokeWidth="2.5"><path d="M18 6 6 18M6 6l12 12"/></svg>
                  }
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 14, fontWeight: 600 }}>{s.creator}</div>
                  <div style={{ color: "var(--muted)", fontSize: 12, marginTop: 1 }}>{s.handle}</div>
                </div>
                <span style={{ fontSize: 12, color: s.status === "Approved" ? "#00d9a3" : s.status === "Needs fix" ? "#ff8904" : "#ff6b6b", background: s.status === "Approved" ? "rgba(0,217,163,0.1)" : s.status === "Needs fix" ? "rgba(255,137,4,0.1)" : "rgba(255,107,107,0.1)", borderRadius: 999, padding: "4px 10px" }}>
                  {s.status}
                </span>
                <div style={{ fontSize: 14, fontWeight: 700, color: "var(--foreground)", minWidth: 70, textAlign: "right" }}>{s.reward}</div>
              </Link>
            ))}
          </div>
        </div>
      )}
    </AppShell>
  );
}
