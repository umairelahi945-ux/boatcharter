/**
 * All monetary values are stored and computed as integer cents to avoid
 * floating point errors. Only formatting converts back to a decimal string.
 */
export function formatMoney(cents: number | null | undefined, currency = "USD"): string {
  const value = Math.round(Number(cents ?? 0)) / 100;
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
    maximumFractionDigits: 2,
  }).format(value);
}

export function formatDateTime(value: string | Date | null | undefined): string {
  if (!value) return "—";
  const date = typeof value === "string" ? new Date(value) : value;
  if (Number.isNaN(date.getTime())) return "—";
  return new Intl.DateTimeFormat("en-US", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
}

export function formatDate(value: string | Date | null | undefined): string {
  if (!value) return "—";
  const date = typeof value === "string" ? new Date(value) : value;
  if (Number.isNaN(date.getTime())) return "—";
  return new Intl.DateTimeFormat("en-US", { dateStyle: "medium" }).format(date);
}

export const SERVICE_FEE_BPS = 1000; // 10% service fee, in basis points

export const MIN_HOURS = 2;
export const MIN_DAYS = 1;

export type BookingType = "hourly" | "daily";

export type QuoteInput = {
  bookingType: BookingType;
  hourlyRateCents: number;
  dailyRateCents: number;
  startISO: string;
  endISO: string;
};

export type Quote = {
  duration: number;
  unitLabel: string;
  rateCents: number;
  subtotalCents: number;
  feesCents: number;
  totalCents: number;
  error: string | null;
};

/** Shared client/server pricing engine — the single source of truth for quotes. */
export function computeQuote(input: QuoteInput): Quote {
  const empty: Quote = {
    duration: 0,
    unitLabel: input.bookingType === "hourly" ? "hours" : "days",
    rateCents: input.bookingType === "hourly" ? input.hourlyRateCents : input.dailyRateCents,
    subtotalCents: 0,
    feesCents: 0,
    totalCents: 0,
    error: null,
  };

  const start = new Date(input.startISO);
  const end = new Date(input.endISO);
  if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) {
    return { ...empty, error: "Please choose a valid start and end date." };
  }
  if (end.getTime() <= start.getTime()) {
    return { ...empty, error: "The end date must be after the start date." };
  }

  const ms = end.getTime() - start.getTime();
  let duration: number;
  if (input.bookingType === "hourly") {
    duration = Math.ceil(ms / (1000 * 60 * 60));
    if (duration < MIN_HOURS) {
      return { ...empty, error: `Hourly charters have a ${MIN_HOURS} hour minimum.` };
    }
  } else {
    duration = Math.ceil(ms / (1000 * 60 * 60 * 24));
    if (duration < MIN_DAYS) {
      return { ...empty, error: `Daily charters have a ${MIN_DAYS} day minimum.` };
    }
  }

  const rateCents = input.bookingType === "hourly" ? input.hourlyRateCents : input.dailyRateCents;
  const subtotalCents = Math.round(rateCents * duration);
  const feesCents = Math.round((subtotalCents * SERVICE_FEE_BPS) / 10000);

  return {
    duration,
    unitLabel: input.bookingType === "hourly" ? "hours" : "days",
    rateCents,
    subtotalCents,
    feesCents,
    totalCents: subtotalCents + feesCents,
    error: null,
  };
}

export const BOAT_CATEGORIES = [
  "Yacht",
  "Catamaran",
  "Speedboat",
  "Pontoon",
  "Sailboat",
  "Fishing Boat",
] as const;

export const AMENITY_OPTIONS = [
  "Captain Provided",
  "Crew & Steward",
  "Bluetooth Audio",
  "Fuel Included",
  "Snorkel Gear",
  "Paddleboards",
  "Wakeboard Tow",
  "Cooler & Ice",
  "Freshwater Shower",
  "Swim Platform",
  "Bimini Top",
  "Shaded Lounge",
  "Air Conditioning",
  "Onboard Restroom",
] as const;
