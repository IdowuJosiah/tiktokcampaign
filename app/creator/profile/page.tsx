import { AppShell } from "@/app/components/AppShell";
import { FormStatus } from "@/app/components/FormStatus";
import { PayoutSetupForm } from "@/app/components/profile/PayoutSetupForm";
import { requireRole } from "@/lib/auth";
import { getCreatorPayoutReadiness, getCreatorProfile, listCreatorSubmissions } from "@/lib/repository";
import { SubmissionRow } from "@/app/components/SubmissionRow";
import { unlinkTikTok } from "@/app/actions";

export default async function CreatorProfilePage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; success?: string }>;
}) {
  const { error, success } = await searchParams;
  const session = await requireRole("creator");
  const [creator, submissions, payout] = await Promise.all([
    getCreatorProfile(session.id),
    listCreatorSubmissions(session.id),
    getCreatorPayoutReadiness(session.id),
  ]);

  const steps = [
    { label: "TikTok", done: Boolean(creator?.verifiedAt) },
    { label: "Bank", done: Boolean(payout.accountNumber) },
  ];
  const completedSteps = steps.filter((s) => s.done).length;

  return (
    <AppShell>
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontFamily: "var(--font-heading)", fontWeight: 600, fontSize: 26, margin: 0 }}>Profile &amp; Setup</h1>
        <p style={{ color: "var(--muted)", fontSize: 15, margin: "6px 0 0" }}>Complete your profile to start earning</p>
      </div>

      {/* Setup progress */}
      <div style={{ background: "rgba(0,217,163,0.06)", border: "1px solid rgba(0,217,163,0.2)", borderRadius: 14, padding: "18px 22px", marginBottom: 28, display: "flex", alignItems: "center", gap: 20 }}>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 8 }}>Setup progress — {completedSteps} / {steps.length} complete</div>
          <div style={{ display: "flex", gap: 8 }}>
            {steps.map((step) => (
              <div key={step.label} style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 13, color: step.done ? "#00d9a3" : "var(--muted)" }}>
                <div style={{ width: 18, height: 18, borderRadius: "50%", background: step.done ? "rgba(0,217,163,0.2)" : "var(--surface)", border: `1px solid ${step.done ? "rgba(0,217,163,0.5)" : "var(--line)"}`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11 }}>
                  {step.done ? "✓" : "·"}
                </div>
                {step.label}
              </div>
            ))}
          </div>
        </div>
        <div style={{ height: 6, width: 160, background: "rgba(0,0,0,0.1)", borderRadius: 99, overflow: "hidden" }}>
          <div style={{ height: "100%", width: `${(completedSteps / steps.length) * 100}%`, background: "#00d9a3", borderRadius: 99 }} />
        </div>
      </div>

      <FormStatus error={error} success={success} />

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24, marginBottom: 24 }}>
        {/* TikTok */}
        <div style={{ background: "var(--panel)", border: "1px solid var(--line)", borderRadius: 14, padding: 24 }}>
          <div style={{ fontSize: 12, fontWeight: 700, color: "var(--muted)", letterSpacing: ".5px", textTransform: "uppercase", marginBottom: 6 }}>Step 1</div>
          <h2 style={{ fontFamily: "var(--font-heading)", fontSize: 20, fontWeight: 600, margin: "0 0 16px" }}>TikTok Account</h2>
          {creator?.verifiedAt ? (
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: 12, background: "rgba(0,217,163,0.06)", border: "1px solid rgba(0,217,163,0.25)", borderRadius: 10, padding: "12px 16px", marginBottom: 16 }}>
                {creator.tiktokAvatarUrl && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={creator.tiktokAvatarUrl} alt="" width={36} height={36} style={{ borderRadius: "50%" }} />
                )}
                <div>
                  <div style={{ fontSize: 14, fontWeight: 600 }}>{creator.tiktokHandle}</div>
                  <div style={{ fontSize: 12, color: "#00d9a3" }}>✓ Verified via TikTok login</div>
                </div>
              </div>
              <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                <a className="ghost-button" href="/api/tiktok/connect" style={{ display: "inline-flex", alignItems: "center", padding: "0 16px", height: 38, fontSize: 14, borderRadius: 8 }}>Reconnect TikTok</a>
                <form action={unlinkTikTok}>
                  <button type="submit" style={{ display: "inline-flex", alignItems: "center", padding: "0 16px", height: 38, fontSize: 14, borderRadius: 8, background: "transparent", border: "1px solid rgba(255,80,80,0.4)", color: "#ff5050", cursor: "pointer", fontFamily: "inherit" }}>Unlink TikTok</button>
                </form>
              </div>
            </div>
          ) : (
            <div>
              <p style={{ color: "var(--muted)", fontSize: 14, margin: "0 0 16px", lineHeight: 1.5 }}>Connect your TikTok account to verify ownership and unlock campaign submissions.</p>
              <a href="/api/tiktok/connect" style={{ display: "inline-flex", alignItems: "center", height: 44, padding: "0 20px", fontFamily: "inherit", fontSize: 15, fontWeight: 700, color: "#000", background: "#00d9a3", border: "none", borderRadius: 8, textDecoration: "none" }}>Connect TikTok →</a>
            </div>
          )}
        </div>

        {/* Bank */}
        <div style={{ background: "var(--panel)", border: "1px solid var(--line)", borderRadius: 14, padding: 24 }}>
          <div style={{ fontSize: 12, fontWeight: 700, color: "var(--muted)", letterSpacing: ".5px", textTransform: "uppercase", marginBottom: 6 }}>Step 2</div>
          <h2 style={{ fontFamily: "var(--font-heading)", fontSize: 20, fontWeight: 600, margin: "0 0 16px" }}>Bank Account</h2>
          <PayoutSetupForm
            defaultAccountName={payout.accountName}
            defaultAccountNumber={payout.accountNumber}
            defaultBankName={payout.bankName}
          />
        </div>
      </div>

      {/* Submission history */}
      {submissions.length > 0 && (
        <div style={{ background: "var(--panel)", border: "1px solid var(--line)", borderRadius: 14, overflow: "hidden" }}>
          <div style={{ padding: "18px 22px", borderBottom: "1px solid var(--line)", fontSize: 15, fontWeight: 700 }}>Submission history</div>
          <div style={{ padding: "8px 22px" }}>
            {submissions.map((submission) => (
              <SubmissionRow submission={submission} key={submission.id} />
            ))}
          </div>
        </div>
      )}
    </AppShell>
  );
}
