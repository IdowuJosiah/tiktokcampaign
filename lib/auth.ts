import "server-only";
import { createHmac, timingSafeEqual } from "crypto";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import type { UserRole } from "./domain";

const SESSION_COOKIE = "voicerank_session";

export type AppSession = {
  id: string;
  email: string;
  role: UserRole;
};

// Sessions are stateless cookies, so they must be signed to prevent a user from
// editing the JSON to escalate their role or impersonate another account. We
// prefer an explicit SESSION_SECRET but fall back to the service-role key, which
// is already a server-only secret, so signing works without extra configuration.
function getSessionSecret(): string {
  const secret = process.env.SESSION_SECRET || process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!secret) {
    throw new Error("SESSION_SECRET (or SUPABASE_SERVICE_ROLE_KEY) must be set to sign sessions.");
  }
  return secret;
}

function sign(payload: string): string {
  return createHmac("sha256", getSessionSecret()).update(payload).digest("base64url");
}

function verify(payload: string, signature: string): boolean {
  const expected = sign(payload);
  const expectedBuf = Buffer.from(expected);
  const actualBuf = Buffer.from(signature);
  if (expectedBuf.length !== actualBuf.length) return false;
  return timingSafeEqual(expectedBuf, actualBuf);
}

export async function setAppSession(session: AppSession) {
  const cookieStore = await cookies();
  const payload = Buffer.from(JSON.stringify(session)).toString("base64url");
  const token = `${payload}.${sign(payload)}`;

  cookieStore.set(SESSION_COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 30,
  });
}

export async function clearAppSession() {
  const cookieStore = await cookies();
  cookieStore.delete(SESSION_COOKIE);
}

export async function getAppSession(): Promise<AppSession | null> {
  const cookieStore = await cookies();
  const value = cookieStore.get(SESSION_COOKIE)?.value;

  if (!value) return null;

  const separatorIndex = value.lastIndexOf(".");
  if (separatorIndex === -1) return null;

  const payload = value.slice(0, separatorIndex);
  const signature = value.slice(separatorIndex + 1);
  if (!payload || !signature || !verify(payload, signature)) return null;

  try {
    return JSON.parse(Buffer.from(payload, "base64url").toString()) as AppSession;
  } catch {
    return null;
  }
}

export async function requireRole(role: UserRole) {
  const session = await getAppSession();

  if (!session) {
    redirect(`/login?error=${role}_required`);
  }

  if (session.role !== role) {
    redirect(`/?error=${role}_required`);
  }

  return session;
}
