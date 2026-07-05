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
  status: "draft" | "live" | "closed" | "rejected";
  required_hashtag: string;
  required_sound: string | null;
  minimum_views: number;
  views_per_submission: number | null;
  disclosure_required: boolean;
  funded_at?: string | null;
  approved_at?: string | null;
  deposit_reference?: string | null;
  rejection_reason?: string | null;
  rejected_at?: string | null;
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
  missions?: { title: string; brands: { name: string } | { name: string }[] | null } | { title: string; brands: { name: string } | { name: string }[] | null }[] | null;
};

type WalletTransactionRow = {
  id: string;
  amount_cents: number;
  status: "pending" | "available" | "paid" | "reversed";
  label: string;
};

function formatMoney(cents: number) {
  return `₦${Math.round(cents / 100).toLocaleString()}`;
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
  if (status === "rejected") return "Rejected" as const;
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
    rejectionReason: row.rejection_reason ?? null,
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
  const mission = first(row.missions);
  const brand = mission ? first(mission.brands) : null;
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
    missionTitle: mission?.title ?? "Campaign",
    missionBrand: brand?.name ?? "Brand",
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

export async function listMissions(ownerUserId?: string) {
  const rows = await trySupabase(async () => {
    const supabase = createServerSupabaseClient();

    if (ownerUserId) {
      const { data: brandRows, error: brandError } = await supabase
        .from("brands")
        .select("id")
        .eq("owner_user_id", ownerUserId);

      if (brandError) throw brandError;
      const brandIds = (brandRows ?? []).map((row) => row.id as string);
      if (brandIds.length === 0) return [];

      const { data, error } = await supabase
        .from("missions")
        .select("*, brands(name)")
        .in("brand_id", brandIds)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data as MissionRow[];
    }

    const { data, error } = await supabase
      .from("missions")
      .select("*, brands(name)")
      .order("created_at", { ascending: false });

    if (error) throw error;
    return data as MissionRow[];
  });

  if (rows === null) return ownerUserId ? [] : missions;
  return rows.map(mapMission);
}

export async function listBrandWalletTransactions(ownerUserId: string) {
  const rows = await trySupabase(async () => {
    const supabase = createServerSupabaseClient();
    const { data: brands, error: brandError } = await supabase
      .from("brands")
      .select("id")
      .eq("owner_user_id", ownerUserId)
      .order("created_at", { ascending: true })
      .limit(1);

    if (brandError) throw brandError;
    const brand = brands?.[0];
    if (!brand) return [];

    const { data, error } = await supabase
      .from("brand_wallet_transactions")
      .select("id, amount_cents, type, status, label, created_at")
      .eq("brand_id", brand.id)
      .order("created_at", { ascending: false })
      .limit(50);

    if (error) throw error;
    return data as Array<{ id: string; amount_cents: number; type: string; status: string; label: string | null; created_at: string }>;
  });

  return (rows ?? []).map((row) => {
    const label =
      row.label ??
      (row.type === "deposit" ? "Deposit" : row.type === "allocation" ? "Campaign allocation" : row.type);
    const positive = row.amount_cents >= 0;
    return {
      id: row.id,
      label,
      type: row.type,
      status: row.status,
      amountCents: row.amount_cents,
      amount: (positive ? "+" : "−") + formatMoney(Math.abs(row.amount_cents)),
      positive,
      date: new Intl.DateTimeFormat("en", { day: "numeric", month: "short", year: "numeric" }).format(new Date(row.created_at)),
    };
  });
}

export async function getBrandWalletBalance(ownerUserId: string) {
  const row = await trySupabase(async () => {
    const supabase = createServerSupabaseClient();
    const { data: brands, error: brandError } = await supabase
      .from("brands")
      .select("id")
      .eq("owner_user_id", ownerUserId)
      .order("created_at", { ascending: true })
      .limit(1);

    if (brandError) throw brandError;
    const brand = brands?.[0];
    if (!brand) return 0;

    const { data, error } = await supabase
      .from("brand_wallet_transactions")
      .select("amount_cents")
      .eq("brand_id", brand.id)
      .eq("status", "completed");

    if (error) throw error;
    return (data ?? []).reduce((sum, item) => sum + item.amount_cents, 0);
  });

  return formatMoney(row ?? 0);
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

  // Only fall back to demo data when the query itself failed (rows === null).
  // A healthy query that legitimately found zero live missions should render
  // an empty state, not resurrect fake campaigns creators can't actually submit to.
  return rows === null ? missions.filter((mission) => mission.status === "Live") : rows.map(mapMission);
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

  // Same reasoning as listLiveMissions: only fall back to mock data when the
  // query genuinely failed, not when it legitimately found zero submissions —
  // otherwise the admin queue shows fake, un-actionable rows that 404 on review.
  return rows === null ? submissions : rows.map(mapSubmission);
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
      .select("*, creators(display_name, tiktok_handle), missions(title, brands(name)), submission_metrics(views, likes, comments, shares, saves), submission_scores(composite)")
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

function startOfCurrentMonth() {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
}

type AdminCreatorRow = {
  id: string;
  email: string;
  creators: { display_name: string; tiktok_handle: string; tiktok_verified_at: string | null } | { display_name: string; tiktok_handle: string; tiktok_verified_at: string | null }[] | null;
};

// Counts by users.role so this matches getAdminSignupStats — the creators/brands
// profile tables are only populated once a user completes onboarding (links
// TikTok, creates a mission, etc.), so counting those tables directly used to
// silently hide signed-up users who hadn't finished setup yet.
export async function listAdminCreators() {
  const rows = await trySupabase(async () => {
    const supabase = createServerSupabaseClient();
    const { data, error } = await supabase
      .from("users")
      .select("id, email, creators(display_name, tiktok_handle, tiktok_verified_at)")
      .eq("role", "creator")
      .order("created_at", { ascending: false })
      .limit(100);
    if (error) throw error;
    return data as AdminCreatorRow[];
  });

  return (rows ?? []).map((row) => {
    const profile = first(row.creators);
    return {
      id: row.id,
      name: profile?.display_name ?? row.email.split("@")[0],
      handle: profile?.tiktok_handle ?? "—",
      kyc: profile?.tiktok_verified_at ? "Verified" : "Not started",
      kycColor: (profile?.tiktok_verified_at ? "green" : "gray") as "green" | "gray",
      status: profile ? "Active" : "Pending setup",
      statusColor: (profile ? "green" : "orange") as "green" | "orange",
    };
  });
}

type AdminBrandRow = {
  id: string;
  email: string;
  brands: { name: string; category: string | null } | { name: string; category: string | null }[] | null;
};

export async function listAdminBrands() {
  const rows = await trySupabase(async () => {
    const supabase = createServerSupabaseClient();
    const { data, error } = await supabase
      .from("users")
      .select("id, email, brands(name, category)")
      .eq("role", "brand")
      .order("created_at", { ascending: false })
      .limit(100);
    if (error) throw error;
    return data as AdminBrandRow[];
  });

  return (rows ?? []).map((row) => {
    const profile = first(row.brands);
    return {
      id: row.id,
      name: profile?.name ?? row.email.split("@")[0],
      industry: profile?.category ?? "—",
      status: profile ? "Active" : "Pending setup",
      statusColor: (profile ? "green" : "orange") as "green" | "orange",
    };
  });
}

export async function getPlatformWalletStats() {
  const result = await trySupabase(async () => {
    const supabase = createServerSupabaseClient();
    const monthStart = startOfCurrentMonth();

    const [{ data: brandTxns }, { data: creatorTxns }] = await Promise.all([
      supabase
        .from("brand_wallet_transactions")
        .select("amount_cents, type, status")
        .gte("created_at", monthStart),
      supabase
        .from("wallet_transactions")
        .select("amount_cents, status")
        .gte("created_at", monthStart),
    ]);

    const deposits = (brandTxns ?? [])
      .filter((t) => t.type === "deposit" && t.status === "completed")
      .reduce((sum, t) => sum + t.amount_cents, 0);

    const paidToCreators = (creatorTxns ?? [])
      .filter((t) => t.status === "paid")
      .reduce((sum, t) => sum + t.amount_cents, 0);

    const brandFloat = (brandTxns ?? [])
      .filter((t) => t.status === "completed")
      .reduce((sum, t) => sum + t.amount_cents, 0);

    return { deposits, paidToCreators, float: Math.max(0, brandFloat) };
  });

  const stats = result ?? { deposits: 0, paidToCreators: 0, float: 0 };
  return {
    depositsLabel: formatMoney(stats.deposits),
    paidToCreatorsLabel: formatMoney(stats.paidToCreators),
    floatLabel: formatMoney(stats.float),
  };
}

export async function listPlatformPayoutQueue() {
  const rows = await trySupabase(async () => {
    const supabase = createServerSupabaseClient();
    const { data, error } = await supabase
      .from("wallet_transactions")
      .select("id, amount_cents, status, label, creators(display_name, tiktok_handle)")
      .in("status", ["available", "paid"])
      .order("created_at", { ascending: false })
      .limit(20);
    if (error) throw error;
    return data as Array<{
      id: string;
      amount_cents: number;
      status: string;
      label: string | null;
      creators: CreatorRow | CreatorRow[] | null;
    }>;
  });

  return (rows ?? []).map((row) => {
    const creator = first(row.creators);
    return {
      id: row.id,
      handle: creator?.tiktok_handle ?? "—",
      name: creator?.display_name ?? "Creator",
      amount: formatMoney(row.amount_cents),
      label: row.label ?? "Reward",
      state: (row.status === "paid" ? "complete" : "processing") as "processing" | "complete" | "failed",
      stateLabel: row.status === "paid" ? "Complete" : "Pending payout",
    };
  });
}

export async function getAdminSignupStats() {
  const result = await trySupabase(async () => {
    const supabase = createServerSupabaseClient();
    const [{ count: creatorCount }, { count: brandCount }] = await Promise.all([
      supabase.from("users").select("*", { count: "exact", head: true }).eq("role", "creator"),
      supabase.from("users").select("*", { count: "exact", head: true }).eq("role", "brand"),
    ]);
    return {
      creatorCount: creatorCount ?? 0,
      brandCount: brandCount ?? 0,
      total: (creatorCount ?? 0) + (brandCount ?? 0),
    };
  });

  return result ?? { creatorCount: 0, brandCount: 0, total: 0 };
}

export async function listRejectedSubmissionsForDisputes() {
  const rows = await trySupabase(async () => {
    const supabase = createServerSupabaseClient();
    const { data, error } = await supabase
      .from("submissions")
      .select("id, creators(display_name, tiktok_handle), missions(title, brands(name)), submission_reviews(reason, decision)")
      .eq("status", "rejected")
      .order("submitted_at", { ascending: false })
      .limit(20);
    if (error) throw error;
    return data as Array<{
      id: string;
      creators: CreatorRow | CreatorRow[] | null;
      missions: { title: string; brands: { name: string } | { name: string }[] | null } | { title: string; brands: { name: string } | { name: string }[] | null }[] | null;
      submission_reviews: { reason: string | null; decision: string } | { reason: string | null; decision: string }[] | null;
    }>;
  });

  return (rows ?? []).map((row) => {
    const creator = first(row.creators);
    const mission = first(row.missions);
    const brand = mission ? first(mission.brands) : null;
    const review = Array.isArray(row.submission_reviews) ? row.submission_reviews[0] : row.submission_reviews;
    return {
      id: row.id,
      handle: creator?.tiktok_handle ?? "@creator",
      name: creator?.display_name ?? "Creator",
      campaign: mission ? `${mission.title}${brand ? ` · ${brand.name}` : ""}` : "—",
      reason: review?.reason ?? "No reason recorded.",
    };
  });
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
