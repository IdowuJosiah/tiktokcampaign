import Link from "next/link";
import { signUp } from "@/app/actions";
import { AppShell } from "@/app/components/AppShell";
import { FormStatus } from "@/app/components/FormStatus";

export default async function SignupPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;

  return (
    <AppShell>
      <header className="page-header auth-header">
        <div>
          <p className="eyebrow">Start here</p>
          <h1>Create your account.</h1>
          <p>Join as a brand launching missions or as a creator submitting TikTok videos.</p>
        </div>
      </header>

      <section className="panel form-panel auth-panel">
        <FormStatus error={error} />
        <form action={signUp} className="submission-form">
          <label>
            Account type
            <select name="role" defaultValue="creator">
              <option value="creator">Creator</option>
              <option value="brand">Brand</option>
            </select>
          </label>
          <label>
            Full name
            <input name="name" required type="text" placeholder="Tomi Ade" />
          </label>
          <label>
            Email
            <input name="email" required type="email" placeholder="you@example.com" />
          </label>
          <label>
            Password
            <input name="password" required type="password" placeholder="Create a password" />
          </label>
          <button className="primary-button full" type="submit">Create account</button>
        </form>
        <p className="auth-switch">
          Already have an account? <Link href="/login">Log in</Link>
        </p>
      </section>
    </AppShell>
  );
}
