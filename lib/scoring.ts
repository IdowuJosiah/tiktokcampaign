import type { MissionRequirement, SubmissionChecks, SubmissionMetrics, SubmissionScore } from "./domain";

const clamp = (value: number) => Math.max(0, Math.min(100, Math.round(value)));

export function scoreInstructionMatch(checks: SubmissionChecks, requirement: MissionRequirement) {
  const soundWeight = requirement.requiredSound ? 20 : 0;
  const total = 30 + soundWeight + 25 + 15 + 10;
  const earned =
    (checks.hashtag ? 30 : 0) +
    (checks.sound || !requirement.requiredSound ? soundWeight : 0) +
    (checks.disclosure || !requirement.disclosureRequired ? 25 : 0) +
    (checks.deadline ? 15 : 0) +
    (checks.publicVideo ? 10 : 0);

  return clamp((earned / total) * 100);
}

export function calculateEngagementRate(metrics: SubmissionMetrics) {
  if (metrics.views <= 0) return 0;
  return (metrics.likes + metrics.comments + metrics.shares + (metrics.saves ?? 0)) / metrics.views;
}

export function scoreReachQuality(metrics: SubmissionMetrics, minimumViews: number) {
  const viewScore = (metrics.views / minimumViews) * 70;
  const engagementBonus = calculateEngagementRate(metrics) * 600;
  return clamp(viewScore + engagementBonus);
}

export function buildSubmissionScore(params: {
  checks: SubmissionChecks;
  metrics: SubmissionMetrics;
  requirement: MissionRequirement;
  authenticity: number;
  brandSafety: number;
}): SubmissionScore {
  const instructionMatch = scoreInstructionMatch(params.checks, params.requirement);
  const reachQuality = scoreReachQuality(params.metrics, params.requirement.minimumViews);
  const engagementDepth = clamp(calculateEngagementRate(params.metrics) * 900);
  const authenticity = clamp(params.authenticity);
  const brandSafety = clamp(params.brandSafety);

  const composite = clamp(
    instructionMatch * 0.3 +
      reachQuality * 0.25 +
      engagementDepth * 0.2 +
      authenticity * 0.15 +
      brandSafety * 0.1,
  );

  return {
    instructionMatch,
    reachQuality,
    engagementDepth,
    authenticity,
    brandSafety,
    composite,
  };
}
