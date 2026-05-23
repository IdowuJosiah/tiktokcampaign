import { AppShell } from "@/app/components/AppShell";
import { submitTikTokVideo } from "@/app/actions";
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
          <form action={submitTikTokVideo} className="submission-form">
          <label>
            Mission
            <select name="missionId" defaultValue={missions[0].id}>
              {missions.map((mission) => (
                <option value={mission.id} key={mission.id}>{mission.brand} · {mission.title}</option>
              ))}
            </select>
          </label>
          <label>
            TikTok video link
            <input name="tiktokUrl" required type="url" placeholder="https://www.tiktok.com/@creator/video/..." />
          </label>
          <label>
            Creator handle
            <input name="creatorHandle" readOnly required type="text" value={creator?.tiktokHandle ?? ""} />
          </label>
          <div className="checklist">
            <label><input name="hashtagOk" type="checkbox" /> I used the required hashtag</label>
            <label><input name="soundOk" type="checkbox" /> I used the required sound, if listed</label>
            <label><input name="disclosureOk" type="checkbox" /> I added paid partnership disclosure</label>
            <label><input name="publicVideoOk" type="checkbox" /> The video is public</label>
          </div>
          <button className="primary-button full" type="submit">Submit for review</button>
          </form>
        )}
      </section>
    </AppShell>
  );
}
