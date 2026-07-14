"use client";

import { useEffect, useMemo, useState } from "react";
import { savePayoutProfile } from "@/app/actions";

type Bank = {
  name: string;
  code: string;
};

export function PayoutSetupForm({
  defaultAccountName,
  defaultAccountNumber,
  defaultBankName,
}: {
  defaultAccountName?: string;
  defaultAccountNumber?: string;
  defaultBankName?: string;
}) {
  const [banks, setBanks] = useState<Bank[]>([]);
  const [bankCode, setBankCode] = useState("");
  const [bankName, setBankName] = useState(defaultBankName ?? "");
  const [accountNumber, setAccountNumber] = useState(defaultAccountNumber ?? "");
  const [accountName, setAccountName] = useState(defaultAccountName ?? "");
  const [status, setStatus] = useState("Choose your bank and enter your 10-digit account number.");
  const [isResolving, setIsResolving] = useState(false);
  // Once a profile is saved the form is locked (read-only) until the creator
  // taps the edit icon.
  const [editing, setEditing] = useState(!defaultAccountNumber);

  useEffect(() => {
    let mounted = true;

    fetch("/api/paystack/banks")
      .then((response) => response.json())
      .then((payload: { banks?: Bank[] }) => {
        if (!mounted) return;
        const bankList = payload.banks ?? [];
        setBanks(bankList);
        const currentBank = bankList.find((bank) => bank.name === defaultBankName);
        if (currentBank) setBankCode(currentBank.code);
      })
      .catch(() => {
        if (mounted) setStatus("Could not load Nigerian banks. Try again.");
      });

    return () => {
      mounted = false;
    };
  }, [defaultBankName]);

  const canResolve = useMemo(() => /^\d{10}$/.test(accountNumber) && bankCode, [accountNumber, bankCode]);

  const hasSavedProfile = Boolean(defaultAccountNumber);

  useEffect(() => {
    if (!canResolve) {
      return;
    }

    const controller = new AbortController();
    const timeout = window.setTimeout(() => {
      setIsResolving(true);
      setStatus("Resolving account name...");

      fetch(`/api/paystack/resolve?account_number=${accountNumber}&bank_code=${bankCode}`, {
        signal: controller.signal,
      })
        .then((response) => response.json().then((payload) => ({ ok: response.ok, payload })))
        .then(({ ok, payload }: { ok: boolean; payload: { accountName?: string; error?: string } }) => {
          if (!ok || !payload.accountName) {
            setStatus(payload.error ?? "Could not resolve account name. Enter it manually.");
            return;
          }

          setAccountName(payload.accountName);
          setStatus("Account name resolved.");
        })
        .catch(() => {
          if (!controller.signal.aborted) {
            setAccountName("");
            setStatus("Could not resolve account name.");
          }
        })
        .finally(() => setIsResolving(false));
    }, 450);

    return () => {
      controller.abort();
      window.clearTimeout(timeout);
    };
  }, [accountNumber, bankCode, canResolve]);

  return (
    <form action={savePayoutProfile} className="submission-form">
      <input name="bankName" type="hidden" value={bankName} />
      <input name="accountName" type="hidden" value={accountName} />

      {hasSavedProfile && !editing ? (
        <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: -8 }}>
          <button
            type="button"
            onClick={() => {
              setEditing(true);
              setStatus("Update your bank details.");
            }}
            aria-label="Edit bank details"
            style={{ display: "inline-flex", alignItems: "center", gap: 6, height: 32, padding: "0 12px", fontSize: 13, fontWeight: 700, color: "#00d9a3", background: "rgba(0,217,163,0.08)", border: "1px solid rgba(0,217,163,0.3)", borderRadius: 8, cursor: "pointer" }}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/></svg>
            Edit
          </button>
        </div>
      ) : null}

      <label>
        Bank
        <select
          name="bankCode"
          required
          disabled={!editing}
          value={bankCode}
          onChange={(event) => {
            const selectedBank = banks.find((bank) => bank.code === event.target.value);
            setBankCode(event.target.value);
            setBankName(selectedBank?.name ?? "");
            setAccountName("");
            setStatus("Enter a 10-digit account number.");
          }}
        >
          <option value="">Select Nigerian bank</option>
          {banks.map((bank) => (
            <option key={bank.code} value={bank.code}>
              {bank.name}
            </option>
          ))}
        </select>
      </label>
      <label>
        Account number
        <input
          inputMode="numeric"
          maxLength={10}
          name="accountNumber"
          pattern="[0-9]{10}"
          required
          disabled={!editing}
          type="text"
          value={accountNumber}
          onChange={(event) => {
            const nextAccountNumber = event.target.value.replace(/\D/g, "").slice(0, 10);
            setAccountNumber(nextAccountNumber);
            setStatus(nextAccountNumber.length === 10 ? "Ready to resolve account name." : "Enter a 10-digit account number.");
          }}
          placeholder="0123456789"
        />
      </label>
      <label>
        Account name
        <input
          required
          disabled={!editing}
          type="text"
          value={accountName}
          onChange={(event) => setAccountName(event.target.value)}
          placeholder="Enter account name"
        />
      </label>
      <p className="form-hint">{isResolving ? "Checking Paystack..." : status}</p>
      <button className="primary-button full" disabled={!editing || !accountName || isResolving} type="submit">
        Save bank details
      </button>
    </form>
  );
}
