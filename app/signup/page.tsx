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
    <main className="auth-screen">
      {/* Left art panel — becomes a top banner on mobile via .auth-screen media rules */}
      <div className="auth-art-panel">
        <div className="auth-art-copy">
          <h1>Connect. Post. Earn.</h1>
          <p>
            Join the platform where Nigerian creators earn real money for the content they already love
            making.
          </p>
        </div>
      </div>

      {/* Right form panel */}
      <div className="auth-form-panel">
        <div className="auth-card compact">
          <div className="auth-mark">
            <span>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#00d9a3" strokeWidth="2" strokeLinecap="round"><path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"/><path d="M19 10v2a7 7 0 0 1-14 0v-2"/><line x1="12" y1="19" x2="12" y2="23"/></svg>
            </span>
            <strong style={{ fontFamily: "var(--font-heading)", fontWeight: 700, fontSize: 19 }}>VoiceRank</strong>
          </div>

          <h1 style={{ fontFamily: "var(--font-heading)", fontWeight: 600, fontSize: 26, textAlign: "center", margin: 0 }}>Create your account</h1>
          <p style={{ color: "var(--muted)", fontSize: 14, textAlign: "center", margin: "8px 0 26px" }}>Choose how you want to use VoiceRank</p>

          <FormStatus error={error} />

          <SignupForm defaultRole={defaultRole} />

          <p style={{ textAlign: "center", color: "var(--muted)", fontSize: 14, marginTop: 22 }}>
            Already have an account?{" "}
            <Link href="/login" style={{ color: "#00d9a3", fontWeight: 700, textDecoration: "none" }}>Sign in</Link>
          </p>
        </div>
      </div>
    </main>
  );
}
