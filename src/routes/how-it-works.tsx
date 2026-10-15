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
          "Learn how to compare boats, choose charter dates, review the price and submit a booking request.",
      },
      { property: "og:title", content: "How Chartering Works — Boat Charter" },
      {
        property: "og:description",
        content: "Compare boats, set your dates and review the quote before requesting a charter.",
      },
    ],
  }),
  component: HowItWorks,
});

const STEPS = [
  {
    icon: Ship,
    title: "Choose a vessel",
    body: "Filter listings by category, location and guest count. Each listing shows its capacity, length, amenities and rates.",
  },
  {
    icon: CalendarClock,
    title: "Set your dates",
    body: "Choose hourly or daily pricing and enter a start and end time. The quote enforces the minimum duration for each option.",
  },
  {
    icon: CreditCard,
    title: "Review the estimate",
    body: "The quote shows the listed rate, service fee, total, 20% deposit and remaining balance before you submit.",
  },
  {
    icon: Sparkles,
    title: "Submit a booking request",
    body: "Add your contact details and guest count. The system checks for date conflicts and shows the booking and payment result after submission.",
  },
];

function HowItWorks() {
  return (
    <div className="container-page py-14">
      <header className="max-w-2xl">
        <p className="text-xs font-semibold tracking-[0.2em] text-primary uppercase">Process</p>
        <h1 className="mt-2 text-4xl font-semibold">How chartering works</h1>
        <p className="mt-3 text-muted-foreground">
          The booking flow shows the quote and deposit split before you submit your request.
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
          <li>Hourly rates are multiplied by booked hours, rounded up to a whole hour.</li>
          <li>Daily rates are multiplied by booked days, rounded up to a whole day.</li>
          <li>A 10% service fee is added to the charter subtotal.</li>
          <li>
            A 20% deposit is calculated from the total; the remaining balance is shown separately.
          </li>
        </ul>
        <Button asChild className="mt-8" size="lg">
          <Link to="/fleet">Start booking</Link>
        </Button>
      </section>
    </div>
  );
}
