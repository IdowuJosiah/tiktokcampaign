"use server";

import { revalidatePath } from "next/cache";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { missions as demoMissions } from "@/lib/data";
import { clearAppSession, getAppSession, requireRole, setAppSession } from "@/lib/auth";
import type { UserRole } from "@/lib/domain";
import { createServerSupabaseClient, createSupabaseCookieAuthClient } from "@/lib/supabase/server";

const DEMO_BRAND_EMAIL = "brand@voicerank.local";
const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

function asString(formData: FormData, key: string) {
  const value = formData.get(key);
  return typeof value === "string" ? value.trim() : "";
}

function parseCents(value: string) {
  const amount = Number(value.replace(/[^0-9.]/g, ""));
  return Number.isFinite(amount) ? Math.round(amount * 100) : 0;
}

function parseNumber(value: string) {
  const amount = Number(value.replace(/[^0-9]/g, ""));
  return Number.isFinite(amount) ? amount : 0;
}

function checked(formData: FormData, key: string) {
  return formData.get(key) === "on";
}

function isTikTokUrl(value: string) {
  try {
    const url = new URL(value);
    return url.hostname === "tiktok.com" || url.hostname.endsWith(".tiktok.com");
  } catch {
    return false;
  }
}

function isTikTokSoundUrl(value: string) {
  try {
    const url = new URL(value);
    const isTikTokHost = url.hostname === "tiktok.com" || url.hostname.endsWith(".tiktok.com");
    return isTikTokHost && (url.pathname.includes("/music/") || url.pathname.includes("/sound/"));
  } catch {
    return false;
  }
}

function extractSoundKeyword(soundUrl: string): string | null {
  try {
    const url = new URL(soundUrl);
    const segments = url.pathname.split("/").filter(Boolean);
    const slug = segments[segments.length - 1] ?? "";
    const withoutTrailingId = slug.replace(/-\d+$/, "");
    const keyword = withoutTrailingId.replace(/-/g, " ").trim().toLowerCase();
    return keyword.length > 2 ? keyword : null;
  } catch {
    return null;
  }
}

const MAX_TITLE_LENGTH = 80;
const MAX_BRIEF_LENGTH = 2000;
const MAX_HASHTAG_LENGTH = 50;
const MAX_RULE_LENGTH = 200;

function extractErrorMessage(error: unknown, fallback: string): string {
  if (error instanceof Error) return error.message;
  if (typeof error === "object" && error !== null && "message" in error) {
    return String((error as { message: unknown }).message);
  }
  return fallback;
}

function writeErrorRedirect(path: string, error: unknown): never {
  const message = extractErrorMessage(error, "Unable to reach Supabase.");
  console.error("Database write failed:", message, error);
  const code =
    message.toLowerCase().includes("abort") ||
    message.toLowerCase().includes("timeout") ||
    message.toLowerCase().includes("upstream")
      ? "timeout"
      : message.toLowerCase().includes("schema cache")
        ? "schema_cache_stale"
        : message.toLowerCase().includes("payout_per_5_submissions_cents") ||
            message.toLowerCase().includes("views_per_submission")
          ? "campaign_columns_missing"
          : message.toLowerCase().includes("creator_payout_profiles") ||
              message.toLowerCase().includes("creator_identity_verifications")
            ? "payout_tables_missing"
          : message.toLowerCase().includes("out of range") || message.toLowerCase().includes("integer")
            ? "campaign_amount_too_large"
          : message.toLowerCase().includes("duplicate key") && message.toLowerCase().includes("submissions")
            ? "duplicate_submission"
      : "write_failed";

  redirect(`${path}?error=${code}`);
}

function authErrorRedirect(path: string, error: unknown): never {
  const message = error instanceof Error ? error.message : "Authentication failed.";
  const code =
    message.toLowerCase().includes("invalid") || message.toLowerCase().includes("credentials")
      ? "invalid_credentials"
      : message.toLowerCase().includes("already")
        ? "already_registered"
        : "auth_failed";

  redirect(`${path}?error=${code}`);
}

function normalizeRole(role: unknown): UserRole {
  return role === "brand" || role === "admin" ? role : "creator";
}

async function ensureUser(email: string, role: UserRole) {
  const supabase = createServerSupabaseClient();
  const { data: existingUser, error: findError } = await supabase
    .from("users")
    .select("id, role")
    .eq("email", email)
    .maybeSingle();

  if (findError) throw findError;
  if (existingUser) return { id: existingUser.id as string, role: normalizeRole(existingUser.role) };

  const { data: user, error } = await supabase
    .from("users")
    .insert({ email, role })
    .select("id, role")
    .single();

  if (error) throw error;
  return { id: user.id as string, role: normalizeRole(user.role) };
}

async function ensureBrandForUser(brandName: string, ownerUserId?: string) {
  const supabase = createServerSupabaseClient();
  const brandOwnerUserId = ownerUserId ?? (await ensureUser(DEMO_BRAND_EMAIL, "brand")).id;

  const { data: existingBrands, error: findError } = await supabase
    .from("brands")
    .select("id")
    .eq("owner_user_id", brandOwnerUserId)
    .order("created_at", { ascending: true })
    .limit(1);

  if (findError) throw findError;

  const existingBrand = existingBrands?.[0];
  if (existingBrand) {
    if (brandName) {
      const { error } = await supabase.from("brands").update({ name: brandName }).eq("id", existingBrand.id);
      if (error) throw error;
    }
    return existingBrand.id as string;
  }

  const { data: brand, error } = await supabase
    .from("brands")
    .insert({
      owner_user_id: brandOwnerUserId,
      name: brandName || "Demo Brand",
      category: "Consumer",
    })
    .select("id")
    .single();

  if (error) throw error;
  return brand.id as string;
}

async function getBrandWalletBalanceCents(brandId: string) {
  const supabase = createServerSupabaseClient();
  const { data, error } = await supabase
    .from("brand_wallet_transactions")
    .select("amount_cents")
    .eq("brand_id", brandId)
    .eq("status", "completed");

  if (error) throw error;
  return (data ?? []).reduce((sum, row) => sum + row.amount_cents, 0);
}

async function ensureCreatorForUser(userId: string, handle: string, displayName?: string) {
  const supabase = createServerSupabaseClient();
  const normalizedHandle = handle.startsWith("@") ? handle : `@${handle}`;
  const { data: existingCreator, error: findError } = await supabase
    .from("creators")
    .select("id")
    .eq("user_id", userId)
    .maybeSingle();

  if (findError) throw findError;

  if (existingCreator) {
    const { error } = await supabase
      .from("creators")
      .update({
        display_name: displayName || normalizedHandle.replace("@", ""),
        tiktok_handle: normalizedHandle,
        tiktok_verified_at: null,
      })
      .eq("id", existingCreator.id);

    if (error) throw error;
    return existingCreator.id as string;
  }

  const { data: creator, error } = await supabase
    .from("creators")
    .insert({
      user_id: userId,
      display_name: displayName || normalizedHandle.replace("@", ""),
      tiktok_handle: normalizedHandle,
      country: "NG",
    })
    .select("id")
    .single();

  if (error) throw error;
  return creator.id as string;
}

async function ensureTemporaryCreatorForUser(userId: string, email: string) {
  const supabase = createServerSupabaseClient();
  const { data: existingCreator, error: findError } = await supabase
    .from("creators")
    .select("id")
    .eq("user_id", userId)
    .maybeSingle();

  if (findError) throw findError;
  if (existingCreator) return existingCreator.id as string;

  const fallbackName = email.split("@")[0] || "creator";
  return ensureCreatorForUser(userId, `@voicerank_${userId.slice(0, 8)}`, fallbackName);
}

async function createDemoMission(slug: string) {
  const demoMission = demoMissions.find((mission) => mission.id === slug) ?? demoMissions[0];
  const brandId = await ensureBrandForUser(demoMission.brand);
  const supabase = createServerSupabaseClient();
  const deadline = new Date();
  deadline.setDate(deadline.getDate() + 14);

  const { data: mission, error } = await supabase
    .from("missions")
    .insert({
      brand_id: brandId,
      title: demoMission.title,
      brief: demoMission.brief,
      reward_pool_cents: parseCents(demoMission.rewardPool),
      payout_per_5_submissions_cents: parseCents(demoMission.payoutPerFiveSubmissions),
      deadline: deadline.toISOString(),
      status: "live",
      required_hashtag: demoMission.requiredHashtag,
      required_sound: demoMission.requiredSound,
      minimum_views: parseNumber(demoMission.minimumViews),
      views_per_submission: parseNumber(demoMission.viewsPerSubmission),
      disclosure_required: true,
      rules: demoMission.requirements,
    })
    .select("id")
    .single();

  if (error) throw error;
  return mission.id as string;
}

export async function createMission(formData: FormData) {
  const session = await requireRole("brand");

  const title = asString(formData, "title");
  const brief = asString(formData, "brief");
  const requiredHashtag = asString(formData, "requiredHashtag");
  const requiredSound = asString(formData, "requiredSound");
  const rewardPoolCents = parseCents(asString(formData, "rewardPool"));
  const payoutPerFiveCents = parseCents(asString(formData, "payoutPerFiveSubmissions"));
  const rules = asString(formData, "rules")
    .split("\n")
    .map((rule) => rule.trim())
    .filter(Boolean);

  if (title.length > MAX_TITLE_LENGTH) {
    redirect("/brand/missions/new?error=title_too_long");
  }
  if (brief.length > MAX_BRIEF_LENGTH) {
    redirect("/brand/missions/new?error=brief_too_long");
  }
  if (requiredHashtag.length > MAX_HASHTAG_LENGTH) {
    redirect("/brand/missions/new?error=hashtag_too_long");
  }
  if (rules.some((rule) => rule.length > MAX_RULE_LENGTH)) {
    redirect("/brand/missions/new?error=rule_too_long");
  }
  if (requiredSound && !isTikTokSoundUrl(requiredSound)) {
    redirect("/brand/missions/new?error=invalid_sound_url");
  }
  if (payoutPerFiveCents > rewardPoolCents) {
    redirect("/brand/missions/new?error=payout_exceeds_pool");
  }

  let brandId: string;
  try {
    brandId = await ensureBrandForUser(asString(formData, "brandName"), session.id);
  } catch (error) {
    writeErrorRedirect("/brand/missions/new", error);
  }

  const balanceCents = await getBrandWalletBalanceCents(brandId).catch(() => 0);
  if (rewardPoolCents > balanceCents) {
    redirect("/brand/missions/new?error=insufficient_wallet_balance");
  }

  try {
    const supabase = createServerSupabaseClient();
    const deadline = asString(formData, "deadline") || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString();

    const { data: mission, error } = await supabase
      .from("missions")
      .insert({
        brand_id: brandId,
        title,
        brief,
        reward_pool_cents: rewardPoolCents,
        payout_per_5_submissions_cents: payoutPerFiveCents,
        deadline,
        status: "draft",
        required_hashtag: requiredHashtag,
        required_sound: requiredSound || null,
        minimum_views: parseNumber(asString(formData, "viewsPerSubmission")),
        views_per_submission: parseNumber(asString(formData, "viewsPerSubmission")),
        disclosure_required: true,
        funded_at: new Date().toISOString(),
        rules,
      })
      .select("id")
      .single();

    if (error) throw error;

    const { error: ledgerError } = await supabase.from("brand_wallet_transactions").insert({
      brand_id: brandId,
      mission_id: mission.id,
      amount_cents: -rewardPoolCents,
      type: "campaign_funding",
      status: "completed",
    });

    if (ledgerError) throw ledgerError;

    revalidatePath("/");
    revalidatePath("/brand/missions");
    revalidatePath("/dashboard/brand");
  } catch (error) {
    writeErrorRedirect("/brand/missions/new", error);
  }

  redirect("/brand/missions");
}

export async function initiateBrandDeposit(formData: FormData) {
  const session = await requireRole("brand");
  const amountCents = parseCents(asString(formData, "amount"));

  if (amountCents < 100) {
    redirect("/dashboard/brand?error=invalid_deposit_amount");
  }

  if (!process.env.PAYSTACK_SECRET_KEY) {
    redirect("/dashboard/brand?error=deposit_key_missing");
  }

  let brandId: string;
  try {
    brandId = await ensureBrandForUser(asString(formData, "brandName"), session.id);
  } catch (error) {
    const message = extractErrorMessage(error, "Could not resolve brand.");
    console.error("Brand deposit initialization failed (brand lookup):", message);
    const isWalletTableError = message.toLowerCase().includes("brand_wallet_transactions") || message.toLowerCase().includes("relation");
    redirect(`/dashboard/brand?error=${isWalletTableError ? "wallet_table_missing" : "deposit_init_failed"}`);
  }

  const headerStore = await headers();
  const origin = headerStore.get("origin") ?? process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
  const reference = `brand_${brandId.slice(0, 8)}_${Date.now()}`;

  let authorizationUrl: string;
  try {
    const { initializePaystackTransaction } = await import("@/lib/paystack");
    authorizationUrl = await initializePaystackTransaction({
      email: session.email,
      amountCents,
      reference,
      callbackUrl: `${origin}/api/paystack/callback`,
    });
  } catch (error) {
    const message = extractErrorMessage(error, "Could not initialize Paystack transaction.");
    console.error("Brand deposit initialization failed (Paystack):", message);
    redirect("/dashboard/brand?error=deposit_api_failed");
  }

  redirect(authorizationUrl);
}

export async function signUp(formData: FormData) {
  const role = asString(formData, "role") === "brand" ? "brand" : "creator";
  const email = asString(formData, "email");
  const password = asString(formData, "password");
  const name = asString(formData, "name");
  const tiktokHandle = asString(formData, "tiktokHandle");
  const supabase = createServerSupabaseClient();

  try {
    const { error } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: {
        name,
        role,
      },
    });

    if (error) throw error;
    const appUser = await ensureUser(email, role);
    if (appUser.role !== role) {
      await supabase.from("users").update({ role }).eq("id", appUser.id);
    }
    if (role === "creator" && tiktokHandle) {
      await ensureCreatorForUser(appUser.id, tiktokHandle, name);
    }
    await setAppSession({ id: appUser.id, email, role });
  } catch (error) {
    authErrorRedirect("/signup", error);
  }

  redirect(role === "brand" ? "/dashboard/brand" : tiktokHandle ? "/creator/profile" : "/dashboard/creator");
}

export async function continueWithGoogle() {
  const headerStore = await headers();
  const origin = headerStore.get("origin") ?? process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
  const supabase = await createSupabaseCookieAuthClient();

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: {
      redirectTo: `${origin}/auth/callback?chooseRole=1`,
      queryParams: {
        access_type: "offline",
        prompt: "consent",
      },
    },
  });

  if (error || !data.url) {
    authErrorRedirect("/signup", error ?? new Error("Google OAuth URL was not returned."));
  }

  redirect(data.url);
}

export async function chooseAccountRole(formData: FormData) {
  const session = await getAppSession();
  const role = asString(formData, "role") === "brand" ? "brand" : "creator";

  if (!session) {
    redirect("/login?error=login_required");
  }

  try {
    const supabase = createServerSupabaseClient();
    const { error } = await supabase.from("users").update({ role }).eq("id", session.id);

    if (error) throw error;
    await setAppSession({ ...session, role });
  } catch (error) {
    writeErrorRedirect("/onboarding/role", error);
  }

  redirect(role === "brand" ? "/dashboard/brand" : "/dashboard/creator");
}

export async function logIn(formData: FormData) {
  const email = asString(formData, "email");
  const password = asString(formData, "password");
  const supabase = createServerSupabaseClient();
  let destination = "/creator/missions";

  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) throw error;

    const role = normalizeRole(data.user?.user_metadata?.role);
    const appUser = await ensureUser(email, role);
    if (appUser.role !== role) {
      await supabase.from("users").update({ role }).eq("id", appUser.id);
    }
    const effectiveRole = appUser.role !== role ? role : appUser.role;
    await setAppSession({ id: appUser.id, email, role: effectiveRole });
    destination =
      effectiveRole === "admin"
        ? "/admin"
        : effectiveRole === "brand"
          ? "/dashboard/brand"
          : "/dashboard/creator";
  } catch (error) {
    authErrorRedirect("/login", error);
  }

  redirect(destination);
}

export async function submitTikTokVideo(formData: FormData) {
  const session = await requireRole("creator");

  let verifiedCreator: {
    id: string;
    tiktok_verified_at: string | null;
    tiktok_username: string | null;
    tiktok_handle: string | null;
    tiktok_access_token: string | null;
    tiktok_refresh_token: string | null;
    tiktok_token_expires_at: string | null;
  };
  try {
    const supabaseCheck = createServerSupabaseClient();
    const { data, error: verifyError } = await supabaseCheck
      .from("creators")
      .select(
        "id, tiktok_verified_at, tiktok_username, tiktok_handle, tiktok_access_token, tiktok_refresh_token, tiktok_token_expires_at",
      )
      .eq("user_id", session.id)
      .maybeSingle();

    if (verifyError) throw verifyError;
    if (!data) redirect("/submit?error=tiktok_required");
    verifiedCreator = data;
  } catch (error) {
    writeErrorRedirect("/submit", error);
  }

  if (!verifiedCreator.tiktok_verified_at) {
    redirect("/submit?error=tiktok_required");
  }

  const ownerHandle = (verifiedCreator.tiktok_username || verifiedCreator.tiktok_handle?.replace(/^@/, "") || "").toLowerCase();
  if (!ownerHandle) {
    redirect("/submit?error=tiktok_required");
  }

  let missionId = asString(formData, "missionId");
  if (!uuidPattern.test(missionId)) {
    missionId = await createDemoMission(missionId);
  }

  const creatorId = verifiedCreator.id;
  const links = formData
    .getAll("tiktokUrl")
    .filter((value): value is string => typeof value === "string")
    .map((value) => value.trim().replace(/\/$/, ""))
    .filter(Boolean);
  const uniqueLinks = Array.from(new Set(links));

  if (links.length === 0 || links.length !== uniqueLinks.length || uniqueLinks.some((link) => !isTikTokUrl(link))) {
    redirect("/submit?error=invalid_tiktok_links");
  }

  if (uniqueLinks.length < 5) {
    redirect("/submit?error=minimum_five_links");
  }

  const { fetchTikTokVideoAuthor, findTikTokVideoByShareUrl, refreshTikTokAccessToken } = await import("@/lib/tiktok");
  const authors = await Promise.all(uniqueLinks.map((link) => fetchTikTokVideoAuthor(link).catch(() => null)));
  if (authors.some((author) => author !== ownerHandle)) {
    redirect("/submit?error=tiktok_ownership_mismatch");
  }

  let soundFlags: boolean[] | null = null;

  if (verifiedCreator.tiktok_access_token && verifiedCreator.tiktok_refresh_token) {
    let validationError: string | null = null;

    try {
      let accessToken = verifiedCreator.tiktok_access_token;
      const expiresAt = verifiedCreator.tiktok_token_expires_at
        ? new Date(verifiedCreator.tiktok_token_expires_at).getTime()
        : 0;

      if (expiresAt < Date.now() + 60_000) {
        const refreshed = await refreshTikTokAccessToken(verifiedCreator.tiktok_refresh_token);
        accessToken = refreshed.accessToken;
        const supabaseRefresh = createServerSupabaseClient();
        await supabaseRefresh
          .from("creators")
          .update({
            tiktok_access_token: refreshed.accessToken,
            tiktok_refresh_token: refreshed.refreshToken,
            tiktok_token_expires_at: new Date(Date.now() + refreshed.expiresInSeconds * 1000).toISOString(),
          })
          .eq("id", creatorId);
      }

      const supabaseMission = createServerSupabaseClient();
      const { data: missionRow } = await supabaseMission
        .from("missions")
        .select("minimum_views, required_sound")
        .eq("id", missionId)
        .maybeSingle();

      const minimumViews = missionRow?.minimum_views ?? 0;
      const requiredSoundKeyword = missionRow?.required_sound ? extractSoundKeyword(missionRow.required_sound) : null;

      const videoStats = await Promise.all(
        uniqueLinks.map((link) => findTikTokVideoByShareUrl(accessToken, link).catch(() => null)),
      );

      if (videoStats.some((stats) => !stats)) {
        validationError = "tiktok_video_not_found";
      } else if (minimumViews > 0 && videoStats.some((stats) => (stats?.viewCount ?? 0) < minimumViews)) {
        validationError = "insufficient_views";
      } else if (requiredSoundKeyword) {
        // Caption keyword matching is a heuristic, not real sound-usage data (TikTok's
        // public API doesn't expose it) — flag mismatches for admin review instead of
        // blocking the submission outright, since false negatives are common.
        soundFlags = videoStats.map((stats) => Boolean(stats?.description.toLowerCase().includes(requiredSoundKeyword)));
      }
    } catch (error) {
      console.error("TikTok video validation failed:", error);
      validationError = "tiktok_validation_failed";
    }

    if (validationError) {
      redirect(`/submit?error=${validationError}`);
    }
  }

  const needsSoundReview = soundFlags?.some((matched) => !matched) ?? false;

  try {
    const supabase = createServerSupabaseClient();
    const { error } = await supabase.from("submissions").insert(
      uniqueLinks.map((link, index) => ({
        mission_id: missionId,
        creator_id: creatorId,
        tiktok_url: link,
        status: needsSoundReview ? "in_review" : "submitted",
        hashtag_ok: checked(formData, "hashtagOk"),
        sound_ok: soundFlags ? soundFlags[index] : checked(formData, "soundOk"),
        disclosure_ok: checked(formData, "disclosureOk"),
        deadline_ok: true,
        public_video_ok: checked(formData, "publicVideoOk"),
      })),
    );

    if (error) throw error;

    revalidatePath("/");
    revalidatePath("/dashboard/creator");
    revalidatePath("/admin/submissions");
  } catch (error) {
    writeErrorRedirect("/submit", error);
  }

  redirect(needsSoundReview ? "/dashboard/creator?success=submitted_for_sound_review" : "/dashboard/creator");
}

export async function logOut() {
  await clearAppSession();
  redirect("/");
}

export async function unlinkTikTok() {
  const session = await requireRole("creator");

  try {
    const supabase = createServerSupabaseClient();
    const { data: creator, error: findError } = await supabase
      .from("creators")
      .select("id")
      .eq("user_id", session.id)
      .maybeSingle();

    if (findError) throw findError;
    if (!creator) redirect("/creator/profile?error=write_failed");

    const { error } = await supabase
      .from("creators")
      .update({
        tiktok_verified_at: null,
        tiktok_open_id: null,
        tiktok_username: null,
        tiktok_avatar_url: null,
        tiktok_access_token: null,
        tiktok_refresh_token: null,
        tiktok_token_expires_at: null,
      })
      .eq("id", creator.id);

    if (error) throw error;
    revalidatePath("/creator/profile");
  } catch (error) {
    writeErrorRedirect("/creator/profile", error);
  }

  redirect("/creator/profile");
}

export async function savePayoutProfile(formData: FormData) {
  const session = await requireRole("creator");
  const accountName = asString(formData, "accountName");

  if (!accountName) {
    redirect("/creator/profile?error=account_unresolved");
  }

  try {
    const supabase = createServerSupabaseClient();
    const creatorId = await ensureTemporaryCreatorForUser(session.id, session.email);

    const { error } = await supabase.from("creator_payout_profiles").upsert(
      {
        creator_id: creatorId,
        bank_name: asString(formData, "bankName"),
        account_number: asString(formData, "accountNumber"),
        account_name: accountName,
      },
      { onConflict: "creator_id" },
    );

    if (error) throw error;
    revalidatePath("/creator/profile");
    revalidatePath("/creator/wallet");
  } catch (error) {
    if (error instanceof Error && error.message === "tiktok_profile_required") {
      redirect("/creator/profile?error=tiktok_profile_required");
    }
    writeErrorRedirect("/creator/profile", error);
  }

  redirect("/creator/profile");
}

export async function saveIdentityVerification(formData: FormData) {
  const session = await requireRole("creator");

  try {
    const supabase = createServerSupabaseClient();
    const creatorId = await ensureTemporaryCreatorForUser(session.id, session.email);

    const { error } = await supabase.from("creator_identity_verifications").upsert(
      {
        creator_id: creatorId,
        legal_name: asString(formData, "legalName"),
        nin: asString(formData, "nin"),
        status: "pending",
      },
      { onConflict: "creator_id" },
    );

    if (error) throw error;
    revalidatePath("/creator/profile");
    revalidatePath("/creator/wallet");
  } catch (error) {
    writeErrorRedirect("/creator/profile", error);
  }

  redirect("/creator/profile?success=nin_submitted");
}

export async function approveMission(formData: FormData) {
  await requireRole("admin");
  const missionId = asString(formData, "missionId");

  let currentStatus: string | null;
  try {
    const supabaseCheck = createServerSupabaseClient();
    const { data: existing, error: findError } = await supabaseCheck
      .from("missions")
      .select("status")
      .eq("id", missionId)
      .maybeSingle();

    if (findError) throw findError;
    currentStatus = existing?.status ?? null;
  } catch (error) {
    writeErrorRedirect(`/admin/campaigns/${missionId}`, error);
  }

  if (currentStatus === "rejected") {
    redirect(`/admin/campaigns/${missionId}?error=mission_rejected`);
  }

  try {
    const supabase = createServerSupabaseClient();
    const now = new Date().toISOString();
    const { error } = await supabase
      .from("missions")
      .update({
        status: "live",
        approved_at: now,
        funded_at: now,
      })
      .eq("id", missionId);

    if (error) throw error;
    revalidatePath("/");
    revalidatePath("/campaigns");
    revalidatePath("/creator/missions");
    revalidatePath("/admin/campaigns");
    revalidatePath("/internal/ops/submissions");
    revalidatePath(`/admin/campaigns/${missionId}`);
    revalidatePath(`/internal/ops/missions/${missionId}`);
  } catch (error) {
    writeErrorRedirect(`/admin/campaigns/${missionId}`, error);
  }

  redirect(`/admin/campaigns/${missionId}`);
}

export async function rejectMission(formData: FormData) {
  await requireRole("admin");
  const missionId = asString(formData, "missionId");
  const reason = asString(formData, "reason").trim();

  if (!reason) {
    redirect(`/admin/campaigns/${missionId}?error=rejection_reason_required`);
  }

  try {
    const supabase = createServerSupabaseClient();
    const { error } = await supabase
      .from("missions")
      .update({
        status: "rejected",
        rejection_reason: reason,
        rejected_at: new Date().toISOString(),
      })
      .eq("id", missionId);

    if (error) throw error;
    revalidatePath("/");
    revalidatePath("/campaigns");
    revalidatePath("/creator/missions");
    revalidatePath("/admin/campaigns");
    revalidatePath("/brand/missions");
    revalidatePath(`/admin/campaigns/${missionId}`);
    revalidatePath(`/internal/ops/missions/${missionId}`);
  } catch (error) {
    writeErrorRedirect(`/admin/campaigns/${missionId}`, error);
  }

  redirect(`/admin/campaigns/${missionId}`);
}

export async function reviewSubmission(formData: FormData) {
  const session = await requireRole("admin");
  const submissionId = asString(formData, "submissionId");
  const decision = asString(formData, "decision");
  const reason = asString(formData, "reason");
  const rewardCents = parseCents(asString(formData, "reward"));
  const nextStatus =
    decision === "approve"
      ? "approved"
      : decision === "request_fix"
        ? "needs_fix"
        : "rejected";

  try {
    const supabase = createServerSupabaseClient();
    const { data: submission, error: submissionError } = await supabase
      .from("submissions")
      .select("id, creator_id, mission_id")
      .eq("id", submissionId)
      .maybeSingle();

    if (submissionError) throw submissionError;
    if (!submission) throw new Error("Submission not found.");

    const { error: updateError } = await supabase
      .from("submissions")
      .update({
        status: nextStatus,
        reward_cents: nextStatus === "approved" ? rewardCents : 0,
      })
      .eq("id", submissionId);

    if (updateError) throw updateError;

    const { error: reviewError } = await supabase.from("submission_reviews").insert({
      submission_id: submissionId,
      reviewer_user_id: session.id,
      decision,
      reason,
    });

    if (reviewError) throw reviewError;

    await supabase.from("wallet_transactions").delete().eq("submission_id", submissionId);

    if (nextStatus === "approved" && rewardCents > 0) {
      const { error: walletError } = await supabase.from("wallet_transactions").insert({
        creator_id: submission.creator_id,
        submission_id: submissionId,
        amount_cents: rewardCents,
        status: "available",
        label: "Approved campaign reward",
      });

      if (walletError) throw walletError;
    }

    revalidatePath("/admin/submissions");
    revalidatePath(`/admin/submissions/${submissionId}`);
    revalidatePath("/dashboard/creator");
    revalidatePath("/creator/profile");
    revalidatePath("/creator/wallet");
    revalidatePath(`/submissions/${submissionId}`);
  } catch (error) {
    writeErrorRedirect(`/admin/submissions/${submissionId}`, error);
  }

  redirect(`/admin/submissions/${submissionId}`);
}
