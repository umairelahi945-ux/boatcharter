import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { Clock, Mail, MapPin, Phone } from "lucide-react";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { BUSINESS_PHONE_DISPLAY, BUSINESS_PHONE_HREF } from "@/lib/contact-info";
import { sendEnquiry } from "@/lib/enquiry.functions";
import { getPublicSiteInfo } from "@/lib/site.functions";

export const Route = createFileRoute("/contact")({
  head: () => ({
    meta: [
      { title: "Contact the Charter Desk — Boat Charter" },
      {
        name: "description",
        content:
          "Speak with our charter concierge about custom itineraries, group bookings and corporate charters.",
      },
      { property: "og:title", content: "Contact the Charter Desk — Boat Charter" },
      {
        property: "og:description",
        content: "Custom itineraries, group bookings and corporate charters.",
      },
    ],
  }),
  component: Contact,
});

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

function Contact() {
  const infoFn = useServerFn(getPublicSiteInfo);
  const info = useQuery({ queryKey: ["site-info"], queryFn: () => infoFn() }).data;
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [website, setWebsite] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [pending, setPending] = useState(false);
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; message: string } | null>(
    null,
  );

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const next: Record<string, string> = {};
    if (name.trim().length < 2) next["name"] = "Please enter your name.";
    if (phone.trim().length < 7 || !/^[+]?[-\d\s().]+$/.test(phone.trim())) {
      next["phone"] = "Please enter a valid phone number.";
    }
    if (!emailPattern.test(email.trim())) next["email"] = "Please enter a valid email address.";
    if (message.trim().length < 10) next["message"] = "Please add a few more details.";
    setErrors(next);
    setFeedback(null);
    if (Object.keys(next).length > 0) return;

    setPending(true);
    try {
      const result = await sendEnquiry({ data: { name, phone, email, message, website } });
      if (!result.success) {
        if ("errors" in result && result.errors) {
          const serverErrors: Record<string, string> = {};
          for (const [field, fieldErrors] of Object.entries(result.errors)) {
            if (fieldErrors?.[0]) serverErrors[field] = fieldErrors[0];
          }
          setErrors(serverErrors);
        }
        setFeedback({
          type: "error",
          message:
            "error" in result ? result.error : "Please check the highlighted fields and try again.",
        });
        return;
      }

      setFeedback({
        type: "success",
        message:
          "Thanks — your enquiry has been sent. Our concierge will reply within one business day.",
      });
      setName("");
      setPhone("");
      setEmail("");
      setMessage("");
      setWebsite("");
      setErrors({});
    } catch {
      setFeedback({
        type: "error",
        message: "We couldn't send your enquiry right now. Please try again shortly.",
      });
    } finally {
      setPending(false);
    }
  }

  return (
    <div className="container-page py-14">
      <div className="grid gap-12 lg:grid-cols-[1fr_1.1fr]">
        <div>
          <p className="text-xs font-semibold tracking-[0.2em] text-primary uppercase">Contact</p>
          <h1 className="mt-2 text-4xl font-semibold">Talk to the charter desk</h1>
          <p className="mt-3 text-muted-foreground">
            Planning a multi-day itinerary, a corporate charter or a celebration on the water? Our
            team will build it around you.
          </p>

          <ul className="mt-8 space-y-4 text-sm">
            <li className="flex items-center gap-3">
              <a
                href={BUSINESS_PHONE_HREF}
                aria-label={`Call Horizon Boat Charters at ${BUSINESS_PHONE_DISPLAY}`}
                className="inline-flex min-h-11 items-center gap-3 rounded-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
              >
                <span className="flex size-9 items-center justify-center rounded-lg bg-primary/15 text-primary">
                  <Phone aria-hidden="true" className="size-4" />
                </span>
                <span className="text-[#064576] transition-colors hover:text-primary">
                  {BUSINESS_PHONE_DISPLAY}
                </span>
              </a>
            </li>
            <li className="flex items-center gap-3">
              <span className="flex size-9 items-center justify-center rounded-lg bg-primary/15 text-primary">
                <Mail className="size-4" />
              </span>
              <a href="mailto:contact@horizonboatcharters.com">contact@horizonboatcharters.com</a>
            </li>
            <li className="flex items-center gap-3">
              <span className="flex size-9 items-center justify-center rounded-lg bg-primary/15 text-primary">
                <MapPin className="size-4" />
              </span>
              <address className="not-italic leading-relaxed">
                Horizon Boat Charter
                <br />
                High Tech Services LLC
                <br />
                1001 S Main St STE 500
                <br />
                Kalispell, MT 59901
              </address>
            </li>
            <li className="flex items-center gap-3">
              <span className="flex size-9 items-center justify-center rounded-lg bg-primary/15 text-primary">
                <Clock className="size-4" />
              </span>
              Daily, 7:00 – 21:00
            </li>
          </ul>
        </div>

        <form
          onSubmit={submit}
          noValidate
          className="rounded-2xl border border-border bg-card p-6 shadow-[var(--shadow-card)] sm:p-8"
        >
          <h2 className="text-xl font-semibold">Send an enquiry</h2>
          {feedback ? (
            <p
              className={`mt-3 text-sm ${feedback.type === "error" ? "text-destructive" : "text-primary"}`}
              role={feedback.type === "error" ? "alert" : "status"}
              aria-live="polite"
            >
              {feedback.message}
            </p>
          ) : null}
          <div className="mt-6 space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="contact-name">Name</Label>
              <Input
                id="contact-name"
                required
                autoComplete="name"
                aria-invalid={Boolean(errors["name"])}
                aria-describedby={errors["name"] ? "contact-name-error" : undefined}
                value={name}
                onChange={(event) => setName(event.target.value)}
                maxLength={100}
              />
              {errors["name"] ? (
                <p id="contact-name-error" className="text-xs font-medium text-destructive">
                  {errors["name"]}
                </p>
              ) : null}
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="contact-phone">Phone / WhatsApp</Label>
              <Input
                id="contact-phone"
                type="tel"
                required
                autoComplete="tel"
                aria-invalid={Boolean(errors["phone"])}
                aria-describedby={errors["phone"] ? "contact-phone-error" : undefined}
                value={phone}
                onChange={(event) => setPhone(event.target.value)}
                maxLength={30}
              />
              {errors["phone"] ? (
                <p id="contact-phone-error" className="text-xs font-medium text-destructive">
                  {errors["phone"]}
                </p>
              ) : null}
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="contact-email">Email</Label>
              <Input
                id="contact-email"
                type="email"
                required
                autoComplete="email"
                aria-invalid={Boolean(errors["email"])}
                aria-describedby={errors["email"] ? "contact-email-error" : undefined}
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                maxLength={255}
              />
              {errors["email"] ? (
                <p id="contact-email-error" className="text-xs font-medium text-destructive">
                  {errors["email"]}
                </p>
              ) : null}
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="contact-message">Message</Label>
              <Textarea
                id="contact-message"
                rows={5}
                required
                aria-invalid={Boolean(errors["message"])}
                aria-describedby={errors["message"] ? "contact-message-error" : undefined}
                value={message}
                onChange={(event) => setMessage(event.target.value)}
                maxLength={1000}
              />
              {errors["message"] ? (
                <p id="contact-message-error" className="text-xs font-medium text-destructive">
                  {errors["message"]}
                </p>
              ) : null}
            </div>
            <div className="absolute -left-[10000px]" aria-hidden="true">
              <Label htmlFor="contact-website">Leave this field empty</Label>
              <Input
                id="contact-website"
                name="website"
                tabIndex={-1}
                autoComplete="off"
                value={website}
                onChange={(event) => setWebsite(event.target.value)}
              />
            </div>
            <Button type="submit" size="lg" className="w-full text-white" disabled={pending}>
              {pending ? "Sending enquiry..." : "Send enquiry"}
            </Button>
          </div>
        </form>
      </div>
      {info && (info.cancellationPolicy || info.mapEmbedUrl) ? (
        <div className="mt-14 grid gap-8 lg:grid-cols-2">
          {info.cancellationPolicy ? (
            <section className="rounded-2xl border border-border bg-card p-6">
              <h2 className="text-xl font-semibold">Cancellation &amp; refund policy</h2>
              <p className="mt-3 text-sm whitespace-pre-line text-muted-foreground">
                {info.cancellationPolicy}
              </p>
            </section>
          ) : null}
          {info.mapEmbedUrl ? (
            <section className="overflow-hidden rounded-2xl border border-border bg-card">
              {info.mapLocation ? (
                <p className="p-4 text-sm font-medium">{info.mapLocation}</p>
              ) : null}
              <iframe
                title="Our location"
                src={info.mapEmbedUrl}
                className="h-80 w-full border-0"
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                sandbox="allow-scripts allow-same-origin allow-popups"
              />
            </section>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
