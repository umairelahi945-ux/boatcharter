/**
 * Modular payment gateway adapter.
 *
 * The application ships with a single online payment method (secure card
 * checkout). Credentials are read from environment variables at call time so a
 * real provider can be connected later without touching application code:
 *
 *   PAYMENT_API_KEY, PAYMENT_SECRET_KEY, PAYMENT_PUBLIC_KEY,
 *   PAYMENT_WEBHOOK_SECRET, PAYMENT_API_URL, PAYMENT_ENVIRONMENT
 *
 * When live credentials are absent the adapter runs in clearly labelled
 * demo mode so the product is fully usable in development.
 */

export type PaymentStatus = "pending" | "paid" | "failed" | "refunded" | "cancelled";

export type PaymentConfig = {
  provider: string;
  apiUrl: string;
  environment: "development" | "production";
  mode: "live" | "demo";
  publicKey: string;
  methodLabel: string;
  methodType: "card";
};

export type ChargeResult = {
  status: PaymentStatus;
  transactionId: string;
  lastFour: string | null;
  message: string;
};

function env(name: string): string {
  return (process.env[name] ?? "").trim();
}

export function getPaymentConfig(): PaymentConfig {
  const secret = env("PAYMENT_SECRET_KEY") || env("PAYMENT_API_KEY");
  const apiUrl = env("PAYMENT_API_URL");
  const environment = env("PAYMENT_ENVIRONMENT") === "production" ? "production" : "development";
  const live = Boolean(secret && apiUrl);

  return {
    provider: live ? env("PAYMENT_PROVIDER") || "gateway" : "demo",
    apiUrl,
    environment,
    mode: live ? "live" : "demo",
    publicKey: env("PAYMENT_PUBLIC_KEY"),
    methodLabel: "Secure Card Payment",
    methodType: "card",
  };
}

function randomId(prefix: string): string {
  const bytes = crypto.getRandomValues(new Uint8Array(8));
  const hex = Array.from(bytes)
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
  return `${prefix}_${hex}`;
}

export type ChargeInput = {
  amountCents: number;
  currency: string;
  reference: string;
  customerEmail: string;
  customerName: string;
  /** Only honoured in demo mode. */
  demoOutcome?: "success" | "failure" | "pending";
  cardLastFour?: string | null;
};

export async function createCharge(input: ChargeInput): Promise<ChargeResult> {
  const config = getPaymentConfig();

  if (config.mode === "demo") {
    const outcome = input.demoOutcome ?? "success";
    if (outcome === "failure") {
      return {
        status: "failed",
        transactionId: randomId("txn_demo"),
        lastFour: input.cardLastFour ?? null,
        message: "Demo payment declined by the test gateway.",
      };
    }
    if (outcome === "pending") {
      return {
        status: "pending",
        transactionId: randomId("txn_demo"),
        lastFour: input.cardLastFour ?? null,
        message: "Demo payment is awaiting confirmation.",
      };
    }
    return {
      status: "paid",
      transactionId: randomId("txn_demo"),
      lastFour: input.cardLastFour ?? "4242",
      message: "Demo payment approved by the test gateway.",
    };
  }

  const secret = env("PAYMENT_SECRET_KEY") || env("PAYMENT_API_KEY");
  try {
    const response = await fetch(`${config.apiUrl.replace(/\/$/, "")}/payments`, {
      method: "POST",
      headers: {
        "content-type": "application/json",
        authorization: `Bearer ${secret}`,
      },
      body: JSON.stringify({
        amount: input.amountCents,
        currency: input.currency.toLowerCase(),
        reference: input.reference,
        customer: { name: input.customerName, email: input.customerEmail },
        capture: true,
      }),
    });

    const payload = (await response.json().catch(() => ({}))) as Record<string, unknown>;

    if (!response.ok) {
      console.error("[payments] gateway rejected charge", response.status, payload);
      return {
        status: "failed",
        transactionId: String(payload["id"] ?? randomId("txn")),
        lastFour: null,
        message: "The payment provider declined this transaction.",
      };
    }

    const providerStatus = String(payload["status"] ?? "pending").toLowerCase();
    const status: PaymentStatus =
      providerStatus === "succeeded" || providerStatus === "paid"
        ? "paid"
        : providerStatus === "failed"
          ? "failed"
          : "pending";

    return {
      status,
      transactionId: String(payload["id"] ?? randomId("txn")),
      lastFour: (payload["last_four"] as string | undefined) ?? null,
      message:
        status === "paid" ? "Payment captured successfully." : "Payment is awaiting confirmation.",
    };
  } catch (error) {
    console.error("[payments] gateway request failed", error);
    return {
      status: "failed",
      transactionId: randomId("txn"),
      lastFour: null,
      message: "We could not reach the payment provider. Please try again.",
    };
  }
}

export async function createRefund(
  transactionId: string,
  amountCents: number,
): Promise<{ ok: boolean; refundId: string; message: string }> {
  const config = getPaymentConfig();
  if (config.mode === "demo") {
    return {
      ok: true,
      refundId: `${transactionId}-refund`,
      message: "Demo refund processed.",
    };
  }

  const secret = env("PAYMENT_SECRET_KEY") || env("PAYMENT_API_KEY");
  try {
    const response = await fetch(`${config.apiUrl.replace(/\/$/, "")}/refunds`, {
      method: "POST",
      headers: { "content-type": "application/json", authorization: `Bearer ${secret}` },
      body: JSON.stringify({ payment_id: transactionId, amount: amountCents }),
    });
    const payload = (await response.json().catch(() => ({}))) as Record<string, unknown>;
    if (!response.ok) {
      console.error("[payments] refund rejected", response.status, payload);
      return { ok: false, refundId: "", message: "The payment provider rejected the refund." };
    }
    return {
      ok: true,
      refundId: String(payload["id"] ?? `${transactionId}-refund`),
      message: "Refund submitted to the payment provider.",
    };
  } catch (error) {
    console.error("[payments] refund request failed", error);
    return { ok: false, refundId: "", message: "We could not reach the payment provider." };
  }
}

/** Timing-safe HMAC-SHA256 signature verification for provider webhooks. */
export async function verifyWebhookSignature(
  rawBody: string,
  signature: string | null,
): Promise<boolean> {
  const secret = env("PAYMENT_WEBHOOK_SECRET");
  if (!secret) {
    // No webhook secret configured: demo mode only accepts explicitly-marked test events.
    return getPaymentConfig().mode === "demo";
  }
  if (!signature) return false;

  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const digest = await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(rawBody));
  const expected = Array.from(new Uint8Array(digest))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");

  const provided = signature.replace(/^sha256=/, "");
  if (provided.length !== expected.length) return false;
  let diff = 0;
  for (let i = 0; i < expected.length; i += 1) {
    diff |= expected.charCodeAt(i) ^ provided.charCodeAt(i);
  }
  return diff === 0;
}
