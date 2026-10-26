import { createServerFn } from "@tanstack/react-start";
import { getRequestHeader, setResponseStatus } from "@tanstack/react-start/server";
import { z } from "zod";

import { sendResendEmail } from "./resend.server";

const enquirySchema = z.object({
  name: z.string().trim().min(2, "Please enter your name.").max(100),
  phone: z
    .string()
    .trim()
    .min(7, "Please enter a valid phone number.")
    .max(30)
    .regex(/^[+]?[-\d\s().]+$/, "Please enter a valid phone number."),
  email: z.string().trim().email("Please enter a valid email address.").max(255),
  message: z.string().trim().min(10, "Please add a few more details.").max(1000),
  website: z.string().max(200).default(""),
});

const attempts = new Map<string, number[]>();
const windowMs = 60 * 60 * 1000;
const maxAttempts = 5;

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

export const sendEnquiry = createServerFn({ method: "POST" })
  .validator((input: unknown) => input)
  .handler(async ({ data }) => {
    const parsed = enquirySchema.safeParse(data);
    if (!parsed.success) {
      setResponseStatus(400);
      return {
        success: false as const,
        errors: parsed.error.flatten().fieldErrors,
      };
    }

    const enquiry = parsed.data;
    // Quietly accept bot submissions without forwarding them to the mailbox.
    if (enquiry.website) {
      setResponseStatus(400);
      return {
        success: false as const,
        error: "We couldn't send your enquiry right now. Please try again shortly.",
      };
    }

    const realIp = getRequestHeader("cf-connecting-ip")?.trim();
    const forwardedFor = getRequestHeader("x-forwarded-for")?.split(",")[0]?.trim();
    const key = realIp || forwardedFor || "unknown-client";
    const now = Date.now();
    const recent = (attempts.get(key) ?? []).filter((time) => now - time < windowMs);
    if (recent.length >= maxAttempts) {
      setResponseStatus(429);
      return {
        success: false as const,
        error: "Please wait a while before sending another enquiry.",
      };
    }
    recent.push(now);
    attempts.set(key, recent);
    if (attempts.size > 1000) {
      for (const [clientKey, times] of attempts) {
        if (!times.some((time) => now - time < windowMs)) attempts.delete(clientKey);
      }
    }

    const recipient = process.env["CONTACT_EMAIL"]?.trim() || "contact@horizonboatcharters.com";

    const submittedAt = new Intl.DateTimeFormat("en-US", {
      dateStyle: "long",
      timeStyle: "long",
      timeZone: "UTC",
    }).format(new Date());
    const { name, phone, email, message } = enquiry;
    const html = `<h1>New website enquiry</h1><p><strong>Name:</strong> ${escapeHtml(name)}</p><p><strong>Phone / WhatsApp:</strong> ${escapeHtml(phone)}</p><p><strong>Email:</strong> ${escapeHtml(email)}</p><p><strong>Message:</strong><br>${escapeHtml(message).replace(/\n/g, "<br>")}</p><p><strong>Submitted:</strong> ${escapeHtml(submittedAt)} UTC</p>`;
    const text = [
      "New website enquiry",
      `Name: ${name}`,
      `Phone / WhatsApp: ${phone}`,
      `Email: ${email}`,
      `Message:\n${message}`,
      `Submitted: ${submittedAt} UTC`,
    ].join("\n\n");

    try {
      const result = await sendResendEmail({
        to: recipient,
        replyTo: email,
        subject: "New Website Enquiry \u2013 Horizon Boat Charters",
        html,
        text,
      });
      if (!result.ok) {
        setResponseStatus(result.status);
        console.error("Enquiry email provider rejected the request.");
        return {
          success: false as const,
          error: "We couldn't send your enquiry right now. Please try again shortly.",
        };
      }
      return { success: true as const };
    } catch {
      setResponseStatus(502);
      console.error("Enquiry email provider request failed.");
      return {
        success: false as const,
        error: "We couldn't send your enquiry right now. Please try again shortly.",
      };
    }
  });
