import { AppShell } from "@/app/components/AppShell";
import { missions } from "@/lib/data";

export default function CreatorSubmitPage() {
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
        <form className="submission-form">
          <label>
            Mission
            <select defaultValue={missions[0].id}>
              {missions.map((mission) => (
                <option value={mission.id} key={mission.id}>{mission.brand} · {mission.title}</option>
              ))}
            </select>
          </label>
          <label>
            TikTok video link
            <input type="url" placeholder="https://www.tiktok.com/@creator/video/..." />
          </label>
          <label>
            Creator handle
            <input type="text" placeholder="@yourhandle" />
          </label>
          <div className="checklist">
            <label><input type="checkbox" /> I used the required hashtag</label>
            <label><input type="checkbox" /> I used the required sound, if listed</label>
            <label><input type="checkbox" /> I added paid partnership disclosure</label>
            <label><input type="checkbox" /> The video is public</label>
          </div>
          <button className="primary-button full" type="button">Submit for review</button>
        </form>
      </section>
    </AppShell>
  );
}
