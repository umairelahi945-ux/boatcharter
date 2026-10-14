import { useQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { CalendarDays, MapPin } from "lucide-react";

import { getPublicSiteInfo } from "@/lib/site.functions";

export const Route = createFileRoute("/destinations")({
  head: () => ({
    meta: [
      { title: "Charter Destinations & Seasons — Boat Charter" },
      { name: "description", content: "Where we charter and the best season to sail each destination." },
      { property: "og:title", content: "Charter Destinations & Seasons — Boat Charter" },
      { property: "og:description", content: "Where we charter and the best season to sail each destination." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Destinations,
});

function Destinations() {
  const fn = useServerFn(getPublicSiteInfo);
  const query = useQuery({ queryKey: ["site-info"], queryFn: () => fn() });
  const rows = query.data?.destinations ?? [];
  return (
    <div className="container-page py-14">
      <p className="text-xs font-semibold tracking-[0.2em] text-primary uppercase">Destinations</p>
      <h1 className="mt-2 text-4xl font-semibold">Where we sail</h1>
      <p className="mt-3 text-muted-foreground">Seasonal availability for each charter destination.</p>
      {query.isPending ? (
        <p className="mt-10 text-muted-foreground">Loading…</p>
      ) : rows.length === 0 ? (
        <p className="mt-10 text-muted-foreground">No destinations listed yet.</p>
      ) : (
        <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {rows.map((d) => (
            <div key={d.id} className="rounded-2xl border border-border bg-card p-5">
              <p className="flex items-center gap-2 font-semibold">
                <MapPin className="size-4 text-primary" /> {d.name}
              </p>
              <p className="mt-2 flex items-center gap-2 text-sm text-muted-foreground">
                <CalendarDays className="size-4" /> {d.season_start} to {d.season_end}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
