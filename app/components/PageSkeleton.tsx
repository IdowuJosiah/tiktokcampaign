// Lightweight content-area skeleton shown (via loading.tsx) the instant a
// sidebar link is clicked, so navigation feels responsive while the server
// renders the real page.
export function PageSkeleton() {
  const block: React.CSSProperties = {
    background: "rgba(255,255,255,0.04)",
    border: "1px solid rgba(255,255,255,0.08)",
    borderRadius: 14,
  };

  return (
    <div style={{ maxWidth: 1100 }} aria-hidden>
      <div className="vr-skeleton" style={{ height: 26, width: 220, borderRadius: 8, background: "rgba(255,255,255,0.07)", marginBottom: 10 }} />
      <div className="vr-skeleton" style={{ height: 15, width: 320, borderRadius: 6, background: "rgba(255,255,255,0.05)", marginBottom: 28 }} />

      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 18, marginBottom: 24 }}>
        {[0, 1, 2, 3].map((i) => (
          <div key={i} className="vr-skeleton" style={{ ...block, height: 108 }} />
        ))}
      </div>

      <div className="vr-skeleton" style={{ ...block, height: 320 }} />
    </div>
  );
}
