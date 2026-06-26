import "server-only";
import crypto from "node:crypto";

const AUTHORIZE_URL = "https://www.tiktok.com/v2/auth/authorize/";
const TOKEN_URL = "https://open.tiktokapis.com/v2/oauth/token/";
const USER_INFO_URL = "https://open.tiktokapis.com/v2/user/info/";

export type TikTokUserInfo = {
  openId: string;
  username: string;
  displayName: string;
  avatarUrl: string;
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
  url.searchParams.set("scope", "user.info.basic,user.info.profile");
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
}) {
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

  return data.access_token as string;
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

  const response = await fetch(url.toString());
  if (!response.ok) return null;

  const data = await response.json();
  const authorUrl = typeof data.author_url === "string" ? data.author_url : "";
  const match = authorUrl.match(/tiktok\.com\/@([^/?]+)/i);
  return match ? match[1].toLowerCase() : null;
}
