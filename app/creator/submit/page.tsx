import { AppShell } from "@/app/components/AppShell";
import { MultiLinkSubmissionForm } from "@/app/components/submission/MultiLinkSubmissionForm";
import { FormStatus } from "@/app/components/FormStatus";
import { requireRole } from "@/lib/auth";
import { getCreatorProfile, listLiveMissions } from "@/lib/repository";
import Link from "next/link";

export default async function CreatorSubmitPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;
  const session = await requireRole("creator");
  const creator = await getCreatorProfile(session.id);
  const missions = await listLiveMissions();
  const canSubmit = Boolean(creator?.verifiedAt);

  return (
    <AppShell>
      <header className="page-header">
        <div>
          <p className="eyebrow">Creator</p>
          <h1>Submit TikTok video</h1>
          <p>Paste the public TikTok video link and confirm the mission requirements before review.</p>
        </div>
      </header>

      <section className="panel form-panel">
        <FormStatus error={error ?? (!canSubmit ? "tiktok_required" : undefined)} />
        {!canSubmit ? (
          <div className="empty-state">
            <h2>Verify your TikTok handle first.</h2>
            <p>Add your handle, place the verification code in your bio, then confirm verification before submitting campaign videos.</p>
            <Link className="primary-button" href="/creator/profile">Verify TikTok profile</Link>
          </div>
        ) : (
          <MultiLinkSubmissionForm creatorHandle={creator?.tiktokHandle ?? ""} missions={missions} />
        )}
      </section>
    </AppShell>
  );
}
