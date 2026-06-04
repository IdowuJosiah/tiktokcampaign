import { NextResponse } from "next/server";

const fallbackBanks = [
  { name: "Access Bank", code: "044" },
  { name: "Fidelity Bank", code: "070" },
  { name: "First Bank of Nigeria", code: "011" },
  { name: "Guaranty Trust Bank", code: "058" },
  { name: "Kuda Bank", code: "50211" },
  { name: "Moniepoint MFB", code: "50515" },
  { name: "OPay Digital Services", code: "999992" },
  { name: "PalmPay", code: "999991" },
  { name: "Stanbic IBTC Bank", code: "221" },
  { name: "Sterling Bank", code: "232" },
  { name: "United Bank For Africa", code: "033" },
  { name: "Wema Bank", code: "035" },
  { name: "Zenith Bank", code: "057" },
];

type PaystackBank = {
  name: string;
  code: string;
  active?: boolean;
  country?: string;
  currency?: string;
};

export async function GET() {
  const secretKey = process.env.PAYSTACK_SECRET_KEY;

  if (!secretKey) {
    return NextResponse.json({ banks: fallbackBanks, source: "fallback" });
  }

  try {
    const response = await fetch("https://api.paystack.co/bank?country=nigeria&enabled_for_verification=true", {
      headers: {
        Authorization: `Bearer ${secretKey}`,
      },
      next: { revalidate: 60 * 60 * 24 },
    });

    if (!response.ok) {
      return NextResponse.json({ banks: fallbackBanks, source: "fallback" });
    }

    const payload = (await response.json()) as { data?: PaystackBank[] };
    const banks = (payload.data ?? [])
      .filter((bank) => bank.name && bank.code)
      .map((bank) => ({ name: bank.name, code: bank.code }))
      .sort((a, b) => a.name.localeCompare(b.name));

    return NextResponse.json({ banks: banks.length ? banks : fallbackBanks, source: "paystack" });
  } catch {
    return NextResponse.json({ banks: fallbackBanks, source: "fallback" });
  }
}
