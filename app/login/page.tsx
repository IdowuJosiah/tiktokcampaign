import Link from "next/link";
import { logIn } from "@/app/actions";
import { AppShell } from "@/app/components/AppShell";
import { FormStatus } from "@/app/components/FormStatus";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;

  return (
    <AppShell>
      <header className="page-header auth-header">
        <div>
          <p className="eyebrow">Welcome back</p>
          <h1>Log in to VoiceRank.</h1>
          <p>Continue managing TikTok missions, submissions, reviews, and creator payouts.</p>
        </div>
      </header>

      <section className="panel form-panel auth-panel">
        <FormStatus error={error} />
        <form action={logIn} className="submission-form">
          <label>
            Email
            <input name="email" required type="email" placeholder="you@example.com" />
          </label>
          <label>
            Password
            <input name="password" required type="password" placeholder="••••••••" />
          </label>
          <button className="primary-button full" type="submit">Log in</button>
        </form>
        <p className="auth-switch">
          New to VoiceRank? <Link href="/signup">Create an account</Link>
        </p>
      </section>
    </AppShell>
  );
}
