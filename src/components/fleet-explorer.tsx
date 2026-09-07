import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { Search, SlidersHorizontal, Ship } from "lucide-react";
import { useMemo, useState } from "react";

import { BoatCard, type BoatSummary } from "@/components/boat-card";
import { BookingDialog } from "@/components/booking-dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { listBoats } from "@/lib/charter.functions";
import { BOAT_CATEGORIES } from "@/lib/money";

const ANY = "any";

export function FleetExplorer({ limit }: { limit?: number }) {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState<string>(ANY);
  const [location, setLocation] = useState("");
  const [guests, setGuests] = useState("");
  const [selected, setSelected] = useState<BoatSummary | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);

  const fetchBoats = useServerFn(listBoats);
  const filters = useMemo(
    () => ({
      ...(search.trim() ? { search: search.trim() } : {}),
      ...(category !== ANY ? { category } : {}),
      ...(location.trim() ? { location: location.trim() } : {}),
      ...(Number(guests) > 0 ? { guests: Number(guests) } : {}),
    }),
    [search, category, location, guests],
  );

  const boatsQuery = useQuery({
    queryKey: ["boats", filters],
    queryFn: () => fetchBoats({ data: filters }),
  });

  const boats = (boatsQuery.data ?? []) as BoatSummary[];
  const visible = limit ? boats.slice(0, limit) : boats;
  const hasFilters = Boolean(search || location || guests || category !== ANY);

  function reset() {
    setSearch("");
    setCategory(ANY);
    setLocation("");
    setGuests("");
  }

  return (
    <div>
      <div className="rounded-2xl border border-border bg-card p-4 shadow-[var(--shadow-card)] sm:p-5">
        <div className="grid gap-4 md:grid-cols-[1.4fr_1fr_1fr_0.7fr_auto] md:items-end">
          <div className="space-y-1.5">
            <Label htmlFor="search">Search</Label>
            <div className="relative">
              <Search className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                id="search"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Yacht, catamaran, speedboat…"
                className="pl-9"
                maxLength={120}
              />
            </div>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="category">Category</Label>
            <Select value={category} onValueChange={setCategory}>
              <SelectTrigger id="category">
                <SelectValue placeholder="Any category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={ANY}>Any category</SelectItem>
                {BOAT_CATEGORIES.map((option) => (
                  <SelectItem key={option} value={option}>
                    {option}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="location">Location</Label>
            <Input
              id="location"
              value={location}
              onChange={(event) => setLocation(event.target.value)}
              placeholder="Miami, FL"
              maxLength={120}
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="min-guests">Guests</Label>
            <Input
              id="min-guests"
              type="number"
              min={0}
              value={guests}
              onChange={(event) => setGuests(event.target.value)}
              placeholder="2"
            />
          </div>
          <Button variant="outline" onClick={reset} disabled={!hasFilters} className="md:mb-0.5">
            <SlidersHorizontal className="size-4" />
            Reset
          </Button>
        </div>
      </div>

      <div className="mt-8">
        {boatsQuery.isPending ? (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: limit ?? 3 }).map((_, index) => (
              <Skeleton key={index} className="h-[26rem] rounded-xl" />
            ))}
          </div>
        ) : boatsQuery.isError ? (
          <div className="rounded-xl border border-destructive/30 bg-destructive/5 p-10 text-center">
            <p className="font-medium text-destructive">We could not load the yachts.</p>
            <Button variant="outline" className="mt-4" onClick={() => boatsQuery.refetch()}>
              Try again
            </Button>
          </div>
        ) : visible.length === 0 ? (
          <div className="rounded-xl border border-dashed border-border p-14 text-center">
            <Ship className="mx-auto size-8 text-muted-foreground" />
            <p className="mt-4 font-display text-xl font-semibold">No boats match your search</p>
            <p className="mt-1 text-sm text-muted-foreground">
              Try widening the location, guest count or category.
            </p>
            {hasFilters ? (
              <Button variant="outline" className="mt-5" onClick={reset}>
                Clear filters
              </Button>
            ) : null}
          </div>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {visible.map((boat) => (
              <BoatCard
                key={boat.id}
                boat={boat}
                onSelect={() => {
                  setSelected(boat);
                  setDialogOpen(true);
                }}
              />
            ))}
          </div>
        )}
      </div>

      <BookingDialog boat={selected} open={dialogOpen} onOpenChange={setDialogOpen} />
    </div>
  );
}
