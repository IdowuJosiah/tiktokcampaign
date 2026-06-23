"use server";

import { revalidatePath } from "next/cache";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { missions as demoMissions } from "@/lib/data";
import { clearAppSession, getAppSession, requireRole, setAppSession } from "@/lib/auth";
import type { UserRole } from "@/lib/domain";
import { createServerSupabaseClient, createSupabaseCookieAuthClient } from "@/lib/supabase/server";

const DEMO_BRAND_EMAIL = "brand@voicerank.local";
const DEMO_CREATOR_EMAIL = "creator@voicerank.local";
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

function writeErrorRedirect(path: string, error: unknown): never {
  const message = error instanceof Error ? error.message : "Unable to reach Supabase.";
  console.error("Database write failed:", message);
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

async function createBrand(brandName: string, ownerUserId?: string) {
  const supabase = createServerSupabaseClient();
  const brandOwnerUserId = ownerUserId ?? (await ensureUser(DEMO_BRAND_EMAIL, "brand")).id;
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

async function ensureCreator(handle: string) {
  const supabase = createServerSupabaseClient();
  const normalizedHandle = handle.startsWith("@") ? handle : `@${handle}`;
  const { data: existingCreator, error: findError } = await supabase
    .from("creators")
    .select("id")
    .eq("tiktok_handle", normalizedHandle)
    .maybeSingle();

  if (findError) throw findError;
  if (existingCreator) return existingCreator.id as string;

  const userId = (await ensureUser(DEMO_CREATOR_EMAIL, "creator")).id;
  const { data: creator, error } = await supabase
    .from("creators")
    .insert({
      user_id: userId,
      display_name: normalizedHandle.replace("@", ""),
      tiktok_handle: normalizedHandle,
      country: "NG",
    })
    .select("id")
    .single();

  if (error) throw error;
  return creator.id as string;
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
  const brandId = await createBrand(demoMission.brand);
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

  try {
    const brandId = await createBrand(asString(formData, "brandName"), session.id);
    const supabase = createServerSupabaseClient();
    const rules = asString(formData, "rules")
      .split("\n")
      .map((rule) => rule.trim())
      .filter(Boolean);

    const deadline = asString(formData, "deadline") || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString();

    const { error } = await supabase.from("missions").insert({
      brand_id: brandId,
      title: asString(formData, "title"),
      brief: asString(formData, "brief"),
      reward_pool_cents: parseCents(asString(formData, "rewardPool")),
      payout_per_5_submissions_cents: parseCents(asString(formData, "payoutPerFiveSubmissions")),
      deadline,
      status: "draft",
      required_hashtag: asString(formData, "requiredHashtag"),
      required_sound: asString(formData, "requiredSound") || null,
      minimum_views: parseNumber(asString(formData, "viewsPerSubmission")),
      views_per_submission: parseNumber(asString(formData, "viewsPerSubmission")),
      disclosure_required: true,
      deposit_reference: asString(formData, "depositReference"),
      rules,
    });

    if (error) throw error;

    revalidatePath("/");
    revalidatePath("/brand/missions");
  } catch (error) {
    writeErrorRedirect("/brand/missions/new", error);
  }

  redirect("/brand/missions");
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
    if (role === "creator" && tiktokHandle) {
      await ensureCreatorForUser(appUser.id, tiktokHandle, name);
    }
    await setAppSession({ id: appUser.id, email, role: appUser.role });
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
    await setAppSession({ id: appUser.id, email, role: appUser.role });
    destination =
      appUser.role === "admin"
        ? "/admin"
        : appUser.role === "brand"
          ? "/dashboard/brand"
          : "/dashboard/creator";
  } catch (error) {
    authErrorRedirect("/login", error);
  }

  redirect(destination);
}

export async function submitTikTokVideo(formData: FormData) {
  try {
    let missionId = asString(formData, "missionId");
    if (!uuidPattern.test(missionId)) {
      missionId = await createDemoMission(missionId);
    }

    const creatorId = await ensureCreator(asString(formData, "creatorHandle"));
    const links = formData
      .getAll("tiktokUrl")
      .filter((value): value is string => typeof value === "string")
      .map((value) => value.trim().replace(/\/$/, ""))
      .filter(Boolean);
    const uniqueLinks = Array.from(new Set(links));

    if (links.length === 0 || links.length !== uniqueLinks.length || uniqueLinks.some((link) => !isTikTokUrl(link))) {
      redirect("/submit?error=invalid_tiktok_links");
    }

    const supabase = createServerSupabaseClient();
    const { error } = await supabase.from("submissions").insert(
      uniqueLinks.map((link) => ({
        mission_id: missionId,
        creator_id: creatorId,
        tiktok_url: link,
        status: "submitted",
        hashtag_ok: checked(formData, "hashtagOk"),
        sound_ok: checked(formData, "soundOk"),
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

  redirect("/dashboard/creator");
}

export async function logOut() {
  await clearAppSession();
  redirect("/");
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
