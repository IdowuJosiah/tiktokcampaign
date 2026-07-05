import { AppShell } from "@/app/components/AppShell";
import { createMission } from "@/app/actions";
import { FormStatus } from "@/app/components/FormStatus";
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
          <p style={{ color: "#99a1af", fontSize: 15, margin: "6px 0 0" }}>Define the brief, requirements, budget, and deadline</p>
        </div>

        <FormStatus error={error} />

        <form action={createMission}>
          {/* Basic info */}
          <div style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 14, padding: 24, marginBottom: 18 }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: "#99a1af", letterSpacing: ".5px", textTransform: "uppercase", marginBottom: 18 }}>Campaign details</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              <div>
                <label style={{ display: "block", fontSize: 13, color: "#d1d5dc", marginBottom: 7 }}>Brand name</label>
                <input name="brandName" required type="text" placeholder="Kuda" style={{ width: "100%", height: 46, padding: "0 14px", fontSize: 14, color: "#fff", background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.12)", borderRadius: 8, outline: "none", fontFamily: "inherit", boxSizing: "border-box" }} />
              </div>
              <div>
                <label style={{ display: "block", fontSize: 13, color: "#d1d5dc", marginBottom: 7 }}>Campaign title <span style={{ color: "#6a7282", fontWeight: 400 }}>(max 80 characters)</span></label>
                <input name="title" required type="text" maxLength={80} placeholder="Show your real split-bill routine" style={{ width: "100%", height: 46, padding: "0 14px", fontSize: 14, color: "#fff", background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.12)", borderRadius: 8, outline: "none", fontFamily: "inherit", boxSizing: "border-box" }} />
              </div>
              <div>
                <label style={{ display: "block", fontSize: 13, color: "#d1d5dc", marginBottom: 7 }}>Creator brief <span style={{ color: "#6a7282", fontWeight: 400 }}>(max 2000 characters)</span></label>
                <textarea name="brief" required maxLength={2000} placeholder="Tell creators what to show, what to avoid, and what counts as valid proof." style={{ width: "100%", minHeight: 120, padding: 14, fontSize: 14, color: "#fff", background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.12)", borderRadius: 8, outline: "none", fontFamily: "inherit", resize: "vertical", boxSizing: "border-box" }} />
              </div>
            </div>
          </div>

          {/* Requirements */}
          <div style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 14, padding: 24, marginBottom: 18 }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: "#99a1af", letterSpacing: ".5px", textTransform: "uppercase", marginBottom: 18 }}>Requirements</div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
              <div>
                <label style={{ display: "block", fontSize: 13, color: "#d1d5dc", marginBottom: 7 }}>Required hashtag</label>
                <input name="requiredHashtag" required type="text" maxLength={50} placeholder="#KudaSplit" style={{ width: "100%", height: 46, padding: "0 14px", fontSize: 14, color: "#fff", background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.12)", borderRadius: 8, outline: "none", fontFamily: "inherit", boxSizing: "border-box" }} />
              </div>
              <div>
                <label style={{ display: "block", fontSize: 13, color: "#d1d5dc", marginBottom: 7 }}>Required sound <span style={{ color: "#6a7282", fontWeight: 400 }}>(optional, must be a tiktok.com/music or /sound link)</span></label>
                <input name="requiredSound" type="url" placeholder="https://www.tiktok.com/music/your-sound-12345" style={{ width: "100%", height: 46, padding: "0 14px", fontSize: 14, color: "#fff", background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.12)", borderRadius: 8, outline: "none", fontFamily: "inherit", boxSizing: "border-box" }} />
              </div>
              <div>
                <label style={{ display: "block", fontSize: 13, color: "#d1d5dc", marginBottom: 7 }}>Views per submission</label>
                <input min="0" name="viewsPerSubmission" required type="number" placeholder="1000" style={{ width: "100%", height: 46, padding: "0 14px", fontSize: 14, color: "#fff", background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.12)", borderRadius: 8, outline: "none", fontFamily: "inherit", boxSizing: "border-box" }} />
              </div>
              <div>
                <label style={{ display: "block", fontSize: 13, color: "#d1d5dc", marginBottom: 7 }}>Deadline</label>
                <input name="deadline" required type="date" style={{ width: "100%", height: 46, padding: "0 14px", fontSize: 14, color: "#fff", background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.12)", borderRadius: 8, outline: "none", fontFamily: "inherit", boxSizing: "border-box" }} />
              </div>
            </div>
            <div style={{ marginTop: 16 }}>
              <label style={{ display: "block", fontSize: 13, color: "#d1d5dc", marginBottom: 7 }}>Rules <span style={{ color: "#6a7282", fontWeight: 400 }}>(one per line, max 200 characters each)</span></label>
              <textarea name="rules" placeholder={"Use #KudaSplit\nShow app screen or receipt\nAdd paid partnership disclosure"} style={{ width: "100%", minHeight: 100, padding: 14, fontSize: 14, color: "#fff", background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.12)", borderRadius: 8, outline: "none", fontFamily: "inherit", resize: "vertical", boxSizing: "border-box" }} />
            </div>
          </div>

          {/* Budget */}
          <div style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 14, padding: 24, marginBottom: 18 }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: "#99a1af", letterSpacing: ".5px", textTransform: "uppercase", marginBottom: 18 }}>Budget</div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
              <div>
                <label style={{ display: "block", fontSize: 13, color: "#d1d5dc", marginBottom: 7 }}>Reward pool (₦)</label>
                <input min="1" name="rewardPool" required type="number" placeholder="50000" style={{ width: "100%", height: 46, padding: "0 14px", fontSize: 14, color: "#fff", background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.12)", borderRadius: 8, outline: "none", fontFamily: "inherit", boxSizing: "border-box" }} />
              </div>
              <div>
                <label style={{ display: "block", fontSize: 13, color: "#d1d5dc", marginBottom: 7 }}>Payout per 5 submissions (₦) <span style={{ color: "#6a7282", fontWeight: 400 }}>(can't exceed reward pool)</span></label>
                <input min="1" name="payoutPerFiveSubmissions" required type="number" placeholder="2500" style={{ width: "100%", height: 46, padding: "0 14px", fontSize: 14, color: "#fff", background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.12)", borderRadius: 8, outline: "none", fontFamily: "inherit", boxSizing: "border-box" }} />
              </div>
            </div>
          </div>

          {/* Funding */}
          <div style={{ display: "flex", alignItems: "flex-start", gap: 14, background: "rgba(0,217,163,0.06)", border: "1px solid rgba(0,217,163,0.25)", borderRadius: 14, padding: "18px 22px", marginBottom: 24 }}>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#00d9a3" strokeWidth="2" style={{ flexShrink: 0, marginTop: 2 }}><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 12 }}>Funded from your wallet balance</div>
              <p style={{ color: "#99a1af", fontSize: 14, margin: 0, lineHeight: 1.5 }}>The reward pool is deducted from your wallet automatically when you submit this campaign. Add funds on the dashboard first if your balance is too low.</p>
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
