import Link from "next/link";
import { getMissionTitle, type Submission } from "@/lib/data";

export function SubmissionRow({
  submission,
  href,
}: {
  submission: Submission;
  href?: string;
}) {
  return (
    <Link className="submission-row clickable-row" href={href ?? `/submissions/${submission.id}`}>
      <div className="item-icon">▶</div>
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
      <span className="row-button">{submission.status}</span>
      <p className="row-footnote">{getMissionTitle(submission.missionId)}</p>
    </Link>
  );
}
