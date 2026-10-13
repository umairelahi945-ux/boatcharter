import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";

/**
 * Payment provider webhook receiver.
 *
 * Handles: payment succeeded / failed / pending / refunded / cancelled and
 * generic status updates. Requests are rejected unless the HMAC-SHA256
 * signature in `x-payment-signature` matches PAYMENT_WEBHOOK_SECRET.
 * Events are de-duplicated by provider event id.
 */
const eventSchema = z.object({
  id: z.string().min(1).max(200),
  type: z.string().min(1).max(100),
  data: z.object({
    transaction_id: z.string().min(1).max(200),
    amount: z.number().int().optional(),
    currency: z.string().max(8).optional(),
  }),
});

const STATUS_BY_EVENT: Record<
  string,
  { status: "paid" | "failed" | "pending" | "refunded" | "cancelled"; label: string; type: string }
> = {
  "payment.succeeded": { status: "paid", label: "Payment succeeded", type: "payment_succeeded" },
  "payment.failed": { status: "failed", label: "Payment failed", type: "payment_failed" },
  "payment.pending": { status: "pending", label: "Payment pending", type: "payment_pending" },
  "payment.refunded": { status: "refunded", label: "Refund issued", type: "refund_issued" },
  "payment.cancelled": { status: "cancelled", label: "Payment cancelled", type: "payment_cancelled" },
};

export const Route = createFileRoute("/api/public/webhooks/payment")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const rawBody = await request.text();
        const signature = request.headers.get("x-payment-signature");

        const { verifyWebhookSignature, getPaymentConfig } = await import(
          "@/lib/payment-gateway.server"
        );
        const valid = await verifyWebhookSignature(rawBody, signature);
        if (!valid) {
          return Response.json({ error: "Invalid signature" }, { status: 401 });
        }

        let parsed;
        try {
          parsed = eventSchema.parse(JSON.parse(rawBody));
        } catch {
          return Response.json({ error: "Invalid payload" }, { status: 400 });
        }

        const mapped = STATUS_BY_EVENT[parsed.type];
        if (!mapped) {
          return Response.json({ received: true, ignored: parsed.type }, { status: 202 });
        }

        const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
        const provider = getPaymentConfig().provider;

        const { error: dedupeError } = await supabaseAdmin.from("webhook_events").insert({
          provider,
          event_id: parsed.id,
          event_type: parsed.type,
          payload: JSON.parse(rawBody),
        });
        if (dedupeError) {
          // Unique violation => already processed. Idempotent success.
          return Response.json({ received: true, duplicate: true }, { status: 200 });
        }

        const { applyPaymentStatus } = await import("@/lib/finance.server");
        const result = await applyPaymentStatus({
          transactionId: parsed.data.transaction_id,
          status: mapped.status,
          note: `Provider webhook: ${parsed.type}`,
          eventLabel: mapped.label,
          eventType: mapped.type,
        });

        if (!result.ok) {
          return Response.json({ error: result.message }, { status: 404 });
        }
        return Response.json({ received: true }, { status: 200 });
      },
    },
  },
});
