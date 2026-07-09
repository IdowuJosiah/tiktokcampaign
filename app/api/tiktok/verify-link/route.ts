import { NextRequest, NextResponse } from "next/server";
import { getAppSession } from "@/lib/auth";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { fetchTikTokVideoAuthor } from "@/lib/tiktok";

function isTikTokUrl(value: string) {
  try {
    const url = new URL(value);
    return url.hostname === "tiktok.com" || url.hostname.endsWith(".tiktok.com");
  } catch {
    return false;
  }
}

// Verifies a single TikTok link before submission so creators see per-link
// problems (bad link, wrong account) as they type, instead of only after
// submitting the whole batch. Uses the same public oEmbed ownership check the
// submit action runs. Deeper checks (minimum views, required sound) still run
// on submit because they require the video-list API and the mission context.
export async function GET(request: NextRequest) {
  const session = await getAppSession();
  if (!session || session.role !== "creator") {
    return NextResponse.json({ ok: false, reason: "creator_required" }, { status: 401 });
  }

  const url = request.nextUrl.searchParams.get("url")?.trim() ?? "";
  if (!url || !isTikTokUrl(url)) {
    return NextResponse.json({ ok: false, reason: "invalid" });
  }

  const supabase = createServerSupabaseClient();
  const { data: creator, error } = await supabase
    .from("creators")
    .select("tiktok_verified_at, tiktok_username, tiktok_handle")
    .eq("user_id", session.id)
    .maybeSingle();

  if (error) {
    return NextResponse.json({ ok: false, reason: "unavailable" }, { status: 503 });
  }
  if (!creator || !creator.tiktok_verified_at) {
    return NextResponse.json({ ok: false, reason: "tiktok_required" });
  }

  const ownerHandle = (
    creator.tiktok_username ||
    creator.tiktok_handle?.replace(/^@/, "") ||
    ""
  ).toLowerCase();
  if (!ownerHandle) {
    return NextResponse.json({ ok: false, reason: "tiktok_required" });
  }

  let author: string | null;
  try {
    author = await fetchTikTokVideoAuthor(url);
  } catch {
    return NextResponse.json({ ok: false, reason: "unavailable" }, { status: 503 });
  }

  if (!author) {
    return NextResponse.json({ ok: false, reason: "not_found" });
  }
  if (author !== ownerHandle) {
    return NextResponse.json({ ok: false, reason: "ownership" });
  }

  return NextResponse.json({ ok: true });
}
