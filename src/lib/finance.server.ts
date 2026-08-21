import { supabaseAdmin } from "@/integrations/supabase/client.server";

import type { PaymentStatus } from "./payment-gateway.server";

export type HistoryEvent = {
  event: string;
  eventType: string;
  bookingId?: string | null;
  bookingReference?: string;
  transactionId?: string;
  boatId?: string | null;
  boatTitle?: string;
  customerName?: string;
  amountCents?: number;
  currency?: string;
  status?: string;
  notes?: string;
};

/** Append-only audit trail. History rows are never updated or deleted. */
export async function addHistory(event: HistoryEvent): Promise<void> {
  const { error } = await supabaseAdmin.from("financial_history").insert({
    event: event.event,
    event_type: event.eventType,
    booking_id: event.bookingId ?? null,
    booking_reference: event.bookingReference ?? "",
    transaction_id: event.transactionId ?? "",
    boat_id: event.boatId ?? null,
    boat_title: event.boatTitle ?? "",
    customer_name: event.customerName ?? "",
    amount_cents: event.amountCents ?? 0,
    currency: event.currency ?? "USD",
    status: event.status ?? "",
    notes: event.notes ?? "",
  });
  if (error) console.error("[finance] failed to append history", error);
}

export type FinancialRecordInput = {
  bookingId: string | null;
  transactionId: string;
  customerName: string;
  boatId: string | null;
  boatTitle: string;
  amountCents: number;
  currency?: string;
  transactionType: "booking_payment" | "refund" | "adjustment" | "other";
  paymentMethod: string;
  paymentStatus: string;
  notes?: string;
};

export async function upsertFinancialRecord(input: FinancialRecordInput): Promise<void> {
  const { data: existing } = await supabaseAdmin
    .from("financial_records")
    .select("id")
    .eq("transaction_id", input.transactionId)
    .eq("transaction_type", input.transactionType)
    .maybeSingle();

  const payload = {
    booking_id: input.bookingId,
    transaction_id: input.transactionId,
    customer_name: input.customerName,
    boat_id: input.boatId,
    boat_title: input.boatTitle,
    amount_cents: input.amountCents,
    currency: input.currency ?? "USD",
    transaction_type: input.transactionType,
    payment_method: input.paymentMethod,
    payment_status: input.paymentStatus,
    notes: input.notes ?? "",
  };

  if (existing) {
    const { error } = await supabaseAdmin
      .from("financial_records")
      .update({ payment_status: payload.payment_status, notes: payload.notes })
      .eq("id", existing.id);
    if (error) console.error("[finance] failed to update record", error);
    return;
  }

  const { error } = await supabaseAdmin.from("financial_records").insert(payload);
  if (error) console.error("[finance] failed to insert record", error);
}

/**
 * Applies a payment status transition across payment, booking and financial
 * records, and appends an immutable history entry. Idempotent: re-applying the
 * same status is a no-op for revenue.
 */
export async function applyPaymentStatus(options: {
  transactionId: string;
  status: PaymentStatus;
  note: string;
  eventLabel: string;
  eventType: string;
}): Promise<{ ok: boolean; message: string }> {
  const { data: payment } = await supabaseAdmin
    .from("payments")
    .select("*")
    .eq("transaction_id", options.transactionId)
    .maybeSingle();

  if (!payment) return { ok: false, message: "No matching transaction was found." };
  if (payment.payment_status === options.status) {
    return { ok: true, message: "Transaction already in this state." };
  }

  await supabaseAdmin
    .from("payments")
    .update({ payment_status: options.status })
    .eq("id", payment.id);

  let booking: {
    id: string;
    reference: string;
    boat_id: string | null;
    boat_title: string;
    customer_name: string;
    total_price_cents: number;
    currency: string;
  } | null = null;

  if (payment.booking_id) {
    const { data } = await supabaseAdmin
      .from("bookings")
      .select("id, reference, boat_id, boat_title, customer_name, total_price_cents, currency")
      .eq("id", payment.booking_id)
      .maybeSingle();
    booking = data ?? null;

    if (booking) {
      const update: {
        payment_status: string;
        status?: string;
        amount_paid_cents?: number;
        balance_due_cents?: number;
      } = {
        payment_status: options.status,
      };
      if (options.status === "paid") {
        update.status = "confirmed";
        // Only the captured deposit counts as paid; the rest stays outstanding.
        update.amount_paid_cents = Number(payment.amount_cents);
        update.balance_due_cents = Math.max(
          Number(booking.total_price_cents) - Number(payment.amount_cents),
          0,
        );
      }
      if (options.status === "refunded" || options.status === "cancelled") {
        update.status = "cancelled";
        update.amount_paid_cents = 0;
        update.balance_due_cents = Number(booking.total_price_cents);
      }
      if (options.status === "failed" || options.status === "pending") {
        update.amount_paid_cents = 0;
        update.balance_due_cents = Number(booking.total_price_cents);
      }
      await supabaseAdmin.from("bookings").update(update).eq("id", booking.id);
    }
  }

  await upsertFinancialRecord({
    bookingId: payment.booking_id,
    transactionId: options.transactionId,
    customerName: booking?.customer_name ?? "",
    boatId: booking?.boat_id ?? null,
    boatTitle: booking?.boat_title ?? "",
    amountCents: payment.amount_cents,
    currency: payment.currency,
    transactionType: "booking_payment",
    paymentMethod: payment.payment_method_type,
    paymentStatus: options.status,
    notes: options.note,
  });

  if (options.status === "refunded") {
    await upsertFinancialRecord({
      bookingId: payment.booking_id,
      transactionId: `${options.transactionId}-refund`,
      customerName: booking?.customer_name ?? "",
      boatId: booking?.boat_id ?? null,
      boatTitle: booking?.boat_title ?? "",
      amountCents: payment.amount_cents,
      currency: payment.currency,
      transactionType: "refund",
      paymentMethod: payment.payment_method_type,
      paymentStatus: "refunded",
      notes: options.note,
    });
  }

  await addHistory({
    event: options.eventLabel,
    eventType: options.eventType,
    bookingId: payment.booking_id,
    bookingReference: booking?.reference ?? "",
    transactionId: options.transactionId,
    boatId: booking?.boat_id ?? null,
    boatTitle: booking?.boat_title ?? "",
    customerName: booking?.customer_name ?? "",
    amountCents: payment.amount_cents,
    currency: payment.currency,
    status: options.status,
    notes: options.note,
  });

  return { ok: true, message: "Transaction updated." };
}

export function generateReference(): string {
  const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  const bytes = crypto.getRandomValues(new Uint8Array(6));
  let out = "";
  for (const byte of bytes) out += alphabet[byte % alphabet.length];
  return `BC-${out}`;
}
