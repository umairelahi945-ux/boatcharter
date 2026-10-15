import { createFileRoute, Link } from "@tanstack/react-router";
import { Mail } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { getPublicSiteInfo } from "@/lib/site.functions";
import { toast } from "sonner";

export const Route = createFileRoute("/contact")({
  head: () => ({
    meta: [
      { title: "Contact the Charter Desk — Boat Charter" },
      {
        name: "description",
        content:
          "Send a charter enquiry by email or start a booking request from a vessel listing.",
      },
      { property: "og:title", content: "Contact the Charter Desk — Boat Charter" },
      {
        property: "og:description",
        content: "Get in touch about a charter or start a booking request online.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: Contact,
});

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const PUBLIC_CONTACT_EMAIL = "contact@horizonboatcharters.com";

type FieldErrors = Partial<Record<"name" | "email" | "message", string>>;

function Contact() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [errors, setErrors] = useState<FieldErrors>({});

  function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const next: FieldErrors = {};
    if (name.trim().length < 2) next.name = "Please enter your name.";
    if (!emailPattern.test(email.trim())) next.email = "Please enter a valid email address.";
    if (message.trim().length < 10) next.message = "Please add a few more details.";
    setErrors(next);
    if (Object.keys(next).length > 0) return;

    const subject = encodeURIComponent(`Boat charter enquiry from ${name.trim()}`);
    const body = encodeURIComponent(
      `Name: ${name.trim()}\nEmail: ${email.trim()}\n\n${message.trim()}`,
    );
    window.location.href = `mailto:${PUBLIC_CONTACT_EMAIL}?subject=${subject}&body=${body}`;
    toast.message(
      "Your email app should open with a draft. Send the draft to complete your enquiry.",
    );
  }

  const infoFn = useServerFn(getPublicSiteInfo);
  const info = useQuery({ queryKey: ["site-info"], queryFn: () => infoFn() }).data;

  return (
    <div className="container-page py-14">
      <div className="grid gap-12 lg:grid-cols-[1fr_1.1fr]">
        <div>
          <p className="text-xs font-semibold tracking-[0.2em] text-primary uppercase">Contact</p>
          <h1 className="mt-2 text-4xl font-semibold">Talk to the charter desk</h1>
          <p className="mt-3 text-muted-foreground">
            Send us your charter question by email, or choose a vessel to start a booking request.
          </p>

          <ul className="mt-8 space-y-4 text-sm">
            <li className="flex items-center gap-3">
              <span className="flex size-9 items-center justify-center rounded-lg bg-primary/15 text-primary">
                <Mail className="size-4" aria-hidden="true" />
              </span>
              <a
                className="font-medium text-primary underline underline-offset-4"
                href={`mailto:${PUBLIC_CONTACT_EMAIL}`}
              >
                {PUBLIC_CONTACT_EMAIL}
              </a>
            </li>
          </ul>

          <p className="mt-5 text-sm text-muted-foreground">
            Looking to reserve a specific boat?{" "}
            <Link className="font-medium text-primary underline underline-offset-4" to="/fleet">
              Browse the fleet and request a booking
            </Link>
            .
          </p>
        </div>

        <form
          onSubmit={submit}
          noValidate
          className="rounded-2xl border border-border bg-card p-6 shadow-[var(--shadow-card)] sm:p-8"
        >
          <h2 className="text-xl font-semibold">Email an enquiry</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Submitting opens a draft in your email app. The message is sent only when you press Send
            there.
          </p>
          <div className="mt-6 space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="contact-name">Name</Label>
              <Input
                id="contact-name"
                name="name"
                autoComplete="name"
                required
                value={name}
                onChange={(event) => setName(event.target.value)}
                maxLength={100}
                aria-invalid={Boolean(errors.name)}
                aria-describedby={errors.name ? "contact-name-error" : undefined}
              />
              {errors.name ? (
                <p
                  id="contact-name-error"
                  role="alert"
                  className="text-xs font-medium text-destructive"
                >
                  {errors.name}
                </p>
              ) : null}
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="contact-email">Email</Label>
              <Input
                id="contact-email"
                name="email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                maxLength={255}
                aria-invalid={Boolean(errors.email)}
                aria-describedby={errors.email ? "contact-email-error" : undefined}
              />
              {errors.email ? (
                <p
                  id="contact-email-error"
                  role="alert"
                  className="text-xs font-medium text-destructive"
                >
                  {errors.email}
                </p>
              ) : null}
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="contact-message">Message</Label>
              <Textarea
                id="contact-message"
                name="message"
                required
                rows={5}
                value={message}
                onChange={(event) => setMessage(event.target.value)}
                maxLength={1000}
                aria-invalid={Boolean(errors.message)}
                aria-describedby={errors.message ? "contact-message-error" : undefined}
              />
              {errors.message ? (
                <p
                  id="contact-message-error"
                  role="alert"
                  className="text-xs font-medium text-destructive"
                >
                  {errors.message}
                </p>
              ) : null}
            </div>
            <Button type="submit" size="lg" className="w-full">
              Open email draft
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
