import { Link } from "@tanstack/react-router";

import { FleetExplorer } from "@/components/fleet-explorer";
import { Button } from "@/components/ui/button";
import { NAVIGATION_SECTIONS, categoryDescription, getCategory } from "@/lib/navigation-content";

export function NavigationLandingPage({ sectionSlug }: { sectionSlug: string }) {
  const section = NAVIGATION_SECTIONS[sectionSlug];
  if (!section) return <UnknownNavigationPage />;

  return (
    <main className="container-page py-14 sm:py-16">
      <header className="max-w-3xl">
        <p className="text-xs font-semibold tracking-[0.2em] text-primary uppercase">
          {section.label}
        </p>
        <h1 className="mt-2 text-4xl font-semibold sm:text-5xl">{section.title}</h1>
        <p className="mt-4 text-lg leading-7 text-muted-foreground">{section.description}</p>
      </header>

      {section.categories.length > 0 ? (
        <nav aria-label={`${section.label} categories`} className="mt-10">
          <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {section.categories.map((category) => (
              <li key={category.slug}>
                <Link
                  to={`/${sectionSlug}/${category.slug}` as never}
                  className="group block h-full rounded-xl border border-border bg-card p-5 shadow-[var(--shadow-card)] transition-colors hover:border-primary/50 hover:bg-accent/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                >
                  <h2 className="text-lg font-semibold group-hover:text-primary">
                    {category.label}
                  </h2>
                  <p className="mt-2 text-sm leading-6 text-muted-foreground">
                    {categoryDescription(category.label, category.description)}
                  </p>
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      ) : (
        <div className="mt-8 max-w-2xl rounded-2xl border border-border bg-card p-6 shadow-[var(--shadow-card)]">
          <p className="leading-7 text-muted-foreground">
            We connect guests with carefully selected vessels and experienced captains for memorable
            time on the water.
          </p>
          <Button asChild className="mt-6">
            <Link to="/contact">Contact our team</Link>
          </Button>
        </div>
      )}

    </main>
  );
}

export function NavigationCategoryPage({
  sectionSlug,
  categorySlug,
}: {
  sectionSlug: string;
  categorySlug: string;
}) {
  const section = NAVIGATION_SECTIONS[sectionSlug];
  const category = getCategory(sectionSlug, categorySlug);
  if (!section || !category) return <UnknownNavigationPage />;

  if (sectionSlug === "destinations") {
    return (
      <main className="container-page py-10 sm:py-14">
        <nav aria-label="Breadcrumb" className="text-sm text-muted-foreground">
          <ol className="flex flex-wrap items-center gap-2">
            <li>
              <Link to="/" className="hover:text-foreground">
                Home
              </Link>
            </li>
            <li aria-hidden="true">/</li>
            <li>
              <Link to="/$section" params={{ section: "destinations" }} className="hover:text-foreground">
                Destinations
              </Link>
            </li>
            <li aria-hidden="true">/</li>
            <li aria-current="page" className="text-foreground">
              {category.label}
            </li>
          </ol>
        </nav>
        <header className="mt-7 max-w-3xl">
          <p className="text-xs font-semibold tracking-[0.2em] text-primary uppercase">
            Destination
          </p>
          <h1 className="mt-2 text-4xl font-semibold sm:text-5xl">
            Boat Charters in {category.label}
          </h1>
          <p className="mt-4 text-lg leading-7 text-muted-foreground">
            {categoryDescription(category.label, category.description)}
          </p>
        </header>
        <section className="mt-10" aria-labelledby="destination-vessels-heading">
          <h2 id="destination-vessels-heading" className="text-2xl font-semibold sm:text-3xl">
            Vessels listed for {category.label}
          </h2>
          <p className="mt-2 max-w-3xl text-muted-foreground">
            Filter the existing inventory by vessel type, charter date, guests, price, and amenities.
            Results only include boats whose recorded location matches this destination.
          </p>
          <div className="mt-6">
            <FleetExplorer
              key={category.slug}
              destination={{
                label: category.label,
                locations: category.inventoryLocations,
                locationIncludes: category.inventoryLocationIncludes,
              }}
              contactOnEmpty
            />
          </div>
        </section>
      </main>
    );
  }

  return (
    <main className="container-page py-14 sm:py-16">
      <nav aria-label="Breadcrumb" className="text-sm text-muted-foreground">
        <ol className="flex flex-wrap items-center gap-2">
          <li>
            <Link to="/" className="hover:text-foreground">
              Home
            </Link>
          </li>
          <li aria-hidden="true">/</li>
          <li>
            <Link to={`/${sectionSlug}/` as never} className="hover:text-foreground">
              {section.label}
            </Link>
          </li>
          <li aria-hidden="true">/</li>
          <li aria-current="page" className="text-foreground">
            {category.label}
          </li>
        </ol>
      </nav>
      <header className="mt-8 max-w-3xl">
        <p className="text-xs font-semibold tracking-[0.2em] text-primary uppercase">
          {section.label}
        </p>
        <h1 className="mt-2 text-4xl font-semibold sm:text-5xl">{category.label}</h1>
        <p className="mt-4 text-lg leading-7 text-muted-foreground">
          {categoryDescription(category.label, category.description)}
        </p>
        <Button asChild size="lg" className="mt-7">
          <Link to="/fleet">Explore available vessels</Link>
        </Button>
      </header>
      <section className="mt-14 max-w-3xl rounded-2xl border border-border bg-card p-6 sm:p-8">
        <h2 className="text-2xl font-semibold">Plan your time on the water</h2>
        <p className="mt-3 leading-7 text-muted-foreground">
          Browse the current fleet to compare vessel details, guest capacity, rates and
          availability. Select a vessel to open the booking calculator and choose your dates.
        </p>
        <Button asChild variant="outline" className="mt-6">
          <Link to={`/${sectionSlug}/` as never}>Explore more {section.label.toLowerCase()}</Link>
        </Button>
      </section>
    </main>
  );
}

function UnknownNavigationPage() {
  return (
    <main className="container-page py-20">
      <h1 className="text-3xl font-semibold">Page not found</h1>
      <p className="mt-3 text-muted-foreground">
        Browse our available vessels to plan your charter.
      </p>
      <Button asChild className="mt-6">
        <Link to="/fleet">Explore the fleet</Link>
      </Button>
    </main>
  );
}
