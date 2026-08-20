import { useMutation, useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import {
  BadgeCheck,
  CalendarClock,
  CircleAlert,
  CreditCard,
  Loader2,
  Lock,
  MapPin,
  Ruler,
  ShieldCheck,
  Ticket,
  Users,
} from "lucide-react";
import { useMemo, useState } from "react";
import { toast } from "sonner";

import { AmenityIcon } from "@/components/amenity-icon";
import { FALLBACK_IMAGE, type BoatSummary } from "@/components/boat-card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { getPaymentMethodInfo, requestBooking } from "@/lib/charter.functions";
import { computeQuote, formatMoney, type BookingType } from "@/lib/money";

type Confirmation = {
  reference: string;
  transactionId: string;
  paymentStatus: string;
  bookingStatus: string;
  totalCents: number;
  message: string;
  boatTitle: string;
};

function toLocalInput(date: Date): string {
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const phonePattern = /^[+]?[\d\s().-]{7,25}$/;

export function BookingDialog({
  boat,
  open,
  onOpenChange,
  defaults,
}: {
  boat: BoatSummary | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  defaults?: { startISO?: string; endISO?: string; guests?: number };
}) {
  const start = new Date();
  start.setDate(start.getDate() + 3);
  start.setHours(10, 0, 0, 0);
  const end = new Date(start);
  end.setHours(start.getHours() + 4);

  const [activeImage, setActiveImage] = useState(0);
  const [bookingType, setBookingType] = useState<BookingType>("hourly");
  const [startValue, setStartValue] = useState(
    defaults?.startISO ? toLocalInput(new Date(defaults.startISO)) : toLocalInput(start),
  );
  const [endValue, setEndValue] = useState(
    defaults?.endISO ? toLocalInput(new Date(defaults.endISO)) : toLocalInput(end),
  );
  const [guests, setGuests] = useState(String(defaults?.guests ?? 2));
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [demoOutcome, setDemoOutcome] = useState<"success" | "failure" | "pending">("success");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [confirmation, setConfirmation] = useState<Confirmation | null>(null);

  const paymentInfoFn = useServerFn(getPaymentMethodInfo);
  const paymentInfo = useQuery({
    queryKey: ["payment-method"],
    queryFn: () => paymentInfoFn(),
  });

  const submitBooking = useServerFn(requestBooking);
  const mutation = useMutation({
    mutationFn: submitBooking,
    onSuccess: (result) => {
      if (!result.ok) {
        toast.error(result.message);
        return;
      }
      setConfirmation({
        reference: result.reference,
        transactionId: result.transactionId,
        paymentStatus: result.paymentStatus,
        bookingStatus: result.bookingStatus,
        totalCents: result.totalCents,
        message: result.message,
        boatTitle: result.boatTitle,
      });
      if (result.paymentStatus === "paid") toast.success("Booking confirmed and payment captured.");
      else if (result.paymentStatus === "failed")
        toast.error("Booking saved, but the payment failed.");
      else toast.message("Booking saved. Payment is pending confirmation.");
    },
    onError: () => toast.error("Something went wrong. Please try again."),
  });

  const quote = useMemo(() => {
    if (!boat) return null;
    return computeQuote({
      bookingType,
      hourlyRateCents: boat.hourly_rate_cents,
      dailyRateCents: boat.daily_rate_cents,
      startISO: new Date(startValue).toISOString(),
      endISO: new Date(endValue).toISOString(),
    });
  }, [boat, bookingType, startValue, endValue]);

  if (!boat) return null;

  const images = boat.image_urls.length > 0 ? boat.image_urls : [FALLBACK_IMAGE];

  function validate(): boolean {
    const next: Record<string, string> = {};
    if (name.trim().length < 2) next["name"] = "Please enter your full name.";
    if (!emailPattern.test(email.trim())) next["email"] = "Please enter a valid email address.";
    if (!phonePattern.test(phone.trim())) next["phone"] = "Please enter a valid phone number.";
    const guestCount = Number(guests);
    if (!Number.isInteger(guestCount) || guestCount < 1) {
      next["guests"] = "Enter at least one guest.";
    } else if (boat && guestCount > boat.capacity) {
      next["guests"] = `This boat seats up to ${boat.capacity} guests.`;
    }
    if (new Date(startValue).getTime() < Date.now()) {
      next["start"] = "The start date must be in the future.";
    }
    if (quote?.error) next["dates"] = quote.error;
    setErrors(next);
    return Object.keys(next).length === 0;
  }

  function handleSubmit() {
    if (!boat) return;
    if (!boat.is_available) {
      toast.error("This boat is currently unavailable for booking.");
      return;
    }
    if (!validate()) {
      toast.error("Please correct the highlighted fields.");
      return;
    }
    mutation.mutate({
      data: {
        boatId: boat.id,
        customerName: name.trim(),
        customerEmail: email.trim(),
        customerPhone: phone.trim(),
        guestCount: Number(guests),
        bookingType,
        startISO: new Date(startValue).toISOString(),
        endISO: new Date(endValue).toISOString(),
        demoOutcome,
      },
    });
  }

  function handleClose(next: boolean) {
    onOpenChange(next);
    if (!next) {
      setConfirmation(null);
      mutation.reset();
    }
  }

  const isDemo = paymentInfo.data?.mode === "demo";

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-h-[92vh] max-w-5xl overflow-y-auto p-0">
        {confirmation ? (
          <div className="p-8 text-center">
            <DialogTitle className="sr-only">Booking confirmation</DialogTitle>
            <div className="mx-auto flex size-16 items-center justify-center rounded-full bg-primary/15 text-primary">
              <BadgeCheck className="size-8" />
            </div>
            <h2 className="mt-6 font-display text-3xl font-semibold">
              {confirmation.paymentStatus === "failed" ? "Booking saved" : "Booking confirmed"}
            </h2>
            <p className="mt-2 text-muted-foreground">{confirmation.message}</p>

            <div className="mx-auto mt-8 max-w-md rounded-xl border border-border bg-muted/40 p-6 text-left">
              <dl className="space-y-3 text-sm">
                <div className="flex justify-between gap-4">
                  <dt className="text-muted-foreground">Booking reference</dt>
                  <dd className="font-mono font-semibold">{confirmation.reference}</dd>
                </div>
                <div className="flex justify-between gap-4">
                  <dt className="text-muted-foreground">Boat</dt>
                  <dd className="font-medium">{confirmation.boatTitle}</dd>
                </div>
                <div className="flex justify-between gap-4">
                  <dt className="text-muted-foreground">Transaction ID</dt>
                  <dd className="truncate font-mono text-xs">{confirmation.transactionId}</dd>
                </div>
                <div className="flex justify-between gap-4">
                  <dt className="text-muted-foreground">Payment status</dt>
                  <dd>
                    <Badge
                      className={
                        confirmation.paymentStatus === "paid"
                          ? "bg-success text-success-foreground"
                          : confirmation.paymentStatus === "failed"
                            ? "bg-destructive text-destructive-foreground"
                            : "bg-warning text-warning-foreground"
                      }
                    >
                      {confirmation.paymentStatus}
                    </Badge>
                  </dd>
                </div>
                <div className="flex justify-between gap-4">
                  <dt className="text-muted-foreground">Booking status</dt>
                  <dd className="font-medium capitalize">{confirmation.bookingStatus}</dd>
                </div>
                <Separator />
                <div className="flex justify-between gap-4">
                  <dt className="font-medium">Total</dt>
                  <dd className="font-display text-xl font-semibold">
                    {formatMoney(confirmation.totalCents)}
                  </dd>
                </div>
              </dl>
            </div>

            <p className="mt-6 text-sm text-muted-foreground">
              A charter specialist will contact {email} within 24 hours.
            </p>
            <Button className="mt-6" size="lg" onClick={() => handleClose(false)}>
              Done
            </Button>
          </div>
        ) : (
          <div className="grid lg:grid-cols-[1.15fr_1fr]">
            <div className="bg-muted/30 p-6">
              <DialogTitle className="font-display text-2xl font-semibold">
                {boat.title}
              </DialogTitle>
              <p className="mt-1 flex items-center gap-1.5 text-sm text-muted-foreground">
                <MapPin className="size-3.5 text-primary" /> {boat.location}
              </p>

              <div className="mt-4 overflow-hidden rounded-xl bg-muted">
                <img
                  src={images[activeImage] ?? FALLBACK_IMAGE}
                  alt={`${boat.title} view ${activeImage + 1}`}
                  className="aspect-[16/10] w-full object-cover"
                />
              </div>
              {images.length > 1 ? (
                <div className="mt-3 flex gap-2 overflow-x-auto pb-1">
                  {images.map((url, index) => (
                    <button
                      key={url}
                      type="button"
                      onClick={() => setActiveImage(index)}
                      aria-label={`Show image ${index + 1}`}
                      className={`size-16 shrink-0 overflow-hidden rounded-lg border-2 transition-colors ${
                        index === activeImage ? "border-primary" : "border-transparent opacity-70"
                      }`}
                    >
                      <img src={url} alt="" className="size-full object-cover" />
                    </button>
                  ))}
                </div>
              ) : null}

              <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-4">
                <Spec label="Category" value={boat.category} />
                <Spec label="Capacity" value={`${boat.capacity} guests`} icon={<Users className="size-3.5" />} />
                <Spec label="Length" value={`${boat.length_ft} ft`} icon={<Ruler className="size-3.5" />} />
                <Spec
                  label="Status"
                  value={boat.is_available ? "Available" : "Unavailable"}
                />
              </div>

              <p className="mt-5 text-sm leading-relaxed text-muted-foreground">
                {boat.description}
              </p>

              {boat.amenities.length > 0 ? (
                <div className="mt-5">
                  <h3 className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">
                    Amenities
                  </h3>
                  <ul className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-2">
                    {boat.amenities.map((amenity) => (
                      <li key={amenity} className="flex items-center gap-2 text-sm">
                        <AmenityIcon name={amenity} className="size-4 text-primary" />
                        {amenity}
                      </li>
                    ))}
                  </ul>
                </div>
              ) : null}
            </div>

            <div className="p-6">
              <h3 className="font-display text-xl font-semibold">Booking calculator</h3>
              <p className="text-sm text-muted-foreground">
                Live pricing from this boat&apos;s published rates.
              </p>

              <div className="mt-5 space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <Label>Booking type</Label>
                    <Select
                      value={bookingType}
                      onValueChange={(value) => setBookingType(value as BookingType)}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="hourly">Hourly</SelectItem>
                        <SelectItem value="daily">Daily</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="guests">Guests</Label>
                    <Input
                      id="guests"
                      type="number"
                      min={1}
                      max={boat.capacity}
                      value={guests}
                      onChange={(event) => setGuests(event.target.value)}
                    />
                    {errors["guests"] ? <FieldError message={errors["guests"]} /> : null}
                  </div>
                </div>

                <div className="grid gap-3 sm:grid-cols-2">
                  <div className="space-y-1.5">
                    <Label htmlFor="start">Start</Label>
                    <Input
                      id="start"
                      type="datetime-local"
                      value={startValue}
                      onChange={(event) => setStartValue(event.target.value)}
                    />
                    {errors["start"] ? <FieldError message={errors["start"]} /> : null}
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="end">End</Label>
                    <Input
                      id="end"
                      type="datetime-local"
                      value={endValue}
                      onChange={(event) => setEndValue(event.target.value)}
                    />
                  </div>
                </div>

                {quote?.error ? (
                  <div className="flex items-start gap-2 rounded-lg bg-destructive/10 p-3 text-sm text-destructive">
                    <CircleAlert className="mt-0.5 size-4 shrink-0" />
                    {quote.error}
                  </div>
                ) : (
                  <div className="rounded-xl border border-border bg-muted/40 p-4 text-sm">
                    <Row label="Selected boat" value={boat.title} />
                    <Row label="Booking type" value={bookingType === "hourly" ? "Hourly" : "Daily"} />
                    <Row
                      label="Duration"
                      value={`${quote?.duration ?? 0} ${quote?.unitLabel ?? ""}`}
                    />
                    <Row label="Rate" value={`${formatMoney(quote?.rateCents ?? 0)} / ${bookingType === "hourly" ? "hour" : "day"}`} />
                    <Row label="Subtotal" value={formatMoney(quote?.subtotalCents ?? 0)} />
                    <Row label="Service fee (10%)" value={formatMoney(quote?.feesCents ?? 0)} />
                    <Separator className="my-2" />
                    <div className="flex items-center justify-between">
                      <span className="font-medium">Total</span>
                      <span className="font-display text-2xl font-semibold">
                        {formatMoney(quote?.totalCents ?? 0)}
                      </span>
                    </div>
                  </div>
                )}

                <Separator />

                <div className="space-y-3">
                  <h4 className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">
                    Your details
                  </h4>
                  <div className="space-y-1.5">
                    <Label htmlFor="name">Full name</Label>
                    <Input
                      id="name"
                      value={name}
                      onChange={(event) => setName(event.target.value)}
                      placeholder="Alex Morgan"
                      maxLength={100}
                    />
                    {errors["name"] ? <FieldError message={errors["name"]} /> : null}
                  </div>
                  <div className="grid gap-3 sm:grid-cols-2">
                    <div className="space-y-1.5">
                      <Label htmlFor="email">Email</Label>
                      <Input
                        id="email"
                        type="email"
                        value={email}
                        onChange={(event) => setEmail(event.target.value)}
                        placeholder="alex@example.com"
                        maxLength={255}
                      />
                      {errors["email"] ? <FieldError message={errors["email"]} /> : null}
                    </div>
                    <div className="space-y-1.5">
                      <Label htmlFor="phone">Phone</Label>
                      <Input
                        id="phone"
                        type="tel"
                        value={phone}
                        onChange={(event) => setPhone(event.target.value)}
                        placeholder="+1 305 555 0100"
                        maxLength={25}
                      />
                      {errors["phone"] ? <FieldError message={errors["phone"]} /> : null}
                    </div>
                  </div>
                </div>

                <Separator />

                <div className="rounded-xl border border-border p-4">
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2.5">
                      <span className="flex size-9 items-center justify-center rounded-lg bg-primary/15 text-primary">
                        <CreditCard className="size-4.5" />
                      </span>
                      <div>
                        <p className="text-sm font-medium">
                          {paymentInfo.data?.label ?? "Secure Card Payment"}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Processed securely by our payment provider
                        </p>
                      </div>
                    </div>
                    <Badge variant="secondary">Only method</Badge>
                  </div>

                  <div className="mt-3 flex items-center gap-1.5 text-xs text-muted-foreground">
                    <Lock className="size-3.5" /> Card details are tokenised by the provider and
                    never stored here.
                  </div>

                  {isDemo ? (
                    <div className="mt-4 space-y-2 rounded-lg bg-warning/15 p-3">
                      <p className="text-xs font-semibold text-warning-foreground">
                        Test mode — no live credentials configured
                      </p>
                      <Select
                        value={demoOutcome}
                        onValueChange={(value) =>
                          setDemoOutcome(value as "success" | "failure" | "pending")
                        }
                      >
                        <SelectTrigger className="bg-background">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="success">Test Payment Successful</SelectItem>
                          <SelectItem value="pending">Test Payment Pending</SelectItem>
                          <SelectItem value="failure">Test Payment Failed</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  ) : null}

                  <div className="mt-4 space-y-1 text-sm">
                    <Row label="Booking amount" value={formatMoney(quote?.totalCents ?? 0)} />
                    <Row label="Payment status" value="Pending until submitted" />
                  </div>
                </div>

                <Button
                  size="lg"
                  className="w-full"
                  onClick={handleSubmit}
                  disabled={mutation.isPending || !boat.is_available || Boolean(quote?.error)}
                >
                  {mutation.isPending ? (
                    <>
                      <Loader2 className="size-4 animate-spin" /> Processing…
                    </>
                  ) : (
                    <>
                      <Ticket className="size-4" /> Request Booking
                    </>
                  )}
                </Button>

                <p className="flex items-center justify-center gap-1.5 text-xs text-muted-foreground">
                  <ShieldCheck className="size-3.5 text-primary" /> Instant confirmation once the
                  payment clears.
                </p>
                {!boat.is_available ? (
                  <p className="flex items-center justify-center gap-1.5 text-xs text-destructive">
                    <CalendarClock className="size-3.5" /> This boat is currently unavailable.
                  </p>
                ) : null}
              </div>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

function Spec({ label, value, icon }: { label: string; value: string; icon?: React.ReactNode }) {
  return (
    <div className="rounded-lg border border-border bg-card p-3">
      <p className="text-[11px] tracking-wide text-muted-foreground uppercase">{label}</p>
      <p className="mt-1 flex items-center gap-1.5 text-sm font-semibold">
        {icon ? <span className="text-primary">{icon}</span> : null}
        {value}
      </p>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-4 py-1">
      <span className="text-muted-foreground">{label}</span>
      <span className="text-right font-medium">{value}</span>
    </div>
  );
}

function FieldError({ message }: { message: string }) {
  return <p className="text-xs font-medium text-destructive">{message}</p>;
}
