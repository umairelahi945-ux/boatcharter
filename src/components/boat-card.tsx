import { MapPin, Ruler, Users } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { formatMoney } from "@/lib/money";

export type BoatSummary = {
  id: string;
  title: string;
  category: string;
  capacity: number;
  length_ft: number;
  hourly_rate_cents: number;
  daily_rate_cents: number;
  location: string;
  description: string;
  amenities: string[];
  image_urls: string[];
  is_available: boolean;
};

export const FALLBACK_IMAGE =
  "https://images.unsplash.com/photo-1544551763-46a013bb70d5?auto=format&fit=crop&w=1200&q=80";

export function BoatCard({ boat, onSelect }: { boat: BoatSummary; onSelect: () => void }) {
  return (
    <Card className="group flex flex-col overflow-hidden border-border/70 p-0 shadow-[var(--shadow-card)] transition-all hover:-translate-y-1 hover:shadow-[var(--shadow-luxe)]">
      <div className="relative aspect-[4/3] overflow-hidden bg-muted">
        <img
          src={boat.image_urls[0] ?? FALLBACK_IMAGE}
          alt={boat.title}
          loading="lazy"
          onError={(event) => {
            event.currentTarget.src = FALLBACK_IMAGE;
          }}
          className="size-full object-cover transition-transform duration-700 group-hover:scale-105"
        />
        <Badge className="absolute top-3 left-3 bg-secondary text-secondary-foreground">
          {boat.category}
        </Badge>
        <Badge
          className={
            boat.is_available
              ? "absolute top-3 right-3 bg-success text-success-foreground"
              : "absolute top-3 right-3 bg-muted text-muted-foreground"
          }
        >
          {boat.is_available ? "Available" : "Unavailable"}
        </Badge>
      </div>

      <div className="flex flex-1 flex-col gap-4 p-5">
        <div>
          <h3 className="font-display text-xl leading-tight font-semibold">{boat.title}</h3>
          <p className="mt-1.5 flex items-center gap-1.5 text-sm text-muted-foreground">
            <MapPin className="size-3.5 text-primary" />
            {boat.location}
          </p>
        </div>

        <div className="flex flex-wrap gap-2 text-xs">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-muted px-2.5 py-1 font-medium">
            <Users className="size-3.5 text-primary" /> Up to {boat.capacity} guests
          </span>
          <span className="inline-flex items-center gap-1.5 rounded-full bg-muted px-2.5 py-1 font-medium">
            <Ruler className="size-3.5 text-primary" /> {boat.length_ft} ft
          </span>
        </div>

        <div className="mt-auto grid grid-cols-2 gap-3 border-t border-border/70 pt-4">
          <div>
            <p className="text-[11px] tracking-wide text-muted-foreground uppercase">Hourly</p>
            <p className="font-display text-lg font-semibold">
              {formatMoney(boat.hourly_rate_cents)}
            </p>
          </div>
          <div>
            <p className="text-[11px] tracking-wide text-muted-foreground uppercase">Daily</p>
            <p className="font-display text-lg font-semibold">
              {formatMoney(boat.daily_rate_cents)}
            </p>
          </div>
        </div>

        <Button onClick={onSelect} className="w-full" size="lg">
          View &amp; Book
        </Button>
      </div>
    </Card>
  );
}
