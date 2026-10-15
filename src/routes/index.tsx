import { Link, createFileRoute } from "@tanstack/react-router";
import { Anchor, CalendarCheck, CreditCard, LifeBuoy, ShieldCheck, Waves } from "lucide-react";

import heroImage from "@/assets/hero-yacht.jpg";
import { FleetExplorer } from "@/components/fleet-explorer";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Boat Charter — Luxury Yacht & Boat Rentals" },
      {
        name: "description",
        content:
          "Browse yacht, catamaran and speedboat listings, compare hourly or daily rates, and submit a charter booking request online.",
      },
      { property: "og:title", content: "Boat Charter — Luxury Yacht & Boat Rentals" },
      {
        property: "og:description",
        content:
          "Compare vessel details and rates, then request an hourly or daily charter online.",
      },
    ],
  }),
  component: Home,
});

const HIGHLIGHTS = [
  {
    icon: ShieldCheck,
    title: "Compare vessels",
    body: "Review boat categories, guest capacity, location, rates and listed amenities.",
  },
  {
    icon: CreditCard,
    title: "See the full estimate",
    body: "Review the rate, service fee, total and 20% deposit before submitting a booking request.",
  },
  {
    icon: CalendarCheck,
    title: "Choose your dates",
    body: "Pick hourly or daily dates and see a quote based on the selected vessel's listed rates.",
  },
  {
    icon: LifeBuoy,
    title: "Send a booking request",
    body: "Enter your contact details and guest count in the booking flow to request your charter.",
  },
];

function Home() {
  return (
    <div>
      <section className="relative isolate overflow-hidden">
        <img
          src={heroImage}
          alt="Luxury motor yacht cruising at sunset"
          width={1920}
          height={1088}
          loading="eager"
          fetchPriority="high"
          decoding="async"
          sizes="100vw"
          className="absolute inset-0 -z-10 size-full object-cover"
        />
        <div className="absolute inset-0 -z-10 hero-overlay" />
        <div className="container-page flex min-h-[34rem] flex-col justify-center py-24 text-white md:min-h-[42rem]">
          <span className="inline-flex w-fit items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3.5 py-1.5 text-xs font-medium tracking-wide uppercase backdrop-blur">
            <Waves className="size-3.5 text-primary" /> Yacht, catamaran and boat charters
          </span>
          <h1 className="mt-6 max-w-3xl text-4xl leading-[1.05] font-semibold sm:text-5xl md:text-6xl">
            Charter the coast on <span className="text-gradient-sea">your own terms</span>
          </h1>
          <p className="mt-5 max-w-xl text-base text-white/75 md:text-lg">
            Hourly and daily rentals across a curated selection of yachts, catamarans and
            speedboats. Compare vessels, choose your dates and review a clear price estimate before
            you send a booking request.
          </p>
          <div className="mt-9 flex flex-wrap gap-3">
            <Button asChild size="lg">
              <Link to="/fleet">
                <Anchor className="size-4" /> Explore the yachts
              </Link>
            </Button>
            <Button asChild size="lg" variant="hero">
              <Link to="/how-it-works">
                <LifeBuoy className="size-4" /> How it works
              </Link>
            </Button>
          </div>

          <ul className="mt-12 flex flex-wrap gap-x-8 gap-y-3 border-t border-white/15 pt-6 text-sm text-white/75">
            <li>Hourly and daily options</li>
            <li>Rates shown by vessel</li>
            <li>Booking request online</li>
          </ul>
        </div>
      </section>

      <section
        aria-labelledby="planning-heading"
        className="container-page -mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4"
      >
        <h2 id="planning-heading" className="sr-only">
          Plan your charter
        </h2>
        {HIGHLIGHTS.map((item) => (
          <div
            key={item.title}
            className="rounded-xl border border-border bg-card p-5 shadow-[var(--shadow-card)]"
          >
            <item.icon className="size-5 text-primary" />
            <h3 className="mt-3 text-base font-semibold">{item.title}</h3>
            <p className="mt-1.5 text-sm text-muted-foreground">{item.body}</p>
          </div>
        ))}
      </section>

      <section className="container-page mt-24">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-xs font-semibold tracking-[0.2em] text-primary uppercase">
              Explore the fleet
            </p>
            <h2 className="mt-2 text-3xl font-semibold sm:text-4xl">Yachts ready to sail</h2>
            <p className="mt-2 max-w-xl text-muted-foreground">
              Filter by category, guest count or home port, then estimate your charter total.
            </p>
          </div>
          <Button asChild variant="outline">
            <Link to="/fleet">View all boats</Link>
          </Button>
        </div>

        <div className="mt-8">
          <FleetExplorer limit={3} />
        </div>
      </section>
    </div>
  );
}
