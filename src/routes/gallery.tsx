import { createFileRoute } from "@tanstack/react-router";

import heroYacht from "@/assets/hero-yacht.jpg";

export const Route = createFileRoute("/gallery")({
  head: () => ({
    meta: [
      { title: "Gallery | Horizon Boat Charters" },
      {
        name: "description",
        content:
          "A preview of the yachts and coastal scenery you can enjoy with Horizon Boat Charters.",
      },
    ],
  }),
  component: GalleryPage,
});

function GalleryPage() {
  return (
    <main className="container-page py-14 sm:py-16">
      <header className="mb-8 max-w-3xl">
        <p className="text-xs font-semibold tracking-[0.2em] text-primary uppercase">
          Horizon Boat Charters
        </p>
        <h1 className="mt-2 text-4xl font-semibold sm:text-5xl">Gallery</h1>
        <p className="mt-4 text-lg leading-7 text-muted-foreground">
          A glimpse of time on the water.
        </p>
      </header>
      <figure className="overflow-hidden rounded-2xl border border-border bg-card shadow-[var(--shadow-card)]">
        <img
          src={heroYacht}
          alt="Luxury yacht cruising along the coast at sunset"
          className="scroll-parallax-media max-h-[36rem] w-full object-cover"
        />
      </figure>
    </main>
  );
}
