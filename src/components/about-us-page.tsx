import { ArrowRight, Compass, Search, Ship } from "lucide-react";
import { Link } from "@tanstack/react-router";

import { Button } from "@/components/ui/button";
import { BOAT_CATEGORIES } from "@/lib/money";
import { NAVIGATION_SECTIONS } from "@/lib/navigation-content";

const destinationSummaries: Record<string, string> = {
  "phuket-thailand": "Explore island and bay routes along Thailand’s Andaman coast.",
  "mahe-seychelles":
    "Plan island-hopping from Mahé, the main island in the Seychelles archipelago.",
  "bahamas-exumas": "Discover a chain of islands and cays throughout the Exumas.",
  curacao: "Explore Curaçao’s Caribbean coastline, coves, and sheltered bays.",
  "cozumel-mexico": "See Cozumel’s Caribbean shoreline and surrounding waters from the sea.",
  "grand-cayman":
    "Build an island itinerary around Grand Cayman’s beaches and clear Caribbean water.",
  aruba: "Cruise Aruba’s calmer leeward coast and take in the island from the water.",
  "st-martin": "Use St. Martin as a sailing base for nearby islands and bays.",
  "cabo-san-lucas-mexico":
    "Set out from Cabo San Lucas, where the Pacific meets the Sea of Cortez.",
  "la-paz-mexico": "Explore the bay and nearby islands along the Sea of Cortez from La Paz.",
  "maldives-indian-ocean": "Plan time among the Maldives’ atolls and islands in the Indian Ocean.",
  "cancun-mexico": "Discover Cancun’s Caribbean coast and nearby island routes.",
  "punta-cana-dominican-republic":
    "Plan a coastal trip around Punta Cana on the Dominican Republic’s eastern shore.",
  "caribbean-barbados-jamaica": "Compare the distinct island coastlines of Barbados and Jamaica.",
  "turks-and-caicos-grace-bay":
    "Explore Grace Bay’s clear, shallow water as part of a Turks and Caicos itinerary.",
};

const categoryDescriptions: Record<string, string> = {
  Yacht: "Review yacht listings, guest capacity, rates, and vessel details.",
  Catamaran: "Compare listed catamarans and the details provided for each vessel.",
  Speedboat: "Browse speedboat listings for shorter trips and time on the water.",
  Pontoon: "Explore pontoon listings and compare capacity and pricing details.",
  Sailboat: "Review sailboat listings and the details available for each trip.",
  "Fishing Boat": "Browse fishing boat listings and compare their published details.",
};

const aboutYachtImage =
  "https://images.unsplash.com/photo-1771354686596-11b5a1f04d4e?auto=format&fit=crop&fm=jpg&q=85&w=1600";
const adventureImage =
  "https://images.unsplash.com/photo-1648726438777-de835df96657?auto=format&fit=crop&crop=entropy&fm=jpg&q=80&w=900";

export function AboutUsPage() {
  const destinations = NAVIGATION_SECTIONS.destinations.categories;
  const experiences = NAVIGATION_SECTIONS.experiences.categories;

  return (
    <main className="container-page py-12 sm:py-16">
      <section className="grid items-center gap-8 lg:grid-cols-2 lg:gap-12">
        <div>
          <p className="text-xs font-semibold tracking-[0.2em] text-primary uppercase">
            Explore boats and yachts
          </p>
          <h1 className="mt-3 text-4xl leading-tight font-semibold sm:text-5xl">
            About Horizon Boat Charters
          </h1>
          <p className="mt-5 max-w-2xl text-lg leading-8 text-muted-foreground">
            Discover your next boat or yacht charter with Horizon Boat Charters. Explore places you
            want to visit, compare vessel details, and find charter options that fit your group and
            travel plans.
          </p>
          <p className="mt-4 max-w-2xl leading-7 text-muted-foreground">
            Browse boat rentals, private yacht charters, and luxury yacht listings by destination,
            vessel type, guest count, dates, and budget. Listings show available details and rates
            so you can decide what to explore next.
          </p>
          <div className="mt-7 flex flex-wrap gap-3">
            <Button asChild size="lg">
              <Link to="/$section/" params={{ section: "destinations" }}>
                <Compass /> Explore destinations
              </Link>
            </Button>
            <Button asChild size="lg" variant="outline">
              <Link to="/fleet">
                <Ship /> Browse boats and yachts
              </Link>
            </Button>
          </div>
        </div>
        <figure className="overflow-hidden rounded-2xl border border-border shadow-[var(--shadow-card)]">
          <img
            src={aboutYachtImage}
            alt="Sailboat gliding across the blue sea near Mallorca"
            className="scroll-parallax-media aspect-[4/3] w-full object-cover"
            loading="lazy"
            decoding="async"
          />
          <figcaption className="sr-only">
            Photo by David Vives on Unsplash, free to use under the Unsplash License.
          </figcaption>
        </figure>
      </section>

      <section className="mt-16 grid gap-8 rounded-2xl border border-border bg-card p-6 shadow-[var(--shadow-card)] sm:p-8 lg:grid-cols-2 lg:gap-12">
        <div>
          <h2 className="text-2xl font-semibold sm:text-3xl">
            Discover the world with Horizon Boat Charters
          </h2>
          <p className="mt-4 leading-7 text-muted-foreground">
            The site helps travelers explore boat and yacht charter destinations, review current
            vessel listings, and compare the details that matter when planning time on the water.
            Each destination page narrows results to boats whose recorded location matches that
            place.
          </p>
        </div>
        <div>
          <h2 className="text-2xl font-semibold sm:text-3xl">Our mission</h2>
          <p className="mt-4 leading-7 text-muted-foreground">
            Our aim is to make it easier to find a charter suited to your trip. We bring destination
            pages, vessel information, filters, and a booking calculator into one straightforward
            browsing experience, so you can compare options before choosing your next step.
          </p>
        </div>
      </section>

      <section className="mt-16" aria-labelledby="about-destinations-heading">
        <header className="max-w-3xl">
          <p className="text-xs font-semibold tracking-[0.2em] text-primary uppercase">
            Find a place to start
          </p>
          <h2 id="about-destinations-heading" className="mt-2 text-3xl font-semibold sm:text-4xl">
            Boat and yacht charter destinations
          </h2>
          <p className="mt-4 leading-7 text-muted-foreground">
            From island chains to coastal waters, explore the destinations in our directory. Open a
            destination to see the vessels currently listed for that location.
          </p>
        </header>
        <ul className="mt-7 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {destinations.map((destination) => (
            <li key={destination.slug} data-scroll-reveal-card>
              <Link
                to="/$section/$category"
                params={{ section: "destinations", category: destination.slug }}
                className="group flex h-full flex-col rounded-xl border border-border bg-card p-5 shadow-[var(--shadow-card)] transition-colors hover:border-primary/50 hover:bg-accent/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                <h3 className="font-semibold group-hover:text-primary">{destination.label}</h3>
                <p className="mt-2 flex-1 text-sm leading-6 text-muted-foreground">
                  {destinationSummaries[destination.slug]}
                </p>
                <span className="mt-4 inline-flex items-center gap-1 text-sm font-medium text-primary">
                  Explore {destination.label} <ArrowRight className="size-4" />
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </section>

      <section className="mt-16 grid gap-10 lg:grid-cols-[0.8fr_1.2fr]">
        <header>
          <p className="text-xs font-semibold tracking-[0.2em] text-primary uppercase">
            Vessel choices
          </p>
          <h2 className="mt-2 text-3xl font-semibold sm:text-4xl">
            Explore different types of charters
          </h2>
          <p className="mt-4 leading-7 text-muted-foreground">
            Browse the vessel categories used in the fleet and compare the listings currently
            available in each search.
          </p>
        </header>
        <ul className="grid gap-3 sm:grid-cols-2">
          {BOAT_CATEGORIES.map((category) => (
            <li key={category} className="rounded-xl border border-border bg-card p-4">
              <h3 className="font-semibold">{category}</h3>
              <p className="mt-1 text-sm leading-6 text-muted-foreground">
                {categoryDescriptions[category]}
              </p>
            </li>
          ))}
        </ul>
      </section>

      <section className="mt-16" aria-labelledby="about-experiences-heading">
        <h2 id="about-experiences-heading" className="text-2xl font-semibold sm:text-3xl">
          Explore charter experiences
        </h2>
        <p className="mt-3 max-w-3xl leading-7 text-muted-foreground">
          Browse the site’s experience categories to find a starting point for the kind of time on
          the water you have in mind.
        </p>
        <ul className="mt-5 flex flex-wrap gap-3">
          {experiences.map((experience) => (
            <li key={experience.slug}>
              <Link
                to="/$section/$category"
                params={{ section: "experiences", category: experience.slug }}
                className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-4 py-2 text-sm font-medium transition-colors hover:border-primary/50 hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                {experience.label} <ArrowRight className="size-4" />
              </Link>
            </li>
          ))}
        </ul>
      </section>

      <section className="mt-16 grid gap-8 lg:grid-cols-2">
        <div>
          <h2 className="text-2xl font-semibold sm:text-3xl">
            Find the right charter for your trip
          </h2>
          <p className="mt-4 leading-7 text-muted-foreground">
            Start with a destination or browse the full fleet. Use filters for vessel category,
            location, guest count, dates, hourly or daily rates, price range, and amenities. Then
            review each listing’s capacity, description, rates, and other available details.
          </p>
        </div>
        <div>
          <h2 className="text-2xl font-semibold sm:text-3xl">
            Why explore with Horizon Boat Charters?
          </h2>
          <p className="mt-4 leading-7 text-muted-foreground">
            Destination pages connect location discovery with matching vessel listings. Fleet search
            makes it easier to compare options, and the booking calculator shows a quote for the
            dates and charter period you select before you continue.
          </p>
        </div>
      </section>

      <section className="surface-navy mt-16 grid items-center gap-6 rounded-2xl p-5 text-white shadow-[var(--shadow-card)] sm:gap-8 sm:p-8 lg:grid-cols-[minmax(0,1fr)_15rem] lg:p-10">
        <div className="max-w-2xl">
          <h2 className="text-2xl leading-tight font-semibold sm:text-3xl">
            Start your next boating adventure
          </h2>
          <p className="mt-3 max-w-xl leading-7 text-white/80">
            Explore destinations, compare listed boats and yachts, and find an option for the trip
            you have in mind.
          </p>
          <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
            <Button
              asChild
              size="lg"
              className="w-full border-0 bg-[#D19413] text-white hover:bg-[#C68D15] sm:w-auto"
            >
              <Link to="/$section/" params={{ section: "destinations" }}>
                <Compass /> Explore destinations
              </Link>
            </Button>
            <Button asChild size="lg" variant="hero" className="w-full sm:w-auto">
              <Link to="/fleet">
                <Search /> Browse available charters
              </Link>
            </Button>
          </div>
        </div>
        <figure className="mx-auto w-full max-w-xs overflow-hidden rounded-xl border border-white/15 shadow-lg lg:max-w-none">
          <img
            src={adventureImage}
            alt="Sailboat on calm blue water beneath an open sky"
            width={900}
            height={675}
            className="scroll-parallax-media aspect-[4/3] w-full object-cover"
            loading="lazy"
            decoding="async"
          />
          <figcaption className="sr-only">
            Photo by Rasmus Gundorff Sæderup on Unsplash, free to use under the Unsplash License.
          </figcaption>
        </figure>
      </section>
    </main>
  );
}
