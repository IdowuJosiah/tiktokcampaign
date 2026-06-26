import { NextRequest, NextResponse } from "next/server";
import { getAppSession } from "@/lib/auth";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { verifyPaystackTransaction } from "@/lib/paystack";

export async function GET(request: NextRequest) {
  const session = await getAppSession();
  if (!session || session.role !== "brand") {
    return NextResponse.redirect(new URL("/login?error=brand_required", request.url));
  }

  const reference = new URL(request.url).searchParams.get("reference");
  if (!reference) {
    return NextResponse.redirect(new URL("/brand/wallet?error=deposit_verification_failed", request.url));
  }

  try {
    const supabase = createServerSupabaseClient();

    const { data: existing, error: existingError } = await supabase
      .from("brand_wallet_transactions")
      .select("id")
      .eq("paystack_reference", reference)
      .maybeSingle();

    if (existingError) throw existingError;
    if (existing) {
      return NextResponse.redirect(new URL("/brand/wallet?success=funds_added", request.url));
    }

    const { data: brand, error: brandError } = await supabase
      .from("brands")
      .select("id")
      .eq("owner_user_id", session.id)
      .maybeSingle();

    if (brandError) throw brandError;
    if (!brand) throw new Error("Brand profile not found.");

    const result = await verifyPaystackTransaction(reference);
    if (!result.success) {
      return NextResponse.redirect(new URL("/brand/wallet?error=deposit_not_successful", request.url));
    }

    const { error: insertError } = await supabase.from("brand_wallet_transactions").insert({
      brand_id: brand.id,
      amount_cents: result.amountCents,
      type: "deposit",
      status: "completed",
      paystack_reference: reference,
    });

    if (insertError) throw insertError;

    return NextResponse.redirect(new URL("/brand/wallet?success=funds_added", request.url));
  } catch (error) {
    const message = error instanceof Error ? error.message : "Deposit verification failed.";
    console.error("Paystack callback failed:", message);
    return NextResponse.redirect(new URL("/brand/wallet?error=deposit_verification_failed", request.url));
  }
}
