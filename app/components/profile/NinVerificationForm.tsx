"use client";

import { useState } from "react";
import { saveIdentityVerification } from "@/app/actions";

type Props = {
  defaultLegalName?: string;
  defaultNin?: string;
  identityStatus: string;
};

type VerifyState = "idle" | "verifying" | "found" | "not_found" | "unavailable";

export function NinVerificationForm({ defaultLegalName, defaultNin, identityStatus }: Props) {
  const [legalName, setLegalName] = useState(defaultLegalName ?? "");
  const [nin, setNin] = useState(defaultNin ?? "");
  const [verifyState, setVerifyState] = useState<VerifyState>("idle");
  const [verifiedName, setVerifiedName] = useState<string | null>(null);

  const isValidFormat = /^\d{11}$/.test(nin);
  const alreadySubmitted = identityStatus !== "not_started";

  async function verifyNin() {
    if (!isValidFormat) return;
    setVerifyState("verifying");
    setVerifiedName(null);

    try {
      const res = await fetch(`/api/nin/verify?nin=${nin}`);
      const data: { name?: string; error?: string } = await res.json();

      if (res.status === 503) {
        setVerifyState("unavailable");
        return;
      }

      if (!res.ok || !data.name) {
        setVerifyState("not_found");
        return;
      }

      setVerifiedName(data.name);
      setVerifyState("found");
      if (!legalName) setLegalName(data.name);
    } catch {
      setVerifyState("not_found");
    }
  }

  const hintText = () => {
    if (verifyState === "verifying") return "Checking NIN...";
    if (verifyState === "found") return `Verified name: ${verifiedName}`;
    if (verifyState === "not_found") return "NIN not found. Check the number and try again.";
    if (verifyState === "unavailable") return "NIN verification not configured — you can still submit manually.";
    if (!nin) return "Enter your 11-digit National Identity Number.";
    if (!isValidFormat) return `${nin.length}/11 digits entered.`;
    return "Format looks good. You can verify or submit directly.";
  };

  return (
    <form action={saveIdentityVerification} className="submission-form">
      <label>
        Legal name
        <input
          name="legalName"
          required
          type="text"
          value={legalName}
          onChange={(e) => setLegalName(e.target.value)}
          placeholder="Tomi Ade"
        />
      </label>
      <div>
        <label style={{ display: "grid", gap: "9px", fontSize: "14px", fontWeight: 700 }}>
          NIN
          <div style={{ display: "flex", gap: "8px" }}>
            <input
              inputMode="numeric"
              maxLength={11}
              minLength={11}
              name="nin"
              pattern="[0-9]{11}"
              required
              type="text"
              value={nin}
              onChange={(e) => {
                const next = e.target.value.replace(/\D/g, "").slice(0, 11);
                setNin(next);
                setVerifyState("idle");
                setVerifiedName(null);
              }}
              placeholder="12345678901"
              style={{ flex: 1 }}
            />
            <button
              type="button"
              className="ghost-button"
              onClick={verifyNin}
              disabled={!isValidFormat || verifyState === "verifying"}
              style={{ whiteSpace: "nowrap" }}
            >
              {verifyState === "verifying" ? "Checking..." : "Verify NIN"}
            </button>
          </div>
        </label>
        <p
          className="form-hint"
          style={{
            marginTop: "8px",
            color: verifyState === "found" ? "var(--accent)" : verifyState === "not_found" ? "#f87171" : undefined,
          }}
        >
          {hintText()}
        </p>
      </div>
      {alreadySubmitted && (
        <p className="form-hint">Current status: {identityStatus}. You can update and resubmit.</p>
      )}
      <button
        className="primary-button full"
        type="submit"
        disabled={!legalName.trim() || !isValidFormat}
      >
        {alreadySubmitted ? "Update NIN" : "Submit NIN"}
      </button>
    </form>
  );
}
