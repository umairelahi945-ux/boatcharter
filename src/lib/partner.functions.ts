import { createServerFn } from "@tanstack/react-start";
import { getRequestHeader, setResponseStatus } from "@tanstack/react-start/server";
import { z } from "zod";

import { BOAT_CATEGORIES } from "./money";
import { sendResendEmail } from "./resend.server";

const positiveInteger = z
  .string()
  .regex(/^\d+$/, "Enter a whole number.")
  .transform(Number)
  .pipe(z.number().int().min(1).max(500));
const usdAmount = z
  .string()
  .regex(/^\d+(?:\.\d{1,2})?$/, "Enter an amount with up to two decimal places.")
  .transform(Number)
  .pipe(z.number().min(0).max(1_000_000));

const partnerApplicationSchema = z.object({
  boatTitle: z.string().trim().min(2, "Enter your boat's title.").max(120),
  category: z.enum(BOAT_CATEGORIES, { message: "Choose a boat category." }),
  capacity: positiveInteger,
  additionalPaxCharge: usdAmount,
  hourlyCharge: usdAmount,
  bookingWithSnacks: z.enum(["Available", "Not Available"]),
  bookingWithoutSnacks: z.enum(["Available", "Not Available"]),
  minimumBookingHours: positiveInteger.pipe(z.number().max(168)),
  captainName: z.string().trim().min(2, "Enter the captain's name.").max(120),
  companyName: z.string().trim().min(2, "Enter your company name.").max(160),
  email: z.string().trim().email("Enter a valid email address.").max(255),
  contactNumber: z
    .string()
    .trim()
    .min(7, "Enter a valid contact number.")
    .max(30)
    .regex(/^[+]?[-\d\s().]+$/, "Enter a valid contact number."),
  website: z.string().max(200).default(""),
});

const rateBuckets = new Map<string, number[]>();
const rateWindowMs = 60 * 60 * 1000;
const maxApplicationsPerHour = 5;

function escapeHtml(value: string) {
  return value.replace(/[&<>"']/g, (character) => {
    const entities: Record<string, string> = {
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#39;",
    };
    return entities[character]!;
  });
}

function formatUsd(value: number) {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(value);
}

export const submitPartnerApplication = createServerFn({ method: "POST" })
  .validator((input: unknown) => input)
  .handler(async ({ data }) => {
    const parsed = partnerApplicationSchema.safeParse(data);
    if (!parsed.success) {
      setResponseStatus(400);
      return { success: false as const, errors: parsed.error.flatten().fieldErrors };
    }

    const application = parsed.data;
    if (application.website) {
      setResponseStatus(400);
      return {
        success: false as const,
        error: "We couldn't submit your application right now. Please try again shortly.",
      };
    }

    const trustedIp = getRequestHeader("cf-connecting-ip")?.trim();
    const forwardedIp = getRequestHeader("x-forwarded-for")?.split(",")[0]?.trim();
    const ip = trustedIp || forwardedIp || "unknown-client";
    const now = Date.now();
    const recent = (rateBuckets.get(ip) ?? []).filter((time) => now - time < rateWindowMs);
    if (recent.length >= maxApplicationsPerHour) {
      setResponseStatus(429);
      return {
        success: false as const,
        error: "Please wait before submitting another application.",
      };
    }
    recent.push(now);
    rateBuckets.set(ip, recent);
    if (rateBuckets.size > 1000) {
      for (const [key, times] of rateBuckets) {
        if (!times.some((time) => now - time < rateWindowMs)) rateBuckets.delete(key);
      }
    }

    const submittedAt = new Intl.DateTimeFormat("en-US", {
      dateStyle: "long",
      timeStyle: "long",
      timeZone: "UTC",
    }).format(new Date());
    const rows: [string, string][] = [
      ["Boat Title", application.boatTitle],
      ["Category", application.category],
      ["Maximum Passenger Capacity", String(application.capacity)],
      ["Additional Passenger Charges per Person", formatUsd(application.additionalPaxCharge)],
      ["Per Hour Charges", formatUsd(application.hourlyCharge)],
      ["Booking with Snacks", application.bookingWithSnacks],
      ["Booking without Snacks", application.bookingWithoutSnacks],
      ["Minimum Booking Hours", String(application.minimumBookingHours)],
      ["Captain Name", application.captainName],
      ["Company Name", application.companyName],
      ["Applicant Email", application.email],
      ["Contact Number", application.contactNumber],
      ["Submission Date and Time", `${submittedAt} UTC`],
    ];
    const text = [
      "New Boat Partnership Application — Horizon Boat Charters",
      ...rows.map(([label, value]) => `${label}: ${value}`),
    ].join("\n\n");
    const html = `<h1>New Boat Partnership Application</h1><table style="border-collapse:collapse">${rows
      .map(
        ([label, value]) =>
          `<tr><th align="left" style="padding:8px;border-bottom:1px solid #ddd">${escapeHtml(label)}</th><td style="padding:8px;border-bottom:1px solid #ddd">${escapeHtml(value)}</td></tr>`,
      )
      .join("")}</table>`;

    const result = await sendResendEmail({
      to: process.env["CONTACT_EMAIL"]?.trim() || "contact@horizonboatcharters.com",
      replyTo: application.email,
      subject: "New Boat Partnership Application \u2013 Horizon Boat Charters",
      html,
      text,
    });
    if (!result.ok) {
      setResponseStatus(result.status);
      console.error("Partner application email could not be sent.");
      return {
        success: false as const,
        error: "We couldn't submit your application right now. Please try again shortly.",
      };
    }

    return { success: true as const };
  });
