import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { getAppSession, setAppSession } from "@/lib/auth";
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
  const intent = cookieStore.get("tiktok_oauth_intent")?.value ?? "reconnect";
  cookieStore.delete("tiktok_oauth_state");
  cookieStore.delete("tiktok_oauth_code_verifier");
  cookieStore.delete("tiktok_oauth_intent");

  const errorDest = intent === "auth" ? "/login?error=tiktok_oauth_failed" : "/creator/profile?error=tiktok_oauth_failed";

  if (providerError) {
    console.error("TikTok OAuth provider error:", providerError);
    return NextResponse.redirect(new URL(errorDest, request.url));
  }

  if (!code || !state || !expectedState || !codeVerifier || state !== expectedState) {
    return NextResponse.redirect(new URL(errorDest, request.url));
  }

  const origin = process.env.NEXT_PUBLIC_SITE_URL ?? url.origin;
  const redirectUri = `${origin}/api/tiktok/callback`;

  try {
    const accessToken = await exchangeCodeForAccessToken({ code, redirectUri, codeVerifier });
    const profile = await fetchTikTokUserInfo(accessToken);

    if (!profile.openId) {
      console.error("TikTok callback: missing open_id in profile response");
      return NextResponse.redirect(new URL(errorDest, request.url));
    }

    if (!profile.username) {
      console.error("TikTok callback: username missing — user.info.profile scope may not be approved in the TikTok developer portal");
      return NextResponse.redirect(new URL(
        intent === "auth" ? "/login?error=tiktok_username_unavailable" : "/creator/profile?error=tiktok_username_unavailable",
        request.url
      ));
    }

    const supabase = createServerSupabaseClient();

    if (intent === "auth") {
      // TikTok as login/signup — find or create user + creator

      const { data: existingCreator, error: findError } = await supabase
        .from("creators")
        .select("id, user_id")
        .eq("tiktok_open_id", profile.openId)
        .maybeSingle();

      if (findError) throw findError;

      if (existingCreator) {
        const { data: user, error: userError } = await supabase
          .from("users")
          .select("id, email")
          .eq("id", existingCreator.user_id)
          .single();

        if (userError) throw userError;

        // Refresh avatar/handle in case they changed
        await supabase.from("creators").update({
          tiktok_handle: `@${profile.username}`,
          tiktok_username: profile.username,
          tiktok_avatar_url: profile.avatarUrl,
          tiktok_verified_at: new Date().toISOString(),
        }).eq("id", existingCreator.id);

        await setAppSession({ id: user.id, email: user.email, role: "creator" });
        return NextResponse.redirect(new URL("/dashboard/creator", request.url));
      }

      // New TikTok user — check if a creator with this handle already exists (from old flow)
      const handle = `@${profile.username}`;
      const { data: handleCreator, error: handleError } = await supabase
        .from("creators")
        .select("id, user_id")
        .eq("tiktok_handle", handle)
        .maybeSingle();

      if (handleError) throw handleError;

      if (handleCreator) {
        // Attach open_id to existing creator and log them in
        await supabase.from("creators").update({
          tiktok_open_id: profile.openId,
          tiktok_username: profile.username,
          tiktok_avatar_url: profile.avatarUrl,
          tiktok_verified_at: new Date().toISOString(),
        }).eq("id", handleCreator.id);

        const { data: user, error: userError } = await supabase
          .from("users")
          .select("id, email")
          .eq("id", handleCreator.user_id)
          .single();

        if (userError) throw userError;

        await setAppSession({ id: user.id, email: user.email, role: "creator" });
        return NextResponse.redirect(new URL("/dashboard/creator", request.url));
      }

      // Brand new user — create user row + creator row
      const syntheticEmail = `tiktok_${profile.openId}@voicerank.local`;

      const { data: existingUser } = await supabase
        .from("users")
        .select("id")
        .eq("email", syntheticEmail)
        .maybeSingle();

      let userId: string;
      if (existingUser) {
        userId = existingUser.id;
      } else {
        const { data: newUser, error: userInsertError } = await supabase
          .from("users")
          .insert({ email: syntheticEmail, role: "creator" })
          .select("id")
          .single();

        if (userInsertError) throw userInsertError;
        userId = newUser.id;
      }

      const { error: creatorInsertError } = await supabase.from("creators").insert({
        user_id: userId,
        display_name: profile.displayName || profile.username,
        tiktok_handle: handle,
        tiktok_open_id: profile.openId,
        tiktok_username: profile.username,
        tiktok_avatar_url: profile.avatarUrl,
        tiktok_verified_at: new Date().toISOString(),
        country: "NG",
      });

      if (creatorInsertError) throw creatorInsertError;

      await setAppSession({ id: userId, email: syntheticEmail, role: "creator" });
      return NextResponse.redirect(new URL("/creator/profile?success=tiktok_verified", request.url));
    }

    // Reconnect — update existing creator's TikTok profile
    const session = await getAppSession();
    if (!session || session.role !== "creator") {
      return NextResponse.redirect(new URL("/login?error=creator_required", request.url));
    }

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
