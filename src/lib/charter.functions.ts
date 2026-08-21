import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

import { computeDeposit, computeQuote } from "./money";

const bookingInputSchema = z.object({
  boatId: z.string().uuid("Please choose a boat."),
  customerName: z.string().trim().min(2, "Please enter your full name.").max(100),
  customerEmail: z.string().trim().email("Please enter a valid email address.").max(255),
  customerPhone: z
    .string()
    .trim()
    .min(7, "Please enter a valid phone number.")
    .max(25)
    .regex(/^[+]?[\d\s().-]{7,25}$/, "Please enter a valid phone number."),
  guestCount: z.number().int().min(1, "At least one guest is required.").max(100),
  bookingType: z.enum(["hourly", "daily"]),
  startISO: z.string().min(1, "Please choose a start date."),
  endISO: z.string().min(1, "Please choose an end date."),
  demoOutcome: z.enum(["success", "failure", "pending"]).optional(),
});

export type BookingInput = z.infer<typeof bookingInputSchema>;

const boatFilterSchema = z.object({
  location: z.string().trim().max(120).optional(),
  category: z.string().trim().max(60).optional(),
  guests: z.number().int().min(0).max(500).optional(),
  startISO: z.string().optional(),
  endISO: z.string().optional(),
  search: z.string().trim().max(120).optional(),
});

export type BoatFilters = z.infer<typeof boatFilterSchema>;

export const listBoats = createServerFn({ method: "GET" })
  .inputValidator((data: BoatFilters | undefined) => boatFilterSchema.parse(data ?? {}))
  .handler(async ({ data }) => {
    const { getPublicClient } = await import("./supabase-public.server");
    const supabase = getPublicClient();

    let query = supabase
      .from("boats")
      .select(
        "id, title, category, capacity, length_ft, hourly_rate_cents, daily_rate_cents, location, description, amenities, image_urls, is_available",
      )
      .order("daily_rate_cents", { ascending: true });

    if (data.category) query = query.eq("category", data.category);
    if (data.location) query = query.ilike("location", `%${data.location}%`);
    if (data.guests && data.guests > 0) query = query.gte("capacity", data.guests);
    if (data.search) query = query.ilike("title", `%${data.search}%`);

    const { data: boats, error } = await query;
    if (error) {
      console.error("[boats] list failed", error);
      throw new Error("We could not load the fleet right now.");
    }

    let results = boats ?? [];

    // Date-range filter: hide boats already reserved for the requested window.
    if (data.startISO && data.endISO) {
      const start = new Date(data.startISO);
      const end = new Date(data.endISO);
      if (!Number.isNaN(start.getTime()) && !Number.isNaN(end.getTime()) && end > start) {
        const { getAdminClient } = await import("./supabase-public.server");
        const admin = await getAdminClient();
        const { data: conflicts } = await admin
          .from("bookings")
          .select("boat_id")
          .in("status", ["pending", "confirmed"])
          .lt("start_date", end.toISOString())
          .gt("end_date", start.toISOString());
        const busy = new Set((conflicts ?? []).map((row) => row.boat_id));
        results = results.filter((boat) => !busy.has(boat.id));
      }
    }

    return results;
  });

export const getBoat = createServerFn({ method: "GET" })
  .inputValidator((data: { id: string }) => z.object({ id: z.string().uuid() }).parse(data))
  .handler(async ({ data }) => {
    const { getPublicClient } = await import("./supabase-public.server");
    const { data: boat, error } = await getPublicClient()
      .from("boats")
      .select("*")
      .eq("id", data.id)
      .maybeSingle();
    if (error) {
      console.error("[boats] get failed", error);
      throw new Error("We could not load this boat.");
    }
    return boat;
  });

/** Public, non-sensitive description of the single configured payment method. */
export const getPaymentMethodInfo = createServerFn({ method: "GET" }).handler(async () => {
  const { getPaymentConfig } = await import("./payment-gateway.server");
  const config = getPaymentConfig();
  return {
    label: config.methodLabel,
    type: config.methodType,
    provider: config.provider,
    mode: config.mode,
    environment: config.environment,
    publicKey: config.publicKey || null,
  };
});

export const requestBooking = createServerFn({ method: "POST" })
  .inputValidator((data: BookingInput) => bookingInputSchema.parse(data))
  .handler(async ({ data }) => {
    const { getAdminClient } = await import("./supabase-public.server");
    const supabase = await getAdminClient();
    const { createCharge, getPaymentConfig } = await import("./payment-gateway.server");
    const { addHistory, upsertFinancialRecord, generateReference } = await import(
      "./finance.server"
    );

    const { data: boat, error: boatError } = await supabase
      .from("boats")
      .select("*")
      .eq("id", data.boatId)
      .is("archived_at", null)
      .maybeSingle();

    if (boatError) {
      console.error("[booking] boat lookup failed", boatError);
      return { ok: false as const, message: "We could not verify that boat. Please try again." };
    }
    if (!boat) return { ok: false as const, message: "That boat is no longer listed." };
    if (!boat.is_available) {
      return { ok: false as const, message: "This boat is currently unavailable for booking." };
    }
    if (data.guestCount > boat.capacity) {
      return {
        ok: false as const,
        message: `This boat seats up to ${boat.capacity} guests.`,
      };
    }

    const start = new Date(data.startISO);
    const end = new Date(data.endISO);
    if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) {
      return { ok: false as const, message: "Please choose valid charter dates." };
    }
    if (start.getTime() < Date.now() - 60_000) {
      return { ok: false as const, message: "The start date must be in the future." };
    }

    const quote = computeQuote({
      bookingType: data.bookingType,
      hourlyRateCents: boat.hourly_rate_cents,
      dailyRateCents: boat.daily_rate_cents,
      startISO: data.startISO,
      endISO: data.endISO,
    });
    if (quote.error) return { ok: false as const, message: quote.error };

    // Availability: reject overlaps with live bookings.
    const { data: overlaps } = await supabase
      .from("bookings")
      .select("id")
      .eq("boat_id", boat.id)
      .in("status", ["pending", "confirmed"])
      .lt("start_date", end.toISOString())
      .gt("end_date", start.toISOString());

    if (overlaps && overlaps.length > 0) {
      return {
        ok: false as const,
        message: "This boat is already reserved for the selected dates.",
      };
    }

    const split = computeDeposit(quote.totalCents);

    const reference = generateReference();
    const { data: booking, error: bookingError } = await supabase
      .from("bookings")
      .insert({
        reference,
        boat_id: boat.id,
        boat_title: boat.title,
        customer_name: data.customerName,
        customer_email: data.customerEmail,
        customer_phone: data.customerPhone,
        guest_count: data.guestCount,
        start_date: start.toISOString(),
        end_date: end.toISOString(),
        booking_type: data.bookingType,
        duration: quote.duration,
        subtotal_cents: quote.subtotalCents,
        fees_cents: quote.feesCents,
        total_price_cents: quote.totalCents,
        deposit_cents: split.depositCents,
        amount_paid_cents: 0,
        balance_due_cents: quote.totalCents,
      })
      .select()
      .single();

    if (bookingError || !booking) {
      console.error("[booking] insert failed", bookingError);
      return { ok: false as const, message: "We could not save your booking. Please try again." };
    }

    // Concurrency guard: if a competing booking landed first, roll this one back.
    const { data: raceRows } = await supabase
      .from("bookings")
      .select("id, created_at")
      .eq("boat_id", boat.id)
      .in("status", ["pending", "confirmed"])
      .lt("start_date", end.toISOString())
      .gt("end_date", start.toISOString())
      .order("created_at", { ascending: true });

    if (raceRows && raceRows.length > 1 && raceRows[0]?.id !== booking.id) {
      await supabase
        .from("bookings")
        .update({ status: "cancelled", payment_status: "cancelled" })
        .eq("id", booking.id);
      return {
        ok: false as const,
        message: "Another guest reserved this boat moments ago. Please pick different dates.",
      };
    }

    await addHistory({
      event: "Booking created",
      eventType: "booking_created",
      bookingId: booking.id,
      bookingReference: reference,
      boatId: boat.id,
      boatTitle: boat.title,
      customerName: data.customerName,
      amountCents: quote.totalCents,
      status: "pending",
      notes: `Booking request received from the storefront · total ${quote.totalCents} cents, 20% deposit ${split.depositCents} cents`,
    });

    const config = getPaymentConfig();
    // Only the 20% deposit is charged at booking time.
    const charge = await createCharge({
      amountCents: split.depositCents,
      currency: "USD",
      reference,
      customerEmail: data.customerEmail,
      customerName: data.customerName,
      ...(config.mode === "demo" ? { demoOutcome: data.demoOutcome ?? "success" } : {}),
    });

    await supabase.from("payments").insert({
      booking_id: booking.id,
      payment_method_type: config.methodType,
      provider: config.provider,
      last_four_digits: charge.lastFour,
      payment_status: charge.status,
      transaction_id: charge.transactionId,
      amount_cents: split.depositCents,
    });

    const paidCents = charge.status === "paid" ? split.depositCents : 0;

    await supabase
      .from("bookings")
      .update({
        payment_status: charge.status,
        status: charge.status === "paid" ? "confirmed" : "pending",
        amount_paid_cents: paidCents,
        balance_due_cents: quote.totalCents - paidCents,
      })
      .eq("id", booking.id);

    await upsertFinancialRecord({
      bookingId: booking.id,
      transactionId: charge.transactionId,
      customerName: data.customerName,
      boatId: boat.id,
      boatTitle: boat.title,
      amountCents: split.depositCents,
      transactionType: "booking_payment",
      paymentMethod: config.methodType,
      paymentStatus: charge.status,
      notes: `${charge.message} · 20% deposit of ${quote.totalCents} cents total`,
    });

    await addHistory({
      event:
        charge.status === "paid"
          ? "Payment succeeded"
          : charge.status === "failed"
            ? "Payment failed"
            : "Payment pending",
      eventType:
        charge.status === "paid"
          ? "payment_succeeded"
          : charge.status === "failed"
            ? "payment_failed"
            : "payment_pending",
      bookingId: booking.id,
      bookingReference: reference,
      transactionId: charge.transactionId,
      boatId: boat.id,
      boatTitle: boat.title,
      customerName: data.customerName,
      amountCents: split.depositCents,
      status: charge.status,
      notes: `${charge.message} · 20% deposit`,
    });

    return {
      ok: true as const,
      reference,
      bookingId: booking.id,
      transactionId: charge.transactionId,
      paymentStatus: charge.status,
      bookingStatus: charge.status === "paid" ? "confirmed" : "pending",
      totalCents: quote.totalCents,
      depositCents: split.depositCents,
      balanceCents: quote.totalCents - paidCents,
      amountPaidCents: paidCents,
      subtotalCents: quote.subtotalCents,
      feesCents: quote.feesCents,
      duration: quote.duration,
      unitLabel: quote.unitLabel,
      message: charge.message,
      paymentMode: config.mode,
      boatTitle: boat.title,
    };
  });
