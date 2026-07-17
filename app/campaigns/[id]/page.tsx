import Link from "next/link";
import { notFound } from "next/navigation";
import { AppShell } from "@/app/components/AppShell";
import { getAppSession } from "@/lib/auth";
import { findMission } from "@/lib/repository";

export default async function CampaignBriefPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [session, campaign] = await Promise.all([getAppSession(), findMission(id)]);

  if (!campaign || campaign.status !== "Live") {
    notFound();
  }

  return (
    <AppShell>
      <div style={{ maxWidth: 920 }}>
        {/* Back */}
        <Link href="/campaigns" style={{ display: "inline-flex", alignItems: "center", gap: 8, color: "var(--muted)", fontSize: 14, textDecoration: "none", marginBottom: 20 }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#99a1af" strokeWidth="2"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>
          Back to campaigns
        </Link>

        {/* Header */}
        <div style={{ display: "flex", gap: 18, alignItems: "flex-start", marginBottom: 8 }}>
          <div style={{ width: 72, height: 72, flexShrink: 0, borderRadius: 16, background: "rgba(0,217,163,0.1)", border: "1px solid rgba(0,217,163,0.3)", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <svg width="34" height="34" viewBox="0 0 24 24" fill="none" stroke="#00d9a3" strokeWidth="1.6"><path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"/><path d="M19 10v2a7 7 0 0 1-14 0v-2"/></svg>
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
              <div>
                <h1 style={{ fontFamily: "var(--font-heading)", fontWeight: 600, fontSize: 28, margin: 0 }}>{campaign.title}</h1>
                <div style={{ color: "var(--muted)", fontSize: 15, marginTop: 5 }}>{campaign.brand}</div>
              </div>
              <div style={{ textAlign: "right" }}>
                <div style={{ fontSize: 34, fontWeight: 700, color: "#00d9a3", lineHeight: 1 }}>{campaign.payoutPerThreeSubmissions}</div>
                <div style={{ color: "var(--muted)", fontSize: 13 }}>per 3 qualifying submissions</div>
              </div>
            </div>
            <div style={{ display: "flex", gap: 20, marginTop: 14, color: "var(--muted)", fontSize: 14, flexWrap: "wrap" }}>
              {campaign.deadline && (
                <span style={{ display: "flex", alignItems: "center", gap: 6 }}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#99a1af" strokeWidth="2"><rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"/></svg>
                  Deadline: {campaign.deadline}
                </span>
              )}
              <span style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#99a1af" strokeWidth="2"><path d="M22 12h-4l-3 9L9 3l-3 9H2"/></svg>
                {campaign.viewsPerSubmission} views required
              </span>
            </div>
          </div>
        </div>

        {/* What to make */}
        <div style={{ background: "rgba(0,217,163,0.06)", border: "1px solid rgba(0,217,163,0.25)", borderRadius: 14, padding: "20px 22px", marginTop: 24 }}>
          <div style={{ fontSize: 12, fontWeight: 700, color: "#00d9a3", letterSpacing: ".5px", textTransform: "uppercase", marginBottom: 8 }}>What to make</div>
          <p style={{ fontSize: 16, color: "var(--foreground)", margin: 0, lineHeight: 1.5 }}>{campaign.brief}</p>
        </div>

        {/* Sound + Hashtags */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 18, marginTop: 18 }}>
          {campaign.requiredSound && (
            <div style={{ background: "#fff", border: "1px solid var(--line)", borderRadius: 14, padding: 20 }}>
              <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 14, display: "flex", alignItems: "center", gap: 8 }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#00d9a3" strokeWidth="2"><path d="M9 18V5l12-2v13"/><circle cx="6" cy="18" r="3"/><circle cx="18" cy="16" r="3"/></svg>
                Required sound
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 12, background: "rgba(0,0,0,0.03)", border: "1px solid var(--line)", borderRadius: 10, padding: 12 }}>
                <div style={{ width: 40, height: 40, borderRadius: 8, background: "rgba(0,217,163,0.12)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#00d9a3" strokeWidth="2"><polygon points="5 3 19 12 5 21 5 3"/></svg>
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 14, color: "var(--foreground)" }}>{campaign.requiredSound}</div>
                  <div style={{ fontSize: 12, color: "var(--muted)" }}>Official sound</div>
                </div>
              </div>
            </div>
          )}

          {campaign.requiredHashtag && (
            <div style={{ background: "#fff", border: "1px solid var(--line)", borderRadius: 14, padding: 20 }}>
              <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 14, display: "flex", alignItems: "center", gap: 8 }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#00d9a3" strokeWidth="2"><path d="M4 9h16M4 15h16M10 3 8 21M16 3l-2 18"/></svg>
                Required hashtags
              </div>
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                {campaign.requiredHashtag.split(/\s+/).map((tag: string) => (
                  <span key={tag} style={{ fontSize: 13, color: "#00d9a3", background: "rgba(0,217,163,0.1)", border: "1px solid rgba(0,217,163,0.3)", borderRadius: 7, padding: "6px 11px" }}>{tag}</span>
                ))}
                <span style={{ fontSize: 13, color: "#00d9a3", background: "rgba(0,217,163,0.1)", border: "1px solid rgba(0,217,163,0.3)", borderRadius: 7, padding: "6px 11px" }}>#Ad</span>
              </div>
              <p style={{ fontSize: 12, color: "var(--muted)", margin: "12px 0 0" }}>#Ad disclosure is mandatory.</p>
            </div>
          )}
        </div>

        {/* Requirements */}
        {campaign.requirements?.length > 0 && (
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 18, marginTop: 18 }}>
            <div style={{ background: "#fff", border: "1px solid var(--line)", borderRadius: 14, padding: 20 }}>
              <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 12, color: "#00d9a3" }}>✓ Do</div>
              <div style={{ display: "flex", flexDirection: "column", gap: 9 }}>
                {campaign.requirements.slice(0, Math.ceil(campaign.requirements.length / 2)).map((req: string) => (
                  <div key={req} style={{ display: "flex", gap: 9, color: "var(--foreground)", fontSize: 14 }}>
                    <span style={{ color: "#00d9a3", flexShrink: 0 }}>✓</span>{req}
                  </div>
                ))}
              </div>
            </div>
            <div style={{ background: "#fff", border: "1px solid var(--line)", borderRadius: 14, padding: 20 }}>
              <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 12, color: "#ff6b6b" }}>✕ Don&apos;t</div>
              <div style={{ display: "flex", flexDirection: "column", gap: 9 }}>
                <div style={{ display: "flex", gap: 9, color: "var(--foreground)", fontSize: 14 }}><span style={{ color: "#ff6b6b", flexShrink: 0 }}>✕</span>Mention competitor brands</div>
                <div style={{ display: "flex", gap: 9, color: "var(--foreground)", fontSize: 14 }}><span style={{ color: "#ff6b6b", flexShrink: 0 }}>✕</span>Use a different or remixed sound</div>
                <div style={{ display: "flex", gap: 9, color: "var(--foreground)", fontSize: 14 }}><span style={{ color: "#ff6b6b", flexShrink: 0 }}>✕</span>Post before the campaign start date</div>
              </div>
            </div>
          </div>
        )}

        {/* Payout info */}
        <div style={{ display: "flex", alignItems: "center", gap: 14, background: "rgba(255,221,85,0.06)", border: "1px solid rgba(255,221,85,0.25)", borderRadius: 14, padding: "16px 20px", marginTop: 18 }}>
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#ffdd55" strokeWidth="2"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>
          <div style={{ flex: 1 }}>
            <span style={{ fontSize: 14, color: "var(--foreground)", fontWeight: 700 }}>Earn {campaign.payoutPerThreeSubmissions}</span>
            <span style={{ fontSize: 14, color: "var(--foreground)" }}> per 3 approved submissions in this campaign.</span>
          </div>
        </div>

        {/* Actions */}
        <div style={{ display: "flex", gap: 14, marginTop: 26 }}>
          {session?.role === "creator" && (
            <Link href="/creator/submit" style={{ height: 48, padding: "0 28px", fontFamily: "inherit", fontSize: 15, fontWeight: 700, color: "#000", background: "#00d9a3", border: "none", borderRadius: 10, cursor: "pointer", display: "inline-flex", alignItems: "center", gap: 10, textDecoration: "none" }}>
              Submit a video →
            </Link>
          )}
          {!session && (
            <Link href="/signup" style={{ height: 48, padding: "0 28px", fontFamily: "inherit", fontSize: 15, fontWeight: 700, color: "#000", background: "#00d9a3", border: "none", borderRadius: 10, cursor: "pointer", display: "inline-flex", alignItems: "center", gap: 10, textDecoration: "none" }}>
              Get started →
            </Link>
          )}
        </div>
      </div>
    </AppShell>
  );
}
