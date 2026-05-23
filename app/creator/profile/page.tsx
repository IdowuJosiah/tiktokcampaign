import { AppShell } from "@/app/components/AppShell";
import { FormStatus } from "@/app/components/FormStatus";
import { markTikTokVerified, saveTikTokProfile } from "@/app/actions";
import { requireRole } from "@/lib/auth";
import { getCreatorProfile } from "@/lib/repository";

export default async function CreatorProfilePage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;
  const session = await requireRole("creator");
  const creator = await getCreatorProfile(session.id);

  return (
    <AppShell>
      <header className="page-header">
        <div>
          <p className="eyebrow">Creator profile</p>
          <h1>Verify your TikTok handle.</h1>
          <p>Add your TikTok handle, place your VoiceRank code in your TikTok bio, then confirm once it is visible.</p>
        </div>
      </header>

      <section className="panel form-panel">
        <FormStatus error={error} />
        <form action={saveTikTokProfile} className="submission-form">
          <label>
            Display name
            <input name="displayName" required type="text" defaultValue={creator?.displayName ?? ""} placeholder="Tomi Ade" />
          </label>
          <label>
            TikTok handle
            <input name="tiktokHandle" required type="text" defaultValue={creator?.tiktokHandle ?? ""} placeholder="@yourhandle" />
          </label>
          <button className="primary-button full" type="submit">Save handle</button>
        </form>
      </section>

      {creator?.verificationCode ? (
        <section className="panel form-panel">
          <div className="verification-card">
            <p className="eyebrow">Verification code</p>
            <h2>{creator.verificationCode}</h2>
            <p>Add this code to your TikTok bio temporarily. Once it is visible, confirm below.</p>
            <form action={markTikTokVerified}>
              <button className="primary-button full" type="submit">
                {creator.verifiedAt ? "Verified" : "I added the code"}
              </button>
            </form>
          </div>
        </section>
      ) : null}
    </AppShell>
  );
}
