import Link from "next/link";
import { redirect } from "next/navigation";
import { AppShell } from "@/app/components/AppShell";
import { MissionCard } from "@/app/components/MissionCard";
import { getAppSession } from "@/lib/auth";
import { listDashboardStats, listLiveMissions } from "@/lib/repository";

export default async function Home() {
  const session = await getAppSession();

  if (session?.role === "brand") redirect("/dashboard/brand");
  if (session?.role === "creator") redirect("/dashboard/creator");
  if (session?.role === "admin") redirect("/admin");

  const [stats, missions] = await Promise.all([
    listDashboardStats(),
    listLiveMissions(),
  ]);
  const primaryHref = "/signup";

  return (
    <AppShell>
      <header className="home-hero">
        <p className="pill-label">Creator impact network</p>
        <h1>
          Authentic <span>brand-creator</span> partnerships powered by verified impact.
        </h1>
        <p>Brands pay for measurable reach. Creators submit real TikTok work and get rewarded after review.</p>
        <div className="hero-actions">
          <Link className="primary-button" href={primaryHref}>Get Started</Link>
          <Link className="ghost-button" href="/login">Log In</Link>
        </div>
        <div className="network-visual" aria-hidden="true">
          <div className="network-ring outer" />
          <div className="network-ring inner" />
          <div className="network-core">VR</div>
          {["₦", "▶", "#", "✓", "₿", "↗", "◎", "★"].map((item, index) => (
            <span className={`network-node node-${index + 1}`} key={item}>{item}</span>
          ))}
        </div>
      </header>

      <section className="stats-grid" aria-label="Campaign metrics">
        {stats.map((stat) => (
          <article key={stat.label}>
            <span>{stat.label}</span>
            <strong>{stat.value}</strong>
            <small>{stat.detail}</small>
          </article>
        ))}
      </section>

      <section className="landing-section">
        <div className="section-title centered">
          <div>
            <p className="pill-label muted-pill">How it works</p>
            <h2>Three simple steps to connect brands with creators.</h2>
          </div>
        </div>
        <div className="feature-grid three">
          <article>
            <span>01</span>
            <h3>Brands launch campaigns</h3>
            <p>Create a brief with hashtags, sounds, minimum views, budget, and submission rules.</p>
          </article>
          <article>
            <span>02</span>
            <h3>Creators submit videos</h3>
            <p>Creators browse live campaigns, follow instructions, and submit TikTok links for review.</p>
          </article>
          <article>
            <span>03</span>
            <h3>Rewards are approved</h3>
            <p>Admins verify requirements, approve submissions, and release wallet rewards for payout.</p>
          </article>
        </div>
      </section>

      <section className="grid-two">
        <div className="panel wide">
          <div className="section-title">
            <div>
              <p className="eyebrow">Live campaigns</p>
              <h2>Available creator missions.</h2>
            </div>
            <Link className="ghost-button" href="/campaigns">View all</Link>
          </div>
          <div className="mission-list">
            {missions.slice(0, 2).map((mission) => (
              <MissionCard mission={mission} key={mission.id} />
            ))}
          </div>
        </div>

        <div className="panel">
          <p className="eyebrow">Campaign controls</p>
          <h2>Clear rules before creators submit.</h2>
          <ul className="detail-list">
            <li>Brands set the total reward pool before launch.</li>
            <li>Each campaign defines payment per 5 approved submissions.</li>
            <li>Every submission has its own view requirement and instruction checks.</li>
            <li>Review happens inside the campaign, not in a separate brand queue.</li>
          </ul>
        </div>
      </section>

      <section className="landing-section">
        <div className="section-title centered">
          <div>
            <p className="pill-label muted-pill">Our advantages</p>
            <h2>Built for transparent campaign operations.</h2>
          </div>
        </div>
        <div className="feature-grid three">
          <article>
            <span>✓</span>
            <h3>Verified creator accounts</h3>
            <p>TikTok linking and profile verification protect campaign quality before submissions begin.</p>
          </article>
          <article>
            <span>₦</span>
            <h3>Local payout readiness</h3>
            <p>Nigerian bank lookup and account resolution reduce payout mistakes before withdrawals.</p>
          </article>
          <article>
            <span>#</span>
            <h3>Instruction-based review</h3>
            <p>Campaign rules become review checks for hashtags, sounds, disclosure, reach, and deadlines.</p>
          </article>
        </div>
      </section>

      <section className="cta-panel">
        <p className="pill-label">Ready to start?</p>
        <h2>Launch your first creator campaign today.</h2>
        <p>Join creators and brands using transparent submissions, admin review, and verified reward flows.</p>
        <Link className="primary-button dark-button" href={primaryHref}>Get Started</Link>
      </section>
    </AppShell>
  );
}
