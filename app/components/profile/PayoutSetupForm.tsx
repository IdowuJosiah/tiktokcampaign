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
  const isDirty =
    bankName !== (defaultBankName ?? "") ||
    accountNumber !== (defaultAccountNumber ?? "") ||
    accountName !== (defaultAccountName ?? "");

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
      <label>
        Bank
        <select
          name="bankCode"
          required
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
          type="text"
          value={accountName}
          onChange={(event) => setAccountName(event.target.value)}
          placeholder="Enter account name"
        />
      </label>
      <p className="form-hint">{isResolving ? "Checking Paystack..." : status}</p>
      <button className="primary-button full" disabled={!accountName || isResolving || !isDirty} type="submit">
        {hasSavedProfile && !isDirty ? "Saved ✓" : hasSavedProfile ? "Update bank details" : "Save bank details"}
      </button>
    </form>
  );
}
