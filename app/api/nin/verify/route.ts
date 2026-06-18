import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const nin = request.nextUrl.searchParams.get("nin");

  if (!nin || !/^\d{11}$/.test(nin)) {
    return NextResponse.json({ error: "NIN must be 11 digits." }, { status: 400 });
  }

  const apiKey = process.env.YOUVERIFY_API_KEY;

  if (!apiKey) {
    return NextResponse.json({ error: "NIN verification service not configured." }, { status: 503 });
  }

  try {
    const res = await fetch("https://api.youverify.co/v2/api/identity/ng/nin", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        token: apiKey,
      },
      body: JSON.stringify({ id: nin, isSubjectConsent: true }),
    });

    const data = await res.json();

    if (!res.ok || !data.success) {
      return NextResponse.json({ error: data.message ?? "NIN not found." }, { status: 422 });
    }

    const { firstName, middleName, lastName } = data.data ?? {};
    const parts = [firstName, middleName, lastName].filter(Boolean);
    const name = parts.join(" ").trim() || null;

    return NextResponse.json({ name, dob: data.data?.dateOfBirth ?? null });
  } catch {
    return NextResponse.json({ error: "Verification failed. Try again." }, { status: 500 });
  }
}
