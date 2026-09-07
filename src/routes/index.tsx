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
          "Charter yachts, catamarans and speedboats by the hour or day. Transparent pricing, vetted captains and instant secure booking.",
      },
      { property: "og:title", content: "Boat Charter — Luxury Yacht & Boat Rentals" },
      {
        property: "og:description",
        content:
          "Charter yachts, catamarans and speedboats by the hour or day with instant secure booking.",
      },
    ],
  }),
  component: Home,
});

const HIGHLIGHTS = [
  {
    icon: ShieldCheck,
    title: "Vetted yachts",
    body: "Every vessel is inspected, insured and captained by licensed crew.",
  },
  {
    icon: CreditCard,
    title: "Payment methods",
    body: "We accept all payment methods such as bank transfers, ATM, credit cards, Visa and MasterCard. PayPal as well. Once the deposit is paid, the customers can pay the balance to the captain on the day of the charter.",
  },
  {
    icon: CalendarCheck,
    title: "Live availability",
    body: "Real-time conflict checks stop double bookings before they happen.",
  },
  {
    icon: LifeBuoy,
    title: "24/7 customer support",
    body: "Our customer support staff is fully professional and experienced and are available around the clock for our valuable customers. You can reach us via chat, WhatsApp and email.",
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
          className="absolute inset-0 -z-10 size-full object-cover"
        />
        <div className="absolute inset-0 -z-10 hero-overlay" />
        <div className="container-page flex min-h-[34rem] flex-col justify-center py-24 text-white md:min-h-[42rem]">
          <span className="inline-flex w-fit items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3.5 py-1.5 text-xs font-medium tracking-wide uppercase backdrop-blur">
            <Waves className="size-3.5 text-primary" /> Coastal charters since 2009
          </span>
          <h1 className="mt-6 max-w-3xl text-4xl leading-[1.05] font-semibold sm:text-5xl md:text-6xl">
            Charter the coast on <span className="text-gradient-sea">your own terms</span>
          </h1>
          <p className="mt-5 max-w-xl text-base text-white/75 md:text-lg">
            Hourly and daily rentals across a curated fleet of yachts, catamarans and speedboats.
            Pick your window, see the exact price, and confirm in minutes.
          </p>
          <div className="mt-9 flex flex-wrap gap-3">
            <Button asChild size="lg">
              <Link to="/fleet">
                <Anchor className="size-4" /> Explore the fleet
              </Link>
            </Button>
            <Button asChild size="lg" variant="hero">
              <Link to="/how-it-works">
                <LifeBuoy className="size-4" /> How it works
              </Link>
            </Button>
          </div>

          <dl className="mt-14 grid max-w-2xl grid-cols-3 gap-6 border-t border-white/15 pt-8">
            <Stat value="4" label="Signature vessels" />
            <Stat value="2 hr" label="Minimum charter" />
            <Stat value="24/7" label="Concierge desk" />
          </dl>
        </div>
      </section>

      <section className="container-page -mt-10 grid gap-4 sm:grid-cols-3">
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
              The fleet
            </p>
            <h2 className="mt-2 text-3xl font-semibold sm:text-4xl">Boats ready to sail</h2>
            <p className="mt-2 max-w-xl text-muted-foreground">
              Filter by category, guest count or home port, then price your charter instantly.
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

function Stat({ value, label }: { value: string; label: string }) {
  return (
    <div>
      <dt className="font-display text-3xl font-semibold">{value}</dt>
      <dd className="mt-1 text-xs tracking-wide text-white/60 uppercase">{label}</dd>
    </div>
  );
}
