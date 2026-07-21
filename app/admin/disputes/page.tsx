import Link from "next/link";
import { AppShell } from "@/app/components/AppShell";
import { requireRole } from "@/lib/auth";
import { listRejectedSubmissionsForDisputes } from "@/lib/repository";
import { reviewSubmission } from "@/app/actions";

export default async function AdminDisputesPage() {
  await requireRole("admin");
  const disputes = await listRejectedSubmissionsForDisputes();

  return (
    <AppShell>
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontFamily: "var(--font-heading)", fontWeight: 600, fontSize: 26, margin: 0 }}>Dispute Resolution</h1>
        <p style={{ color: "var(--muted)", fontSize: 15, margin: "6px 0 0" }}>Rejected submissions available for appeal review · 48h SLA</p>
      </div>

      {disputes.length === 0 ? (
        <div style={{ background: "var(--panel)", border: "1px solid var(--line)", borderRadius: 14, padding: 48, textAlign: "center", color: "var(--muted)" }}>
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="var(--muted)" strokeWidth="1.5" style={{ marginBottom: 12 }}><path d="M20 6 9 17l-5-5"/></svg>
          <div>No rejected submissions — nothing to dispute.</div>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          {disputes.map((d) => (
            <div key={d.id} style={{ background: "var(--panel)", border: "1px solid var(--line)", borderRadius: 14, padding: 22 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 16 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  <div style={{ width: 40, height: 40, borderRadius: "50%", background: "rgba(0,217,163,0.15)", display: "flex", alignItems: "center", justifyContent: "center", color: "#00d9a3", fontSize: 13, fontWeight: 700, flexShrink: 0 }}>
                    {d.name.slice(0, 2).toUpperCase()}
                  </div>
                  <div>
                    <div style={{ fontSize: 15, fontWeight: 700 }}>{d.handle}</div>
                    <div style={{ fontSize: 13, color: "var(--muted)" }}>{d.campaign}</div>
                  </div>
                </div>
              </div>

              <div style={{ background: "rgba(255,107,107,0.05)", border: "1px solid rgba(255,107,107,0.2)", borderRadius: 10, padding: 14, marginBottom: 18 }}>
                <div style={{ fontSize: 12, color: "#ff6b6b", fontWeight: 700, marginBottom: 6 }}>REJECTION REASON</div>
                <div style={{ fontSize: 13, color: "var(--foreground)", lineHeight: 1.5 }}>{d.reason}</div>
              </div>

              <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
                <form action={reviewSubmission}>
                  <input type="hidden" name="submissionId" value={d.id} />
                  <input type="hidden" name="decision" value="approve" />
                  <input type="hidden" name="reason" value="Rejection overturned after appeal review." />
                  <button
                    type="submit"
                    style={{ height: 42, padding: "0 20px", fontFamily: "inherit", fontSize: 14, fontWeight: 700, color: "#000", background: "#00d9a3", border: "none", borderRadius: 8, cursor: "pointer" }}
                  >
                    Overturn — qualify
                  </button>
                </form>
                <Link
                  href={`/admin/submissions/${d.id}`}
                  style={{ height: 42, padding: "0 20px", fontFamily: "inherit", fontSize: 14, fontWeight: 700, color: "var(--foreground)", background: "var(--surface)", border: "1px solid var(--line)", borderRadius: 8, cursor: "pointer", display: "flex", alignItems: "center", textDecoration: "none" }}
                >
                  View submission
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </AppShell>
  );
}
