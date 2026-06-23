import Link from "next/link";
import { redirect } from "next/navigation";
import { AppShell } from "@/app/components/AppShell";
import { getAppSession } from "@/lib/auth";
import { listLiveMissions } from "@/lib/repository";

export default async function Home() {
  const session = await getAppSession();

  if (session?.role === "brand") redirect("/dashboard/brand");
  if (session?.role === "creator") redirect("/dashboard/creator");
  if (session?.role === "admin") redirect("/admin");

  const missions = await listLiveMissions();

  return (
    <AppShell>
      {/* Hero */}
      <header style={{ position: "relative", minHeight: "100vh", overflow: "hidden" }}>
        <div style={{ position: "absolute", inset: 0, background: "radial-gradient(900px 500px at 50% -5%,rgba(0,217,163,0.12),transparent 60%)", pointerEvents: "none" }} />
        <nav style={{ position: "relative", display: "flex", alignItems: "center", justifyContent: "space-between", padding: "20px 56px", borderBottom: "1px solid rgba(255,255,255,0.08)" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{ width: 30, height: 30, borderRadius: 9, background: "rgba(0,217,163,0.15)", border: "1px solid rgba(0,217,163,0.35)", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#00d9a3" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"/><path d="M19 10v2a7 7 0 0 1-14 0v-2"/><line x1="12" y1="19" x2="12" y2="23"/></svg>
            </div>
            <span style={{ fontFamily: "var(--font-heading)", fontWeight: 700, fontSize: 18, letterSpacing: "-0.3px" }}>VoiceRank</span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 32 }}>
            <span style={{ color: "#d1d5dc", fontSize: 14 }}>Home</span>
            <span style={{ color: "#99a1af", fontSize: 14 }}>How it Works</span>
            <span style={{ color: "#99a1af", fontSize: 14 }}>For Brands</span>
            <span style={{ color: "#99a1af", fontSize: 14 }}>Contact</span>
            <Link href="/signup" style={{ fontFamily: "inherit", fontSize: 14, fontWeight: 700, color: "#000", background: "#00d9a3", border: "none", borderRadius: 8, padding: "9px 16px", textDecoration: "none" }}>Get Started</Link>
          </div>
        </nav>

        <section style={{ position: "relative", maxWidth: 900, margin: "0 auto", textAlign: "center", padding: "80px 24px 40px" }}>
          <span style={{ display: "inline-block", fontSize: 13, color: "#00d9a3", background: "rgba(0,217,163,0.1)", border: "1px solid rgba(0,217,163,0.3)", borderRadius: 999, padding: "6px 14px" }}>Nigeria&apos;s creator earning platform</span>
          <h1 style={{ fontFamily: "var(--font-heading)", fontWeight: 700, fontSize: "clamp(40px,6vw,60px)", lineHeight: 1.05, letterSpacing: "-1.5px", margin: "24px 0 0" }}>
            Get paid for the<br />
            <span style={{ color: "#00d9a3", borderBottom: "4px solid #00d9a3", paddingBottom: 4 }}>TikToks</span> you already make
          </h1>
          <p style={{ color: "#99a1af", fontSize: 19, margin: "28px auto 0", maxWidth: 560, lineHeight: 1.5 }}>Brands fund campaigns. Creators post, get scored, and cash out in Naira. Transparent rewards for real engagement.</p>
          <div style={{ display: "flex", gap: 14, justifyContent: "center", marginTop: 36 }}>
            <Link href="/signup" style={{ fontFamily: "inherit", fontSize: 15, fontWeight: 700, color: "#000", background: "#00d9a3", border: "none", borderRadius: 10, padding: "13px 26px", textDecoration: "none", display: "inline-flex", alignItems: "center" }}>Start earning →</Link>
            <Link href="/signup?role=brand" style={{ fontFamily: "inherit", fontSize: 15, fontWeight: 700, color: "#fff", background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.14)", borderRadius: 10, padding: "13px 26px", textDecoration: "none", display: "inline-flex", alignItems: "center" }}>I&apos;m a brand</Link>
          </div>
        </section>

        <section style={{ position: "relative", display: "flex", gap: 24, justifyContent: "center", flexWrap: "wrap", maxWidth: 1100, margin: "30px auto 0", padding: "0 24px 70px" }}>
          <div style={{ flex: 1, minWidth: 280, background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 14, padding: 28 }}>
            <div style={{ width: 40, height: 40, borderRadius: 10, background: "rgba(0,217,163,0.1)", border: "1px solid rgba(0,217,163,0.3)", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 16 }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#00d9a3" strokeWidth="2"><path d="M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 0 0-2.91 0z"/><path d="M12 15l-3-3a22 22 0 0 1 2-3.95A12.88 12.88 0 0 1 22 2c0 2.72-.78 7.5-6 11a22.35 22.35 0 0 1-4 2z"/></svg>
            </div>
            <h3 style={{ fontSize: 17, fontWeight: 700, margin: "0 0 8px" }}>Connect TikTok, post, earn</h3>
            <p style={{ color: "#99a1af", fontSize: 14, lineHeight: 1.55, margin: 0 }}>Link your account, pick a campaign, post the video. We verify the sound and hashtags automatically.</p>
          </div>
          <div style={{ flex: 1, minWidth: 280, background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 14, padding: 28 }}>
            <div style={{ width: 40, height: 40, borderRadius: 10, background: "rgba(0,217,163,0.1)", border: "1px solid rgba(0,217,163,0.3)", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 16 }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#00d9a3" strokeWidth="2"><path d="M22 12h-4l-3 9L9 3l-3 9H2"/></svg>
            </div>
            <h3 style={{ fontSize: 17, fontWeight: 700, margin: "0 0 8px" }}>Fair AI scoring</h3>
            <p style={{ color: "#99a1af", fontSize: 14, lineHeight: 1.55, margin: 0 }}>Every submission is scored on quality, reach and engagement. No black box — you always see why.</p>
          </div>
          <div style={{ flex: 1, minWidth: 280, background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 14, padding: 28 }}>
            <div style={{ width: 40, height: 40, borderRadius: 10, background: "rgba(0,217,163,0.1)", border: "1px solid rgba(0,217,163,0.3)", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 16 }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#00d9a3" strokeWidth="2"><rect x="2" y="5" width="20" height="14" rx="2"/><path d="M2 10h20"/></svg>
            </div>
            <h3 style={{ fontSize: 17, fontWeight: 700, margin: "0 0 8px" }}>Cash out in Naira</h3>
            <p style={{ color: "#99a1af", fontSize: 14, lineHeight: 1.55, margin: 0 }}>Withdraw to your bank from ₦2,000 or take a gift card from ₦500. Paystack-powered, no hidden fees.</p>
          </div>
        </section>
      </header>

      {/* Live campaigns preview */}
      {missions.length > 0 && (
        <section style={{ maxWidth: 1100, margin: "0 auto", padding: "0 24px 80px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
            <div>
              <p style={{ color: "#99a1af", fontSize: 13, fontWeight: 700, textTransform: "uppercase", margin: "0 0 6px" }}>Live now</p>
              <h2 style={{ fontFamily: "var(--font-heading)", fontSize: "clamp(24px,3vw,36px)", fontWeight: 600, margin: 0 }}>Available campaigns</h2>
            </div>
            <Link href="/campaigns" style={{ fontSize: 14, fontWeight: 700, color: "#fff", background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.12)", borderRadius: 8, padding: "9px 16px", textDecoration: "none" }}>View all</Link>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            {missions.slice(0, 3).map((m) => (
              <Link key={m.id} href={`/campaigns/${m.id}`} style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 14, padding: 24, display: "flex", gap: 24, alignItems: "center", textDecoration: "none", color: "inherit" }}>
                <div style={{ width: 56, height: 56, borderRadius: 12, background: "rgba(0,217,163,0.1)", border: "1px solid rgba(0,217,163,0.3)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#00d9a3" strokeWidth="1.8"><path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"/><path d="M19 10v2a7 7 0 0 1-14 0v-2"/></svg>
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 16, fontWeight: 700, marginBottom: 4 }}>{m.title}</div>
                  <div style={{ color: "#99a1af", fontSize: 14 }}>{m.brand}</div>
                </div>
                <div style={{ textAlign: "right" }}>
                  <div style={{ fontSize: 22, fontWeight: 700, color: "#00d9a3" }}>{m.rewardPool}</div>
                  <div style={{ color: "#99a1af", fontSize: 12, marginTop: 2 }}>reward pool</div>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* CTA */}
      <section style={{ maxWidth: 900, margin: "0 auto 80px", padding: "0 24px" }}>
        <div style={{ background: "linear-gradient(135deg,rgba(0,217,163,0.12),rgba(0,217,163,0.03))", border: "1px solid rgba(0,217,163,0.25)", borderRadius: 20, padding: "clamp(36px,6vw,64px)", textAlign: "center" }}>
          <p style={{ display: "inline-block", fontSize: 13, color: "#00d9a3", background: "rgba(0,217,163,0.1)", border: "1px solid rgba(0,217,163,0.3)", borderRadius: 999, padding: "6px 14px", margin: "0 0 20px" }}>Ready to start?</p>
          <h2 style={{ fontFamily: "var(--font-heading)", fontSize: "clamp(28px,4vw,42px)", fontWeight: 700, margin: "0 0 16px" }}>Start earning from your TikToks today.</h2>
          <p style={{ color: "#99a1af", fontSize: 16, maxWidth: 520, margin: "0 auto 28px", lineHeight: 1.5 }}>Join creators and brands using transparent submissions, AI scoring, and verified reward flows.</p>
          <Link href="/signup" style={{ fontFamily: "inherit", fontSize: 15, fontWeight: 700, color: "#000", background: "#00d9a3", border: "none", borderRadius: 10, padding: "13px 28px", textDecoration: "none", display: "inline-flex", alignItems: "center" }}>Get Started →</Link>
        </div>
      </section>
    </AppShell>
  );
}
