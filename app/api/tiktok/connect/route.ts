import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { getAppSession } from "@/lib/auth";
import { buildAuthorizeUrl, createPkcePair, createState } from "@/lib/tiktok";

export async function GET(request: NextRequest) {
  const session = await getAppSession();
  if (!session || session.role !== "creator") {
    return NextResponse.redirect(new URL("/login?error=creator_required", request.url));
  }

  const origin = process.env.NEXT_PUBLIC_SITE_URL ?? new URL(request.url).origin;
  const redirectUri = `${origin}/api/tiktok/callback`;
  const { codeVerifier, codeChallenge } = createPkcePair();
  const state = createState();

  let authorizeUrl: string;
  try {
    authorizeUrl = buildAuthorizeUrl({ state, codeChallenge, redirectUri });
  } catch (error) {
    const message = error instanceof Error ? error.message : "TikTok is not configured.";
    console.error("TikTok connect failed:", message);
    return NextResponse.redirect(new URL("/creator/profile?error=tiktok_not_configured", request.url));
  }

  const cookieStore = await cookies();
  const cookieOptions = {
    httpOnly: true,
    sameSite: "lax" as const,
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 10,
  };
  cookieStore.set("tiktok_oauth_state", state, cookieOptions);
  cookieStore.set("tiktok_oauth_code_verifier", codeVerifier, cookieOptions);

  return NextResponse.redirect(authorizeUrl);
}
