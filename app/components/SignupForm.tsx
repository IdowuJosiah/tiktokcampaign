"use client";

import { useState } from "react";
import { continueWithGoogle, signUp } from "@/app/actions";

const INPUT_STYLE: React.CSSProperties = {
  width: "100%",
  height: 44,
  padding: "0 14px",
  fontSize: 14,
  color: "var(--foreground)" as string,
  background: "rgba(0,0,0,0.04)",
  border: "1px solid var(--line)" as string,
  borderRadius: 8,
  outline: "none",
  fontFamily: "inherit",
  boxSizing: "border-box",
};

export function SignupForm({ defaultRole }: { defaultRole: "creator" | "brand" }) {
  const [role, setRole] = useState<"creator" | "brand">(defaultRole);

  const cardStyle = (active: boolean): React.CSSProperties => ({
    flex: 1,
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    padding: "18px 12px",
    border: `1px solid ${active ? "#00d9a3" : "var(--line)"}`,
    borderRadius: 12,
    background: active ? "rgba(0,217,163,0.1)" : "rgba(0,0,0,0.03)",
    color: active ? "#00d9a3" : "var(--muted)",
    cursor: "pointer",
    transition: "all 0.15s",
  });

  return (
    <form action={signUp}>
      {/* Role picker */}
      <div style={{ display: "flex", gap: 12, marginBottom: 20 }}>
        <div style={cardStyle(role === "creator")} onClick={() => setRole("creator")}>
          <input type="radio" name="role" value="creator" checked={role === "creator"} onChange={() => setRole("creator")} style={{ display: "none" }} />
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="8" r="4"/><path d="M4 21v-1a6 6 0 0 1 12 0v1"/></svg>
          <span style={{ fontSize: 14, fontWeight: 700, color: "inherit" }}>Creator</span>
          <span style={{ fontSize: 12, color: "var(--muted)" }}>Earn from posts</span>
        </div>
        <div style={cardStyle(role === "brand")} onClick={() => setRole("brand")}>
          <input type="radio" name="role" value="brand" checked={role === "brand"} onChange={() => setRole("brand")} style={{ display: "none" }} />
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 21h18"/><path d="M5 21V7l8-4v18"/><path d="M19 21V11l-6-4"/></svg>
          <span style={{ fontSize: 14, fontWeight: 700, color: "inherit" }}>Brand</span>
          <span style={{ fontSize: 12, color: "var(--muted)" }}>Launch campaigns</span>
        </div>
      </div>

      {/* Fields */}
      <div style={{ display: "flex", flexDirection: "column", gap: 14, marginBottom: 18 }}>
        <div>
          <label style={{ display: "block", fontSize: 13, color: "#374151", marginBottom: 7 }}>Full name</label>
          <input name="name" required type="text" placeholder="Ada Obi" style={INPUT_STYLE} />
        </div>
        <div>
          <label style={{ display: "block", fontSize: 13, color: "#374151", marginBottom: 7 }}>Email</label>
          <input name="email" required type="email" placeholder="you@example.com" style={INPUT_STYLE} />
        </div>
        <div>
          <label style={{ display: "block", fontSize: 13, color: "#374151", marginBottom: 7 }}>Password</label>
          <input name="password" required type="password" placeholder="Min 8 characters, 1 number" style={INPUT_STYLE} />
        </div>
      </div>

      <button
        type="submit"
        style={{ width: "100%", height: 46, fontSize: 15, fontWeight: 700, color: "#000", background: "#00d9a3", border: "none", borderRadius: 8, cursor: "pointer", marginTop: 0 }}
      >
        Create account →
      </button>

      {/* Divider */}
      <div style={{ display: "flex", alignItems: "center", gap: 12, margin: "18px 0", color: "var(--muted)", fontSize: 12 }}>
        <div style={{ flex: 1, height: 1, background: "var(--line)" }} />
        OR
        <div style={{ flex: 1, height: 1, background: "var(--line)" }} />
      </div>

      {/* OAuth */}
      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        <button
          type="submit"
          formAction={continueWithGoogle}
          formNoValidate
          style={{ height: 44, display: "flex", alignItems: "center", justifyContent: "center", gap: 10, fontSize: 14, color: "var(--foreground)", background: "rgba(0,0,0,0.04)", border: "1px solid var(--line)", borderRadius: 8, cursor: "pointer" }}
        >
          <svg width="16" height="16" viewBox="0 0 24 24">
            <path fill="#4285F4" d="M22.5 12.2c0-.7-.1-1.4-.2-2H12v3.8h5.9a5 5 0 0 1-2.2 3.3v2.7h3.6c2.1-2 3.2-4.9 3.2-7.8z"/>
            <path fill="#34A853" d="M12 23c2.9 0 5.4-1 7.2-2.6l-3.6-2.7c-1 .7-2.3 1.1-3.6 1.1-2.8 0-5.1-1.9-6-4.4H2.3v2.8A11 11 0 0 0 12 23z"/>
            <path fill="#FBBC05" d="M6 14.3a6.6 6.6 0 0 1 0-4.2V7.3H2.3a11 11 0 0 0 0 9.8z"/>
            <path fill="#EA4335" d="M12 5.4c1.6 0 3 .5 4.1 1.6l3-3A11 11 0 0 0 2.3 7.3l3.7 2.8C6.9 7.3 9.2 5.4 12 5.4z"/>
          </svg>
          Continue with Google
        </button>
      </div>
    </form>
  );
}
