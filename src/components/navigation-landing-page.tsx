import { Link } from "@tanstack/react-router";

import { FleetExplorer } from "@/components/fleet-explorer";
import { AboutUsPage } from "@/components/about-us-page";
import { Button } from "@/components/ui/button";
import { DESTINATION_STORIES } from "@/lib/destination-content";
import { NAVIGATION_SECTIONS, categoryDescription, getCategory } from "@/lib/navigation-content";

export function NavigationLandingPage({ sectionSlug }: { sectionSlug: string }) {
  const section = NAVIGATION_SECTIONS[sectionSlug];
  if (!section) return <UnknownNavigationPage />;
  if (sectionSlug === "about") return <AboutUsPage />;

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
              <li key={category.slug} data-scroll-reveal-card>
                <Link
                  to="/$section/$category"
                  params={{ section: sectionSlug, category: category.slug }}
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
          <Button asChild className="mt-6 bg-white !text-[#064576] hover:bg-white/90">
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
    const story = DESTINATION_STORIES[category.slug];
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
              <Link
                to="/$section"
                params={{ section: "destinations" }}
                className="hover:text-foreground"
              >
                Destinations
              </Link>
            </li>
            <li aria-hidden="true">/</li>
            <li aria-current="page" className="text-foreground">
              {category.label}
            </li>
          </ol>
        </nav>
        <header className="mt-7 grid items-center gap-7 lg:grid-cols-[minmax(0,1fr)_minmax(18rem,26rem)]">
          <div className="max-w-3xl">
            <p className="text-xs font-semibold tracking-[0.2em] text-primary uppercase">
              Destination
            </p>
            <h1 className="mt-2 text-4xl font-semibold sm:text-5xl">
              Boat Charters in {category.label}
            </h1>
            <p className="mt-4 text-lg leading-7 text-muted-foreground">
              {story?.intro ?? categoryDescription(category.label, category.description)}
            </p>
            <Button asChild className="mt-6">
              <a href="#destination-vessels">Browse boats in {category.label}</a>
            </Button>
          </div>
          {story?.images[0] ? (
            <figure className="overflow-hidden rounded-2xl border border-border bg-card shadow-[var(--shadow-card)]">
              <img
                src={story.images[0].src}
                alt={story.images[0].alt}
                width={960}
                height={640}
                fetchPriority="high"
                decoding="async"
                className="aspect-[3/2] w-full object-cover"
              />
            </figure>
          ) : null}
        </header>
        {story ? (
          <div className="mt-10 grid gap-6 lg:grid-cols-[minmax(0,1fr)_18rem]">
            <div className="space-y-6">
              {story.sections.map((item, index) => (
                <section
                  key={item.heading}
                  aria-labelledby={`story-${category.slug}-${index}`}
                  className="rounded-2xl border border-border bg-card p-6 shadow-[var(--shadow-card)] sm:p-8"
                >
                  <h2 id={`story-${category.slug}-${index}`} className="text-2xl font-semibold">
                    {item.heading}
                  </h2>
                  <div className="mt-4 space-y-3 text-base leading-7 text-muted-foreground">
                    {item.paragraphs.map((paragraph) => (
                      <p key={paragraph}>{paragraph}</p>
                    ))}
                  </div>
                  {item.highlights ? (
                    <ul className="mt-5 flex flex-wrap gap-2" aria-label="Destination highlights">
                      {item.highlights.map((highlight) => (
                        <li
                          key={highlight}
                          className="rounded-full bg-accent px-3 py-1.5 text-sm text-accent-foreground"
                        >
                          {highlight}
                        </li>
                      ))}
                    </ul>
                  ) : null}
                </section>
              ))}
            </div>
            <aside className="h-fit rounded-2xl border border-border bg-card p-6 shadow-[var(--shadow-card)]">
              <h2 className="text-lg font-semibold">Explore this destination</h2>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">
                Browse vessels currently listed for this location or contact us with a question
                about planning your trip.
              </p>
              <Button asChild variant="outline" className="mt-4 w-full">
                <Link to="/contact">Ask us about this destination</Link>
              </Button>
            </aside>
          </div>
        ) : null}
        {story && story.images.length > 1 ? (
          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:max-w-3xl">
            {story.images.slice(1).map((image) => (
              <figure
                key={image.src}
                className="overflow-hidden rounded-xl border border-border bg-card shadow-[var(--shadow-card)]"
              >
                <img
                  src={image.src}
                  alt={image.alt}
                  width={960}
                  height={640}
                  loading="lazy"
                  decoding="async"
                  className="aspect-[3/2] w-full object-cover"
                />
              </figure>
            ))}
          </div>
        ) : null}
        <section
          id="destination-vessels"
          className="mt-12 scroll-mt-24"
          aria-labelledby="destination-vessels-heading"
        >
          <h2 id="destination-vessels-heading" className="text-2xl font-semibold sm:text-3xl">
            Vessels listed for {category.label}
          </h2>
          <p className="mt-2 max-w-3xl text-muted-foreground">
            Filter the existing inventory by vessel type, charter date, guests, price, and
            amenities. Results only include boats whose recorded location matches this destination.
          </p>
          <div className="mt-6">
            <FleetExplorer
              key={category.slug}
              destination={{
                label: category.label,
                ...(category.inventoryLocations ? { locations: category.inventoryLocations } : {}),
                ...(category.inventoryLocationIncludes
                  ? { locationIncludes: category.inventoryLocationIncludes }
                  : {}),
              }}
              contactOnEmpty
            />
          </div>
        </section>
        {story ? (
          <nav
            aria-label="More boat charter destinations"
            className="mt-14 border-t border-border pt-8"
          >
            <h2 className="text-xl font-semibold">Explore more destinations</h2>
            <ul className="mt-4 flex flex-wrap gap-x-5 gap-y-3 text-sm">
              {story.related.map((slug) => {
                const related = section.categories.find((item) => item.slug === slug);
                return related ? (
                  <li key={slug}>
                    <Link
                      to="/$section/$category"
                      params={{ section: sectionSlug, category: slug }}
                      className="text-primary underline-offset-4 hover:underline focus-visible:underline"
                    >
                      {related.label} boat charters
                    </Link>
                  </li>
                ) : null;
              })}
            </ul>
          </nav>
        ) : null}
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
            <Link
              to="/$section"
              params={{ section: sectionSlug }}
              className="hover:text-foreground"
            >
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
          <Link to="/$section" params={{ section: sectionSlug }}>
            Explore more {section.label.toLowerCase()}
          </Link>
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
