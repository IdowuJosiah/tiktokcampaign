import { AppShell } from "@/app/components/AppShell";
import { createMission } from "@/app/actions";
import { FormStatus } from "@/app/components/FormStatus";
import { DatePicker } from "@/app/components/DatePicker";
import { requireRole } from "@/lib/auth";

export default async function NewMissionPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;
  await requireRole("brand");

  return (
    <AppShell>
      <div style={{ maxWidth: 760 }}>
        <div style={{ marginBottom: 28 }}>
          <h1 style={{ fontFamily: "var(--font-heading)", fontWeight: 600, fontSize: 26, margin: 0 }}>Create Campaign</h1>
          <p style={{ color: "var(--muted)", fontSize: 15, margin: "6px 0 0" }}>Define the brief, requirements, budget, and deadline</p>
        </div>

        <FormStatus error={error} />

        <form action={createMission}>
          {/* Basic info */}
          <div style={{ background: "var(--panel)", border: "1px solid var(--line)", borderRadius: 14, padding: 24, marginBottom: 18 }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: "var(--muted)", letterSpacing: ".5px", textTransform: "uppercase", marginBottom: 18 }}>Campaign details</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              <div>
                <label style={{ display: "block", fontSize: 13, color: "var(--label)", marginBottom: 7 }}>Brand name</label>
                <input name="brandName" required type="text" placeholder="Kuda" style={{ width: "100%", height: 46, padding: "0 14px", fontSize: 14, color: "var(--foreground)", background: "var(--panel)", border: "1px solid var(--line)", borderRadius: 8, outline: "none", fontFamily: "inherit", boxSizing: "border-box" }} />
              </div>
              <div>
                <label style={{ display: "block", fontSize: 13, color: "var(--label)", marginBottom: 7 }}>Campaign title <span style={{ color: "var(--muted)", fontWeight: 400 }}>(max 80 characters)</span></label>
                <input name="title" required type="text" maxLength={80} placeholder="Show your real split-bill routine" style={{ width: "100%", height: 46, padding: "0 14px", fontSize: 14, color: "var(--foreground)", background: "var(--panel)", border: "1px solid var(--line)", borderRadius: 8, outline: "none", fontFamily: "inherit", boxSizing: "border-box" }} />
              </div>
              <div>
                <label style={{ display: "block", fontSize: 13, color: "var(--label)", marginBottom: 7 }}>Creator brief <span style={{ color: "var(--muted)", fontWeight: 400 }}>(max 2000 characters)</span></label>
                <textarea name="brief" required maxLength={2000} placeholder="Tell creators what to show, what to avoid, and what counts as valid proof." style={{ width: "100%", minHeight: 120, padding: 14, fontSize: 14, color: "var(--foreground)", background: "var(--panel)", border: "1px solid var(--line)", borderRadius: 8, outline: "none", fontFamily: "inherit", resize: "vertical", boxSizing: "border-box" }} />
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                <div>
                  <label style={{ display: "block", fontSize: 13, color: "var(--label)", marginBottom: 7 }}>Required hashtag</label>
                  <input name="requiredHashtag" required type="text" maxLength={50} placeholder="#KudaSplit" style={{ width: "100%", height: 46, padding: "0 14px", fontSize: 14, color: "var(--foreground)", background: "var(--panel)", border: "1px solid var(--line)", borderRadius: 8, outline: "none", fontFamily: "inherit", boxSizing: "border-box" }} />
                </div>
                <div>
                  <label style={{ display: "block", fontSize: 13, color: "var(--label)", marginBottom: 7 }}>Required sound <span style={{ color: "var(--muted)", fontWeight: 400 }}>(optional — TikTok sound link)</span></label>
                  <input name="requiredSound" type="url" placeholder="https://www.tiktok.com/music/your-sound-12345" style={{ width: "100%", height: 46, padding: "0 14px", fontSize: 14, color: "var(--foreground)", background: "var(--panel)", border: "1px solid var(--line)", borderRadius: 8, outline: "none", fontFamily: "inherit", boxSizing: "border-box" }} />
                </div>
              </div>
            </div>
          </div>

          {/* Requirements */}
          <div style={{ background: "var(--panel)", border: "1px solid var(--line)", borderRadius: 14, padding: 24, marginBottom: 18 }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: "var(--muted)", letterSpacing: ".5px", textTransform: "uppercase", marginBottom: 18 }}>Requirements</div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
              <div>
                <label style={{ display: "block", fontSize: 13, color: "var(--label)", marginBottom: 7 }}>Deadline</label>
                <DatePicker name="deadline" required />
              </div>
              <div>
                <label style={{ display: "block", fontSize: 13, color: "var(--label)", marginBottom: 7 }}>Minimum followers <span style={{ color: "var(--muted)", fontWeight: 400 }}>(optional)</span></label>
                <input min="0" name="minFollowerCount" type="number" placeholder="e.g. 1000" style={{ width: "100%", height: 46, padding: "0 14px", fontSize: 14, color: "var(--foreground)", background: "var(--panel)", border: "1px solid var(--line)", borderRadius: 8, outline: "none", fontFamily: "inherit", boxSizing: "border-box" }} />
              </div>
            </div>
          </div>

          {/* Payout tiers */}
          <div style={{ background: "var(--panel)", border: "1px solid var(--line)", borderRadius: 14, padding: 24, marginBottom: 18 }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: "var(--muted)", letterSpacing: ".5px", textTransform: "uppercase", marginBottom: 6 }}>Payout tiers</div>
            <p style={{ color: "var(--muted)", fontSize: 13, margin: "0 0 18px" }}>Set different payouts for different view milestones. At least one tier is required — none can exceed the reward pool.</p>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginBottom: 8 }}>
              <div style={{ fontSize: 12, fontWeight: 600, color: "var(--muted)", paddingLeft: 2 }}>Min views per submission</div>
              <div style={{ fontSize: 12, fontWeight: 600, color: "var(--muted)", paddingLeft: 2 }}>Payout per 3 submissions (₦)</div>
            </div>
            {[0, 1, 2, 3, 4].map((i) => (
              <div key={i} style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginBottom: 10 }}>
                <input
                  min="0"
                  name={`tier_views_${i}`}
                  type="number"
                  placeholder={i === 0 ? "e.g. 1000" : "e.g. 5000"}
                  required={i === 0}
                  style={{ width: "100%", height: 46, padding: "0 14px", fontSize: 14, color: "var(--foreground)", background: i === 0 ? "var(--panel)" : "var(--soft)", border: "1px solid var(--line)", borderRadius: 8, outline: "none", fontFamily: "inherit", boxSizing: "border-box" }}
                />
                <input
                  min="1"
                  name={`tier_payout_${i}`}
                  type="number"
                  placeholder={i === 0 ? "e.g. 2500" : "e.g. 5000"}
                  required={i === 0}
                  style={{ width: "100%", height: 46, padding: "0 14px", fontSize: 14, color: "var(--foreground)", background: i === 0 ? "var(--panel)" : "var(--soft)", border: "1px solid var(--line)", borderRadius: 8, outline: "none", fontFamily: "inherit", boxSizing: "border-box" }}
                />
              </div>
            ))}
          </div>

          {/* Budget */}
          <div style={{ background: "var(--panel)", border: "1px solid var(--line)", borderRadius: 14, padding: 24, marginBottom: 18 }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: "var(--muted)", letterSpacing: ".5px", textTransform: "uppercase", marginBottom: 18 }}>Budget</div>
            <div>
              <label style={{ display: "block", fontSize: 13, color: "var(--label)", marginBottom: 7 }}>Reward pool (₦)</label>
              <input min="1" name="rewardPool" required type="number" placeholder="50000" style={{ width: "100%", height: 46, padding: "0 14px", fontSize: 14, color: "var(--foreground)", background: "var(--panel)", border: "1px solid var(--line)", borderRadius: 8, outline: "none", fontFamily: "inherit", boxSizing: "border-box" }} />
            </div>
          </div>

          {/* Funding */}
          <div style={{ display: "flex", alignItems: "flex-start", gap: 14, background: "rgba(0,217,163,0.06)", border: "1px solid rgba(0,217,163,0.25)", borderRadius: 14, padding: "18px 22px", marginBottom: 24 }}>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#00d9a3" strokeWidth="2" style={{ flexShrink: 0, marginTop: 2 }}><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 12 }}>Funded from your wallet balance</div>
              <p style={{ color: "var(--muted)", fontSize: 14, margin: 0, lineHeight: 1.5 }}>Submitted as a draft. The reward pool is deducted once an admin approves — make sure your balance covers it.</p>
            </div>
          </div>

          <button type="submit" style={{ width: "100%", height: 50, fontFamily: "inherit", fontSize: 16, fontWeight: 700, color: "#000", background: "#00d9a3", border: "none", borderRadius: 10, cursor: "pointer" }}>
            Submit campaign for approval →
          </button>
        </form>
      </div>
    </AppShell>
  );
}
