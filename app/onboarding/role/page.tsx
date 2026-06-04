import { redirect } from "next/navigation";
import { chooseAccountRole } from "@/app/actions";
import { getAppSession } from "@/lib/auth";

const roles = [
  {
    value: "creator",
    title: "Creator",
    eyebrow: "Submit videos",
    description: "Find approved campaigns, follow instructions, submit TikTok links, and withdraw rewards after approval.",
  },
  {
    value: "brand",
    title: "Brand",
    eyebrow: "Launch campaigns",
    description: "Create campaign briefs, fund reward pools through Paystack later, and review creator submissions.",
  },
];

export default async function RolePickerPage() {
  const session = await getAppSession();

  if (!session) {
    redirect("/login?error=login_required");
  }

  if (session.role === "admin") {
    redirect("/admin");
  }

  return (
    <main className="role-screen">
      <section className="role-card">
        <div className="auth-mark"><span /></div>
        <div className="auth-title">
          <h1>How will you use CreatorLink?</h1>
          <p>Choose your account type to finish setting up your workspace.</p>
        </div>

        <div className="role-grid">
          {roles.map((role) => (
            <form action={chooseAccountRole} className="role-option" key={role.value}>
              <input name="role" type="hidden" value={role.value} />
              <span>{role.eyebrow}</span>
              <h2>{role.title}</h2>
              <p>{role.description}</p>
              <button className="primary-button full" type="submit">
                Continue as {role.title}
              </button>
            </form>
          ))}
        </div>
      </section>
    </main>
  );
}
