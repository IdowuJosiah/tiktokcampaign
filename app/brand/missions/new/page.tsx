import { AppShell } from "@/app/components/AppShell";

export default function NewMissionPage() {
  return (
    <AppShell>
      <header className="page-header">
        <div>
          <p className="eyebrow">Brand</p>
          <h1>Create mission</h1>
          <p>Define the brief, required hashtag, sound, view minimum, budget, and deadline.</p>
        </div>
      </header>

      <section className="panel form-panel">
        <form className="submission-form">
          <label>
            Brand name
            <input type="text" placeholder="Kuda" />
          </label>
          <label>
            Mission title
            <input type="text" placeholder="Show your real split-bill routine" />
          </label>
          <label>
            Creator brief
            <textarea placeholder="Tell creators what to show, what to avoid, and what counts as valid proof." />
          </label>
          <div className="form-grid">
            <label>
              Reward pool
              <input type="text" placeholder="$2,000" />
            </label>
            <label>
              Minimum views
              <input type="text" placeholder="1,000" />
            </label>
          </div>
          <div className="form-grid">
            <label>
              Required hashtag
              <input type="text" placeholder="#KudaSplit" />
            </label>
            <label>
              Required sound
              <input type="text" placeholder="TikTok sound URL or sound name" />
            </label>
          </div>
          <label>
            Deadline
            <input type="date" />
          </label>
          <button className="primary-button full" type="button">Save mission draft</button>
        </form>
      </section>
    </AppShell>
  );
}
