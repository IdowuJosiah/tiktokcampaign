import { getMissionTitle, type Submission } from "@/lib/data";

export function SubmissionRow({ submission }: { submission: Submission }) {
  return (
    <article className="submission-row">
      <div>
        <strong>{submission.creator}</strong>
        <span>{submission.handle}</span>
      </div>
      <div>
        <strong>{submission.views}</strong>
        <span>views</span>
      </div>
      <div>
        <strong>{submission.engagement}</strong>
        <span>engagement</span>
      </div>
      <div className="score-pill">{submission.score}</div>
      <button className="row-button" type="button">{submission.status}</button>
      <p className="row-footnote">{getMissionTitle(submission.missionId)}</p>
    </article>
  );
}
