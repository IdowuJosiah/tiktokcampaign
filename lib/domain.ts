export type UserRole = "brand" | "creator" | "admin";
export type MissionStatus = "draft" | "live" | "closed";
export type SubmissionStatus = "submitted" | "in_review" | "approved" | "needs_fix" | "rejected";
export type ReviewDecision = "approve" | "request_fix" | "reject";
export type WalletTransactionStatus = "pending" | "available" | "paid" | "reversed";

export type User = {
  id: string;
  email: string;
  role: UserRole;
  createdAt: string;
};

export type Brand = {
  id: string;
  ownerUserId: string;
  name: string;
  website?: string;
  category: string;
  createdAt: string;
};

export type Creator = {
  id: string;
  userId: string;
  displayName: string;
  tiktokHandle: string;
  tiktokVerificationCode?: string;
  tiktokVerifiedAt?: string;
  country: string;
  createdAt: string;
};

export type MissionRequirement = {
  requiredHashtag: string;
  requiredSound?: string;
  minimumViews: number;
  disclosureRequired: boolean;
  rules: string[];
};

export type MissionRecord = {
  id: string;
  brandId: string;
  title: string;
  brief: string;
  rewardPoolCents: number;
  deadline: string;
  status: MissionStatus;
  requirements: MissionRequirement;
  createdAt: string;
};

export type SubmissionChecks = {
  hashtag: boolean;
  sound: boolean;
  disclosure: boolean;
  deadline: boolean;
  publicVideo: boolean;
};

export type SubmissionMetrics = {
  views: number;
  likes: number;
  comments: number;
  shares: number;
  saves?: number;
  capturedAt: string;
};

export type SubmissionScore = {
  instructionMatch: number;
  reachQuality: number;
  engagementDepth: number;
  authenticity: number;
  brandSafety: number;
  composite: number;
};

export type SubmissionRecord = {
  id: string;
  missionId: string;
  creatorId: string;
  tiktokUrl: string;
  caption?: string;
  status: SubmissionStatus;
  checks: SubmissionChecks;
  metrics?: SubmissionMetrics;
  score?: SubmissionScore;
  rewardCents: number;
  submittedAt: string;
};

export type SubmissionReview = {
  id: string;
  submissionId: string;
  reviewerUserId: string;
  decision: ReviewDecision;
  reason?: string;
  createdAt: string;
};

export type WalletTransaction = {
  id: string;
  creatorId: string;
  submissionId?: string;
  amountCents: number;
  status: WalletTransactionStatus;
  label: string;
  createdAt: string;
};
