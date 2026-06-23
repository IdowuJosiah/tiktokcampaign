import Link from "next/link";
import { FormStatus } from "@/app/components/FormStatus";
import { SignupForm } from "@/app/components/SignupForm";

export default async function SignupPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; role?: string }>;
}) {
  const { error, role } = await searchParams;
  const defaultRole = role === "brand" ? "brand" : "creator";

  return (
    <main style={{ minHeight: "100vh", display: "flex" }}>
      {/* Left art panel */}
      <div style={{ flex: 1, position: "relative", overflow: "hidden", background: "#161616" }}>
        <div style={{ position: "absolute", inset: 0, background: "linear-gradient(180deg,rgba(10,10,10,0.1),rgba(10,10,10,0.85))" }} />
        <div style={{ position: "absolute", left: 48, bottom: 56, right: 48 }}>
          <h2 style={{ fontFamily: "'Space Grotesk',sans-serif", fontWeight: 700, fontSize: 38, margin: 0, letterSpacing: -1 }}>Connect. Post. Earn.</h2>
          <p style={{ color: "#d1d5dc", fontSize: 16, margin: "14px 0 0", maxWidth: 420, lineHeight: 1.5 }}>
            Join the platform where Nigerian creators earn real money for the content they already love making.
          </p>
        </div>
      </div>

      {/* Right form panel */}
      <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", padding: 48, background: "#0a0a0a" }}>
        <div style={{ width: "100%", maxWidth: 420 }}>
          {/* Brand mark */}
          <div style={{ display: "flex", alignItems: "center", gap: 10, justifyContent: "center", marginBottom: 24 }}>
            <div style={{ width: 34, height: 34, borderRadius: 10, background: "rgba(0,217,163,0.15)", border: "1px solid rgba(0,217,163,0.35)", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#00d9a3" strokeWidth="2" strokeLinecap="round"><path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"/><path d="M19 10v2a7 7 0 0 1-14 0v-2"/><line x1="12" y1="19" x2="12" y2="23"/></svg>
            </div>
            <span style={{ fontFamily: "'Space Grotesk',sans-serif", fontWeight: 700, fontSize: 19 }}>VoiceRank</span>
          </div>

          <h1 style={{ fontFamily: "'Space Grotesk',sans-serif", fontWeight: 600, fontSize: 26, textAlign: "center", margin: 0 }}>Create your account</h1>
          <p style={{ color: "#99a1af", fontSize: 14, textAlign: "center", margin: "8px 0 26px" }}>Choose how you want to use VoiceRank</p>

          <FormStatus error={error} />

          <SignupForm defaultRole={defaultRole} />

          <p style={{ textAlign: "center", color: "#99a1af", fontSize: 14, marginTop: 22 }}>
            Already have an account?{" "}
            <Link href="/login" style={{ color: "#00d9a3", fontWeight: 700, textDecoration: "none" }}>Sign in</Link>
          </p>
        </div>
      </div>
    </main>
  );
}
