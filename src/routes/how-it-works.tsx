import { Link, createFileRoute } from "@tanstack/react-router";
import { CalendarClock, CreditCard, Ship, Sparkles } from "lucide-react";

import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/how-it-works")({
  head: () => ({
    meta: [
      { title: "How Chartering Works — Boat Charter" },
      {
        name: "description",
        content:
          "From choosing a boat to boarding: pricing rules, the 2-hour minimum, secure card payment and what happens after you book.",
      },
      { property: "og:title", content: "How Chartering Works — Boat Charter" },
      {
        property: "og:description",
        content: "Pricing rules, secure card payment and what happens after you book.",
      },
    ],
  }),
  component: HowItWorks,
});

const STEPS = [
  {
    icon: Ship,
    title: "1. Choose your boat",
    body: "Filter the fleet by category, home port and guest count. Each listing lists capacity, length and amenities.",
  },
  {
    icon: CalendarClock,
    title: "2. Price your window",
    body: "Pick hourly or daily, then set start and end times. Hourly charters have a 2 hour minimum; daily charters a 1 day minimum.",
  },
  {
    icon: CreditCard,
    title: "3. Pay securely",
    body: "A single card payment covers the charter and the 10% service fee. We never handle cash and never store card numbers.",
  },
  {
    icon: Sparkles,
    title: "4. Board and cruise",
    body: "You receive a booking reference instantly. Our concierge confirms the meeting dock and captain within 24 hours.",
  },
];

function HowItWorks() {
  return (
    <div className="container-page py-14">
      <header className="max-w-2xl">
        <p className="text-xs font-semibold tracking-[0.2em] text-primary uppercase">Process</p>
        <h1 className="mt-2 text-4xl font-semibold">How chartering works</h1>
        <p className="mt-3 text-muted-foreground">
          Transparent pricing, live availability and one secure payment method.
        </p>
      </header>

      <ol className="mt-12 grid gap-6 sm:grid-cols-2">
        {STEPS.map((step) => (
          <li
            key={step.title}
            className="rounded-xl border border-border bg-card p-6 shadow-[var(--shadow-card)]"
          >
            <span className="flex size-10 items-center justify-center rounded-lg bg-primary/15 text-primary">
              <step.icon className="size-5" />
            </span>
            <h2 className="mt-4 text-lg font-semibold">{step.title}</h2>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{step.body}</p>
          </li>
        ))}
      </ol>

      <section className="mt-14 rounded-2xl surface-navy p-8 md:p-12">
        <h2 className="text-2xl font-semibold text-white">Pricing rules at a glance</h2>
        <ul className="mt-5 grid gap-3 text-sm text-white/70 sm:grid-cols-2">
          <li>• Hourly rate × hours booked, rounded up to the next hour.</li>
          <li>• Daily rate × days booked, rounded up to the next day.</li>
          <li>• A 10% service fee is added to every charter subtotal.</li>
          <li>• Fuel policy and captain inclusion are listed per boat.</li>
        </ul>
        <Button asChild className="mt-8" size="lg">
          <Link to="/fleet">Start booking</Link>
        </Button>
      </section>
    </div>
  );
}
