import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

const boatSchema = z.object({
  title: z.string().trim().min(2, "Title is required.").max(120),
  category: z.string().trim().min(2).max(60),
  capacity: z.number().int().min(1).max(500),
  lengthFt: z.number().min(1).max(500),
  hourlyRateCents: z.number().int().min(0).max(100_000_000),
  dailyRateCents: z.number().int().min(0).max(100_000_000),
  location: z.string().trim().min(2, "Location is required.").max(160),
  description: z.string().trim().max(4000).default(""),
  amenities: z.array(z.string().trim().max(60)).max(30).default([]),
  imageUrls: z.array(z.string().trim().url("Image links must be valid URLs.")).max(12).default([]),
  isAvailable: z.boolean().default(true),
});

export type BoatFormInput = z.input<typeof boatSchema>;

/** Session probe used by the admin shell. Authorization is decided server-side. */
export const getAdminContext = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { isAdminEmail } = await import("./admin-guard.server");
    const email = (context.claims as { email?: string } | null)?.email ?? null;
    return {
      userId: context.userId,
      email,
      isAdmin: isAdminEmail(email),
    };
  });

async function adminClient(context: { claims: unknown }) {
  const { assertAdmin } = await import("./admin-guard.server");
  assertAdmin(context.claims as { email?: unknown } | null);
  const { getAdminClient } = await import("./supabase-public.server");
  return getAdminClient();

}

export const getDashboardStats = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const supabase = await adminClient(context);

    const [boats, bookings, records, payments] = await Promise.all([
      supabase.from("boats").select("id, is_available").is("archived_at", null),
      supabase
        .from("bookings")
        .select(
          "id, status, payment_status, total_price_cents, deposit_cents, amount_paid_cents, balance_due_cents",
        ),
      supabase.from("financial_records").select("amount_cents, transaction_type, payment_status"),
      supabase.from("payments").select("id, payment_status, amount_cents"),
    ]);

    const bookingRows = bookings.data ?? [];
    const recordRows = records.data ?? [];
    const paymentRows = payments.data ?? [];

    const sum = (rows: { amount_cents: number }[]) =>
      rows.reduce((total, row) => total + Number(row.amount_cents), 0);

    const paid = sum(
      recordRows.filter(
        (r) => r.transaction_type === "booking_payment" && r.payment_status === "paid",
      ),
    );
    const refunds = sum(recordRows.filter((r) => r.transaction_type === "refund"));
    const adjustments = sum(recordRows.filter((r) => r.transaction_type === "adjustment"));
    const pending = sum(paymentRows.filter((p) => p.payment_status === "pending"));
    const failed = sum(paymentRows.filter((p) => p.payment_status === "failed"));

    return {
      totalBoats: (boats.data ?? []).length,
      availableBoats: (boats.data ?? []).filter((b) => b.is_available).length,
      totalBookings: bookingRows.length,
      pendingRequests: bookingRows.filter((b) => b.status === "pending").length,
      confirmedBookings: bookingRows.filter((b) => b.status === "confirmed").length,
      estimatedRevenueCents: bookingRows
        .filter((b) => b.status !== "cancelled")
        .reduce((total, b) => total + Number(b.total_price_cents), 0),
      depositsDueCents: bookingRows
        .filter((b) => b.status !== "cancelled")
        .reduce((total, b) => total + Number(b.deposit_cents ?? 0), 0),
      outstandingBalanceCents: bookingRows
        .filter((b) => b.status !== "cancelled")
        .reduce((total, b) => total + Number(b.balance_due_cents ?? 0), 0),
      collectedDepositsCents: bookingRows
        .filter((b) => b.status !== "cancelled")
        .reduce((total, b) => total + Number(b.amount_paid_cents ?? 0), 0),
      totalPayments: paymentRows.length,
      paidRevenueCents: paid,
      pendingPaymentsCents: pending,
      failedPaymentsCents: failed,
      refundsCents: refunds,
      adjustmentsCents: adjustments,
      netRevenueCents: paid - refunds + adjustments,
    };
  });

export const adminListBoats = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const supabase = await adminClient(context);
    const { data, error } = await supabase
      .from("boats")
      .select("*")
      .is("archived_at", null)
      .order("created_at", { ascending: false });
    if (error) throw new Error("We could not load the yachts.");
    return data ?? [];
  });

export const createBoat = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: BoatFormInput) => boatSchema.parse(data))
  .handler(async ({ data, context }) => {
    const supabase = await adminClient(context);
    const { error } = await supabase.from("boats").insert({
      title: data.title,
      category: data.category,
      capacity: data.capacity,
      length_ft: data.lengthFt,
      hourly_rate_cents: data.hourlyRateCents,
      daily_rate_cents: data.dailyRateCents,
      location: data.location,
      description: data.description,
      amenities: data.amenities,
      image_urls: data.imageUrls,
      is_available: data.isAvailable,
    });
    if (error) {
      console.error("[admin] create boat failed", error);
      return { ok: false as const, message: "We could not create this boat." };
    }
    return { ok: true as const, message: "Boat added to the yacht listings." };
  });

export const updateBoat = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: BoatFormInput & { id: string }) =>
    boatSchema.extend({ id: z.string().uuid() }).parse(data),
  )
  .handler(async ({ data, context }) => {
    const supabase = await adminClient(context);
    const { error } = await supabase
      .from("boats")
      .update({
        title: data.title,
        category: data.category,
        capacity: data.capacity,
        length_ft: data.lengthFt,
        hourly_rate_cents: data.hourlyRateCents,
        daily_rate_cents: data.dailyRateCents,
        location: data.location,
        description: data.description,
        amenities: data.amenities,
        image_urls: data.imageUrls,
        is_available: data.isAvailable,
      })
      .eq("id", data.id);
    if (error) {
      console.error("[admin] update boat failed", error);
      return { ok: false as const, message: "We could not update this boat." };
    }
    return { ok: true as const, message: "Boat updated." };
  });

export const setBoatAvailability = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: { id: string; isAvailable: boolean }) =>
    z.object({ id: z.string().uuid(), isAvailable: z.boolean() }).parse(data),
  )
  .handler(async ({ data, context }) => {
    const supabase = await adminClient(context);
    const { error } = await supabase
      .from("boats")
      .update({ is_available: data.isAvailable })
      .eq("id", data.id);
    if (error) return { ok: false as const, message: "We could not update availability." };
    return {
      ok: true as const,
      message: data.isAvailable ? "Boat marked available." : "Boat marked unavailable.",
    };
  });

/** Boats are archived, never hard-deleted, so historical records stay intact. */
export const deleteBoat = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: { id: string }) => z.object({ id: z.string().uuid() }).parse(data))
  .handler(async ({ data, context }) => {
    const supabase = await adminClient(context);
    const { error } = await supabase
      .from("boats")
      .update({ archived_at: new Date().toISOString(), is_available: false })
      .eq("id", data.id);
    if (error) return { ok: false as const, message: "We could not remove this boat." };
    return { ok: true as const, message: "Boat removed from the yacht listings." };
  });

export const adminListBookings = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const supabase = await adminClient(context);
    const { data, error } = await supabase
      .from("bookings")
      .select("*")
      .order("created_at", { ascending: false });
    if (error) throw new Error("We could not load bookings.");
    return data ?? [];
  });

export const updateBookingStatus = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: { id: string; status: "confirmed" | "cancelled" }) =>
    z.object({ id: z.string().uuid(), status: z.enum(["confirmed", "cancelled"]) }).parse(data),
  )
  .handler(async ({ data, context }) => {
    const supabase = await adminClient(context);
    const { addHistory } = await import("./finance.server");

    const { data: booking } = await supabase
      .from("bookings")
      .select("*")
      .eq("id", data.id)
      .maybeSingle();
    if (!booking) return { ok: false as const, message: "Booking not found." };
    if (booking.status === data.status) {
      return { ok: true as const, message: "Booking already in that state." };
    }

    const update: { status: string; payment_status?: string } = { status: data.status };
    if (data.status === "cancelled" && booking.payment_status === "pending") {
      update.payment_status = "cancelled";
    }
    const { error } = await supabase.from("bookings").update(update).eq("id", data.id);
    if (error) return { ok: false as const, message: "We could not update this booking." };

    if (update.payment_status === "cancelled") {
      await supabase
        .from("payments")
        .update({ payment_status: "cancelled" })
        .eq("booking_id", booking.id)
        .eq("payment_status", "pending");
      await supabase
        .from("financial_records")
        .update({ payment_status: "cancelled" })
        .eq("booking_id", booking.id)
        .eq("transaction_type", "booking_payment");
    }

    await addHistory({
      event: data.status === "confirmed" ? "Booking confirmed" : "Booking cancelled",
      eventType: data.status === "confirmed" ? "booking_confirmed" : "booking_cancelled",
      bookingId: booking.id,
      bookingReference: booking.reference,
      boatId: booking.boat_id,
      boatTitle: booking.boat_title,
      customerName: booking.customer_name,
      amountCents: booking.total_price_cents,
      status: data.status,
      notes: `Status changed by administrator to ${data.status}`,
    });

    return {
      ok: true as const,
      message: data.status === "confirmed" ? "Booking approved." : "Booking cancelled.",
    };
  });

export const adminListPayments = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const supabase = await adminClient(context);
    const [{ data: payments }, { data: bookings }] = await Promise.all([
      supabase.from("payments").select("*").order("created_at", { ascending: false }),
      supabase.from("bookings").select("id, reference, customer_name, boat_title"),
    ]);
    const map = new Map((bookings ?? []).map((b) => [b.id, b]));
    return (payments ?? []).map((payment) => ({
      ...payment,
      booking_reference: payment.booking_id
        ? (map.get(payment.booking_id)?.reference ?? "—")
        : "—",
      customer_name: payment.booking_id
        ? (map.get(payment.booking_id)?.customer_name ?? "—")
        : "—",
      boat_title: payment.booking_id ? (map.get(payment.booking_id)?.boat_title ?? "—") : "—",
    }));
  });

export const updatePaymentStatus = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: { transactionId: string; status: "paid" | "failed"; note?: string }) =>
    z
      .object({
        transactionId: z.string().min(3).max(200),
        status: z.enum(["paid", "failed"]),
        note: z.string().trim().max(500).optional(),
      })
      .parse(data),
  )
  .handler(async ({ data, context }) => {
    await adminClient(context);
    const { applyPaymentStatus } = await import("./finance.server");
    return applyPaymentStatus({
      transactionId: data.transactionId,
      status: data.status,
      note: data.note ?? `Marked ${data.status} by administrator`,
      eventLabel: data.status === "paid" ? "Payment succeeded" : "Payment failed",
      eventType: data.status === "paid" ? "payment_succeeded" : "payment_failed",
    });
  });

export const refundPayment = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: { transactionId: string; note?: string }) =>
    z
      .object({
        transactionId: z.string().min(3).max(200),
        note: z.string().trim().max(500).optional(),
      })
      .parse(data),
  )
  .handler(async ({ data, context }) => {
    const supabase = await adminClient(context);
    const { createRefund } = await import("./payment-gateway.server");
    const { applyPaymentStatus } = await import("./finance.server");

    const { data: payment } = await supabase
      .from("payments")
      .select("*")
      .eq("transaction_id", data.transactionId)
      .maybeSingle();
    if (!payment) return { ok: false as const, message: "Transaction not found." };
    if (payment.payment_status !== "paid") {
      return { ok: false as const, message: "Only captured payments can be refunded." };
    }

    const refund = await createRefund(data.transactionId, payment.amount_cents);
    if (!refund.ok) return { ok: false as const, message: refund.message };

    return applyPaymentStatus({
      transactionId: data.transactionId,
      status: "refunded",
      note: data.note ?? refund.message,
      eventLabel: "Refund issued",
      eventType: "refund_issued",
    });
  });

export const adminListFinancialRecords = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const supabase = await adminClient(context);
    const [{ data: records }, { data: bookings }] = await Promise.all([
      supabase.from("financial_records").select("*").order("transaction_date", { ascending: false }),
      supabase.from("bookings").select("id, reference"),
    ]);
    const map = new Map((bookings ?? []).map((b) => [b.id, b.reference]));
    return (records ?? []).map((record) => ({
      ...record,
      booking_reference: record.booking_id ? (map.get(record.booking_id) ?? "—") : "—",
    }));
  });

export const createAdjustment = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator(
    (data: { bookingId?: string; amountCents: number; notes: string; type: "adjustment" | "other" }) =>
      z
        .object({
          bookingId: z.string().uuid().optional(),
          amountCents: z.number().int().min(-100_000_000).max(100_000_000),
          notes: z.string().trim().min(3, "Please add a note.").max(500),
          type: z.enum(["adjustment", "other"]),
        })
        .parse(data),
  )
  .handler(async ({ data, context }) => {
    const supabase = await adminClient(context);
    const { upsertFinancialRecord, addHistory } = await import("./finance.server");

    let booking: {
      id: string;
      reference: string;
      customer_name: string;
      boat_id: string | null;
      boat_title: string;
    } | null = null;
    if (data.bookingId) {
      const { data: found } = await supabase
        .from("bookings")
        .select("id, reference, customer_name, boat_id, boat_title")
        .eq("id", data.bookingId)
        .maybeSingle();
      booking = found ?? null;
    }

    const transactionId = `adj_${Date.now().toString(36)}`;
    await upsertFinancialRecord({
      bookingId: booking?.id ?? null,
      transactionId,
      customerName: booking?.customer_name ?? "—",
      boatId: booking?.boat_id ?? null,
      boatTitle: booking?.boat_title ?? "—",
      amountCents: data.amountCents,
      transactionType: data.type,
      paymentMethod: "card",
      paymentStatus: "paid",
      notes: data.notes,
    });

    await addHistory({
      event: data.type === "adjustment" ? "Adjustment recorded" : "Financial entry recorded",
      eventType: data.type === "adjustment" ? "adjustment" : "other",
      bookingId: booking?.id ?? null,
      bookingReference: booking?.reference ?? "",
      transactionId,
      boatId: booking?.boat_id ?? null,
      boatTitle: booking?.boat_title ?? "",
      customerName: booking?.customer_name ?? "",
      amountCents: data.amountCents,
      status: "paid",
      notes: data.notes,
    });

    return { ok: true as const, message: "Financial entry recorded." };
  });

export const adminListFinancialHistory = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const supabase = await adminClient(context);
    const { data, error } = await supabase
      .from("financial_history")
      .select("*")
      .order("occurred_at", { ascending: false })
      .limit(500);
    if (error) throw new Error("We could not load financial history.");
    return data ?? [];
  });
