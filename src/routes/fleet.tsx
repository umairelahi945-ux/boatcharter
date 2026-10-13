import { createFileRoute } from "@tanstack/react-router";

import { FleetExplorer } from "@/components/fleet-explorer";

export const Route = createFileRoute("/fleet")({
  head: () => ({
    meta: [
      { title: "Explore the Yachts — Boat Charter" },
      {
        name: "description",
        content:
          "Browse every yacht, catamaran, speedboat and pontoon available for hourly or daily charter, with live pricing and availability.",
      },
      { property: "og:title", content: "Explore the Yachts — Boat Charter" },
      {
        property: "og:description",
        content: "Browse every vessel available for hourly or daily charter with live pricing.",
      },
    ],
  }),
  component: FleetPage,
});

function FleetPage() {
  return (
    <div className="container-page py-14">
      <header className="max-w-2xl">
        <p className="text-xs font-semibold tracking-[0.2em] text-primary uppercase">Our yachts</p>
        <h1 className="mt-2 text-4xl font-semibold">Find your vessel</h1>
        <p className="mt-3 text-muted-foreground">
          Every listing shows real hourly and daily rates. Choose a boat to open the booking
          calculator and reserve your window.
        </p>
      </header>

      <div className="mt-10">
        <FleetExplorer />
      </div>
    </div>
  );
}
