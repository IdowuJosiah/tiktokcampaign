import Link from "next/link";
import { AppShell } from "@/app/components/AppShell";
import { requireRole } from "@/lib/auth";

export default async function BrandOnboardingPage() {
  await requireRole("brand");

  return (
    <AppShell>
      <header className="page-header">
        <div>
          <p className="eyebrow">Brand onboarding</p>
          <h1>Set up your first campaign.</h1>
          <p>Brand wallet and Paystack funding come next. For now, create a campaign and submit it for admin review.</p>
        </div>
        <Link className="primary-button" href="/brand/missions/new">Create Campaign</Link>
      </header>
    </AppShell>
  );
}
