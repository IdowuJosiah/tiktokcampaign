import Link from "next/link";
import { notFound } from "next/navigation";
import { AppShell } from "@/app/components/AppShell";
import { SubmissionRow } from "@/app/components/SubmissionRow";
import { requireRole } from "@/lib/auth";
import { findMissionForOps, listMissionSubmissions } from "@/lib/repository";

export default async function BrandMissionDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requireRole("brand");
  const { id } = await params;
  const [mission, submissions] = await Promise.all([findMissionForOps(id), listMissionSubmissions(id)]);

  if (!mission) notFound();

  const approved = submissions.filter((s) => s.status === "Approved").length;
  const pending = submissions.filter((s) => s.status === "Pending").length;

  return (
    <AppShell>
      <div style={{ maxWidth: 980 }}>
        {/* Back */}
        <Link href="/brand/missions" style={{ display: "inline-flex", alignItems: "center", gap: 8, color: "#99a1af", fontSize: 14, textDecoration: "none", marginBottom: 20 }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#99a1af" strokeWidth="2"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>
          Back to campaigns
        </Link>

        {/* Header */}
        <div style={{ display: "flex", gap: 18, alignItems: "flex-start", marginBottom: 24 }}>
          <div style={{ width: 64, height: 64, flexShrink: 0, borderRadius: 14, background: "rgba(0,217,163,0.1)", border: "1px solid rgba(0,217,163,0.3)", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#00d9a3" strokeWidth="1.8"><path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"/><path d="M19 10v2a7 7 0 0 1-14 0v-2"/></svg>
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
              <div>
                <h1 style={{ fontFamily: "var(--font-heading)", fontWeight: 600, fontSize: 26, margin: 0 }}>{mission.title}</h1>
                <div style={{ color: "#99a1af", fontSize: 15, marginTop: 5 }}>{mission.brand}</div>
              </div>
              <span style={{ fontSize: 13, color: mission.status === "Live" ? "#00d9a3" : "#99a1af", background: mission.status === "Live" ? "rgba(0,217,163,0.1)" : "rgba(255,255,255,0.06)", border: `1px solid ${mission.status === "Live" ? "rgba(0,217,163,0.3)" : "rgba(255,255,255,0.1)"}`, borderRadius: 999, padding: "6px 14px" }}>
                {mission.status}
              </span>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 16, marginBottom: 24 }}>
          {[
            { label: "Reward pool", value: mission.rewardPool, sub: mission.fundingStatus },
            { label: "Per 5 submissions", value: mission.payoutPerFiveSubmissions, sub: "Payout batch" },
            { label: "Approved", value: String(approved), sub: "submissions" },
            { label: "Pending", value: String(pending), sub: "awaiting review" },
          ].map((stat) => (
            <div key={stat.label} style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 14, padding: 20 }}>
              <div style={{ color: "#99a1af", fontSize: 13, marginBottom: 8 }}>{stat.label}</div>
              <div style={{ fontSize: 22, fontWeight: 700, color: "#fff" }}>{stat.value}</div>
              <div style={{ color: "#99a1af", fontSize: 12, marginTop: 4 }}>{stat.sub}</div>
            </div>
          ))}
        </div>

        {/* Brief */}
        <div style={{ background: "rgba(0,217,163,0.06)", border: "1px solid rgba(0,217,163,0.25)", borderRadius: 14, padding: "18px 22px", marginBottom: 18 }}>
          <div style={{ fontSize: 12, fontWeight: 700, color: "#00d9a3", letterSpacing: ".5px", textTransform: "uppercase", marginBottom: 8 }}>Campaign brief</div>
          <p style={{ fontSize: 15, color: "#fff", margin: 0, lineHeight: 1.5 }}>{mission.brief}</p>
        </div>

        {/* Requirements */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 24 }}>
          <div style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 14, padding: 20 }}>
            <div style={{ fontSize: 13, color: "#99a1af", fontWeight: 700, textTransform: "uppercase", marginBottom: 12, letterSpacing: ".5px" }}>Requirements</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span style={{ color: "#99a1af", fontSize: 13 }}>Hashtag</span>
                <span style={{ fontSize: 14, fontWeight: 600 }}>{mission.requiredHashtag}</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span style={{ color: "#99a1af", fontSize: 13 }}>Sound</span>
                <span style={{ fontSize: 14, fontWeight: 600 }}>{mission.requiredSound}</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span style={{ color: "#99a1af", fontSize: 13 }}>Views req.</span>
                <span style={{ fontSize: 14, fontWeight: 600 }}>{mission.viewsPerSubmission}</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span style={{ color: "#99a1af", fontSize: 13 }}>Deadline</span>
                <span style={{ fontSize: 14, fontWeight: 600 }}>{mission.deadline}</span>
              </div>
            </div>
          </div>
          <div style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 14, padding: 20 }}>
            <div style={{ fontSize: 13, color: "#99a1af", fontWeight: 700, textTransform: "uppercase", marginBottom: 12, letterSpacing: ".5px" }}>Rules</div>
            <ul style={{ margin: 0, paddingLeft: 18, display: "flex", flexDirection: "column", gap: 8 }}>
              {mission.requirements.map((r) => (
                <li key={r} style={{ fontSize: 14, color: "#d1d5dc", lineHeight: 1.4 }}>{r}</li>
              ))}
            </ul>
          </div>
        </div>

        {/* Submissions */}
        <div style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 14, overflow: "hidden" }}>
          <div style={{ padding: "18px 22px", borderBottom: "1px solid rgba(255,255,255,0.08)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span style={{ fontSize: 15, fontWeight: 700 }}>Submissions ({submissions.length})</span>
          </div>
          {submissions.length === 0 ? (
            <div style={{ padding: 32, textAlign: "center", color: "#99a1af" }}>
              No submissions yet. Creator submissions will appear here once this campaign is live.
            </div>
          ) : (
            <div style={{ padding: "8px 22px" }}>
              {submissions.map((s) => (
                <SubmissionRow href={`/submissions/${s.id}`} submission={s} key={s.id} />
              ))}
            </div>
          )}
        </div>
      </div>
    </AppShell>
  );
}
