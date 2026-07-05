import Link from "next/link";

export default function NotFound() {
  return (
    <main
      style={{
        minHeight: "100vh",
        background: "#0a0a0a",
        color: "#fff",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: 24,
        textAlign: "center",
      }}
    >
      <div
        style={{
          width: 56,
          height: 56,
          borderRadius: 14,
          background: "rgba(0,217,163,0.15)",
          border: "1px solid rgba(0,217,163,0.35)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          marginBottom: 24,
        }}
      >
        <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#00d9a3" strokeWidth="2" strokeLinecap="round">
          <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" />
          <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
          <line x1="12" y1="19" x2="12" y2="23" />
        </svg>
      </div>
      <div style={{ fontSize: 13, fontWeight: 700, color: "#00d9a3", letterSpacing: ".5px", textTransform: "uppercase", marginBottom: 12 }}>
        404
      </div>
      <h1 style={{ fontFamily: "var(--font-heading)", fontWeight: 600, fontSize: 28, margin: "0 0 12px" }}>
        Page not found
      </h1>
      <p style={{ color: "#99a1af", fontSize: 15, margin: "0 0 28px", maxWidth: 380, lineHeight: 1.5 }}>
        The page you&apos;re looking for doesn&apos;t exist or may have moved.
      </p>
      <Link
        href="/"
        style={{
          display: "inline-flex",
          alignItems: "center",
          height: 46,
          padding: "0 24px",
          fontFamily: "inherit",
          fontSize: 15,
          fontWeight: 700,
          color: "#000",
          background: "#00d9a3",
          border: "none",
          borderRadius: 9,
          textDecoration: "none",
        }}
      >
        Back to VoiceRank
      </Link>
    </main>
  );
}
