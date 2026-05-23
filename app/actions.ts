"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { missions as demoMissions } from "@/lib/data";
import { clearAppSession, requireRole, setAppSession } from "@/lib/auth";
import type { UserRole } from "@/lib/domain";
import { createServerSupabaseClient } from "@/lib/supabase/server";

const DEMO_BRAND_EMAIL = "brand@voicerank.local";
const DEMO_CREATOR_EMAIL = "creator@voicerank.local";
const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

function makeVerificationCode() {
  return `VR-${Math.random().toString(36).slice(2, 8).toUpperCase()}`;
}

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

function writeErrorRedirect(path: string, error: unknown): never {
  const message = error instanceof Error ? error.message : "Unable to reach Supabase.";
  const code =
    message.toLowerCase().includes("abort") ||
    message.toLowerCase().includes("timeout") ||
    message.toLowerCase().includes("upstream")
      ? "timeout"
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
        tiktok_verification_code: makeVerificationCode(),
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
      tiktok_verification_code: makeVerificationCode(),
      country: "NG",
    })
    .select("id")
    .single();

  if (error) throw error;
  return creator.id as string;
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
      deadline: deadline.toISOString(),
      status: "live",
      required_hashtag: demoMission.requiredHashtag,
      required_sound: demoMission.requiredSound,
      minimum_views: parseNumber(demoMission.minimumViews),
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
      deadline,
      status: "draft",
      required_hashtag: asString(formData, "requiredHashtag"),
      required_sound: asString(formData, "requiredSound") || null,
      minimum_views: parseNumber(asString(formData, "minimumViews")),
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
    await setAppSession({ id: appUser.id, email, role: appUser.role });
  } catch (error) {
    authErrorRedirect("/signup", error);
  }

  redirect(role === "brand" ? "/brand/missions/new" : "/creator/missions");
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
        ? "/internal/ops/submissions"
        : appUser.role === "brand"
          ? "/brand/missions"
          : "/creator/missions";
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
    const supabase = createServerSupabaseClient();
    const { error } = await supabase.from("submissions").insert({
      mission_id: missionId,
      creator_id: creatorId,
      tiktok_url: asString(formData, "tiktokUrl"),
      status: "submitted",
      hashtag_ok: checked(formData, "hashtagOk"),
      sound_ok: checked(formData, "soundOk"),
      disclosure_ok: checked(formData, "disclosureOk"),
      deadline_ok: true,
      public_video_ok: checked(formData, "publicVideoOk"),
    });

    if (error) throw error;

    revalidatePath("/");
    revalidatePath("/brand/review");
    revalidatePath("/admin/submissions");
  } catch (error) {
    writeErrorRedirect("/creator/submit", error);
  }

  redirect("/brand/review");
}

export async function logOut() {
  await clearAppSession();
  redirect("/");
}

export async function saveTikTokProfile(formData: FormData) {
  const session = await requireRole("creator");

  try {
    await ensureCreatorForUser(session.id, asString(formData, "tiktokHandle"), asString(formData, "displayName"));
    revalidatePath("/creator/profile");
  } catch (error) {
    writeErrorRedirect("/creator/profile", error);
  }

  redirect("/creator/profile");
}

export async function markTikTokVerified() {
  const session = await requireRole("creator");

  try {
    const supabase = createServerSupabaseClient();
    const { error } = await supabase
      .from("creators")
      .update({ tiktok_verified_at: new Date().toISOString() })
      .eq("user_id", session.id);

    if (error) throw error;
    revalidatePath("/creator/profile");
    revalidatePath("/creator/submit");
  } catch (error) {
    writeErrorRedirect("/creator/profile", error);
  }

  redirect("/creator/submit");
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
    revalidatePath("/creator/missions");
    revalidatePath("/internal/ops/submissions");
    revalidatePath(`/internal/ops/missions/${missionId}`);
  } catch (error) {
    writeErrorRedirect(`/internal/ops/missions/${missionId}`, error);
  }

  redirect(`/internal/ops/missions/${missionId}`);
}
