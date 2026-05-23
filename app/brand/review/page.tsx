import { AppShell } from "@/app/components/AppShell";
import { SubmissionRow } from "@/app/components/SubmissionRow";
import { listSubmissions } from "@/lib/repository";

export default async function BrandReviewPage() {
  const submissions = await listSubmissions();

  return (
    <AppShell>
      <header className="page-header">
        <div>
          <p className="eyebrow">Brand</p>
          <h1>Review queue</h1>
          <p>Approve, reject, or request fixes after checking TikTok link validity and campaign rules.</p>
        </div>
        <button className="ghost-button" type="button">Export CSV</button>
      </header>

      <section className="panel">
        <div className="submission-table">
          {submissions.map((submission) => (
            <SubmissionRow submission={submission} key={submission.id} />
          ))}
        </div>
      </section>
    </AppShell>
  );
}
