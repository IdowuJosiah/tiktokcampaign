import {
  missions,
  scoreRules,
  stats,
  submissions,
  walletTransactions,
  getMission,
  getMissionTitle,
} from "./data";
import { createServerSupabaseClient } from "./supabase/server";

type BrandRow = {
  name: string;
};

type MissionRow = {
  id: string;
  title: string;
  brief: string;
  reward_pool_cents: number;
  payout_per_5_submissions_cents: number | null;
  deadline: string;
  status: "draft" | "live" | "closed";
  required_hashtag: string;
  required_sound: string | null;
  minimum_views: number;
  views_per_submission: number | null;
  disclosure_required: boolean;
  funded_at?: string | null;
  approved_at?: string | null;
  deposit_reference?: string | null;
  rules: string[] | null;
  brands: BrandRow | BrandRow[] | null;
};

type CreatorRow = {
  id?: string;
  display_name: string;
  tiktok_handle: string;
  tiktok_verification_code?: string | null;
  tiktok_verified_at?: string | null;
  tiktok_username?: string | null;
  tiktok_avatar_url?: string | null;
};

type SubmissionScoreRow = {
  composite: number;
};

type SubmissionMetricsRow = {
  views: number;
  likes: number;
  comments: number;
  shares: number;
  saves: number | null;
};

type SubmissionRow = {
  id: string;
  mission_id: string;
  creator_id: string;
  tiktok_url: string;
  status: "submitted" | "in_review" | "approved" | "needs_fix" | "rejected";
  hashtag_ok: boolean;
  sound_ok: boolean;
  disclosure_ok: boolean;
  deadline_ok: boolean;
  public_video_ok: boolean;
  reward_cents: number;
  creators: CreatorRow | CreatorRow[] | null;
  submission_scores: SubmissionScoreRow[] | null;
  submission_metrics: SubmissionMetricsRow[] | null;
};

type WalletTransactionRow = {
  id: string;
  amount_cents: number;
  status: "pending" | "available" | "paid" | "reversed";
  label: string;
};

function formatMoney(cents: number) {
  return `$${Math.round(cents / 100).toLocaleString()}`;
}

function parseMoney(label: string) {
  const amount = Number(label.replace(/[^0-9.]/g, ""));
  return Number.isFinite(amount) ? Math.round(amount * 100) : 0;
}

function formatViews(views: number) {
  if (views >= 1000) return `${(views / 1000).toFixed(1)}k`;
  return views.toLocaleString();
}

function first<T>(value: T | T[] | null | undefined) {
  if (Array.isArray(value)) return value[0];
  return value;
}

function missionStatus(status: MissionRow["status"]) {
  if (status === "live") return "Live" as const;
  if (status === "closed") return "Closed" as const;
  return "Draft" as const;
}

function submissionStatus(status: SubmissionRow["status"]) {
  if (status === "approved") return "Approved" as const;
  if (status === "needs_fix") return "Needs fix" as const;
  if (status === "rejected") return "Rejected" as const;
  return "Pending" as const;
}

function mapMission(row: MissionRow) {
  const brand = first(row.brands);
  const viewsPerSubmission = row.views_per_submission ?? row.minimum_views;
  const deadline = new Intl.DateTimeFormat("en", {
    month: "short",
    day: "numeric",
  }).format(new Date(row.deadline));

  return {
    id: row.id,
    brand: brand?.name ?? "Brand",
    title: row.title,
    brief: row.brief,
    rewardPool: formatMoney(row.reward_pool_cents),
    payoutPerFiveSubmissions: formatMoney(row.payout_per_5_submissions_cents ?? 0),
    deadline,
    status: missionStatus(row.status),
    minimumViews: row.minimum_views.toLocaleString(),
    viewsPerSubmission: viewsPerSubmission.toLocaleString(),
    requiredHashtag: row.required_hashtag,
    requiredSound: row.required_sound ?? "Creator choice",
    fundingStatus: row.funded_at ? ("Funded" as const) : ("Pending deposit" as const),
    depositReference: row.deposit_reference,
    approvedAt: row.approved_at,
    requirements: row.rules?.length
      ? row.rules
      : [
          `Use ${row.required_hashtag}`,
          row.required_sound ? `Use ${row.required_sound}` : "Creator choice sound",
          `${viewsPerSubmission.toLocaleString()} views required for each submission`,
          `${formatMoney(row.payout_per_5_submissions_cents ?? 0)} paid per 5 approved submissions`,
          row.disclosure_required ? "Add paid partnership disclosure" : "Disclosure optional",
        ],
  };
}

function mapSubmission(row: SubmissionRow) {
  const creator = first(row.creators);
  const metrics = row.submission_metrics?.[0];
  const score = row.submission_scores?.[0];
  const engagement =
    metrics && metrics.views > 0
      ? `${(((metrics.likes + metrics.comments + metrics.shares + (metrics.saves ?? 0)) / metrics.views) * 100).toFixed(1)}%`
      : "0.0%";

  return {
    id: row.id,
    creatorId: row.creator_id,
    creator: creator?.display_name ?? "Creator",
    handle: creator?.tiktok_handle ?? "@creator",
    missionId: row.mission_id,
    link: row.tiktok_url,
    views: metrics ? formatViews(metrics.views) : "Pending",
    engagement,
    score: score?.composite ?? 0,
    reward: formatMoney(row.reward_cents),
    status: submissionStatus(row.status),
    checks: {
      hashtag: row.hashtag_ok,
      sound: row.sound_ok,
      disclosure: row.disclosure_ok,
      deadline: row.deadline_ok,
    },
  };
}

function mapWalletTransaction(row: WalletTransactionRow) {
  return {
    id: row.id,
    label: row.label,
    amount: formatMoney(row.amount_cents),
    amountCents: row.amount_cents,
    status: row.status.charAt(0).toUpperCase() + row.status.slice(1),
  };
}

async function trySupabase<T>(query: () => Promise<T>) {
  try {
    return await query();
  } catch {
    return null;
  }
}

export async function listDashboardStats() {
  return stats;
}

export async function listMissions() {
  const rows = await trySupabase(async () => {
    const supabase = createServerSupabaseClient();
    const { data, error } = await supabase
      .from("missions")
      .select("*, brands(name)")
      .order("created_at", { ascending: false });

    if (error) throw error;
    return data as MissionRow[];
  });

  return rows?.length ? rows.map(mapMission) : missions;
}

export async function listLiveMissions() {
  const rows = await trySupabase(async () => {
    const supabase = createServerSupabaseClient();
    const { data, error } = await supabase
      .from("missions")
      .select("*, brands(name)")
      .eq("status", "live")
      .order("created_at", { ascending: false });

    if (error) throw error;
    return data as MissionRow[];
  });

  return rows?.length ? rows.map(mapMission) : missions.filter((mission) => mission.status === "Live");
}

export async function findMission(id: string) {
  const row = await trySupabase(async () => {
    const supabase = createServerSupabaseClient();
    const { data, error } = await supabase
      .from("missions")
      .select("*, brands(name)")
      .eq("id", id)
      .eq("status", "live")
      .maybeSingle();

    if (error) throw error;
    return data as MissionRow | null;
  });

  return row ? mapMission(row) : getMission(id);
}

export async function findMissionForOps(id: string) {
  const row = await trySupabase(async () => {
    const supabase = createServerSupabaseClient();
    const { data, error } = await supabase
      .from("missions")
      .select("*, brands(name)")
      .eq("id", id)
      .maybeSingle();

    if (error) throw error;
    return data as MissionRow | null;
  });

  return row ? mapMission(row) : getMission(id);
}

export async function listSubmissions() {
  const rows = await trySupabase(async () => {
    const supabase = createServerSupabaseClient();
    const { data, error } = await supabase
      .from("submissions")
      .select("*, creators(display_name, tiktok_handle), submission_metrics(views, likes, comments, shares, saves), submission_scores(composite)")
      .order("submitted_at", { ascending: false });

    if (error) throw error;
    return data as SubmissionRow[];
  });

  return rows?.length ? rows.map(mapSubmission) : submissions;
}

export async function listMissionSubmissions(missionId: string) {
  const rows = await trySupabase(async () => {
    const supabase = createServerSupabaseClient();
    const { data, error } = await supabase
      .from("submissions")
      .select("*, creators(display_name, tiktok_handle), submission_metrics(views, likes, comments, shares, saves), submission_scores(composite)")
      .eq("mission_id", missionId)
      .order("submitted_at", { ascending: false });

    if (error) throw error;
    return data as SubmissionRow[];
  });

  return rows ? rows.map(mapSubmission) : submissions.filter((submission) => submission.missionId === missionId);
}

export async function listCreatorSubmissions(userId: string) {
  const rows = await trySupabase(async () => {
    const supabase = createServerSupabaseClient();
    const { data: creator, error: creatorError } = await supabase
      .from("creators")
      .select("id")
      .eq("user_id", userId)
      .maybeSingle();

    if (creatorError) throw creatorError;
    if (!creator) return [] as SubmissionRow[];

    const { data, error } = await supabase
      .from("submissions")
      .select("*, creators(display_name, tiktok_handle), submission_metrics(views, likes, comments, shares, saves), submission_scores(composite)")
      .eq("creator_id", creator.id)
      .order("submitted_at", { ascending: false });

    if (error) throw error;
    return data as SubmissionRow[];
  });

  return rows ? rows.map(mapSubmission) : submissions;
}

export async function findSubmission(id: string) {
  const row = await trySupabase(async () => {
    const supabase = createServerSupabaseClient();
    const { data, error } = await supabase
      .from("submissions")
      .select("*, creators(display_name, tiktok_handle), submission_metrics(views, likes, comments, shares, saves), submission_scores(composite)")
      .eq("id", id)
      .maybeSingle();

    if (error) throw error;
    return data as SubmissionRow | null;
  });

  return row ? mapSubmission(row) : submissions.find((submission) => submission.id === id) ?? null;
}

export async function findSubmissionForAdmin(id: string) {
  return findSubmission(id);
}

export async function listScoreRules() {
  return scoreRules;
}

export async function listWalletTransactions() {
  return walletTransactions;
}

export async function listCreatorWalletTransactions(userId: string) {
  const rows = await trySupabase(async () => {
    const supabase = createServerSupabaseClient();
    const { data: creator, error: creatorError } = await supabase
      .from("creators")
      .select("id")
      .eq("user_id", userId)
      .maybeSingle();

    if (creatorError) throw creatorError;
    if (!creator) return [] as WalletTransactionRow[];

    const { data, error } = await supabase
      .from("wallet_transactions")
      .select("id, amount_cents, status, label")
      .eq("creator_id", creator.id)
      .order("created_at", { ascending: false });

    if (error) throw error;
    return data as WalletTransactionRow[];
  });

  return rows
    ? rows.map(mapWalletTransaction)
    : walletTransactions.map((transaction) => ({
        ...transaction,
        amountCents: parseMoney(transaction.amount),
      }));
}

export async function getCreatorWalletSummary(userId: string) {
  const transactions = await listCreatorWalletTransactions(userId);
  const totals = transactions.reduce(
    (sum, transaction) => {
      if (transaction.status === "Available") sum.available += transaction.amountCents ?? 0;
      if (transaction.status === "Pending") sum.pending += transaction.amountCents ?? 0;
      if (transaction.status === "Paid") sum.paid += Math.abs(transaction.amountCents ?? 0);
      return sum;
    },
    { available: 0, pending: 0, paid: 0 },
  );

  return {
    ...totals,
    availableLabel: formatMoney(totals.available),
    pendingLabel: formatMoney(totals.pending),
    paidLabel: formatMoney(totals.paid),
  };
}

export async function missionTitle(id: string) {
  const title = await trySupabase(async () => {
    const supabase = createServerSupabaseClient();
    const { data, error } = await supabase
      .from("missions")
      .select("title")
      .eq("id", id)
      .maybeSingle();

    if (error) throw error;
    return data?.title as string | undefined;
  });

  return title ?? getMissionTitle(id);
}

export async function getCreatorProfile(userId: string) {
  const row = await trySupabase(async () => {
    const supabase = createServerSupabaseClient();
    const { data, error } = await supabase
      .from("creators")
      .select("id, display_name, tiktok_handle, tiktok_username, tiktok_avatar_url, tiktok_verified_at")
      .eq("user_id", userId)
      .maybeSingle();

    if (error) throw error;
    return data as CreatorRow | null;
  });

  return row
    ? {
        id: row.id,
        displayName: row.display_name,
        tiktokHandle: row.tiktok_handle,
        tiktokUsername: row.tiktok_username,
        tiktokAvatarUrl: row.tiktok_avatar_url,
        verifiedAt: row.tiktok_verified_at,
      }
    : null;
}

export async function getCreatorPayoutReadiness(userId: string) {
  const row = await trySupabase(async () => {
    const supabase = createServerSupabaseClient();
    const { data: creator, error: creatorError } = await supabase
      .from("creators")
      .select("id")
      .eq("user_id", userId)
      .maybeSingle();

    if (creatorError) throw creatorError;
    if (!creator) return null;

    const [{ data: payout, error: payoutError }, { data: identity, error: identityError }] = await Promise.all([
      supabase
        .from("creator_payout_profiles")
        .select("bank_name, account_number, account_name, verified_at")
        .eq("creator_id", creator.id)
        .maybeSingle(),
      supabase
        .from("creator_identity_verifications")
        .select("legal_name, nin, status, verified_at")
        .eq("creator_id", creator.id)
        .maybeSingle(),
    ]);

    if (payoutError) throw payoutError;
    if (identityError) throw identityError;

    return {
      payout,
      identity,
    };
  });

  return {
    bankReady: Boolean(row?.payout),
    identityReady: row?.identity?.status === "verified" || row?.identity?.status === "pending",
    bankName: row?.payout?.bank_name,
    accountName: row?.payout?.account_name,
    accountNumber: row?.payout?.account_number,
    legalName: row?.identity?.legal_name,
    nin: row?.identity?.nin,
    identityStatus: row?.identity?.status ?? "not_started",
  };
}
