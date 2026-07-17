import { adminLogIn } from "@/app/actions";
import { FormStatus } from "@/app/components/FormStatus";

export default async function AdminLoginPage({
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

        <h1 style={{ fontFamily: "var(--font-heading)", fontWeight: 600, fontSize: 30, textAlign: "center", margin: "14px 0 6px" }}>Admin Console</h1>
        <p style={{ color: "var(--muted)", fontSize: 15, textAlign: "center", margin: "0 0 28px" }}>Sign in to manage VoiceRank</p>

        <FormStatus error={error} />

        <div className="login-body">
          <form action={adminLogIn}>
            <div className="auth-field">
              <label htmlFor="admin-username">Username</label>
              <input id="admin-username" name="username" required type="text" placeholder="admin" autoComplete="username" />
            </div>
            <div className="auth-field" style={{ marginTop: 16 }}>
              <label htmlFor="admin-password">Password</label>
              <input id="admin-password" name="password" required type="password" placeholder="••••••••" autoComplete="current-password" />
            </div>

            <button className="auth-submit-btn" type="submit" style={{ marginTop: 20 }}>Sign in →</button>
          </form>
        </div>
      </div>
    </main>
  );
}
