import Link from "next/link";
import { AppShell } from "@/app/components/AppShell";
import { requireRole } from "@/lib/auth";

export default async function CreatorOnboardingPage() {
  await requireRole("creator");

  return (
    <AppShell>
      <header className="page-header">
        <div>
          <p className="eyebrow">Creator onboarding</p>
          <h1>Set up your creator account.</h1>
          <p>Verify your TikTok handle first. After that, you can browse campaigns and submit videos.</p>
        </div>
        <Link className="primary-button" href="/creator/profile">Verify TikTok</Link>
      </header>
    </AppShell>
  );
}
