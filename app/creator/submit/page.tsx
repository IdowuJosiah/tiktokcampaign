import { AppShell } from "@/app/components/AppShell";
import { MultiLinkSubmissionForm } from "@/app/components/submission/MultiLinkSubmissionForm";
import { FormStatus } from "@/app/components/FormStatus";
import { requireRole } from "@/lib/auth";
import { getCreatorProfile, listLiveMissions } from "@/lib/repository";
import Link from "next/link";

export default async function CreatorSubmitPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; missionId?: string }>;
}) {
  const { error, missionId } = await searchParams;
  const session = await requireRole("creator");
  const creator = await getCreatorProfile(session.id);
  const missions = await listLiveMissions();
  const canSubmit = Boolean(creator?.verifiedAt);

  const selectedMission = missionId ? missions.find((m) => m.id === missionId) : missions[0];

  return (
    <AppShell>
      <div style={{ maxWidth: 760 }}>
        <Link href="/campaigns" style={{ display: "inline-flex", alignItems: "center", gap: 8, color: "var(--muted)", fontSize: 14, textDecoration: "none", marginBottom: 18 }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#99a1af" strokeWidth="2"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>
          Back to campaigns
        </Link>

        <h1 style={{ fontFamily: "var(--font-heading)", fontWeight: 600, fontSize: 26, margin: 0 }}>Submit your video</h1>
        {selectedMission && (
          <p style={{ color: "var(--muted)", fontSize: 15, margin: "6px 0 24px" }}>{selectedMission.title} · {selectedMission.brand} · {selectedMission.rewardPool}</p>
        )}

        <FormStatus error={error ?? (!canSubmit ? "tiktok_required" : undefined)} />

        {!canSubmit ? (
          <div style={{ background: "rgba(255,137,4,0.06)", border: "1px solid rgba(255,137,4,0.25)", borderRadius: 14, padding: "28px 32px" }}>
            <h2 style={{ fontFamily: "var(--font-heading)", fontSize: 22, fontWeight: 600, margin: "0 0 12px" }}>Verify your TikTok first</h2>
            <p style={{ color: "var(--muted)", fontSize: 15, margin: "0 0 20px", lineHeight: 1.5 }}>Connect your TikTok account from your profile page before submitting campaign videos.</p>
            <Link href="/creator/profile" style={{ display: "inline-flex", alignItems: "center", height: 44, padding: "0 20px", fontFamily: "inherit", fontSize: 15, fontWeight: 700, color: "#000", background: "#00d9a3", border: "none", borderRadius: 8, textDecoration: "none" }}>Verify TikTok profile →</Link>
          </div>
        ) : (
          <div>
            <div style={{ background: "#fff", border: "1px solid var(--line)", borderRadius: 14, padding: 22, marginBottom: 18 }}>
              <MultiLinkSubmissionForm creatorHandle={creator?.tiktokHandle ?? ""} missions={missions} />
            </div>
          </div>
        )}
      </div>
    </AppShell>
  );
}
