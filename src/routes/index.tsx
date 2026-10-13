import { Link, createFileRoute } from "@tanstack/react-router";
import { Anchor, LifeBuoy, Waves } from "lucide-react";
import { useState } from "react";

import heroVideo from "@/assets/private-yacht-rental.mp4";
import heroPoster from "@/assets/hero-yacht.jpg";
import { FleetExplorer, FleetFilterBar, type FleetFilters } from "@/components/fleet-explorer";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Luxury Yacht Charters & Boat Rentals | Boat Charter" },
      {
        name: "description",
        content:
          "Charter yachts, catamarans and speedboats by the hour or day. Transparent pricing, vetted captains and instant secure booking.",
      },
      { property: "og:title", content: "Luxury Yacht Charters & Boat Rentals | Boat Charter" },
      {
        property: "og:description",
        content:
          "Charter yachts, catamarans and speedboats by the hour or day with instant secure booking.",
      },
    ],
  }),
  component: Home,
});

function Home() {
  const [filters, setFilters] = useState<FleetFilters>({
    search: "",
    category: "any",
    location: "",
    guests: "",
    date: "",
    ratePeriod: "daily",
    minPrice: "",
    maxPrice: "",
    amenity: "",
  });

  return (
    <div>
      <section className="relative isolate overflow-hidden">
        <video
          src={heroVideo}
          poster={heroPoster}
          autoPlay
          muted
          loop
          playsInline
          preload="metadata"
          aria-hidden="true"
          ref={(video) => {
            if (video) video.playbackRate = 0.5;
          }}
          className="absolute inset-0 z-0 size-full object-cover"
        />
        <div className="absolute inset-0 z-0 bg-[linear-gradient(90deg,rgba(5,16,35,0.94)_0%,rgba(5,16,35,0.82)_48%,rgba(5,16,35,0.62)_100%)]" />
        <div className="container-page relative z-10 grid items-center gap-x-12 gap-y-8 py-14 text-white md:min-h-[44rem] md:grid-cols-[minmax(0,1fr)_minmax(22rem,27rem)] md:gap-x-10 md:py-16">
          <div className="flex flex-col items-start">
            <span className="inline-flex w-fit items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3.5 py-1.5 text-xs font-medium tracking-wide uppercase backdrop-blur">
              <Waves className="size-3.5 text-primary" /> Coastal charters since 2009
            </span>
            <h1 className="mt-6 max-w-3xl text-4xl leading-[1.05] font-semibold sm:text-5xl md:text-6xl">
              Charter the coast on <span className="text-gradient-sea">your own terms</span>
            </h1>
            <p className="mt-5 max-w-xl text-base text-white/75 md:text-lg">
              Hourly and daily rentals across a curated selection of yachts, catamarans and
              speedboats. Pick your window, see the exact price, and confirm in minutes.
            </p>
            <div className="mt-9 flex flex-wrap gap-3">
              <Button
                asChild
                size="lg"
                className="border-0 bg-[#D19413] text-white transition-colors duration-200 hover:bg-[#C68D15] active:bg-[#BE8512] focus-visible:ring-2 focus-visible:ring-[#D19413] focus-visible:ring-offset-2"
              >
                <Link to="/fleet">
                  <Anchor className="size-4" /> Explore the yachts
                </Link>
              </Button>
              <Button
                asChild
                size="lg"
                variant="hero"
                className="border-white/30 bg-[#10233a]/70 text-white transition-colors duration-200 hover:bg-[#1b344d]/80"
              >
                <Link to="/how-it-works">
                  <LifeBuoy className="size-4" /> How it works
                </Link>
              </Button>
            </div>
          </div>

          <aside className="w-full min-w-0 rounded-2xl border border-white/20 bg-[#07172b]/90 p-5 shadow-2xl shadow-black/25 backdrop-blur-md sm:p-6">
            <h2 className="text-2xl font-semibold">Book your charter</h2>
            <p className="mt-2 text-sm leading-6 text-white/75">
              Find the right yacht, choose your dates and see your price before you book.
            </p>
            <div className="mt-5">
              <FleetFilterBar
                filters={filters}
                onChange={setFilters}
                variant="hero"
                onSearch={() =>
                  document.getElementById("featured-yachts")?.scrollIntoView({ behavior: "smooth" })
                }
              />
            </div>
          </aside>
        </div>
      </section>

      <section id="featured-yachts" className="container-page mt-16 scroll-mt-8">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-xs font-semibold tracking-[0.2em] text-primary uppercase">
              Featured Yacht
            </p>
            <h2 className="mt-2 text-3xl font-semibold sm:text-4xl">Yachts ready to sail</h2>
            <p className="mt-2 max-w-xl text-muted-foreground">
              Filter by category, guest count or home port, then price your charter instantly.
            </p>
            <p className="mt-2 max-w-xl text-sm font-medium text-foreground">
              All the available charters are fully inspected and insured. Safety is our top
              priority.
            </p>
          </div>
          <Button asChild variant="outline">
            <Link to="/fleet">View all boats</Link>
          </Button>
        </div>

        <div className="mt-8">
          <FleetExplorer limit={3} filters={filters} onFiltersChange={setFilters} hideFilters />
        </div>
      </section>
    </div>
  );
}
