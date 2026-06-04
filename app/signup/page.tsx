import Link from "next/link";
import { continueWithGoogle, signUp } from "@/app/actions";
import { FormStatus } from "@/app/components/FormStatus";

export default async function SignupPage({
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
          <p>Join a transparent platform where brands launch campaigns and creators earn for real engagement.</p>
        </div>
      </section>

      <section className="auth-form-panel">
        <div className="auth-card">
          <div className="auth-mark"><span /></div>
          <div className="auth-title">
            <h1>Create your account</h1>
            <p>Join the future of creator marketing</p>
          </div>
          <FormStatus error={error} />
          <form action={signUp} className="submission-form">
            <div className="form-grid">
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
            </div>
            <label>
              Email
              <input name="email" required type="email" placeholder="you@example.com" />
            </label>
            <label>
              Password
              <input name="password" required type="password" placeholder="Create a password" />
            </label>
            <label>
              TikTok handle
              <input name="tiktokHandle" type="text" placeholder="@yourhandle" />
              <small>Creators can connect now. We will ask you to verify this in your profile with a bio code.</small>
            </label>
            <button className="ghost-button full" formAction={continueWithGoogle} formNoValidate type="submit">
              Continue with Google
            </button>
            <button className="primary-button full" type="submit">Create account</button>
          </form>
          <p className="auth-switch">
            Already have an account? <Link href="/login">Sign In</Link>
          </p>
        </div>
      </section>
    </main>
  );
}
