import { AppShell } from "@/app/components/AppShell";
import { getMissionTitle, submissions } from "@/lib/data";

export default function AdminSubmissionsPage() {
  return (
    <AppShell>
      <header className="page-header">
        <div>
          <p className="eyebrow">Admin</p>
          <h1>Submission operations</h1>
          <p>Internal queue for link checks, metric capture, fraud flags, and payout readiness.</p>
        </div>
      </header>

      <section className="panel">
        <div className="admin-table">
          {submissions.map((submission) => (
            <article className="admin-row" key={submission.id}>
              <div>
                <strong>{submission.creator}</strong>
                <span>{submission.link}</span>
              </div>
              <div>
                <strong>{getMissionTitle(submission.missionId)}</strong>
                <span>{submission.status}</span>
              </div>
              <div className="checks">
                <span>{submission.checks.hashtag ? "Hashtag" : "No hashtag"}</span>
                <span>{submission.checks.sound ? "Sound" : "No sound"}</span>
                <span>{submission.checks.disclosure ? "Disclosure" : "No disclosure"}</span>
              </div>
              <button className="row-button" type="button">Open</button>
            </article>
          ))}
        </div>
      </section>
    </AppShell>
  );
}
