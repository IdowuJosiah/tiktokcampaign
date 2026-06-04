import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const secretKey = process.env.PAYSTACK_SECRET_KEY;
  const url = new URL(request.url);
  const accountNumber = url.searchParams.get("account_number")?.trim() ?? "";
  const bankCode = url.searchParams.get("bank_code")?.trim() ?? "";

  if (!secretKey) {
    return NextResponse.json({ error: "PAYSTACK_SECRET_KEY is not configured." }, { status: 503 });
  }

  if (!/^\d{10}$/.test(accountNumber) || !bankCode) {
    return NextResponse.json({ error: "Provide a valid account number and bank." }, { status: 400 });
  }

  const paystackUrl = new URL("https://api.paystack.co/bank/resolve");
  paystackUrl.searchParams.set("account_number", accountNumber);
  paystackUrl.searchParams.set("bank_code", bankCode);

  const response = await fetch(paystackUrl, {
    headers: {
      Authorization: `Bearer ${secretKey}`,
    },
    cache: "no-store",
  });

  const payload = await response.json();

  if (!response.ok || !payload?.status) {
    return NextResponse.json({ error: payload?.message ?? "Could not resolve account." }, { status: 400 });
  }

  return NextResponse.json({
    accountName: payload.data?.account_name ?? "",
    accountNumber: payload.data?.account_number ?? accountNumber,
    bankCode,
  });
}
