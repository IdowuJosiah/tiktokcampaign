import Link from "next/link";
import { AppShell } from "@/app/components/AppShell";
import { requireRole } from "@/lib/auth";
import { listCreatorSubmissions } from "@/lib/repository";

const STATUS_COLORS: Record<string, string> = {
  Pending: "#ff8904",
  Approved: "#00d9a3",
  "Needs fix": "#ff8904",
  Rejected: "#ff6467",
};

export default async function CreatorSubmissionsPage() {
  const session = await requireRole("creator");
  const submissions = await listCreatorSubmissions(session.id);

  const grouped = new Map<string, { title: string; brand: string; items: typeof submissions }>();
  for (const submission of submissions) {
    const existing = grouped.get(submission.missionId);
    if (existing) {
      existing.items.push(submission);
    } else {
      grouped.set(submission.missionId, {
        title: submission.missionTitle ?? "Campaign",
        brand: submission.missionBrand ?? "Brand",
        items: [submission],
      });
    }
  }

  return (
    <AppShell>
      <div style={{ marginBottom: 28, display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        <div>
          <h1 style={{ fontFamily: "var(--font-heading)", fontWeight: 600, fontSize: 26, margin: 0 }}>My Submissions</h1>
          <p style={{ color: "var(--muted)", fontSize: 15, margin: "6px 0 0" }}>Track your videos across every campaign you've joined</p>
        </div>
        <Link href="/creator/submit" style={{ height: 40, padding: "0 18px", fontFamily: "inherit", fontSize: 14, fontWeight: 700, color: "#000", background: "#00d9a3", border: "none", borderRadius: 8, display: "inline-flex", alignItems: "center", textDecoration: "none" }}>
          Submit a new link
        </Link>
      </div>

      {/* Tabs */}
      <div style={{ display: "inline-flex", gap: 4, padding: 4, background: "rgba(0,0,0,0.05)", borderRadius: 12, marginBottom: 22 }}>
        <Link href="/dashboard/creator" style={{ padding: "7px 16px", borderRadius: 9, color: "var(--foreground)", fontSize: 14, textDecoration: "none" }}>Available Campaigns</Link>
        <div style={{ padding: "7px 16px", borderRadius: 9, background: "#00d9a3", color: "#000", fontSize: 14, fontWeight: 700 }}>My Submissions</div>
      </div>

      {grouped.size === 0 ? (
        <div style={{ padding: 32, textAlign: "center", color: "var(--muted)", background: "#fff", border: "1px solid var(--line)", borderRadius: 14 }}>
          You haven't submitted any videos yet.{" "}
          <Link href="/creator/submit" style={{ color: "#00d9a3" }}>Submit your first link →</Link>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          {Array.from(grouped.entries()).map(([missionId, group]) => (
            <div key={missionId} style={{ background: "#fff", border: "1px solid var(--line)", borderRadius: 14, padding: 22 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 14 }}>
                <div>
                  <div style={{ fontSize: 16, fontWeight: 700 }}>{group.title}</div>
                  <div style={{ color: "var(--muted)", fontSize: 13, marginTop: 2 }}>{group.brand}</div>
                </div>
                <span style={{ color: "var(--muted)", fontSize: 13 }}>{group.items.length} {group.items.length === 1 ? "submission" : "submissions"}</span>
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {group.items.map((submission) => (
                  <div key={submission.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 16, padding: "12px 14px", background: "rgba(0,0,0,0.04)", border: "1px solid var(--line)", borderRadius: 10 }}>
                    <a href={submission.link} target="_blank" rel="noreferrer" style={{ color: "#5b8cff", fontSize: 13, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", flex: 1, minWidth: 0 }}>
                      {submission.link}
                    </a>
                    <span style={{ color: "var(--muted)", fontSize: 13, flexShrink: 0 }}>{submission.views} views</span>
                    <span style={{ color: "var(--muted)", fontSize: 13, flexShrink: 0 }}>{submission.reward}</span>
                    <span style={{ fontSize: 12, fontWeight: 700, color: STATUS_COLORS[submission.status] ?? "var(--muted)", flexShrink: 0 }}>{submission.status}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </AppShell>
  );
}
