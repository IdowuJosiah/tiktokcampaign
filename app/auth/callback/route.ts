import { NextRequest, NextResponse } from "next/server";
import type { UserRole } from "@/lib/domain";
import { setAppSession } from "@/lib/auth";
import { createServerSupabaseClient, createSupabaseCookieAuthClient } from "@/lib/supabase/server";

function normalizeRole(role: unknown): UserRole {
  if (role === "admin") return "admin";
  if (role === "brand") return "brand";
  return "creator";
}

async function ensureUser(email: string, role: UserRole) {
  const supabase = createServerSupabaseClient();
  const { data: existingUser, error: findError } = await supabase
    .from("users")
    .select("id, role")
    .eq("email", email)
    .maybeSingle();

  if (findError) throw findError;
  if (existingUser) {
    return {
      id: existingUser.id as string,
      role: existingUser.role === "brand" || existingUser.role === "admin" ? existingUser.role : "creator",
      isNew: false,
    };
  }

  const { data: user, error } = await supabase
    .from("users")
    .insert({ email, role })
    .select("id, role")
    .single();

  if (error) throw error;
  return { id: user.id as string, role: normalizeRole(user.role), isNew: true };
}

export async function GET(request: NextRequest) {
  const url = new URL(request.url);
  const code = url.searchParams.get("code");
  const providerError = url.searchParams.get("error") || url.searchParams.get("error_code");
  const providerDescription = url.searchParams.get("error_description");
  const shouldChooseRole = url.searchParams.get("chooseRole") === "1";

  if (providerError) {
    console.error("Supabase OAuth provider error:", providerError, providerDescription);
    return NextResponse.redirect(new URL("/login?error=oauth_provider_failed", request.url));
  }

  if (!code) {
    return NextResponse.redirect(new URL("/login?error=oauth_missing_code", request.url));
  }

  try {
    const supabase = await createSupabaseCookieAuthClient();
    const { data, error } = await supabase.auth.exchangeCodeForSession(code);

    if (error) {
      console.error("Supabase OAuth code exchange failed:", error.message);
      return NextResponse.redirect(new URL("/login?error=oauth_exchange_failed", request.url));
    }
    const email = data.user?.email;
    if (!email) {
      return NextResponse.redirect(new URL("/login?error=oauth_email_missing", request.url));
    }

    const initialRole = normalizeRole(data.user?.user_metadata?.role ?? url.searchParams.get("role"));
    const appUser = await ensureUser(email, initialRole);
    await setAppSession({ id: appUser.id, email, role: appUser.role });

    const destination =
      shouldChooseRole && appUser.isNew && appUser.role !== "admin"
        ? "/onboarding/role"
        : appUser.role === "admin"
          ? "/admin"
          : appUser.role === "brand"
            ? "/dashboard/brand"
            : "/creator/profile";

    return NextResponse.redirect(new URL(destination, request.url));
  } catch (error) {
    const message = error instanceof Error ? error.message : "OAuth callback failed.";
    console.error("VoiceRank OAuth callback failed:", message);
    return NextResponse.redirect(new URL("/login?error=oauth_app_user_failed", request.url));
  }
}
