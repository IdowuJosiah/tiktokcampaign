import Link from "next/link";
import { continueWithGoogle, logIn } from "@/app/actions";
import { FormStatus } from "@/app/components/FormStatus";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;

  return (
    <main className="auth-screen">
      <section className="auth-art-panel">
        <div className="auth-art-copy">
          <h1>Connect. Create. Earn.</h1>
          <p>Continue managing campaigns, submissions, reviews, and creator payouts.</p>
        </div>
      </section>

      <section className="auth-form-panel">
        <div className="auth-card compact">
          <div className="auth-mark"><span /></div>
          <div className="auth-title">
            <h1>Welcome back</h1>
            <p>Log in to CreatorLink</p>
          </div>
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
            <button className="ghost-button full" formAction={continueWithGoogle} formNoValidate type="submit">
              Continue with Google
            </button>
            <button className="primary-button full" type="submit">Log in</button>
          </form>
          <p className="auth-switch">
            New to CreatorLink? <Link href="/signup">Create an account</Link>
          </p>
        </div>
      </section>
    </main>
  );
}
