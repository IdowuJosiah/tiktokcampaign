import "server-only";
import crypto from "node:crypto";

const AUTHORIZE_URL = "https://www.tiktok.com/v2/auth/authorize/";
const TOKEN_URL = "https://open.tiktokapis.com/v2/oauth/token/";
const USER_INFO_URL = "https://open.tiktokapis.com/v2/user/info/";
const VIDEO_LIST_URL = "https://open.tiktokapis.com/v2/video/list/";

export type TikTokUserInfo = {
  openId: string;
  username: string;
  displayName: string;
  avatarUrl: string;
};

export type TikTokTokenSet = {
  accessToken: string;
  refreshToken: string;
  expiresInSeconds: number;
};

function base64url(input: Buffer) {
  return input.toString("base64").replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

export function createPkcePair() {
  const codeVerifier = base64url(crypto.randomBytes(32));
  const codeChallenge = base64url(crypto.createHash("sha256").update(codeVerifier).digest());
  return { codeVerifier, codeChallenge };
}

export function createState() {
  return base64url(crypto.randomBytes(16));
}

export function buildAuthorizeUrl(params: { state: string; codeChallenge: string; redirectUri: string }) {
  const clientKey = process.env.TIKTOK_CLIENT_KEY;
  if (!clientKey) throw new Error("TIKTOK_CLIENT_KEY is not configured.");

  const url = new URL(AUTHORIZE_URL);
  url.searchParams.set("client_key", clientKey);
  url.searchParams.set("scope", "user.info.basic,user.info.profile,video.list");
  url.searchParams.set("response_type", "code");
  url.searchParams.set("redirect_uri", params.redirectUri);
  url.searchParams.set("state", params.state);
  url.searchParams.set("code_challenge", params.codeChallenge);
  url.searchParams.set("code_challenge_method", "S256");
  return url.toString();
}

export async function exchangeCodeForAccessToken(params: {
  code: string;
  redirectUri: string;
  codeVerifier: string;
}): Promise<TikTokTokenSet> {
  const clientKey = process.env.TIKTOK_CLIENT_KEY;
  const clientSecret = process.env.TIKTOK_CLIENT_SECRET;
  if (!clientKey || !clientSecret) throw new Error("TikTok client credentials are not configured.");

  const response = await fetch(TOKEN_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      "Cache-Control": "no-cache",
    },
    body: new URLSearchParams({
      client_key: clientKey,
      client_secret: clientSecret,
      code: params.code,
      grant_type: "authorization_code",
      redirect_uri: params.redirectUri,
      code_verifier: params.codeVerifier,
    }),
  });

  const data = await response.json();
  if (!response.ok || data.error) {
    throw new Error(data.error_description || data.error || "TikTok token exchange failed.");
  }

  return {
    accessToken: data.access_token as string,
    refreshToken: data.refresh_token as string,
    expiresInSeconds: data.expires_in as number,
  };
}

export async function refreshTikTokAccessToken(refreshToken: string): Promise<TikTokTokenSet> {
  const clientKey = process.env.TIKTOK_CLIENT_KEY;
  const clientSecret = process.env.TIKTOK_CLIENT_SECRET;
  if (!clientKey || !clientSecret) throw new Error("TikTok client credentials are not configured.");

  const response = await fetch(TOKEN_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      "Cache-Control": "no-cache",
    },
    body: new URLSearchParams({
      client_key: clientKey,
      client_secret: clientSecret,
      grant_type: "refresh_token",
      refresh_token: refreshToken,
    }),
  });

  const data = await response.json();
  if (!response.ok || data.error) {
    throw new Error(data.error_description || data.error || "TikTok token refresh failed.");
  }

  return {
    accessToken: data.access_token as string,
    refreshToken: data.refresh_token as string,
    expiresInSeconds: data.expires_in as number,
  };
}

export async function fetchTikTokUserInfo(accessToken: string): Promise<TikTokUserInfo> {
  const url = new URL(USER_INFO_URL);
  url.searchParams.set("fields", "open_id,username,display_name,avatar_url");

  const response = await fetch(url.toString(), {
    headers: { Authorization: `Bearer ${accessToken}` },
  });

  const data = await response.json();
  if (!response.ok || data.error?.code !== "ok") {
    throw new Error(data.error?.message || "Unable to fetch TikTok profile.");
  }

  const user = data.data.user;
  return {
    openId: user.open_id,
    username: user.username,
    displayName: user.display_name,
    avatarUrl: user.avatar_url,
  };
}

const OEMBED_URL = "https://www.tiktok.com/oembed";

export async function fetchTikTokVideoAuthor(videoUrl: string): Promise<string | null> {
  const url = new URL(OEMBED_URL);
  url.searchParams.set("url", videoUrl);

  // TikTok's oEmbed endpoint returns an HTML anti-bot page (not JSON) to
  // requests without a browser-like User-Agent, which makes response.json()
  // throw. Sending a normal UA + Accept header gets the JSON response.
  const response = await fetch(url.toString(), {
    headers: {
      "User-Agent":
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0 Safari/537.36",
      Accept: "application/json",
    },
  });
  if (!response.ok) return null;

  const data = await response.json();
  const authorUrl = typeof data.author_url === "string" ? data.author_url : "";
  const match = authorUrl.match(/tiktok\.com\/@([^/?]+)/i);
  return match ? match[1].toLowerCase() : null;
}

function normalizeShareUrl(value: string) {
  try {
    const url = new URL(value);
    return `${url.hostname}${url.pathname}`.replace(/\/$/, "").toLowerCase();
  } catch {
    return value.trim().replace(/\/$/, "").replace(/^https?:\/\//, "").toLowerCase();
  }
}

export type TikTokVideoStats = {
  viewCount: number;
  description: string;
};

export async function findTikTokVideoByShareUrl(
  accessToken: string,
  shareUrl: string,
): Promise<TikTokVideoStats | null> {
  const target = normalizeShareUrl(shareUrl);
  let cursor: number | undefined;

  for (let page = 0; page < 5; page++) {
    const response = await fetch(`${VIDEO_LIST_URL}?fields=id,share_url,view_count,video_description`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ max_count: 20, ...(cursor ? { cursor } : {}) }),
    });

    const data = await response.json();
    if (!response.ok || data.error?.code !== "ok") {
      throw new Error(data.error?.message || "Unable to fetch TikTok video list.");
    }

    const videos = (data.data?.videos ?? []) as Array<{
      share_url: string;
      view_count: number;
      video_description: string;
    }>;

    const match = videos.find((video) => normalizeShareUrl(video.share_url) === target);
    if (match) {
      return { viewCount: match.view_count, description: match.video_description ?? "" };
    }

    if (!data.data?.has_more) return null;
    cursor = data.data.cursor;
  }

  return null;
}
