import { createFileRoute } from "@tanstack/react-router";
import { Clock, Mail, MapPin, Phone } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

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
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});

  function submit(event: React.FormEvent) {
    event.preventDefault();
    const next: Record<string, string> = {};
    if (name.trim().length < 2) next["name"] = "Please enter your name.";
    if (!emailPattern.test(email.trim())) next["email"] = "Please enter a valid email address.";
    if (message.trim().length < 10) next["message"] = "Please add a few more details.";
    setErrors(next);
    if (Object.keys(next).length > 0) return;
    toast.success("Thanks — our concierge will reply within one business day.");
    setName("");
    setEmail("");
    setMessage("");
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
              <span className="flex size-9 items-center justify-center rounded-lg bg-primary/15 text-primary">
                <Phone className="size-4" />
              </span>
              +1 (305) 555 0100
            </li>
            <li className="flex items-center gap-3">
              <span className="flex size-9 items-center justify-center rounded-lg bg-primary/15 text-primary">
                <Mail className="size-4" />
              </span>
              concierge@boatcharter.example
            </li>
            <li className="flex items-center gap-3">
              <span className="flex size-9 items-center justify-center rounded-lg bg-primary/15 text-primary">
                <MapPin className="size-4" />
              </span>
              Pier 12, Marina District
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
          <div className="mt-6 space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="contact-name">Name</Label>
              <Input
                id="contact-name"
                value={name}
                onChange={(event) => setName(event.target.value)}
                maxLength={100}
              />
              {errors["name"] ? (
                <p className="text-xs font-medium text-destructive">{errors["name"]}</p>
              ) : null}
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="contact-email">Email</Label>
              <Input
                id="contact-email"
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                maxLength={255}
              />
              {errors["email"] ? (
                <p className="text-xs font-medium text-destructive">{errors["email"]}</p>
              ) : null}
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="contact-message">Message</Label>
              <Textarea
                id="contact-message"
                rows={5}
                value={message}
                onChange={(event) => setMessage(event.target.value)}
                maxLength={1000}
              />
              {errors["message"] ? (
                <p className="text-xs font-medium text-destructive">{errors["message"]}</p>
              ) : null}
            </div>
            <Button type="submit" size="lg" className="w-full">
              Send enquiry
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
