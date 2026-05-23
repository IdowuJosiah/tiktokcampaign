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
  deadline: string;
  status: "draft" | "live" | "closed";
  required_hashtag: string;
  required_sound: string | null;
  minimum_views: number;
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

function formatMoney(cents: number) {
  return `$${Math.round(cents / 100).toLocaleString()}`;
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
    deadline,
    status: missionStatus(row.status),
    minimumViews: row.minimum_views.toLocaleString(),
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
          `${row.minimum_views.toLocaleString()} minimum views`,
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

export async function listScoreRules() {
  return scoreRules;
}

export async function listWalletTransactions() {
  return walletTransactions;
}

export async function missionTitle(id: string) {
  return getMissionTitle(id);
}

export async function getCreatorProfile(userId: string) {
  const row = await trySupabase(async () => {
    const supabase = createServerSupabaseClient();
    const { data, error } = await supabase
      .from("creators")
      .select("id, display_name, tiktok_handle, tiktok_verification_code, tiktok_verified_at")
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
        verificationCode: row.tiktok_verification_code,
        verifiedAt: row.tiktok_verified_at,
      }
    : null;
}
