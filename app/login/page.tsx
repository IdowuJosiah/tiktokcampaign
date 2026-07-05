import Link from "next/link";
import { continueWithGoogle, demoLogIn, logIn } from "@/app/actions";
import { FormStatus } from "@/app/components/FormStatus";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;

  return (
    <main className="login-screen">
      <div className="login-card">
        <div className="login-logo">
          <div className="login-logo-icon">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#00d9a3" strokeWidth="2" strokeLinecap="round"><path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"/><path d="M19 10v2a7 7 0 0 1-14 0v-2"/><line x1="12" y1="19" x2="12" y2="23"/></svg>
          </div>
        </div>

        <h1 style={{ fontFamily: "var(--font-heading)", fontWeight: 600, fontSize: 30, textAlign: "center", margin: "14px 0 6px" }}>Welcome back</h1>
        <p style={{ color: "#99a1af", fontSize: 15, textAlign: "center", margin: "0 0 28px" }}>Sign in to continue earning</p>

        <FormStatus error={error} />

        <div className="login-body">
          <form action={logIn}>
            <div className="auth-field">
              <label htmlFor="login-email">Email</label>
              <input id="login-email" name="email" required type="email" placeholder="you@example.com" />
            </div>
            <div className="auth-field" style={{ marginTop: 16 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 7 }}>
                <label htmlFor="login-password" style={{ margin: 0, fontSize: 13, color: "#d1d5dc" }}>Password</label>
                <span style={{ fontSize: 13, color: "#00d9a3", cursor: "pointer" }}>Forgot password?</span>
              </div>
              <input id="login-password" name="password" required type="password" placeholder="••••••••" />
            </div>

            <button className="auth-submit-btn" type="submit" style={{ marginTop: 20 }}>Sign in →</button>

            <button className="auth-oauth-btn" formAction={continueWithGoogle} formNoValidate type="submit" style={{ marginTop: 12 }}>
              <svg width="16" height="16" viewBox="0 0 24 24"><path fill="#4285F4" d="M22.5 12.2c0-.7-.1-1.4-.2-2H12v3.8h5.9a5 5 0 0 1-2.2 3.3v2.7h3.6c2.1-2 3.2-4.9 3.2-7.8z"/><path fill="#34A853" d="M12 23c2.9 0 5.4-1 7.2-2.6l-3.6-2.7c-1 .7-2.3 1.1-3.6 1.1-2.8 0-5.1-1.9-6-4.4H2.3v2.8A11 11 0 0 0 12 23z"/><path fill="#FBBC05" d="M6 14.3a6.6 6.6 0 0 1 0-4.2V7.3H2.3a11 11 0 0 0 0 9.8z"/><path fill="#EA4335" d="M12 5.4c1.6 0 3 .5 4.1 1.6l3-3A11 11 0 0 0 2.3 7.3l3.7 2.8C6.9 7.3 9.2 5.4 12 5.4z"/></svg>
              Continue with Google
            </button>

            {process.env.DEMO_LOGIN_ENABLED === "true" && (
              <>
                <p className="login-demo-hint">Demo — jump straight into a portal</p>
                <div className="login-demo-btns">
                  <button className="login-demo-btn" formAction={demoLogIn.bind(null, "creator@demo.com")} formNoValidate type="submit">Creator</button>
                  <button className="login-demo-btn" formAction={demoLogIn.bind(null, "brand@demo.com")} formNoValidate type="submit">Brand</button>
                  <button className="login-demo-btn" formAction={demoLogIn.bind(null, "admin@demo.com")} formNoValidate type="submit">Admin</button>
                </div>
              </>
            )}
          </form>
        </div>

        <p style={{ textAlign: "center", color: "#99a1af", fontSize: 14, marginTop: 22 }}>
          Don&apos;t have an account? <Link href="/signup" style={{ color: "#00d9a3", fontWeight: 700, textDecoration: "none" }}>Sign up</Link>
        </p>
      </div>
    </main>
  );
}
