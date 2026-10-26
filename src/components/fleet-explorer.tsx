import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { Link } from "@tanstack/react-router";
import { Search, SlidersHorizontal, Ship } from "lucide-react";
import { lazy, Suspense, useMemo, useState } from "react";

import { BoatCard, type BoatSummary } from "@/components/boat-card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { listBoats } from "@/lib/charter.functions";
import { BOAT_CATEGORIES } from "@/lib/money";

const ANY = "any";
const BookingDialog = lazy(() =>
  import("@/components/booking-dialog").then((module) => ({ default: module.BookingDialog })),
);

export type FleetFilters = {
  search: string;
  category: string;
  location: string;
  guests: string;
  date: string;
  ratePeriod: "hourly" | "daily";
  minPrice: string;
  maxPrice: string;
  amenity: string;
};

const EMPTY_FILTERS: FleetFilters = {
  search: "",
  category: ANY,
  location: "",
  guests: "",
  date: "",
  ratePeriod: "daily",
  minPrice: "",
  maxPrice: "",
  amenity: "",
};

export function FleetFilterBar({
  filters,
  onChange,
  variant = "default",
  onSearch,
  destinationLabel,
}: {
  filters: FleetFilters;
  onChange: (filters: FleetFilters) => void;
  variant?: "default" | "hero" | "destination";
  onSearch?: () => void;
  destinationLabel?: string;
}) {
  const hero = variant === "hero";
  const destinationMode = variant === "destination";
  const controlClass = hero
    ? "border-white/20 bg-white/5 text-white placeholder:text-white/45 focus-visible:ring-primary"
    : "";
  const labelClass = hero ? "text-white/75" : "";
  const resetDisabled =
    !filters.search &&
    !filters.location &&
    !filters.guests &&
    !filters.date &&
    !filters.minPrice &&
    !filters.maxPrice &&
    !filters.amenity &&
    filters.ratePeriod === "daily" &&
    filters.category === ANY;
  const resetFilters = () => onChange({ ...EMPTY_FILTERS });

  return (
    <form
      onSubmit={(event) => {
        event.preventDefault();
        onSearch?.();
      }}
      className={
        hero
          ? "min-w-0"
          : "rounded-2xl border border-border bg-card p-4 shadow-[var(--shadow-card)] sm:p-5"
      }
    >
      <div
        className={
          hero
            ? "grid min-w-0 gap-3"
            : destinationMode
              ? "grid min-w-0 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 xl:items-end"
              : "grid min-w-0 gap-4 sm:grid-cols-2 lg:grid-cols-[minmax(14rem,1.7fr)_minmax(10rem,1fr)_minmax(10rem,1fr)_minmax(6rem,0.65fr)_auto] lg:items-end"
        }
      >
        <div className="min-w-0 space-y-1.5">
          <Label htmlFor={hero ? "hero-search" : "search"} className={labelClass}>
            Search
          </Label>
          <div className="relative">
            <Search
              className={`absolute top-1/2 left-3 size-4 -translate-y-1/2 ${hero ? "text-white/55" : "text-muted-foreground"}`}
            />
            <Input
              id={hero ? "hero-search" : "search"}
              value={filters.search}
              onChange={(event) => onChange({ ...filters, search: event.target.value })}
              placeholder={hero ? "Search yachts or boats" : "Yacht, catamaran, speedboat…"}
              className={`pl-9 ${controlClass}`}
              maxLength={120}
            />
          </div>
        </div>
        <div className="min-w-0 space-y-1.5">
          <Label htmlFor={hero ? "hero-category" : "category"} className={labelClass}>
            Category
          </Label>
          <Select
            value={filters.category}
            onValueChange={(category) => onChange({ ...filters, category })}
          >
            <SelectTrigger id={hero ? "hero-category" : "category"} className={controlClass}>
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
        <div className="min-w-0 space-y-1.5">
          <Label
            htmlFor={destinationMode ? "destination" : hero ? "hero-location" : "location"}
            className={labelClass}
          >
            {destinationMode ? "Destination" : "Location"}
          </Label>
          {destinationMode ? (
            <Input
              id="destination"
              value={destinationLabel ?? ""}
              readOnly
              className={controlClass}
            />
          ) : (
            <Input
              id={hero ? "hero-location" : "location"}
              value={filters.location}
              onChange={(event) => onChange({ ...filters, location: event.target.value })}
              placeholder={hero ? "Enter destination" : "Miami, FL"}
              maxLength={120}
              className={controlClass}
            />
          )}
        </div>
        <div className="min-w-0 space-y-1.5">
          <Label htmlFor={hero ? "hero-min-guests" : "min-guests"} className={labelClass}>
            Guests
          </Label>
          <Input
            id={hero ? "hero-min-guests" : "min-guests"}
            type="number"
            min={0}
            value={filters.guests}
            onChange={(event) => onChange({ ...filters, guests: event.target.value })}
            placeholder="2"
            className={controlClass}
          />
        </div>
        {destinationMode ? (
          <>
            <div className="min-w-0 space-y-1.5">
              <Label htmlFor="charter-type">Charter type</Label>
              <Select
                value={filters.ratePeriod}
                onValueChange={(ratePeriod) => {
                  if (ratePeriod === "hourly" || ratePeriod === "daily") {
                    onChange({ ...filters, ratePeriod });
                  }
                }}
              >
                <SelectTrigger id="charter-type">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="hourly">Hourly</SelectItem>
                  <SelectItem value="daily">Daily</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="min-w-0 space-y-1.5">
              <Label htmlFor="charter-date">Date</Label>
              <Input
                id="charter-date"
                type="date"
                min={new Date().toISOString().slice(0, 10)}
                value={filters.date}
                onChange={(event) => onChange({ ...filters, date: event.target.value })}
              />
            </div>
            <div className="min-w-0 space-y-1.5">
              <Label htmlFor="min-price">Minimum price (USD)</Label>
              <Input
                id="min-price"
                type="number"
                min={0}
                step="0.01"
                value={filters.minPrice}
                onChange={(event) => onChange({ ...filters, minPrice: event.target.value })}
                placeholder="No minimum"
              />
            </div>
            <div className="min-w-0 space-y-1.5">
              <Label htmlFor="max-price">Maximum price (USD)</Label>
              <Input
                id="max-price"
                type="number"
                min={0}
                step="0.01"
                value={filters.maxPrice}
                onChange={(event) => onChange({ ...filters, maxPrice: event.target.value })}
                placeholder="No maximum"
              />
            </div>
            <div className="min-w-0 space-y-1.5">
              <Label htmlFor="amenity">Amenity</Label>
              <Input
                id="amenity"
                value={filters.amenity}
                onChange={(event) => onChange({ ...filters, amenity: event.target.value })}
                placeholder="e.g. Air Conditioning"
                maxLength={60}
              />
            </div>
          </>
        ) : null}
        <Button
          type="button"
          variant="outline"
          onClick={resetFilters}
          disabled={resetDisabled}
          className={`min-h-10 w-full transition-colors duration-200 ${hero ? "border-white/20 bg-[#10233a]/70 text-white/85 hover:bg-[#1b344d]/80 hover:text-white" : "sm:col-span-2 lg:col-span-1"}`}
        >
          <SlidersHorizontal className="size-4" /> Reset
        </Button>
      </div>
      {hero ? (
        <Button
          type="submit"
          className="mt-3 min-h-11 w-full border-0 bg-[#D19413] text-white transition-colors duration-200 hover:bg-[#C68D15] active:bg-[#BE8512] focus-visible:ring-2 focus-visible:ring-[#D19413] focus-visible:ring-offset-2"
        >
          <Search className="size-4" /> Search yachts
        </Button>
      ) : null}
    </form>
  );
}

export function FleetExplorer({
  limit,
  filters: controlledFilters,
  onFiltersChange,
  hideFilters = false,
  initialFilters,
  destination,
  contactOnEmpty = false,
}: {
  limit?: number;
  filters?: FleetFilters;
  onFiltersChange?: (filters: FleetFilters) => void;
  hideFilters?: boolean;
  initialFilters?: Partial<FleetFilters>;
  destination?: { label: string; locations?: string[]; locationIncludes?: string[] };
  contactOnEmpty?: boolean;
}) {
  const [localFilters, setLocalFilters] = useState<FleetFilters>(() => ({
    ...EMPTY_FILTERS,
    ...initialFilters,
  }));
  const formFilters = useMemo(
    () => ({ ...EMPTY_FILTERS, ...(controlledFilters ?? localFilters) }),
    [controlledFilters, localFilters],
  );
  const updateFilters = onFiltersChange ?? setLocalFilters;
  const [selected, setSelected] = useState<BoatSummary | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);

  const fetchBoats = useServerFn(listBoats);
  const queryFilters = useMemo(
    () => ({
      ...(formFilters.search.trim() ? { search: formFilters.search.trim() } : {}),
      ...(formFilters.category !== ANY ? { category: formFilters.category } : {}),
      ...(formFilters.location.trim() ? { location: formFilters.location.trim() } : {}),
      ...(Number(formFilters.guests) > 0 ? { guests: Number(formFilters.guests) } : {}),
      ...(destination
        ? {
            ...(destination.locations?.length ? { locations: destination.locations } : {}),
            ...(destination.locationIncludes?.length
              ? { locationIncludes: destination.locationIncludes }
              : {}),
            ratePeriod: formFilters.ratePeriod,
          }
        : {}),
      ...(formFilters.date
        ? {
            startISO: new Date(`${formFilters.date}T00:00:00.000Z`).toISOString(),
            endISO: new Date(
              new Date(`${formFilters.date}T00:00:00.000Z`).getTime() + 24 * 60 * 60 * 1000,
            ).toISOString(),
          }
        : {}),
      ...(formFilters.minPrice && Number.isFinite(Number(formFilters.minPrice))
        ? { minRateCents: Math.max(0, Math.round(Number(formFilters.minPrice) * 100)) }
        : {}),
      ...(formFilters.maxPrice && Number.isFinite(Number(formFilters.maxPrice))
        ? { maxRateCents: Math.max(0, Math.round(Number(formFilters.maxPrice) * 100)) }
        : {}),
      ...(formFilters.minPrice || formFilters.maxPrice
        ? { ratePeriod: formFilters.ratePeriod }
        : {}),
      ...(formFilters.amenity.trim() ? { amenity: formFilters.amenity.trim() } : {}),
    }),
    [formFilters, destination],
  );
  const boatsQuery = useQuery({
    queryKey: ["boats", queryFilters],
    queryFn: () => fetchBoats({ data: queryFilters }),
  });
  const boats = (boatsQuery.data ?? []) as BoatSummary[];
  const visible = limit ? boats.slice(0, limit) : boats;
  const hasFilters = Boolean(
    formFilters.search ||
    formFilters.location ||
    formFilters.guests ||
    formFilters.date ||
    formFilters.minPrice ||
    formFilters.maxPrice ||
    formFilters.amenity ||
    formFilters.ratePeriod !== "daily" ||
    formFilters.category !== ANY,
  );

  return (
    <div>
      {!hideFilters ? (
        <FleetFilterBar
          filters={formFilters}
          onChange={updateFilters}
          variant={destination ? "destination" : "default"}
          {...(destination ? { destinationLabel: destination.label } : {})}
        />
      ) : null}
      {!boatsQuery.isPending && !boatsQuery.isError ? (
        <p className="mt-5 text-sm text-muted-foreground" aria-live="polite">
          {boats.length} {boats.length === 1 ? "vessel" : "vessels"} match these filters
        </p>
      ) : null}
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
              {destination
                ? "No vessels are currently listed for this destination. Contact us and we can help with your inquiry."
                : "Try widening the location, guest count or category."}
            </p>
            {hasFilters ? (
              <Button
                variant="outline"
                className="mt-5"
                onClick={() => updateFilters({ ...EMPTY_FILTERS })}
              >
                Clear filters
              </Button>
            ) : null}
            {contactOnEmpty ? (
              <Button asChild variant="outline" className="mt-5">
                <Link to="/contact">Ask us about this destination</Link>
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
      {selected ? (
        <Suspense fallback={null}>
          <BookingDialog boat={selected} open={dialogOpen} onOpenChange={setDialogOpen} />
        </Suspense>
      ) : null}
    </div>
  );
}
