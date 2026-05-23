import "server-only";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import type { UserRole } from "./domain";

const SESSION_COOKIE = "voicerank_session";

export type AppSession = {
  id: string;
  email: string;
  role: UserRole;
};

export async function setAppSession(session: AppSession) {
  const cookieStore = await cookies();

  cookieStore.set(SESSION_COOKIE, JSON.stringify(session), {
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

export async function getAppSession() {
  const cookieStore = await cookies();
  const value = cookieStore.get(SESSION_COOKIE)?.value;

  if (!value) return null;

  try {
    return JSON.parse(value) as AppSession;
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
