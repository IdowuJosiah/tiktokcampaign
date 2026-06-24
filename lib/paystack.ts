import "server-only";

const INITIALIZE_URL = "https://api.paystack.co/transaction/initialize";
const VERIFY_URL = "https://api.paystack.co/transaction/verify";

export async function initializePaystackTransaction(params: {
  email: string;
  amountCents: number;
  reference: string;
  callbackUrl: string;
}) {
  const secretKey = process.env.PAYSTACK_SECRET_KEY;
  if (!secretKey) throw new Error("PAYSTACK_SECRET_KEY is not configured.");

  const response = await fetch(INITIALIZE_URL, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${secretKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      email: params.email,
      amount: params.amountCents,
      reference: params.reference,
      callback_url: params.callbackUrl,
    }),
  });

  const payload = await response.json();
  if (!response.ok || !payload?.status) {
    throw new Error(payload?.message || "Could not initialize Paystack transaction.");
  }

  return payload.data.authorization_url as string;
}

export async function verifyPaystackTransaction(reference: string) {
  const secretKey = process.env.PAYSTACK_SECRET_KEY;
  if (!secretKey) throw new Error("PAYSTACK_SECRET_KEY is not configured.");

  const response = await fetch(`${VERIFY_URL}/${encodeURIComponent(reference)}`, {
    headers: { Authorization: `Bearer ${secretKey}` },
    cache: "no-store",
  });

  const payload = await response.json();
  if (!response.ok || !payload?.status) {
    throw new Error(payload?.message || "Could not verify Paystack transaction.");
  }

  return {
    success: payload.data.status === "success",
    amountCents: payload.data.amount as number,
    currency: payload.data.currency as string,
  };
}
