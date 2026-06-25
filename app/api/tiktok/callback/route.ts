import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { getAppSession } from "@/lib/auth";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { exchangeCodeForAccessToken, fetchTikTokUserInfo } from "@/lib/tiktok";

export async function GET(request: NextRequest) {
  const url = new URL(request.url);
  const code = url.searchParams.get("code");
  const state = url.searchParams.get("state");
  const providerError = url.searchParams.get("error");

  const cookieStore = await cookies();
  const expectedState = cookieStore.get("tiktok_oauth_state")?.value;
  const codeVerifier = cookieStore.get("tiktok_oauth_code_verifier")?.value;
  cookieStore.delete("tiktok_oauth_state");
  cookieStore.delete("tiktok_oauth_code_verifier");

  const errorDest = "/creator/profile?error=tiktok_oauth_failed";

  if (providerError) {
    console.error("TikTok OAuth provider error:", providerError);
    return NextResponse.redirect(new URL(errorDest, request.url));
  }

  if (!code || !state || !expectedState || !codeVerifier || state !== expectedState) {
    return NextResponse.redirect(new URL(errorDest, request.url));
  }

  const session = await getAppSession();
  if (!session || session.role !== "creator") {
    return NextResponse.redirect(new URL("/login?error=creator_required", request.url));
  }

  const origin = process.env.NEXT_PUBLIC_SITE_URL ?? url.origin;
  const redirectUri = `${origin}/api/tiktok/callback`;

  try {
    const accessToken = await exchangeCodeForAccessToken({ code, redirectUri, codeVerifier });
    const profile = await fetchTikTokUserInfo(accessToken);
    const supabase = createServerSupabaseClient();

    const { data: existingCreator, error: findError } = await supabase
      .from("creators")
      .select("id")
      .eq("user_id", session.id)
      .maybeSingle();

    if (findError) throw findError;

    const update = {
      tiktok_handle: `@${profile.username}`,
      tiktok_open_id: profile.openId,
      tiktok_username: profile.username,
      tiktok_avatar_url: profile.avatarUrl,
      tiktok_verified_at: new Date().toISOString(),
    };

    if (existingCreator) {
      const { error } = await supabase.from("creators").update(update).eq("id", existingCreator.id);
      if (error) throw error;
    } else {
      const { error } = await supabase.from("creators").insert({
        user_id: session.id,
        display_name: profile.displayName || profile.username,
        country: "NG",
        ...update,
      });
      if (error) throw error;
    }

    return NextResponse.redirect(new URL("/creator/profile?success=tiktok_verified", request.url));
  } catch (error) {
    const message = error instanceof Error ? error.message : JSON.stringify(error);
    console.error("TikTok callback failed:", message, error);
    return NextResponse.redirect(new URL(errorDest, request.url));
  }
}
