import { NextResponse } from "next/server";

// Paystack's full bank list includes hundreds of small/microfinance banks (and,
// in practice, occasional duplicate entries for the same bank). We only want to
// offer the major Nigerian banks a creator is actually likely to hold an account
// with, so this list is curated rather than fetched live.
const majorBanks = [
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

export async function GET() {
  return NextResponse.json({ banks: majorBanks });
}
